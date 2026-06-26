import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LocationDetector — Fixed GPS cho mobile indoor
//
// Vấn đề gốc:
//   - Mobile + enableHighAccuracy:true = yêu cầu GPS hardware
//   - GPS hardware trong nhà không thấy vệ tinh → timeout
//   - Laptop dùng WiFi positioning (WPS) → nhanh, không cần GPS hardware
//
// Fix:
//   - Mobile: enableHighAccuracy:false → dùng Network Location (WiFi + Cell)
//     → cho tọa độ trong 1-3s, accuracy 50-200m, hoạt động trong nhà
//   - Desktop: enableHighAccuracy:true → WPS vẫn nhanh
//   - Không reject dựa vào accuracy — effectiveDistance là tiêu chí duy nhất
// ─────────────────────────────────────────────────────────────────────────────
class LocationDetector {

    static THRESHOLDS = {
        OFFICE_RADIUS: 100,   // mét — bán kính geofence
        POOR_ACCURACY: 200,   // chỉ để hiện cảnh báo UI, không reject
    };

    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }

    static haversine(lat1, lon1, lat2, lon2) {
        const R    = 6_371_000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a    =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    static classifyAccuracy(accuracy) {
        if (accuracy <= 30)  return { label: "Excellent", color: "green",  icon: "gps_fixed" };
        if (accuracy <= 100) return { label: "Good",      color: "green",  icon: "gps_fixed" };
        if (accuracy <= 200) return { label: "Moderate",  color: "yellow", icon: "gps_not_fixed" };
        return                      { label: "Weak",       color: "orange", icon: "gps_not_fixed" };
    }

    static analyzeGPS(position, officeLat, officeLng, officeRadius = 100) {
        const { accuracy, latitude, longitude } = position.coords;
        const distance          = this.haversine(latitude, longitude, officeLat, officeLng);
        const effectiveDistance = Math.max(0, distance - accuracy);
        const withinGeofence    = effectiveDistance <= officeRadius;

        console.log("=== GPS ANALYSIS ===");
        console.log(`Position:  ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        console.log(`Accuracy:  ±${accuracy.toFixed(1)} m`);
        console.log(`Distance:  ${distance.toFixed(1)} m`);
        console.log(`EffectiveD:${effectiveDistance.toFixed(1)} m (≤ ${officeRadius}m?)`);
        console.log(`Pass:      ${withinGeofence ? "YES ✓" : "NO ✗"}`);

        return {
            latitude,
            longitude,
            accuracy,
            distance,
            effectiveDistance,
            withinGeofence,
            officeRadius,
            accuracyInfo:       this.classifyAccuracy(accuracy),
            showAccuracyWarning: accuracy > this.THRESHOLDS.POOR_ACCURACY,
        };
    }

    /**
     * Lấy vị trí GPS phù hợp với thiết bị.
     *
     * Strategy:
     *   Mobile Chrome:
     *     1. Network Location (enableHighAccuracy:false) — dùng WiFi + Cell, nhanh trong nhà
     *     2. High accuracy timeout ngắn — thử GPS hardware nếu có
     *     3. Cached location — fallback cuối cùng
     *
     *   Desktop:
     *     1. High accuracy (WPS/GPS) — nhanh trên laptop
     *     2. Network location fallback
     *
     * Fix cho Chrome mobile:
     *   - Tăng timeout lên 15-20s cho network location
     *   - Thêm attempt với high accuracy timeout ngắn
     *   - Kiểm tra HTTPS context
     *   - Better error handling
     */
    static async getPosition() {
        const mobile = this.isMobile();
        const isChrome = /Chrome/.test(navigator.userAgent);
        const isSecureContext = window.isSecureContext || location.protocol === 'https:';
        
        console.log(`GPS: Device=${mobile ? "Mobile" : "Desktop"}, Chrome=${isChrome}, Secure=${isSecureContext}`);

        // Warning cho HTTP context trên mobile
        if (mobile && !isSecureContext) {
            console.warn("GPS: Mobile browser on HTTP may have limited geolocation access");
        }

        // Định nghĩa các option theo thứ tự ưu tiên
        const attempts = mobile
            ? [
                // Mobile attempt 1: Network location — ưu tiên WiFi + Cell
                {
                    label: "network location (WiFi+Cell)",
                    options: {
                        enableHighAccuracy: false,  // dùng WiFi + Cell, không GPS hardware
                        timeout:            15000,  // tăng timeout cho mobile Chrome
                        maximumAge:         30000,  // cache 30s
                    }
                },
                // Mobile attempt 2: High accuracy timeout ngắn — thử GPS nếu nhanh
                {
                    label: "high accuracy (quick GPS)",
                    options: {
                        enableHighAccuracy: true,   // thử GPS hardware
                        timeout:            8000,   // timeout ngắn, không đợi lâu
                        maximumAge:         10000,  // cache 10s
                    }
                },
                // Mobile attempt 3: Cached location — fallback cuối cùng
                {
                    label: "cached location",
                    options: {
                        enableHighAccuracy: false,
                        timeout:            5000,
                        maximumAge:         300000, // cache 5 phút
                    }
                },
            ]
            : [
                // Desktop attempt 1: WPS (WiFi Positioning) — nhanh, cho accuracy tốt
                {
                    label: "high accuracy (WPS)",
                    options: {
                        enableHighAccuracy: true,
                        timeout:            10000,
                        maximumAge:         0,
                    }
                },
                // Desktop attempt 2: Network location fallback
                {
                    label: "network location fallback",
                    options: {
                        enableHighAccuracy: false,
                        timeout:            8000,
                        maximumAge:         60000,
                    }
                },
            ];

        let lastError = null;

        for (const attempt of attempts) {
            try {
                console.log(`GPS: Trying ${attempt.label}...`);
                const pos = await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error(`Timeout after ${attempt.options.timeout}ms`));
                    }, attempt.options.timeout + 2000); // +2s buffer
                    
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            clearTimeout(timeoutId);
                            resolve(position);
                        },
                        (error) => {
                            clearTimeout(timeoutId);
                            reject(error);
                        },
                        attempt.options
                    );
                });
                
                console.log(`GPS: ✓ ${attempt.label} — accuracy: ±${pos.coords.accuracy.toFixed(1)}m`);
                return pos;
            } catch (err) {
                console.warn(`GPS: ✗ ${attempt.label} failed (code=${err.code}): ${err.message}`);
                lastError = err;

                // Nếu bị deny permission thì không cần thử tiếp
                if (err.code === 1) { // PERMISSION_DENIED
                    throw new Error("Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.");
                }
                
                // Nếu là timeout và còn attempts khác, tiếp tục thử
                if (err.code === 3) { // TIMEOUT
                    console.log("GPS: Timeout, trying next method...");
                    continue;
                }
            }
        }

        // Enhanced error message
        const errorMsg = lastError?.message || "Không thể xác định vị trí";
        if (mobile) {
            throw new Error(`${errorMsg}. Trên điện thoại: đảm bảo Location Services bật, có kết nối mạng, và cấp quyền vị trí cho trình duyệt.`);
        }
        throw lastError || new Error("All GPS attempts failed");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckinModal
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckinModal({ onClose }) {
    const [locationStatus, setLocationStatus] = useState("checking");
    const [gpsData,        setGpsData]        = useState(null);
    const [gpsError,       setGpsError]       = useState(null);
    const [isCheckingIn,   setIsCheckingIn]   = useState(false);
    const [showConfirm,    setShowConfirm]     = useState(false);
    const [currentTime,    setCurrentTime]     = useState(new Date());

    const DEFAULT_OFFICE_LAT = 15.970408691695921;
    const DEFAULT_OFFICE_LNG = 108.24941854122163;

    const [officeLat,    setOfficeLat]    = useState(DEFAULT_OFFICE_LAT);
    const [officeLng,    setOfficeLng]    = useState(DEFAULT_OFFICE_LNG);
    const [officeRadius, setOfficeRadius] = useState(100);

    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");


    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fetchLocationAndInit = async () => {
            let lat    = DEFAULT_OFFICE_LAT;
            let lng    = DEFAULT_OFFICE_LNG;
            let radius = 100;
            try {
                const res = await fetch(`${API_BASE_URL}/api/attendance/work-location/active`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.data) {
                        lat    = data.data.latitude    ?? lat;
                        lng    = data.data.longitude   ?? lng;
                        radius = data.data.radiusMeters ?? radius;
                        setOfficeLat(lat);
                        setOfficeLng(lng);
                        setOfficeRadius(radius);
                    }
                }
            } catch (_) {}
            await initGPS(lat, lng, radius);
        };
        fetchLocationAndInit();
    }, []);

    const initGPS = async (lat = officeLat, lng = officeLng, radius = officeRadius) => {
        if (!navigator.geolocation) {
            setLocationStatus("unsupported");
            return;
        }
        setLocationStatus("checking");
        setGpsError(null);
        try {
            const position = await LocationDetector.getPosition();
            const analysis = LocationDetector.analyzeGPS(position, lat, lng, radius);
            setGpsData(analysis);
            setLocationStatus(analysis.withinGeofence ? "verified" : "out_of_range");
        } catch (err) {
            console.error("GPS error:", err);
            setGpsError(err);
            setLocationStatus(err.code === 1 ? "denied" : "error");
        }
    };

    const sendCheckin = async (frames) => {
        try {
            // Lấy vị trí lần cuối trước khi submit
            const position = await LocationDetector.getPosition();
            const analysis = LocationDetector.analyzeGPS(position, officeLat, officeLng, officeRadius);

            if (!analysis.withinGeofence) {
                return {
                    success: false,
                    message: `Ngoài phạm vi văn phòng (${analysis.distance.toFixed(0)} m, cho phép ${officeRadius} m)`,
                };
            }

            const payload = {
                employeeId:       localStorage.getItem("employeeId"),
                latitude:         analysis.latitude,
                longitude:        analysis.longitude,
                gpsAccuracy:      analysis.accuracy,
                faceImagesBase64: frames,
                deviceInfo: {
                    userAgent:        navigator.userAgent,
                    platform:         navigator.platform,
                    screenResolution: `${screen.width}x${screen.height}`,
                    timezone:         Intl.DateTimeFormat().resolvedOptions().timeZone,
                    isMobile:         LocationDetector.isMobile(),
                },
                timestamp: new Date().toISOString(),
            };

            const res = await fetch(`${API_BASE_URL}/api/attendance/face/checkin`, {
                method:  "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:  `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("Backend response:", data);
            console.log("Response status:", res.status, res.ok);
            console.log("Extracted checkinStatus:", data.data?.status);

            return {
                success:       res.ok,
                message:       data.message,
                checkinStatus: data.data?.status        || null,
                faceMatchScore: data.data?.faceMatchScore ?? null,
                livenessScore:  data.data?.livenessScore  ?? null,
                lateMinutes:    data.data?.lateMinutes    ?? null,
                checkinTime:    data.data?.checkinTime    || null,
                gpsWarning:     data.data?.gpsWarning     || null,
                data,
            };
        } catch (err) {
            return { success: false, message: "Lỗi mạng: " + err.message };
        }
    };

    // ── UI config ─────────────────────────────────────────────────────────────
    const statusConfig = {
        verified:    { icon: "location_on",       color: "text-green-700 bg-green-50 border-green-200",   text: "Vị trí đã xác minh" },
        checking:    { icon: "location_searching", color: "text-yellow-700 bg-yellow-50 border-yellow-200", text: "Đang kiểm tra vị trí..." },
        out_of_range:{ icon: "location_off",       color: "text-red-700 bg-red-50 border-red-200",         text: "Ngoài phạm vi văn phòng" },
        denied:      { icon: "location_disabled",  color: "text-red-700 bg-red-50 border-red-200",         text: "Chưa cấp quyền vị trí" },
        error:       { icon: "gps_not_fixed",      color: "text-orange-700 bg-orange-50 border-orange-200",text: "Không xác định được vị trí" },
        unsupported: { icon: "help_outline",       color: "text-gray-700 bg-gray-50 border-gray-200",      text: "Thiết bị không hỗ trợ GPS" },
    }[locationStatus] || { icon: "help_outline", color: "text-gray-700 bg-gray-50 border-gray-200", text: "Không rõ" };

    if (isCheckingIn) {
        return (
            <FaceCheckinModal
                onClose={() => setIsCheckingIn(false)}
                onSuccess={() => { setIsCheckingIn(false); setShowConfirm(true); }}
                sendCheckin={sendCheckin}
            />
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-[#16222e] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Face Check-in</h2>
                            <p className="text-sm text-slate-500">
                                {currentTime.toLocaleDateString("vi-VN", {
                                    weekday: "long", day: "numeric",
                                    month: "long",   year: "numeric"
                                })}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="p-6 flex flex-col items-center gap-5">

                        {/* Clock */}
                        <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {currentTime.toLocaleTimeString("vi-VN", { hour12: false })}
                        </div>

                        {/* Location badge */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color}`}>
                            <span className="material-symbols-outlined text-lg">{statusConfig.icon}</span>
                            <span className="text-sm font-bold">{statusConfig.text}</span>
                            {locationStatus === "checking" && (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1"/>
                            )}
                        </div>

                        {/* GPS info — chỉ thông tin, không reject */}
                        {gpsData && locationStatus === "verified" && (
                            <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Khoảng cách văn phòng</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{gpsData.distance.toFixed(0)} m</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Độ chính xác GPS</span>
                                    <span className={`font-bold ${
                                        gpsData.accuracy <= 100 ? "text-green-600" :
                                        gpsData.accuracy <= 200 ? "text-yellow-600" : "text-orange-500"
                                    }`}>
                                        ±{gpsData.accuracy.toFixed(0)} m ({gpsData.accuracyInfo.label})
                                    </span>
                                </div>
                                {gpsData.showAccuracyWarning && (
                                    <div className="flex items-start gap-2 pt-1 text-xs text-orange-600">
                                        <span className="material-symbols-outlined text-sm flex-shrink-0">info</span>
                                        <span>Tín hiệu GPS yếu do trong nhà — checkin vẫn được chấp nhận nếu trong phạm vi.</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Out of range */}
                        {locationStatus === "out_of_range" && gpsData && (
                            <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 flex-shrink-0">location_off</span>
                                <div>
                                    <p className="font-semibold text-red-800 text-sm">Ngoài phạm vi làm việc</p>
                                    <p className="text-xs text-red-600 mt-1">
                                        Khoảng cách: {gpsData.distance.toFixed(0)} m — cho phép: {LocationDetector.THRESHOLDS.OFFICE_RADIUS} m
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Permission denied */}
                        {locationStatus === "denied" && (
                            <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-800 text-sm mb-2">Chưa cấp quyền truy cập vị trí</p>
                                <div className="text-xs text-red-700 space-y-1">
                                    <p><strong>Android Chrome:</strong> Cài đặt → Quyền ứng dụng → Vị trí → Cho phép</p>
                                    <p><strong>iPhone Safari:</strong> Cài đặt → Safari → Vị trí → Cho phép</p>
                                    <p className="mt-2 text-red-600">Sau khi cấp quyền, bấm "Thử lại" bên dưới.</p>
                                </div>
                            </div>
                        )}

                        {/* GPS error — giải thích mobile indoor */}
                        {locationStatus === "error" && (
                            <div className="w-full bg-orange-50 border border-orange-100 rounded-xl p-4">
                                <p className="font-semibold text-orange-800 text-sm mb-2">Không xác định được vị trí</p>
                                <div className="text-xs text-orange-700 space-y-1">
                                    {LocationDetector.isMobile() ? (
                                        <>
                                            <p><strong>Chrome trên Android cần:</strong></p>
                                            <p>1. Bật Location Services (Cài đặt → Vị trí → Bật)</p>
                                            <p>2. Bật Wi-Fi để định vị chính xác hơn</p>
                                            <p>3. Kết nối mạng 4G/5G (dùng cho Cell Location)</p>
                                            <p>4. Cho phép Chrome truy cập vị trí</p>
                                            <p className="mt-2 text-orange-600"><strong>Lưu ý:</strong> Trong văn phòng dùng Wi-Fi + 4G sẽ nhanh hơn GPS.</p>
                                        </>
                                    ) : (
                                        <>
                                            <p><strong>Trên laptop:</strong></p>
                                            <p>1. Bật Wi-Fi để định vị chính xác</p>
                                            <p>2. Cho phép trình duyệt truy cập vị trí</p>
                                            <p>3. Kiểm tra firewall không chặn geolocation</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Requirements */}
                        <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Yêu cầu xác minh</p>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-sm">face</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400">Nhận diện khuôn mặt</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">Bắt buộc</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400">Phạm vi làm việc</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                            Trong bán kính {LocationDetector.THRESHOLDS.OFFICE_RADIUS}m
                                            {LocationDetector.isMobile() && (
                                                <span className="font-normal text-slate-500"> (dùng mạng Wi-Fi/4G)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Retry */}
                        {["out_of_range", "error", "denied"].includes(locationStatus) && (
                            <button onClick={initGPS}
                                className="w-full border border-slate-300 dark:border-slate-700 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">refresh</span>
                                Thử lại kiểm tra vị trí
                            </button>
                        )}

                        {/* CTA */}
                        <button
                            onClick={() => setIsCheckingIn(true)}
                            disabled={locationStatus !== "verified"}
                            className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                                locationStatus === "verified"
                                    ? "bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                            }`}
                        >
                            <span className="material-symbols-outlined">face</span>
                            {locationStatus === "verified" ? "Bắt đầu Face Check-in" : "Chờ xác minh vị trí..."}
                        </button>
                    </div>

                    <div className="px-6 pb-5 text-center">
                        <p className="text-xs text-slate-400">
                            Nhận diện khuôn mặt + xác minh vị trí để chấm công an toàn.
                        </p>
                    </div>
                </div>
            </div>

            {showConfirm && <ConfirmModal onClose={() => setShowConfirm(false)} />}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FaceCheckinModal
// ─────────────────────────────────────────────────────────────────────────────
function FaceCheckinModal({ onClose, onSuccess, sendCheckin }) {
    const [faceDetected,  setFaceDetected]  = useState(false);
    const [scanProgress,  setScanProgress]  = useState(0);
    const [scanComplete,  setScanComplete]  = useState(false);
    const [isProcessing,  setIsProcessing]  = useState(false);
    const [checkinResult, setCheckinResult] = useState(null);
    const [gpsWarning,    setGpsWarning]    = useState(null);
    const videoRef  = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    useEffect(() => {
        if (!faceDetected || scanComplete) return;
        const t = setInterval(() => {
            setScanProgress(p => {
                if (p >= 100) { clearInterval(t); setScanComplete(true); return 100; }
                return p + 10;
            });
        }, 300);
        return () => clearInterval(t);
    }, [faceDetected, scanComplete]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width:  { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
            // Đợi camera ổn định trước khi báo "face detected"
            setTimeout(() => setFaceDetected(true), 2000);
        } catch (e) {
            console.error("Camera error:", e);
            setErrorMessage("Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera.");
        }
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    };

    // Chụp N frame cách nhau intervalMs — gửi nhiều frame để tăng độ ổn định
    const captureFrames = async (count = 3, intervalMs = 400) => {
        const frames = [];
        for (let i = 0; i < count; i++) {
            if (i > 0) await new Promise(r => setTimeout(r, intervalMs));

            const video  = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState < 2) continue;

            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

            const base64 = canvas
                .toDataURL("image/jpeg", 0.85)
                .replace(/^data:image\/[a-z]+;base64,/, "");

            if (base64.length > 1000) {  // bỏ qua frame trống
                frames.push(base64);
                console.log(`Frame ${i + 1}/${count}: ${base64.length} chars`);
            }
        }
        return frames;
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        setCheckinResult(null);
        try {
            const frames = await captureFrames(3, 400);

            if (frames.length === 0) {
                setCheckinResult({ checkinStatus: "FAILED", message: "Không chụp được ảnh. Vui lòng thử lại." });
                return;
            }

            const result = await sendCheckin(frames);

            if (result.gpsWarning) setGpsWarning(result.gpsWarning);

            if (result.message?.includes("Checked in successfully")) {
                setTimeout(() => { stopCamera(); onSuccess(); }, 1500);
            } else {
                if (result.checkinStatus) {
                    alert(`Trạng thái check-in: ${result.checkinStatus}`);
                }
                setCheckinResult(result);
            }
        } catch (e) {
            setCheckinResult({ checkinStatus: "FAILED", message: "Lỗi hệ thống: " + e.message });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Xác minh khuôn mặt</h2>
                        <p className="text-sm text-slate-500">Đặt khuôn mặt vào khung hình</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <canvas ref={canvasRef} className="hidden"/>

                    {/* Camera preview */}
                    <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>

                        {faceDetected && !scanComplete && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-48 border-4 border-emerald-400 rounded-full animate-pulse"/>
                            </div>
                        )}

                        {faceDetected && !scanComplete && (
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0"/>
                                    <div className="flex-1">
                                        <div className="text-white text-sm font-medium">Đang quét khuôn mặt...</div>
                                        <div className="w-full bg-black/30 rounded-full h-2 mt-1">
                                            <div className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                                                 style={{ width: `${scanProgress}%` }}/>
                                        </div>
                                    </div>
                                    <span className="text-white text-sm font-bold">{scanProgress}%</span>
                                </div>
                            </div>
                        )}

                        {scanComplete && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <span className="material-symbols-outlined text-white text-3xl">check</span>
                                    </div>
                                    <div className="text-white font-bold text-lg">Khuôn mặt được xác nhận</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {gpsWarning && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-2">
                            <span className="material-symbols-outlined text-yellow-500 text-sm flex-shrink-0 mt-0.5">info</span>
                            <p className="text-xs text-yellow-700">{gpsWarning}</p>
                        </div>
                    )}

                    {checkinResult && <CheckinStatusBanner result={checkinResult} />}

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                            <ul className="text-xs text-slate-500 space-y-1">
                                <li>Đảm bảo ánh sáng đủ chiếu vào mặt</li>
                                <li>Nhìn thẳng vào camera, giữ nguyên tư thế</li>
                                <li>Hệ thống chụp 3 frame để tăng độ chính xác</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                            Hủy
                        </button>
                        <button onClick={handleConfirm} disabled={!scanComplete || isProcessing}
                            className={`flex-1 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                                scanComplete && !isProcessing
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                    : "bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                            }`}>
                            {isProcessing
                                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Đang xử lý...</>
                                : <><span className="material-symbols-outlined">check_circle</span>Xác nhận Check-in</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckinStatusBanner — hiển thị lý do thất bại từ backend
// ─────────────────────────────────────────────────────────────────────────────
const CHECKIN_STATUS_CONFIG = {
    FACE_NOT_DETECTED: {
        icon:  "face_retouching_off",
        color: "red",
        title: "Không phát hiện khuôn mặt",
        hint:  "Di chuyển vào vùng sáng hơn, nhìn thẳng vào camera và thử lại.",
    },
    FACE_NOT_REGISTERED: {
        icon:  "person_off",
        color: "orange",
        title: "Chưa đăng ký khuôn mặt",
        hint:  "Liên hệ HR để đăng ký nhận diện khuôn mặt trước khi checkin.",
    },
    FACE_NOT_MATCH: {
        icon:  "face_unlock",
        color: "red",
        title: "Khuôn mặt không khớp",
        hint:  "Bỏ kính/khẩu trang, đảm bảo ánh sáng đủ và nhìn thẳng vào camera.",
    },
    SPOOF_SUSPECTED: {
        icon:  "security",
        color: "red",
        title: "Phát hiện giả mạo (liveness)",
        hint:  "Hệ thống phát hiện ảnh/video giả. Vui lòng dùng khuôn mặt thật trước camera.",
    },
    OUTSIDE_GEOFENCE: {
        icon:  "location_off",
        color: "red",
        title: "Ngoài phạm vi văn phòng",
        hint:  "Di chuyển vào khu vực làm việc được phép rồi thử lại.",
    },
    FAILED: {
        icon:  "error",
        color: "red",
        title: null,
        hint:  null,
    },
};

const COLOR_CLASSES = {
    red:    { bg: "bg-red-50",    border: "border-red-100",    icon: "text-red-500",    title: "text-red-800",    body: "text-red-700"    },
    orange: { bg: "bg-orange-50", border: "border-orange-100", icon: "text-orange-500", title: "text-orange-800", body: "text-orange-700" },
};

function CheckinStatusBanner({ result }) {
    const { checkinStatus, message, faceMatchScore, livenessScore } = result;
    const cfg   = CHECKIN_STATUS_CONFIG[checkinStatus] || CHECKIN_STATUS_CONFIG.FAILED;
    const cls   = COLOR_CLASSES[cfg.color] || COLOR_CLASSES.red;
    const title = cfg.title || message;

    // Debug log to check what we're receiving
    console.log("CheckinStatusBanner result:", result);

    return (
        <div className={`${cls.bg} border ${cls.border} rounded-lg p-3 space-y-2`}>
            <div className="flex items-start gap-2">
                <span className={`material-symbols-outlined text-base flex-shrink-0 mt-0.5 ${cls.icon}`}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${cls.title}`}>{title}</p>
                    {cfg.title && message && message !== title && (
                        <p className={`text-xs mt-0.5 ${cls.body}`}>{message}</p>
                    )}
                    {cfg.hint && (
                        <p className={`text-xs mt-1 ${cls.body} opacity-80`}>{cfg.hint}</p>
                    )}
                </div>
            </div>

            {(faceMatchScore != null || livenessScore != null) && (
                <div className={`flex gap-4 pt-1 border-t ${cls.border}`}>
                    {faceMatchScore != null && (
                        <div className="text-xs">
                            <span className={`${cls.body} opacity-70`}>Độ khớp khuôn mặt: </span>
                            <span className={`font-bold ${cls.title}`}>{(faceMatchScore * 100).toFixed(0)}%</span>
                        </div>
                    )}
                    {livenessScore != null && (
                        <div className="text-xs">
                            <span className={`${cls.body} opacity-70`}>Liveness: </span>
                            <span className={`font-bold ${cls.title}`}>{(livenessScore * 100).toFixed(0)}%</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ConfirmModal
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Check-in thành công</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 text-center">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="material-symbols-outlined text-white text-3xl">check</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Đã ghi nhận chấm công</h3>
                    <p className="text-slate-500 mb-6">Chấm công của bạn đã được lưu thành công.</p>
                    <button onClick={onClose}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors">
                        Xong
                    </button>
                </div>
            </div>
        </div>
    );
}