import React, { useEffect, useMemo, useRef, useState } from "react";

const FACE_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDquoB3y7Bpe3MwaDMXmF2w6YaL0U43pCA2q4ELb9tg89vSRUahuds7W8BMj_uQoS6CGtTNDJDLECMWJMt0M6ZdPZNpBzel79N2gbtaY9av0rRYjDEVmUZPLsoDh5z8WSSkq4xEKW32U6bpgGH1U0Ry3BQMaX9He7xZEae2TiMMsAL7YDRjcEry16A2SnaY6gwQkXr9Q8DpXHWadoqpL_Zn46CMnJAbEHsT9DLuE1D3n_GiLV-ZTRjwd4Cdu6gc-c_8QtrK5Kg5SDM";
const MAP_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBPivbru99mHurdQBrTFjZTxlfpYvSYDcUM2FSDwDOugeJhM_cGPr6CIc43k1coMXv9-7z_ZKDsf8Lxep0OcKia6jm8nm6hsQ3wwlwMELlwnfnluCmUCtTGoT2Spji3P5fxp0A8j6Arc2P_TCCBa0kehGqoVopJavRviM_Bww691375ZzSOvoFxNEc4eY8_hZBpzDfhLWyy_8BRu1j41E6gKPYqS4_xUlPyDYwExAcrLoEhBERo2rSeXoNQ9uNDxYAR0MVJIbCEgfA";

class LocationDetector {
  static THRESHOLDS = {
    OFFICE_RADIUS: 100,
    POOR_ACCURACY: 200,
  };

  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  static classifyAccuracy(accuracy) {
    if (accuracy <= 30) return { label: "Excellent", color: "green" };
    if (accuracy <= 100) return { label: "Good", color: "green" };
    if (accuracy <= 200) return { label: "Moderate", color: "yellow" };
    return { label: "Weak", color: "orange" };
  }

  static analyzeGPS(position, officeLat, officeLng) {
    const { accuracy, latitude, longitude } = position.coords;
    const distance = this.haversine(latitude, longitude, officeLat, officeLng);
    const effectiveDistance = Math.max(0, distance - accuracy);
    const withinGeofence = effectiveDistance <= this.THRESHOLDS.OFFICE_RADIUS;

    return {
      latitude,
      longitude,
      accuracy,
      distance,
      effectiveDistance,
      withinGeofence,
      accuracyInfo: this.classifyAccuracy(accuracy),
      showAccuracyWarning: accuracy > this.THRESHOLDS.POOR_ACCURACY,
    };
  }

  static normalizeGeoError(error, fallbackMessage = "Không thể xác định vị trí hiện tại") {
    if (!error) {
      return new Error(fallbackMessage);
    }

    if (error.code === 1) {
      const permissionError = new Error("Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong trình duyệt.");
      permissionError.code = 1;
      return permissionError;
    }

    if (error.code === 2) {
      const unavailableError = new Error("Thiết bị chưa lấy được vị trí hiện tại. Hãy bật Location Services, Wi-Fi/4G và thử lại.");
      unavailableError.code = 2;
      return unavailableError;
    }

    if (error.code === 3 || /timeout/i.test(error.message || "")) {
      const timeoutError = new Error("Hết thời gian lấy vị trí. Hãy thử lại ở nơi thoáng hơn hoặc gần cửa sổ.");
      timeoutError.code = 3;
      return timeoutError;
    }

    const genericError = new Error(error.message || fallbackMessage);
    genericError.code = error.code;
    return genericError;
  }

  static getCurrentPositionOnce(options) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(this.normalizeGeoError({ code: 3, message: `Timeout after ${options.timeout}ms` }));
      }, (options.timeout || 10000) + 2000);

      navigator.geolocation.getCurrentPosition(
        (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(this.normalizeGeoError(error));
        },
        options
      );
    });
  }

  static async getPosition() {
    const attempts = [
      {
        options: {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
      },
      {
        options: {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        },
      },
      {
        options: {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0,
        },
      },
    ];

    let lastError = null;

    for (const attempt of attempts) {
      try {
        const position = await this.getCurrentPositionOnce(attempt.options);

        if (this.isMobile() && position.coords.accuracy > 200) {
          lastError = this.normalizeGeoError({
            code: 2,
            message: `GPS accuracy quá thấp: ±${position.coords.accuracy.toFixed(0)}m`,
          });
          continue;
        }

        return position;
      } catch (error) {
        lastError = error;
        if (error.code === 1) {
          throw error;
        }
      }
    }

    throw this.normalizeGeoError(
      lastError,
      "Không thể lấy GPS chính xác. Hãy bật Location Services, bật Wi-Fi/4G, cấp quyền vị trí và thử lại ngoài trời/gần cửa sổ."
    );
  }
}

export default function CheckoutModal({
  open = true,
  onClose,
  employee = {
    name: "Nguyễn Văn A",
    code: "NV1001",
    department: "Phòng Kinh doanh",
    shift: "Hành chính (08:00 - 17:30)",
    checkinTime: "08:05",
    scheduledCheckout: "17:30",
    workplace: "Tòa nhà TimeSquares, 123 Lê Lợi",
  },
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [note, setNote] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [locationStatus, setLocationStatus] = useState("checking");
  const [gpsData, setGpsData] = useState(null);
  const [gpsError, setGpsError] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [hasCaptured, setHasCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [autoCountdown, setAutoCountdown] = useState(5);
  const [isAutoCounting, setIsAutoCounting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const autoCaptureTimeoutRef = useRef(null);
  const autoCaptureIntervalRef = useRef(null);
  const gpsRetryTimeoutRef = useRef(null);
  const gpsRequestInFlightRef = useRef(false);
  const OFFICE_LAT = 15.970408691695921;
  const OFFICE_LNG = 108.24941854122163;
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  useEffect(() => {
    if (!open) return undefined;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setIsCompleted(false);
    setHasCaptured(false);
    setCapturedImage("");
    setFrameCount(0);
    setSubmitError("");
    setAutoCountdown(5);
    setIsAutoCounting(false);

    startCamera();
    initGPS();

    return () => {
      clearAutoCaptureTimers();
      clearGpsRetryTimer();
      stopCamera();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !cameraReady || isRunning || hasCaptured || isCompleted) {
      clearAutoCaptureTimers();
      setIsAutoCounting(false);
      return undefined;
    }

    setAutoCountdown(5);
    setIsAutoCounting(true);

    autoCaptureIntervalRef.current = setInterval(() => {
      setAutoCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoCaptureTimeoutRef.current = setTimeout(() => {
      clearAutoCaptureTimers();
      setIsAutoCounting(false);
      handleCaptureFace(true);
    }, 5000);

    return () => clearAutoCaptureTimers();
  }, [cameraReady, hasCaptured, isCompleted, isRunning, open]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !streamRef.current) {
      return undefined;
    }

    const bindStream = async () => {
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
      }

      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;

      try {
        await video.play();
      } catch (error) {
        console.warn("Video play warning:", error);
      }
    };

    bindStream();

    return undefined;
  }, [cameraReady, open]);

  const summary = useMemo(() => {
    const checkoutTime = currentTime.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      checkoutTime,
      totalHours: "9h 37m",
      overtime: "12 phút",
      earlyLeave: "0 phút",
      similarity: isCompleted ? "98% MATCH" : cameraReady ? "CAMERA READY" : "CHƯA SẴN SÀNG",
      liveness: isCompleted ? "Đạt" : hasCaptured ? "Đã chụp ảnh" : isRunning ? "Đang xử lý" : "Chờ xác minh",
      gpsStatus: locationStatus === "verified" ? "HỢP LỆ" : locationStatus === "checking" ? "ĐANG KIỂM TRA" : "CẦN KIỂM TRA",
      locationStatus:
        locationStatus === "verified"
          ? currentAddress || "Bạn đang ở trong khu vực cho phép"
          : locationStatus === "checking"
            ? "Đang kiểm tra vị trí hiện tại"
            : "Chưa xác minh được vị trí hợp lệ",
      coordinates: gpsData
        ? `Lat: ${gpsData.latitude.toFixed(6)}, Long: ${gpsData.longitude.toFixed(6)}`
        : "Lat: --, Long: --",
      shiftStatus: isCompleted ? "ĐÃ CHECKOUT" : "ĐANG LÀM VIỆC",
    };
  }, [cameraReady, currentAddress, currentTime, gpsData, hasCaptured, isCompleted, isRunning, locationStatus]);

  const faceGuides = [
    { icon: "light_mode", text: "Đảm bảo đủ ánh sáng" },
    { icon: "face_retouching_off", text: "Không đeo khẩu trang" },
  ];

  const timelineItems = [
    {
      title: `Check-in: ${employee.checkinTime}`,
      detail: "Thành công • Trong khu vực",
      active: true,
    },
    {
      title: isCompleted ? `Check-out: ${summary.checkoutTime}` : "Check-out: Chưa thực hiện",
      detail: isCompleted ? "Đã xác minh khuôn mặt và GPS" : "Đang chờ xác thực khuôn mặt",
      active: isCompleted,
    },
  ];

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  };

  const waitForVideoReady = async (retries = 10, delayMs = 200) => {
    const video = videoRef.current;

    if (!video) {
      throw new Error("Camera preview chưa sẵn sàng.");
    }

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      return video;
    }

    await new Promise((resolve) => {
      const onReady = () => {
        video.removeEventListener("loadedmetadata", onReady);
        resolve();
      };

      video.addEventListener("loadedmetadata", onReady, { once: true });
      setTimeout(() => {
        video.removeEventListener("loadedmetadata", onReady);
        resolve();
      }, delayMs);
    });

    for (let attempt = 0; attempt < retries; attempt += 1) {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        return video;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error("Camera đã mở nhưng chưa sẵn sàng để chụp ảnh.");
  };

  const clearGpsRetryTimer = () => {
    if (gpsRetryTimeoutRef.current) {
      clearTimeout(gpsRetryTimeoutRef.current);
      gpsRetryTimeoutRef.current = null;
    }
  };

  const clearAutoCaptureTimers = () => {
    if (autoCaptureTimeoutRef.current) {
      clearTimeout(autoCaptureTimeoutRef.current);
      autoCaptureTimeoutRef.current = null;
    }

    if (autoCaptureIntervalRef.current) {
      clearInterval(autoCaptureIntervalRef.current);
      autoCaptureIntervalRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      setIsCompleted(false);
      setHasCaptured(false);
      setCapturedImage("");
      setFrameCount(0);
      setSubmitError("");
      setAutoCountdown(5);
      setIsAutoCounting(false);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ camera.");
      }

      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("webkit-playsinline", "true");
        videoRef.current.srcObject = stream;

        await new Promise((resolve) => {
          const video = videoRef.current;
          if (!video) {
            resolve();
            return;
          }

          const onReady = () => {
            video.removeEventListener("loadedmetadata", onReady);
            video.removeEventListener("canplay", onReady);
            resolve();
          };

          video.addEventListener("loadedmetadata", onReady, { once: true });
          video.addEventListener("canplay", onReady, { once: true });

          setTimeout(() => {
            video.removeEventListener("loadedmetadata", onReady);
            video.removeEventListener("canplay", onReady);
            resolve();
          }, 2500);
        });

        await videoRef.current.play().catch(() => undefined);
      }

      const video = videoRef.current;
      const isVideoReady = Boolean(video && video.videoWidth > 0 && video.videoHeight > 0);
      setCameraReady(isVideoReady);

      if (!isVideoReady) {
        setCameraError("Camera đã mở nhưng chưa sẵn sàng để chụp ảnh.");
      }
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError(error.message || "Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera.");
      setCameraReady(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tra cứu địa chỉ từ tọa độ hiện tại.");
      }

      const data = await response.json();
      return data.display_name || "";
    } catch (error) {
      console.error("Reverse geocode error:", error);
      return "";
    }
  };

  const initGPS = async (isRetry = false) => {
    if (!window.isSecureContext) {
      setLocationStatus("unsupported");
      setGpsError("Geolocation chỉ hoạt động trên HTTPS hoặc localhost.");
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      setGpsError("Thiết bị không hỗ trợ geolocation.");
      return;
    }

    if (gpsRequestInFlightRef.current) {
      return;
    }

    gpsRequestInFlightRef.current = true;

    setLocationStatus("checking");
    setGpsError(isRetry ? "Đang thử lại xác định vị trí..." : "");
    setCurrentAddress("");
    setGpsData(null);

    try {
      const position = await LocationDetector.getPosition();
      const analysis = LocationDetector.analyzeGPS(position, OFFICE_LAT, OFFICE_LNG);
      const address = await reverseGeocode(analysis.latitude, analysis.longitude);
      setGpsData(analysis);
      setCurrentAddress(address);
      setLocationStatus(analysis.withinGeofence ? "verified" : "out_of_range");
      setGpsError("");
    } catch (error) {
      console.error("GPS error:", error);
      const message = error?.message || "Không thể xác định vị trí.";
      setGpsError(message);

      if (/từ chối/i.test(message)) {
        setLocationStatus("denied");
      } else if (/timeout/i.test(message)) {
        setLocationStatus("error");
      } else {
        setLocationStatus("error");
      }
    } finally {
      gpsRequestInFlightRef.current = false;
    }
  };

  const captureSingleFrame = async () => {
    const video = await waitForVideoReady();
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Không thể khởi tạo canvas để chụp ảnh.");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas
      .toDataURL("image/jpeg", 0.85)
      .replace(/^data:image\/[a-z]+;base64,/, "");

    if (base64.length > 1000) {
      setFrameCount(1);
      setHasCaptured(true);
      setCapturedImage(base64);
      return base64;
    }

    return null;
  };

  const refreshVerifiedGPS = async () => {
    const latestPosition = await LocationDetector.getPosition();
    const analysis = LocationDetector.analyzeGPS(latestPosition, OFFICE_LAT, OFFICE_LNG);
    const address = await reverseGeocode(analysis.latitude, analysis.longitude);
    setGpsData(analysis);
    setCurrentAddress(address);
    setLocationStatus(analysis.withinGeofence ? "verified" : "out_of_range");

    setGpsError("");
    return analysis;
  };

  const handleCaptureFace = async (triggeredAutomatically = false) => {
    if (!cameraReady) {
      setCameraError("Camera chưa sẵn sàng. Vui lòng cấp quyền và thử lại.");
      return;
    }

    clearAutoCaptureTimers();
    setIsAutoCounting(false);
    setIsRunning(true);
    setFrameCount(0);
    setHasCaptured(false);
    setCapturedImage("");
    setCameraError("");
    setSubmitError("");

    try {
      const frame = await captureSingleFrame();

      if (!frame) {
        setCameraError("Không chụp được ảnh từ camera. Vui lòng thử lại.");
        setIsRunning(false);
        if (triggeredAutomatically) {
          setAutoCountdown(5);
          setIsAutoCounting(true);
        }
        return;
      }
    } catch (error) {
      const message = error.message || "Không thể xác minh vị trí hiện tại.";
      setCameraError(message);
      if (triggeredAutomatically) {
        setAutoCountdown(5);
        setIsAutoCounting(true);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCheckout = async () => {
    if (!capturedImage) {
      setSubmitError("Bạn cần chụp ảnh khuôn mặt trước khi checkout.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const analysis = await refreshVerifiedGPS();

      const payload = {
        employeeId: localStorage.getItem("employeeId"),
        latitude: analysis.latitude,
        longitude: analysis.longitude,
        gpsAccuracy: analysis.accuracy,
        faceImagesBase64: [capturedImage],
        note,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isMobile: LocationDetector.isMobile(),
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/api/attendance/face/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("checkout response: " + JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data.message || "Checkout thất bại.");
      }

      setIsCompleted(true);
    } catch (error) {
      setSubmitError(error.message || "Không thể gửi checkout lên backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/40 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
      <div
        className="flex w-full max-w-[1180px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <canvas ref={canvasRef} className="hidden" />
        <div className="w-full bg-slate-100 p-4 sm:p-5 md:w-[43%] md:p-5 lg:p-6">
          <div className="mb-4 flex w-full items-center justify-between md:mb-5">
            <span className="text-lg font-extrabold tracking-tight text-[#003d9b]">
              XÁC THỰC SINH TRẮC HỌC
            </span>
              <button
                type="button"
                disabled={isRunning || !cameraReady}
                onClick={handleCaptureFace}
                className={`material-symbols-outlined transition-transform ${
                  isRunning || !cameraReady
                    ? "cursor-not-allowed text-slate-400"
                    : "text-[#003d9b] hover:rotate-90"
                }`}
              >
                refresh
              </button>
          </div>

          <div className="relative mb-4 flex justify-center md:mb-5">
            <div className="biometric-ring h-32 w-32 rounded-full p-1 sm:h-36 sm:w-36 lg:h-40 lg:w-40">
              <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${cameraReady ? "opacity-100" : "opacity-0"}`}
                />
                {!cameraReady && (
                  <img
                    alt="Close up of a professional young Asian male employee in a white shirt looking directly into camera with neutral expression for facial recognition biometric scan"
                    className="absolute inset-0 h-full w-full object-cover grayscale-[0.2]"
                    src={FACE_IMAGE}
                  />
                )}
                <div className={`absolute inset-x-0 top-1/4 h-1/2 w-full bg-gradient-to-b from-transparent via-[#003d9b]/20 to-transparent ${isRunning ? "animate-pulse" : "opacity-60"}`} />
              </div>
            </div>

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#003d9b] px-4 py-1 text-xs font-bold text-white shadow-lg">
              {summary.similarity}
            </div>
          </div>

          <div className="mb-4 space-y-1.5 text-center md:mb-5">
            <h3 className="text-lg font-bold text-slate-900">Xác thực khuôn mặt</h3>
            <p className={`font-medium text-[#003d9b] ${isRunning ? "animate-pulse" : ""}`}>
              {isCompleted
                ? "Xác thực hoàn tất"
                : isRunning
                  ? "Đang chụp ảnh xác minh"
                  : hasCaptured
                    ? "Đã có ảnh xác minh, bạn có thể checkout"
                  : cameraReady
                    ? "Camera đã sẵn sàng để xác minh"
                    : "Đang chờ quyền truy cập camera"}
            </p>
            <div className="flex items-start gap-2 rounded-xl bg-white/70 p-3 text-left backdrop-blur-sm">
              <div className="space-y-2">
                {faceGuides.map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
                {capturedImage && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
                    <img
                      src={`data:image/jpeg;base64,${capturedImage}`}
                      alt="Captured verification face"
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-700">Đã chụp ảnh xác minh</p>
                      <p className="text-[11px] text-emerald-600">Bạn có thể chụp lại hoặc gửi checkout.</p>
                    </div>
                  </div>
                )}
                {cameraError && <div className="text-xs font-medium text-red-600">{cameraError}</div>}
                {submitError && <div className="text-xs font-medium text-red-600">{submitError}</div>}
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Vị trí GPS</h4>
              <span className="flex items-center gap-1 rounded-full bg-[#d9e2ff] px-2 py-0.5 text-[10px] font-bold text-[#003d9b]">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                {summary.gpsStatus}
              </span>
            </div>

            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-slate-200 shadow-inner sm:h-32 md:h-36 lg:h-40">
              <img
                alt="Modern stylized map interface showing a blue circular geofence radius centered on a tall building in an urban area with clean pastel colors"
                className="h-full w-full object-cover"
                src={MAP_IMAGE}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#003d9b] bg-[#003d9b]/10 sm:h-20 sm:w-20">
                  <div className="h-3 w-3 rounded-full bg-[#003d9b] shadow-[0_0_15px_#003d9b]" />
                </div>
              </div>
            </div>

            <div className="space-y-1 rounded-xl bg-white/80 p-3 backdrop-blur-sm">
              <p className="text-xs font-bold text-[#003d9b]">{summary.locationStatus}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {currentAddress || employee.workplace}
              </p>
              <p className="font-mono text-[10px] text-slate-400">{summary.coordinates}</p>
              {gpsData && (
                <p className="text-[10px] text-slate-500">
                  Accuracy: ±{gpsData.accuracy.toFixed(0)}m • Distance: {gpsData.distance.toFixed(0)}m
                </p>
              )}
              {locationStatus === "checking" && <p className="text-[10px] text-[#003d9b]">Đang lấy vị trí thật từ trình duyệt...</p>}
              {gpsError && <p className="text-[10px] font-medium text-red-600">{gpsError}</p>}
              {locationStatus !== "checking" && (
                <button
                  type="button"
                  onClick={() => initGPS(true)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Kiểm tra lại GPS
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col p-4 sm:p-5 md:w-[57%] md:p-5 lg:p-6">
          <div className="mb-4 flex items-start justify-between md:mb-5">
            <div>
              <h2 className="mb-1 text-2xl font-extrabold text-slate-900 lg:text-3xl">Check-out</h2>
              <p className="text-sm font-medium text-slate-500">
                {currentTime.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="material-symbols-outlined rounded-full p-2 transition hover:bg-slate-100"
            >
              close
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mb-5">
            <StatBlock title="Giờ vào" value={employee.checkinTime} />
            <StatBlock title="Giờ ra dự kiến" value={employee.scheduledCheckout} />
            <div className="col-span-2 flex items-center justify-between rounded-xl bg-[#d9e2ff]/40 p-3.5 lg:p-4">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#003d9b]">
                  Thời gian làm việc
                </p>
                <p className="text-xl font-extrabold text-[#003d9b] lg:text-2xl">{summary.totalHours}</p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#003d9b]">
                  Trạng thái
                </p>
                <span className="rounded-full bg-[#003d9b] px-3 py-1 text-[10px] font-black text-white">
                  {summary.shiftStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4 md:mb-5">
            <label className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Ghi chú (Tùy chọn)
            </label>
            <textarea
              className="h-20 w-full resize-none rounded-t-xl border-b-2 border-slate-300 bg-slate-100 p-3 text-sm transition-all focus:border-[#003d9b] focus:outline-none"
              placeholder="Nhập ghi chú công việc hôm nay..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="mb-4 space-y-3 md:mb-5">
            <h4 className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Lịch sử hôm nay
            </h4>
            <div className="relative space-y-4 pl-6">
              <div className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-slate-200" />
              {timelineItems.map((item) => (
                <div key={item.title} className={`relative ${item.active ? "" : "opacity-50"}`}>
                  <div className={`absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full ring-4 ${item.active ? "bg-[#003d9b] ring-[#d9e2ff]" : "bg-slate-300 ring-slate-100"}`} />
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <button
              type="button"
              className={`flex w-full items-center justify-center gap-3 rounded-full py-3.5 text-base font-extrabold text-white shadow-lg transition-all active:scale-[0.98] lg:py-4 lg:text-lg ${
                isSubmitting || !hasCaptured
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-gradient-to-r from-[#003d9b] to-[#5a8dee] hover:brightness-110"
              }`}
              disabled={isSubmitting || !hasCaptured}
              onClick={handleSubmitCheckout}
            >
              <span className="material-symbols-outlined">logout</span>
              {isCompleted
                ? "Checkout đã hoàn tất"
                : isSubmitting
                  ? "Đang gửi checkout..."
                  : !hasCaptured
                    ? "Chụp khuôn mặt trước khi checkout"
                    : "Gửi request checkout"}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard title="Giờ checkout" value={summary.checkoutTime} highlight="text-slate-900" />
              <ResultCard title="GPS accuracy" value={gpsData ? `±${gpsData.accuracy.toFixed(0)}m` : "--"} highlight="text-slate-900" />
              <ResultCard title="Tăng ca" value={summary.overtime} highlight="text-emerald-600" />
              <ResultCard title="Ảnh xác minh" value={hasCaptured ? "Đã chụp" : "Chưa chụp"} highlight="text-amber-600" />
              <ResultCard title="Liveness" value={summary.liveness} highlight="text-[#003d9b]" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  startCamera();
                }}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Chụp lại khuôn mặt
              </button>
              <button
                type="button"
                onClick={initGPS}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Kiểm tra lại GPS
              </button>
            </div>
            <p className="px-2 text-center text-[11px] text-slate-400 sm:px-4">
              Lưu ý: Bằng cách nhấn Check-out, bạn xác nhận đã hoàn thành các nhiệm vụ trong ca làm việc và dữ liệu vị trí là chính xác.
            </p>
          </div>
        </div>

        <style>{`
          .biometric-ring {
            background: conic-gradient(from 180deg, #d9e2ff, #003d9b, #d9e2ff);
          }
        `}</style>
      </div>
      </div>
    </div>
  );
}

function StatBlock({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-100 p-4">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
      <p className="text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function ResultCard({ title, value, highlight }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className={`mt-2 text-lg font-extrabold sm:text-xl ${highlight}`}>{value}</p>
    </div>
  );
}
