import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FaceDetector,
    FaceLandmarker,
    HandLandmarker,
    FilesetResolver,
} from "@mediapipe/tasks-vision";

const employee = {
    id: localStorage.getItem("employeeId"),
    name: "Đinh Viết Lộc",
    department: "IT Department",
    position: "Software Engineer",
};

const instructions = [
    "Hệ thống sẽ tự chụp khi khuôn mặt đạt chuẩn chất lượng",
    "Ưu tiên ảnh chính diện và quay nhẹ trái/phải",
    "Ánh sáng tốt, không che mặt",
    "Không đeo kính tối màu, khẩu trang",
    "Giữ khuôn mặt trong khung xanh",
];

const captureGuides = [
    {
        id: 1,
        title: "Ảnh chính diện",
        description: "Nhìn thẳng vào camera",
        icon: "face",
        instruction: "Vui lòng nhìn thẳng vào camera",
    },
    {
        id: 2,
        title: "Ảnh chính diện bổ sung",
        description: "Giữ mặt thẳng, rõ nét",
        icon: "face",
        instruction: "Giữ mặt thẳng, đủ sáng, không che mặt",
    },
    {
        id: 3,
        title: "Quay nhẹ trái/phải",
        description: "Xoay nhẹ sang trái hoặc phải",
        icon: "sync_alt",
        instruction: "Quay nhẹ sang trái hoặc phải khoảng 10-25 độ",
    },
    {
        id: 4,
        title: "Quay nhẹ trái/phải",
        description: "Thêm một góc lệch nhẹ khác",
        icon: "sync_alt",
        instruction: "Giữ góc trái/phải nhẹ, mặt vẫn rõ trong khung",
    },
    {
        id: 5,
        title: "Ảnh bổ sung",
        description: "Góc tốt bất kỳ",
        icon: "add_a_photo",
        instruction: "Giữ góc mặt rõ, chất lượng tốt để bổ sung hồ sơ",
    },
];

const items = [
    { icon: "light_mode", text: "Lux: Auto" },
    { icon: "center_focus_strong", text: "Focal: Tracking" },
    { icon: "security", text: "Encrypted-Session" },
];

const CAMERA_FACING_MODES = {
    front: "user",
    back: "environment",
};

const MAX_CAPTURES = 5;
const MIN_ACCEPTED_CAPTURES = 4;
const AUTO_CAPTURE_SECONDS = 3;

// ===== FACE / QUALITY HELPERS =====

const getLandmarkBounds = (landmarks) => {
    if (!landmarks?.length) return null;

    let minX = 1;
    let minY = 1;
    let maxX = 0;
    let maxY = 0;

    for (const p of landmarks) {
        if (!p) continue;
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY),
    };
};

const expandBounds = (box, padding = 0.02) => {
    if (!box) return null;

    const minX = Math.max(0, box.minX - padding);
    const minY = Math.max(0, box.minY - padding);
    const maxX = Math.min(1, box.maxX + padding);
    const maxY = Math.min(1, box.maxY + padding);

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY),
    };
};

const getIntersectionRatio = (a, b) => {
    if (!a || !b) return 0;

    const x1 = Math.max(a.minX, b.minX);
    const y1 = Math.max(a.minY, b.minY);
    const x2 = Math.min(a.maxX, b.maxX);
    const y2 = Math.min(a.maxY, b.maxY);

    const w = Math.max(0, x2 - x1);
    const h = Math.max(0, y2 - y1);
    const intersection = w * h;

    const areaA = Math.max(0.000001, a.width * a.height);
    return intersection / areaA;
};

const detectHandOcclusion = (faceLandmarks, handLandmarksList = []) => {
    if (!faceLandmarks?.length || !handLandmarksList?.length) {
        return {
            covered: false,
            confidence: 0,
            reason: "No hand overlap",
        };
    }

    const faceBox = expandBounds(getLandmarkBounds(faceLandmarks), 0.03);
    if (!faceBox) {
        return {
            covered: false,
            confidence: 0,
            reason: "No face box",
        };
    }

    let maxOverlap = 0;

    for (const handLandmarks of handLandmarksList) {
        const handBox = expandBounds(getLandmarkBounds(handLandmarks), 0.015);
        if (!handBox) continue;

        const overlap = getIntersectionRatio(faceBox, handBox);
        maxOverlap = Math.max(maxOverlap, overlap);
    }

    return {
        covered: maxOverlap > 0.08,
        confidence: maxOverlap,
        reason:
            maxOverlap > 0.08
                ? "Bàn tay đang che hoặc chạm vào vùng khuôn mặt"
                : "No hand overlap",
    };
};

const calculateFaceAngle = (landmarks, previousAngle = null, handLandmarksList = []) => {
    if (!landmarks || landmarks.length < 468) return null;

    const noseTip = landmarks[1];
    const leftEyeOuter = landmarks[33];
    const rightEyeOuter = landmarks[263];
    const leftMouth = landmarks[61];
    const rightMouth = landmarks[291];
    const chin = landmarks[152];
    const forehead = landmarks[10];

    const eyeDistance = Math.sqrt(
        Math.pow(rightEyeOuter.x - leftEyeOuter.x, 2) +
        Math.pow(rightEyeOuter.y - leftEyeOuter.y, 2)
    );

    if (!eyeDistance) return null;

    const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
    const eyeCenterY = (leftEyeOuter.y + rightEyeOuter.y) / 2;
    const mouthCenterX = (leftMouth.x + rightMouth.x) / 2;
    const mouthCenterY = (leftMouth.y + rightMouth.y) / 2;

    const faceHeight = Math.abs(chin.y - forehead.y);
    if (!faceHeight) return null;

    const yawRatio = (noseTip.x - eyeCenterX) / eyeDistance;
    let yawAngle = yawRatio * 28;

    const eyeToMouthY = mouthCenterY - eyeCenterY;
    if (!eyeToMouthY) return null;

    const midY = eyeCenterY + eyeToMouthY * 0.5;
    const pitchRatio = (noseTip.y - midY) / faceHeight;
    let pitchAngle = pitchRatio * 85;

    yawAngle = Math.max(-35, Math.min(35, yawAngle));
    pitchAngle = Math.max(-25, Math.min(25, pitchAngle));

    if (previousAngle) {
        yawAngle = previousAngle.yaw * 0.7 + yawAngle * 0.3;
        pitchAngle = previousAngle.pitch * 0.7 + pitchAngle * 0.3;
    }

    const landmarkConfidence = calculateLandmarkConfidence(landmarks);
    const imageQuality = calculateImageQuality(landmarks, eyeDistance);
    const faceCoverage = detectFaceCoverage(landmarks);
    const handOcclusion = detectHandOcclusion(landmarks, handLandmarksList);

    return {
        yaw: yawAngle,
        pitch: pitchAngle,
        isValid: true,
        confidence: landmarkConfidence,
        quality: imageQuality,
        coverage: faceCoverage,
        debug: {
            eyeDistance,
            landmarkConfidence,
            imageQuality,
            faceCoverage,
            handOcclusion,
            yawRatio,
            pitchRatio,
            mouthCenterX,
        },
    };
};

const calculateLandmarkConfidence = (landmarks) => {
    if (!landmarks || landmarks.length < 468) return 0;

    const keyLandmarks = [1, 33, 263, 61, 291];
    let visibleCount = 0;

    keyLandmarks.forEach((index) => {
        const p = landmarks[index];
        if (
            p &&
            p.x >= 0 &&
            p.x <= 1 &&
            p.y >= 0 &&
            p.y <= 1 &&
            p.z !== undefined
        ) {
            visibleCount++;
        }
    });

    return visibleCount / keyLandmarks.length;
};

const calculateImageQuality = (landmarks, eyeDistance) => {
    if (!landmarks || !eyeDistance) return { score: 0, issues: [] };

    const issues = [];
    let score = 100;

    if (eyeDistance < 0.08) {
        issues.push("Khuôn mặt quá nhỏ");
        score -= 30;
    } else if (eyeDistance < 0.12) {
        issues.push("Nên tiến lại gần camera hơn");
        score -= 15;
    }

    const noseTip = landmarks[1];
    const offsetX = Math.abs(noseTip.x - 0.5);
    const offsetY = Math.abs(noseTip.y - 0.5);

    if (offsetX > 0.3 || offsetY > 0.3) {
        issues.push("Khuôn mặt chưa nằm giữa khung");
        score -= 20;
    }

    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeDistanceCheck = Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) +
        Math.pow(rightEye.y - leftEye.y, 2)
    );

    if (eyeDistanceCheck < 0.05) {
        issues.push("Khó nhận diện khuôn mặt");
        score -= 25;
    }

    return {
        score: Math.max(0, score),
        issues,
        isGood: score >= 70,
    };
};

const detectFaceCoverage = (landmarks) => {
    if (!landmarks || landmarks.length < 468) {
        return { covered: false, confidence: 0, reason: "No landmarks", details: [] };
    }

    const isValidPoint = (p) =>
        p &&
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        Number.isFinite(p.z) &&
        p.x >= 0 &&
        p.x <= 1 &&
        p.y >= 0 &&
        p.y <= 1;

    const ratioVisible = (indices) => {
        let visible = 0;
        for (const idx of indices) {
            if (isValidPoint(landmarks[idx])) visible++;
        }
        return visible / indices.length;
    };

    const zConsistency = (indices, maxDelta = 0.08) => {
        let ok = 0;
        let total = 0;

        for (let i = 0; i < indices.length - 1; i++) {
            const p1 = landmarks[indices[i]];
            const p2 = landmarks[indices[i + 1]];
            if (isValidPoint(p1) && isValidPoint(p2)) {
                total++;
                if (Math.abs(p1.z - p2.z) <= maxDelta) ok++;
            }
        }

        return total > 0 ? ok / total : 0;
    };

    const groups = {
        outline: [10, 152, 234, 454],
        leftEye: [33, 133, 157, 158, 159, 160, 161, 173],
        rightEye: [263, 362, 387, 388, 389, 390, 398, 466],
        nose: [6, 19, 94, 125, 141, 168, 195, 197, 4, 1],
        mouth: [61, 78, 13, 14, 308, 291],
    };

    const outlineVisible = ratioVisible(groups.outline);
    const leftEyeVisible = ratioVisible(groups.leftEye);
    const rightEyeVisible = ratioVisible(groups.rightEye);
    const noseVisible = ratioVisible(groups.nose);
    const mouthVisible = ratioVisible(groups.mouth);

    const leftEyeStable = zConsistency(groups.leftEye, 0.06);
    const rightEyeStable = zConsistency(groups.rightEye, 0.06);
    const noseStable = zConsistency(groups.nose, 0.1);

    const details = [
        { name: "Face outline", visible: outlineVisible, threshold: 0.75 },
        { name: "Left eye visibility", visible: leftEyeVisible, threshold: 0.75 },
        { name: "Right eye visibility", visible: rightEyeVisible, threshold: 0.75 },
        { name: "Left eye consistency", visible: leftEyeStable, threshold: 0.6 },
        { name: "Right eye consistency", visible: rightEyeStable, threshold: 0.6 },
        { name: "Nose visibility", visible: noseVisible, threshold: 0.8 },
        { name: "Nose bridge continuity", visible: noseStable, threshold: 0.65 },
        { name: "Mouth visibility", visible: mouthVisible, threshold: 0.8 },
    ];

    const failedChecks = details.filter((item) => item.visible < item.threshold);

    const eyesLikelyCovered =
        leftEyeVisible < 0.75 ||
        rightEyeVisible < 0.75 ||
        leftEyeStable < 0.6 ||
        rightEyeStable < 0.6;

    const centerLikelyCovered =
        noseVisible < 0.8 || noseStable < 0.65 || mouthVisible < 0.8;

    const covered = failedChecks.length >= 2 || eyesLikelyCovered || centerLikelyCovered;

    const avgConfidence =
        details.reduce((sum, item) => sum + item.visible, 0) / details.length;

    return {
        covered,
        confidence: avgConfidence,
        reason: covered ? `Failed ${failedChecks.length} coverage checks` : "Face fully visible",
        details,
    };
};

const getOcclusionMessage = (faceCoverage) => {
    if (!faceCoverage?.covered) return "";

    const details = faceCoverage.details || [];
    const failed = details
        .filter((item) => item.visible < item.threshold)
        .map((item) => item.name.toLowerCase());

    if (failed.some((name) => name.includes("eye"))) {
        return "Khuôn mặt đang bị che ở vùng mắt. Vui lòng bỏ tay hoặc vật cản ra khỏi mặt.";
    }

    if (failed.some((name) => name.includes("nose"))) {
        return "Khuôn mặt đang bị che ở vùng mũi. Vui lòng để lộ rõ mũi và miệng.";
    }

    if (failed.some((name) => name.includes("mouth"))) {
        return "Khuôn mặt đang bị che ở vùng miệng. Vui lòng bỏ tay hoặc vật cản khỏi mặt.";
    }

    return "Khuôn mặt đang bị che. Vui lòng để lộ rõ mắt, mũi và miệng.";
};

const classifyPose = ({ yaw, pitch }) => {
    if (Math.abs(yaw) <= 15 && Math.abs(pitch) <= 12) return "frontal";
    if (yaw < -15 && yaw >= -28 && Math.abs(pitch) <= 18) return "left";
    if (yaw > 15 && yaw <= 28 && Math.abs(pitch) <= 18) return "right";
    if (pitch < -12 && pitch >= -20 && Math.abs(yaw) <= 18) return "up";
    if (pitch > 12 && pitch <= 20 && Math.abs(yaw) <= 18) return "down";
    return "extreme";
};

const getPoseLabel = (pose) => {
    switch (pose) {
        case "frontal":
            return "Chính diện";
        case "left":
            return "Quay trái nhẹ";
        case "right":
            return "Quay phải nhẹ";
        case "up":
            return "Ngẩng nhẹ";
        case "down":
            return "Cúi nhẹ";
        default:
            return "Không xác định";
    }
};

const validateFrameQuality = (angle) => {
    if (!angle || !angle.isValid) {
        return { ok: false, reason: "Không nhận diện rõ khuôn mặt", code: "NO_FACE" };
    }

    const {
        eyeDistance = 0,
        landmarkConfidence = 0,
        imageQuality = { score: 0, issues: [] },
        faceCoverage = { covered: false },
        handOcclusion = { covered: false },
    } = angle.debug || {};

    if (handOcclusion.covered) {
        return {
            ok: false,
            reason: "Phát hiện bàn tay đang che hoặc chạm vào mặt. Vui lòng bỏ tay ra khỏi khuôn mặt.",
            code: "HAND_ON_FACE",
        };
    }

    if (faceCoverage.covered) {
        return {
            ok: false,
            reason: getOcclusionMessage(faceCoverage),
            code: "FACE_OCCLUDED",
        };
    }

    if (landmarkConfidence < 0.65) {
        return {
            ok: false,
            reason: "Không nhận diện rõ khuôn mặt",
            code: "LOW_CONFIDENCE",
        };
    }

    if (imageQuality.score < 55) {
        return {
            ok: false,
            reason:
                imageQuality.issues?.length > 0
                    ? imageQuality.issues.join(", ")
                    : "Chất lượng ảnh thấp",
            code: "LOW_QUALITY",
        };
    }

    if (eyeDistance < 0.075) {
        return {
            ok: false,
            reason: "Khuôn mặt quá nhỏ, vui lòng tiến gần hơn",
            code: "FACE_TOO_SMALL",
        };
    }

    if (Math.abs(angle.yaw) > 32 || Math.abs(angle.pitch) > 22) {
        return {
            ok: false,
            reason: "Góc mặt quá lệch",
            code: "ANGLE_TOO_LARGE",
        };
    }

    const pose = classifyPose(angle);

    return {
        ok: true,
        pose: pose === "extreme" ? "frontal" : pose,
        reason: "Ảnh đạt chuẩn",
        code: "OK",
    };
};

const validateCaptureSet = (captures) => {
    const accepted = captures.filter((c) => !c.skipped);

    if (accepted.length < MIN_ACCEPTED_CAPTURES) {
        return {
            ok: false,
            reason: `Cần ít nhất ${MIN_ACCEPTED_CAPTURES} ảnh đạt chuẩn`,
        };
    }

    const poses = accepted.map((c) => c.pose);
    const frontalCount = poses.filter((p) => p === "frontal").length;
    const sideCount = poses.filter((p) => p === "left" || p === "right").length;

    if (frontalCount < 1) {
        return {
            ok: false,
            reason: "Cần ít nhất 1 ảnh chính diện rõ mặt",
        };
    }

    if (sideCount < 2) {
        return {
            reason: "Cần thêm ít nhất 2 ảnh quay nhẹ trái/phải",
        };
    }

    return {
        ok: true,
        reason: "Đã thu thập đủ ảnh đạt chuẩn để đăng ký khuôn mặt",
    };
};

// API Base URL configuration
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// Prepare data for backend API
const prepareFaceRegistrationData = (captures) => {
    const accepted = captures.filter((c) => !c.skipped && c.dataUrl);

    // Convert dataUrl to base64 (remove data:image/jpeg;base64, prefix)
    const faceImagesBase64 = accepted.map(capture => {
        const base64Data = capture.dataUrl.split(',')[1]; // Remove prefix
        return base64Data;
    });

    return {
        employeeId: Number(employee.id), // Convert to Number for Long type
        faceImagesBase64: faceImagesBase64
    };
};

// Send face registration data to backend
const sendFaceRegistration = async (registrationData) => {
    try {
        if (!API_BASE_URL) {
            throw new Error("Thiếu VITE_API_BASE_URL");
        }

        const response = await fetch(`${API_BASE_URL}/api/attendance/face/registration`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(registrationData),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(result?.message || `HTTP error! status: ${response.status}`);
        }

        console.log("Face registration successful:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error("Face registration failed:", error);
        return { success: false, error: error.message };
    }
};

export default function FaceRegistrationPage() {
    const [captures, setCaptures] = useState([]);
    const [cameraFacing, setCameraFacing] = useState("front");
    const [activeStep, setActiveStep] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const [faceAngles, setFaceAngles] = useState([]);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationSummary, setValidationSummary] = useState(null);
    const [retakeIndex, setRetakeIndex] = useState(null);
    const [inlineMessage, setInlineMessage] = useState("");

    const completedCount = captures.length;

    const handleCapture = useCallback((photo, faceAngle) => {
        const validation = validateFrameQuality(faceAngle);

        if (!validation.ok) {
            setInlineMessage(`❌ ${validation.reason}`);
            return false;
        }

        const enrichedPhoto = {
            ...photo,
            pose: validation.pose,
            poseLabel: getPoseLabel(validation.pose),
            yaw: faceAngle?.yaw ?? 0,
            pitch: faceAngle?.pitch ?? 0,
        };

        setInlineMessage(`✅ Đã chụp: ${getPoseLabel(validation.pose)}`);

        if (retakeIndex !== null) {
            setCaptures((prev) => {
                const next = [...prev];
                next[retakeIndex] = enrichedPhoto;
                return next;
            });

            setFaceAngles((prev) => {
                const next = [...prev];
                next[retakeIndex] = faceAngle;
                return next;
            });

            setRetakeIndex(null);
            setActiveStep((prev) => Math.min(prev + 1, MAX_CAPTURES));
            return true;
        }

        setCaptures((prev) => {
            if (prev.length >= MAX_CAPTURES) return prev;
            return [...prev, enrichedPhoto];
        });

        setFaceAngles((prev) => {
            if (prev.length >= MAX_CAPTURES) return prev;
            return [...prev, faceAngle];
        });

        setActiveStep((prev) => Math.min(prev + 1, MAX_CAPTURES));
        return true;
    }, [retakeIndex]);

    const handleRetake = useCallback(() => {
        if (retakeIndex !== null) {
            setRetakeIndex(null);
        }
        setCaptures((prev) => prev.slice(0, -1));
        setFaceAngles((prev) => prev.slice(0, -1));
        setActiveStep((prev) => Math.max(prev - 1, 0));
        setInlineMessage("");
    }, [retakeIndex]);

    const handleSkip = useCallback(() => {
        setCaptures((prev) => {
            if (prev.length >= MAX_CAPTURES) return prev;
            return [...prev, { skipped: true, id: crypto.randomUUID() }];
        });
        setFaceAngles((prev) => {
            if (prev.length >= MAX_CAPTURES) return prev;
            return [...prev, null];
        });
        setActiveStep((prev) => Math.min(prev + 1, MAX_CAPTURES));
    }, []);

    const handleSwitchCamera = useCallback(() => {
        setCameraFacing((prev) => (prev === "front" ? "back" : "front"));
    }, []);

    const validateAllCaptures = useCallback(() => {
        const summary = validateCaptureSet(captures);
        setValidationSummary(summary);
        setShowValidationModal(true);
        return summary.ok;
    }, [captures]);

    useEffect(() => {
        if (completedCount === MAX_CAPTURES) {
            const timer = setTimeout(() => {
                validateAllCaptures();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [completedCount]);

    const handleRetakeInvalid = useCallback((index) => {
        setRetakeIndex(index);
        setActiveStep(index);
        setShowValidationModal(false);
        setInlineMessage("Vui lòng chụp lại ảnh này với góc mặt rõ hơn");
    }, []);

    const handleCompleteRegistration = useCallback(async () => {
        if (!validationSummary?.ok) return;

        try {
            // Prepare data for backend
            const registrationData = prepareFaceRegistrationData(captures);

            // Send to backend
            const result = await sendFaceRegistration(registrationData);

            if (result.success) {
                console.log('Face registration completed successfully');
                // You can add navigation or success message here
                alert('Dang ký khuôn mát thành công!');
            } else {
                console.error('Registration failed:', result.error);
                alert(`Dang ký thát bái: ${result.error}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Có lõi xáy ra trong quá trình dang ký');
        }
    }, [validationSummary, captures]);

    const poseStats = useMemo(() => {
        const accepted = captures.filter((c) => !c.skipped);
        const frontal = accepted.filter((c) => c.pose === "frontal").length;
        const left = accepted.filter((c) => c.pose === "left").length;
        const right = accepted.filter((c) => c.pose === "right").length;
        const up = accepted.filter((c) => c.pose === "up").length;
        const down = accepted.filter((c) => c.pose === "down").length;

        return { frontal, left, right, up, down, accepted: accepted.length };
    }, [captures]);

    return (
        <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed-dim min-h-screen px-2 sm:px-4 md:px-8 lg:px-12">
            <Header />

            <main className="py-4 sm:py-6 md:py-8 min-h-[calc(100vh-80px)]">
                <div className="space-y-6 lg:space-y-8">
                    <section className="flex flex-col items-center">
                        <div className="w-full bg-surface-container-lowest rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm flex flex-col items-center">
                            <CameraPreview
                                onCapture={handleCapture}
                                cameraFacing={cameraFacing}
                                completedCount={completedCount}
                                activeStep={activeStep}
                                currentStep={activeStep}
                                inlineMessage={inlineMessage}
                            />

                            <ProgressBar current={activeStep} total={MAX_CAPTURES} />

                            <ActionButtons
                                onRetake={handleRetake}
                                onSkip={handleSkip}
                                onSwitchCamera={handleSwitchCamera}
                                isUsingFrontCamera={cameraFacing === "front"}
                                canRetake={completedCount > 0}
                                canSkip={completedCount < MAX_CAPTURES}
                            />
                        </div>
                    </section>

                    <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start">
                        <aside className="lg:col-span-4 space-y-6">
                            <EmployeeInfoCard employee={employee} />
                            <InstructionsCard instructions={instructions} />
                            <CaptureSummaryCard poseStats={poseStats} />
                            <CaptureGallery captures={captures} onPreview={setPreviewImage} onRetakeInvalid={handleRetakeInvalid} />
                        </aside>

                        <section className="lg:col-span-8">
                            <TechnicalFooter />
                        </section>
                    </div>

                    <div className="lg:hidden space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <EmployeeInfoCard employee={employee} />
                            <CaptureSummaryCard poseStats={poseStats} />
                        </div>
                        
                        <InstructionsCard instructions={instructions} />
                        <CaptureGallery captures={captures} onPreview={setPreviewImage} onRetakeInvalid={handleRetakeInvalid} />
                        <TechnicalFooter />
                    </div>
                </div>
            </main>

            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-surface-container-lowest rounded-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold">Ảnh {previewImage.index + 1}</h3>
                                <p className="text-sm text-on-surface-variant">
                                    {previewImage.poseLabel || "Ảnh đăng ký khuôn mặt"}
                                </p>
                            </div>
                            <img
                                src={previewImage.dataUrl}
                                alt={`Preview ${previewImage.index + 1}`}
                                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}

            {showValidationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-surface-container-low">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    {validationSummary?.ok ? "✅ Hoàn tất đăng ký ảnh" : "⚠️ Cần bổ sung ảnh"}
                                </h2>
                                <button
                                    onClick={() => setShowValidationModal(false)}
                                    className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {validationSummary?.ok ? (
                                <div className="text-center py-8">
                                    <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4">check_circle</span>
                                    <h3 className="text-lg font-bold mb-2">Đã thu đủ ảnh đạt chuẩn</h3>
                                    <p className="text-on-surface-variant mb-6">
                                        Bộ ảnh hiện tại đã phù hợp để gửi backend tạo hồ sơ khuôn mặt.
                                    </p>
                                    <button
                                        onClick={handleCompleteRegistration}
                                        className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                                    >
                                        Ghi danh ký khuôn mát
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div>
                                            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                                                Cần bổ sung để hồ sơ mặt ổn định hơn
                                            </h4>
                                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                                {validationSummary?.reason || "Cần thêm ảnh đạt chuẩn"}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-amber-600">info</span>
                                            <div>
                                                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                                                    Cần bổ sung để hồ sơ mặt ổn định hơn
                                                </h4>
                                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                                    {validationSummary?.reason || "Cần thêm ảnh đạt chuẩn"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {captures.map((capture, index) => {
                                            if (capture.skipped) {
                                                return (
                                                    <div key={capture.id || index} className="flex items-center gap-4 p-3 bg-surface-container rounded-lg border border-surface-container-high">
                                                        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-on-surface-variant">skip_next</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-sm">Ảnh {index + 1}</h4>
                                                            <p className="text-xs text-on-surface-variant">Đã bỏ qua</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRetakeInvalid(index)}
                                                            className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">refresh</span>
                                                            Chụp lại
                                                        </button>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={capture.id || index} className="flex items-center gap-4 p-3 bg-surface-container rounded-lg border border-surface-container-high">
                                                    <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-surface-container-high">
                                                        <img
                                                            src={capture.dataUrl}
                                                            alt={`Capture ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm">Ảnh {index + 1}</h4>
                                                        <p className="text-xs text-on-surface-variant">
                                                            {capture.poseLabel || "Không xác định"} • yaw {capture.yaw?.toFixed(1)}° • pitch {capture.pitch?.toFixed(1)}°
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRetakeInvalid(index)}
                                                        className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">refresh</span>
                                                        Chụp lại
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-end items-center gap-3">
                                        <button
                                            onClick={() => setShowValidationModal(false)}
                                            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            Tiếp tục chỉnh ảnh
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Header() {
    return (
        <header className="bg-[#f8f9fa] dark:bg-[#121212] flex justify-between items-center w-full py-4 sticky top-0 z-50 tonal-shift-no-borders">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="font-headline tracking-tight font-bold text-[#191c1d] dark:text-white text-xl">
                        Face Registration
                    </h1>
                    <p className="text-xs text-on-surface-variant font-medium">
                        Đăng ký khuôn mặt cho chấm công
                    </p>
                </div>
            </div>
        </header>
    );
}

function InfoRow({ label, value, valueClassName = "" }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {label}
            </span>
            <p className={valueClassName}>{value}</p>
        </div>
    );
}

function EmployeeInfoCard({ employee }) {
    return (
        <section className="bg-surface-container-lowest rounded-xl mt-4 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">person</span>
                <h2 className="font-headline text-lg font-bold tracking-tight">
                    Thông tin nhân viên
                </h2>
            </div>

            <div className="space-y-4">
                <InfoRow label="Mã nhân viên" value={employee.id} valueClassName="font-bold text-primary" />
                <div className="w-full h-px bg-surface-container-low" />
                <InfoRow label="Họ và tên" value={employee.name} valueClassName="font-bold" />
                <div className="w-full h-px bg-surface-container-low" />
                <InfoRow label="Phòng ban" value={employee.department} valueClassName="text-on-surface-variant" />
                <InfoRow label="Vị trí" value={employee.position} valueClassName="text-on-surface-variant" />
            </div>
        </section>
    );
}

function InstructionsCard({ instructions = [] }) {
    return (
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-l-4 border-primary">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">info</span>
                <h2 className="font-headline text-lg font-bold tracking-tight">
                    Hướng dẫn đăng ký
                </h2>
            </div>

            <ul className="space-y-4">
                {instructions.map((item, index) => (
                    <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{item}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function CaptureSummaryCard({ poseStats }) {
    return (
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">analytics</span>
                <h2 className="font-headline text-lg font-bold tracking-tight">
                    Thống kê góc ảnh
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-surface-container p-3">
                    <div className="text-on-surface-variant text-xs">Chính diện</div>
                    <div className="font-bold text-lg">{poseStats.frontal}</div>
                </div>
                <div className="rounded-lg bg-surface-container p-3">
                    <div className="text-on-surface-variant text-xs">Trái</div>
                    <div className="font-bold text-lg">{poseStats.left}</div>
                </div>
                <div className="rounded-lg bg-surface-container p-3">
                    <div className="text-on-surface-variant text-xs">Phải</div>
                    <div className="font-bold text-lg">{poseStats.right}</div>
                </div>
                <div className="rounded-lg bg-surface-container p-3">
                    <div className="text-on-surface-variant text-xs">Ngẩng/Cúi</div>
                    <div className="font-bold text-lg">{poseStats.up + poseStats.down}</div>
                </div>
            </div>

            <p className="text-xs text-on-surface-variant mt-4">
                Tối thiểu cần 1 ảnh chính diện và 2 ảnh quay nhẹ trái/phải.
            </p>
        </section>
    );
}

function CaptureGallery({ captures, onPreview, onRetakeInvalid }) {
    return (
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-lg font-bold tracking-tight">Ảnh đã chụp</h2>
                <span className="text-xs font-semibold text-on-surface-variant">
                    {captures.length}/{MAX_CAPTURES}
                </span>
            </div>

            {captures.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2">photo_camera</span>
                    <p className="text-sm">Chưa có ảnh nào được chụp</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {captures.map((capture, index) => (
                        <div
                            key={capture.id || index}
                            className="relative aspect-square rounded-lg overflow-hidden bg-surface-container group"
                        >
                            {capture.skipped ? (
                                <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                                    <span className="material-symbols-outlined">skip_next</span>
                                </div>
                            ) : (
                                <div className="cursor-pointer" onClick={() => onPreview({ ...capture, index })}>
                                    <img
                                        src={capture.dataUrl}
                                        alt={`Capture ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
                                            zoom_in
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                {index + 1}
                            </div>

                            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1">
                                <div className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded truncate">
                                    {capture.skipped ? "Bỏ qua" : capture.poseLabel || "Ảnh"}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRetakeInvalid(index)}
                                    className="bg-primary/90 text-white text-[10px] px-1.5 py-0.5 rounded"
                                >
                                    Chụp lại
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function CameraPreview({ onCapture, cameraFacing, completedCount, currentStep, inlineMessage }) {
    const detectorRef = useRef(null);
    const landmarkerRef = useRef(null);
    const handLandmarkerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const faceSeenAtRef = useRef(0);
    const invalidSinceRef = useRef(null);
    const countdownActiveRef = useRef(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const streamRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const autoCaptureTimeoutRef = useRef(null);
    const autoCaptureLockRef = useRef(false);
    const isStartingRef = useRef(false);

    const [cameraError, setCameraError] = useState("");
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [detectorReady, setDetectorReady] = useState(false);
    const [hasFace, setHasFace] = useState(false);
    const [countdown, setCountdown] = useState(AUTO_CAPTURE_SECONDS);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [faceBox, setFaceBox] = useState(null);
    const [currentFaceAngle, setCurrentFaceAngle] = useState(null);

    const currentValidation = useMemo(() => {
        if (!currentFaceAngle) {
            return { ok: false, reason: "Đang phân tích góc mặt..." };
        }
        return validateFrameQuality(currentFaceAngle);
    }, [currentFaceAngle]);

    const clearCountdown = useCallback(() => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        if (autoCaptureTimeoutRef.current) {
            clearTimeout(autoCaptureTimeoutRef.current);
            autoCaptureTimeoutRef.current = null;
        }

        countdownActiveRef.current = false;
        setIsCountingDown(false);
        setCountdown(AUTO_CAPTURE_SECONDS);
    }, []);

    const stopStream = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }
    }, []);

    const destroyDetector = useCallback(async () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        detectorRef.current = null;
        landmarkerRef.current = null;
        handLandmarkerRef.current = null;
    }, []);

    const loadDetector = useCallback(async () => {
        if (detectorRef.current && landmarkerRef.current && handLandmarkerRef.current) {
            setDetectorReady(true);
            return {
                detector: detectorRef.current,
                landmarker: landmarkerRef.current,
                handLandmarker: handLandmarkerRef.current,
            };
        }

        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const detector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
            },
            runningMode: "VIDEO",
            minDetectionConfidence: 0.6,
        });

        let landmarker = null;
        let handLandmarker = null;

        try {
            landmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numFaces: 1,
                minFaceDetectionConfidence: 0.45,
                minFacePresenceConfidence: 0.45,
                minTrackingConfidence: 0.45,
            });
        } catch (error) {
            console.warn("FaceLandmarker load error:", error);
        }

        try {
            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numHands: 2,
                minHandDetectionConfidence: 0.45,
                minHandPresenceConfidence: 0.45,
                minTrackingConfidence: 0.45,
            });
        } catch (error) {
            console.warn("HandLandmarker load error:", error);
        }

        detectorRef.current = detector;
        landmarkerRef.current = landmarker;
        handLandmarkerRef.current = handLandmarker;
        setDetectorReady(true);

        return { detector, landmarker, handLandmarker };
    }, []);

    const mapDetectionToOverlay = useCallback((box, video, container, isFrontCamera) => {
        const videoW = video.videoWidth;
        const videoH = video.videoHeight;
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;

        if (!videoW || !videoH || !containerW || !containerH) return null;

        const scale = Math.max(containerW / videoW, containerH / videoH);
        const scaledVideoW = videoW * scale;
        const scaledVideoH = videoH * scale;
        const offsetX = (scaledVideoW - containerW) / 2;
        const offsetY = (scaledVideoH - containerH) / 2;

        let x = box.originX;
        const y = box.originY;
        const w = box.width;
        const h = box.height;

        if (isFrontCamera) {
            x = videoW - x - w;
        }

        return {
            left: x * scale - offsetX,
            top: y * scale - offsetY,
            width: w * scale,
            height: h * scale,
        };
    }, []);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !hasFace || completedCount >= MAX_CAPTURES || !currentValidation.ok) {
            return;
        }

        clearCountdown();
        setIsCapturing(true);

        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (cameraFacing === "front") {
            context.save();
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            context.restore();
        } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

        const realFaceAngle = currentFaceAngle || {
            yaw: 0,
            pitch: 0,
            isValid: false,
            message: "Không thể đo góc mặt",
        };

        const accepted = onCapture(
            {
                id: crypto.randomUUID(),
                dataUrl,
                createdAt: Date.now(),
            },
            realFaceAngle
        );

        window.setTimeout(() => {
            setIsCapturing(false);
            autoCaptureLockRef.current = false;
            countdownActiveRef.current = false;

            if (!accepted) {
                setIsCountingDown(false);
            }
        }, 700);
    }, [
        cameraFacing,
        clearCountdown,
        completedCount,
        currentFaceAngle,
        currentValidation.ok,
        hasFace,
        onCapture,
    ]);

    const startCamera = useCallback(async () => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;

        setCameraError("");
        setIsCameraReady(false);
        setDetectorReady(false);
        setHasFace(false);
        setFaceBox(null);
        setCurrentFaceAngle(null);
        clearCountdown();

        stopStream();
        await destroyDetector();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: CAMERA_FACING_MODES[cameraFacing] },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            const video = videoRef.current;
            if (!video) throw new Error("Video element not found");

            streamRef.current = stream;
            video.srcObject = stream;

            await new Promise((resolve) => {
                if (video.readyState >= 1) {
                    resolve();
                    return;
                }

                const handleLoadedMetadata = () => {
                    video.removeEventListener("loadedmetadata", handleLoadedMetadata);
                    resolve();
                };

                video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
            });

            await video.play();
            await loadDetector();

            const detectFrame = () => {
                if (!videoRef.current || !containerRef.current || !detectorRef.current) return;

                if (videoRef.current.readyState >= 2) {
                    const nowMs = performance.now();
                    const result = detectorRef.current.detectForVideo(videoRef.current, nowMs);
                    const detection = result?.detections?.[0];

                    if (!detection) {
                        const now = performance.now();
                        if (now - faceSeenAtRef.current > 800) {
                            setHasFace(false);
                            setFaceBox(null);
                            setCurrentFaceAngle(null);
                        }
                    } else {
                        faceSeenAtRef.current = performance.now();

                        const mappedBox = mapDetectionToOverlay(
                            detection.boundingBox,
                            videoRef.current,
                            containerRef.current,
                            cameraFacing === "front"
                        );

                        setHasFace(true);
                        setFaceBox(mappedBox);

                        if (landmarkerRef.current) {
                            try {
                                const landmarkerResult = landmarkerRef.current.detectForVideo(videoRef.current, nowMs);
                                const faceLandmarks = landmarkerResult?.faceLandmarks?.[0];

                                let handLandmarksList = [];
                                if (handLandmarkerRef.current) {
                                    try {
                                        const handResult = handLandmarkerRef.current.detectForVideo(videoRef.current, nowMs);
                                        handLandmarksList = handResult?.landmarks || [];
                                    } catch (handError) {
                                        console.warn("HandLandmarker detection error:", handError);
                                    }
                                }

                                if (faceLandmarks) {
                                    setCurrentFaceAngle((prev) => {
                                        const angle = calculateFaceAngle(faceLandmarks, prev, handLandmarksList);
                                        return angle || prev;
                                    });
                                }
                            } catch (error) {
                                console.warn("FaceLandmarker detection error:", error);
                            }
                        }
                    }
                }

                animationFrameRef.current = requestAnimationFrame(detectFrame);
            };

            animationFrameRef.current = requestAnimationFrame(detectFrame);
            setIsCameraReady(true);
        } catch (error) {
            console.error("startCamera error:", error);
            setCameraError(
                error?.message || "Không thể truy cập camera. Hãy cấp quyền và dùng HTTPS."
            );
        } finally {
            isStartingRef.current = false;
        }
    }, [cameraFacing, clearCountdown, destroyDetector, loadDetector, stopStream, mapDetectionToOverlay]);

    useEffect(() => {
        startCamera();

        return () => {
            clearCountdown();
            stopStream();
            destroyDetector();
        };
    }, [clearCountdown, destroyDetector, startCamera, stopStream]);

    useEffect(() => {
        if (completedCount >= MAX_CAPTURES) {
            clearCountdown();
            return;
        }

        const canStartCountdown =
            hasFace &&
            isCameraReady &&
            detectorReady &&
            currentValidation.ok &&
            !isCapturing &&
            !autoCaptureLockRef.current;

        if (!canStartCountdown) {
            if (!invalidSinceRef.current) {
                invalidSinceRef.current = Date.now();
            }

            if (Date.now() - invalidSinceRef.current > 250) {
                clearCountdown();
            }
            return;
        }

        invalidSinceRef.current = null;

        if (countdownActiveRef.current) {
            return;
        }

        countdownActiveRef.current = true;
        setIsCountingDown(true);
        setCountdown(AUTO_CAPTURE_SECONDS);

        const startedAt = Date.now();

        countdownIntervalRef.current = window.setInterval(() => {
            const elapsed = Math.floor((Date.now() - startedAt) / 1000);
            const remaining = Math.max(AUTO_CAPTURE_SECONDS - elapsed, 0);
            setCountdown(remaining);
        }, 200);

        autoCaptureTimeoutRef.current = window.setTimeout(() => {
            autoCaptureLockRef.current = true;
            capturePhoto();
        }, AUTO_CAPTURE_SECONDS * 1000);
    }, [
        capturePhoto,
        clearCountdown,
        completedCount,
        currentValidation.ok,
        detectorReady,
        hasFace,
        isCameraReady,
        isCapturing,
    ]);

    const statusText = useMemo(() => {
        if (cameraError) return cameraError;
        if (completedCount >= MAX_CAPTURES) return "✅ Đã hoàn tất số lượng ảnh";
        if (!isCameraReady) return "Đang khởi tạo camera";
        if (!detectorReady) return "Đang tải MediaPipe detector";
        if (!hasFace) return "🟡 Đưa mặt vào trong khung";
        if (!currentFaceAngle) return "🟡 Đang phân tích góc mặt...";
        if (!currentValidation.ok) return `🟠 ${currentValidation.reason}`;
        if (hasFace && isCountingDown) return `🟢 Ảnh đạt chuẩn - Tự chụp sau ${countdown}s`;
        return `🟢 ${inlineMessage || "Giữ yên khuôn mặt để tự chụp"}`;
    }, [
        cameraError,
        completedCount,
        countdown,
        currentFaceAngle,
        currentValidation.ok,
        currentValidation.reason,
        detectorReady,
        hasFace,
        inlineMessage,
        isCameraReady,
        isCountingDown,
    ]);

    return (
        <>
            <div
                ref={containerRef}
                className={`relative w-full aspect-[4/3] max-w-2xl bg-black rounded-xl overflow-hidden ring-4 transition-all ${hasFace && currentValidation.ok
                    ? "ring-emerald-500/40"
                    : hasFace && !currentValidation.ok
                        ? "ring-amber-500/50"
                        : "ring-primary/10"
                    }`}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === "front" ? "scale-x-[-1]" : ""}`}
                />

                <div className="absolute inset-0 pointer-events-none">
                    {faceBox ? (
                        <div
                            className={`absolute border-[3px] rounded-[2rem] transition-all duration-75 ${currentValidation.ok
                                ? "border-emerald-400 shadow-[0_0_22px_rgba(74,222,128,0.55)]"
                                : "border-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.45)]"
                                }`}
                            style={{
                                left: `${faceBox.left}px`,
                                top: `${faceBox.top}px`,
                                width: `${faceBox.width}px`,
                                height: `${faceBox.height}px`,
                            }}
                        >
                            <div
                                className={`absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap ${currentValidation.ok ? "bg-emerald-500" : "bg-amber-500"
                                    }`}
                            >
                                {currentValidation.ok ? "Face Ready" : "Face Warning"}
                            </div>
                            <div
                                className={`absolute inset-x-0 top-1/2 h-0.5 animate-pulse ${currentValidation.ok
                                    ? "bg-emerald-300/70 shadow-[0_0_15px_rgba(134,239,172,0.8)]"
                                    : "bg-amber-300/80 shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                                    }`}
                            />
                        </div>
                    ) : (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 sm:w-56 sm:h-72 md:w-64 md:h-80 border-2 border-primary/70 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem]">
                            <div className="absolute -top-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-primary rounded-tl-lg sm:rounded-tl-xl" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-primary rounded-tr-lg sm:rounded-tr-xl" />
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-primary rounded-bl-lg sm:rounded-bl-xl" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-primary rounded-br-lg sm:rounded-br-xl" />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="glass-panel px-4 py-1.5 sm:px-6 sm:py-2 rounded-full flex items-center gap-2 sm:gap-3 bg-black/35 backdrop-blur-md border border-white/10">
                        <span
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${hasFace
                                ? currentValidation.ok
                                    ? "bg-[#4CAF50] shadow-[0_0_8px_#4CAF50]"
                                    : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                                : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                                }`}
                        />
                        <span className="text-white text-[10px] sm:text-xs font-black tracking-widest">
                            {statusText}
                        </span>
                    </div>
                </div>

                {hasFace && isCountingDown && completedCount < MAX_CAPTURES && currentValidation.ok && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 rounded-xl sm:rounded-2xl bg-emerald-500/90 text-white px-3 py-2 sm:px-4 sm:py-3 shadow-lg">
                        <div className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold opacity-90">
                            Auto Capture
                        </div>
                        <div className="text-2xl sm:text-3xl font-black leading-none mt-1">{countdown}s</div>
                        <div className="text-[10px] sm:text-xs mt-1 opacity-90">Giữ nguyên khuôn mặt để tự chụp</div>
                    </div>
                )}

                {completedCount < MAX_CAPTURES && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 rounded-xl sm:rounded-2xl bg-primary/90 text-white px-3 py-2 sm:px-4 sm:py-3 shadow-lg max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-xl sm:text-2xl">
                                {captureGuides[currentStep]?.icon || "face"}
                            </span>
                            <div>
                                <div className="text-xs sm:text-sm font-bold">
                                    Bước {currentStep + 1}: {captureGuides[currentStep]?.title || "Ảnh đăng ký"}
                                </div>
                                <div className="text-[10px] sm:text-xs opacity-90">
                                    {captureGuides[currentStep]?.description || "Giữ mặt rõ trong khung"}
                                </div>
                            </div>
                        </div>

                        <div className="text-[10px] sm:text-xs opacity-90 leading-relaxed mb-2">
                            {captureGuides[currentStep]?.instruction || "Vui lòng giữ khuôn mặt rõ ràng"}
                        </div>

                        {currentFaceAngle && (
                            <div className="text-[10px] sm:text-xs border-t border-white/20 pt-2 mt-2">
                                <div className="flex justify-between gap-2 sm:gap-3">
                                    <span>Yaw:</span>
                                    <span className="font-mono text-[10px] sm:text-xs">{currentFaceAngle.yaw.toFixed(1)}°</span>
                                </div>
                                <div className="flex justify-between gap-2 sm:gap-3">
                                    <span>Pitch:</span>
                                    <span className="font-mono text-[10px] sm:text-xs">{currentFaceAngle.pitch.toFixed(1)}°</span>
                                </div>
                                <div className="flex justify-between gap-2 sm:gap-3">
                                    <span>Pose:</span>
                                    <span className="font-mono text-[10px] sm:text-xs">
                                        {currentValidation.ok ? getPoseLabel(currentValidation.pose) : "Chưa đạt"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="absolute bottom-16 sm:bottom-20 right-3 sm:right-4 z-20 flex gap-2">
                    <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-black/40 text-white backdrop-blur-md border border-white/10"
                    >
                        Reload Camera
                    </button>
                    <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!hasFace || completedCount >= MAX_CAPTURES || !currentValidation.ok}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {completedCount >= MAX_CAPTURES ? "Đã đủ ảnh" : "Chụp nhanh"}
                    </button>
                </div>

                {isCapturing && <div className="absolute inset-0 bg-white/60 animate-pulse z-30" />}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </>
    );
}

function ProgressBar({ current = 0, total = MAX_CAPTURES }) {
    return (
        <>
            <div className="w-full max-w-2xl mt-8 flex gap-2">
                {Array.from({ length: total }).map((_, index) => {
                    const isDone = index < current;
                    const isNext = index === current;

                    return (
                        <div
                            key={index}
                            className={[
                                "h-1.5 flex-1 rounded-full",
                                isDone ? "bg-primary" : isNext ? "bg-primary/30" : "bg-surface-container",
                            ].join(" ")}
                        />
                    );
                })}
            </div>

            <p className="text-xs text-on-surface-variant font-medium mt-3">
                Scan {Math.min(current, total)} of {total} complete
            </p>
        </>
    );
}

function ActionButtons({
    onRetake,
    onSkip,
    onSwitchCamera,
    isUsingFrontCamera,
    canRetake,
    canSkip,
}) {
    return (
        <div className="w-full max-w-2xl mt-6 sm:mt-8 md:mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <button
                onClick={onRetake}
                disabled={!canRetake}
                className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-lg sm:rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
                <span className="material-symbols-outlined text-sm sm:text-base">refresh</span>
                <span className="hidden xs:inline">Retake</span>
                <span className="xs:hidden">Làm lại</span>
            </button>

            <button
                onClick={onSwitchCamera}
                className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-lg sm:rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-low transition-all text-xs sm:text-sm"
            >
                <span className="material-symbols-outlined text-sm sm:text-base">cameraswitch</span>
                <span className="hidden xs:inline">{isUsingFrontCamera ? "Cam trước" : "Cam sau"}</span>
                <span className="xs:hidden">{isUsingFrontCamera ? "Trước" : "Sau"}</span>
            </button>

            <button
                type="button"
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 text-xs sm:text-sm"
            >
                <span
                    className="material-symbols-outlined text-sm sm:text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    timer
                </span>
                <span className="hidden xs:inline">Tự chụp sau {AUTO_CAPTURE_SECONDS} giây</span>
                <span className="xs:inline">Tự chụp</span>
            </button>

            <button
                onClick={onSkip}
                disabled={!canSkip}
                className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-lg sm:rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
                <span className="material-symbols-outlined text-sm sm:text-base">skip_next</span>
                <span className="hidden xs:inline">Bỏ qua</span>
                <span className="xs:hidden">Bỏ qua</span>
            </button>
        </div>
    );
}

function TechnicalFooter() {
    return (
        <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center">
            {items.map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs sm:text-sm">{item.icon}</span>
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter">
                        {item.text}
                    </span>
                </div>
            ))}
        </div>
    );
}