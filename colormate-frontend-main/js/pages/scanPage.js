import { APP_CONFIG } from "../config.js";
import { CameraController } from "../utils/camera.js";
import { analyzeFaceWithAI } from "../services/aiService.js";
import { storageService } from "../services/storageService.js";
import { showToast } from "../utils/dom.js";

document.addEventListener("DOMContentLoaded", async () => {
  const videoEl = document.getElementById("cameraVideo");
  const fallbackEl = document.getElementById("cameraFallback");
  const closeBtn = document.getElementById("btnCloseScan");
  const retryBtn = document.getElementById("btnRetryScan");
  const progressText = document.getElementById("scanProgressPercent");
  const progressBar = document.getElementById("scanProgressBar");
  const statusTitle = document.getElementById("scanStatusTitle");
  const statusSubtitle = document.getElementById("scanStatusSubtitle");
  const reticleOval = document.getElementById("faceReticleOval");
  const cameraModeBadge = document.getElementById("cameraModeLabel");
  const consentDialog = document.getElementById("scanConsentDialog");
  const consentCheckbox = document.getElementById("processingConsent");
  const consentContinueBtn = document.getElementById("btnAcceptConsent");
  const consentCancelBtn = document.getElementById("btnCancelConsent");
  const photoFileInput = document.getElementById("photoUploadInput");
  const photoUploadStatus = document.getElementById("photoUploadStatus");
  const uploadPhotoBtn = document.getElementById("btnUploadPhoto");

  const camera = new CameraController(videoEl, fallbackEl);
  let isCancelled = false;
  let selectedPhoto = null;
  let retryAction = null;
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxUploadBytes = 5 * 1024 * 1024;

  const cancelScan = () => {
    isCancelled = true;
    camera.stop();
    window.location.href = "index.html";
  };

  closeBtn?.addEventListener("click", cancelScan);
  consentCancelBtn?.addEventListener("click", cancelScan);

  consentCheckbox?.addEventListener("change", () => {
    updateConsentButtons();
  });

  photoFileInput?.addEventListener("change", () => {
    selectedPhoto = photoFileInput.files?.[0] || null;
    const validationError = selectedPhoto ? validatePhoto(selectedPhoto) : null;

    if (photoUploadStatus) {
      photoUploadStatus.textContent = validationError
        || selectedPhoto?.name
        || "Belum ada foto dipilih.";
      photoUploadStatus.classList.toggle("text-error", Boolean(validationError));
    }

    updateConsentButtons();
  });

  consentContinueBtn?.addEventListener("click", async () => {
    if (!consentCheckbox?.checked) return;

    consentDialog?.classList.add("hidden");
    retryAction = runBiometricScanSequence;
    const hasCamera = await camera.start();
    if (cameraModeBadge) {
      cameraModeBadge.textContent = hasCamera ? "LIVE SENSOR • 60 FPS" : "KAMERA TIDAK TERSEDIA";
    }
    runBiometricScanSequence();
  });

  uploadPhotoBtn?.addEventListener("click", () => {
    if (!consentCheckbox?.checked || !selectedPhoto) return;

    const validationError = validatePhoto(selectedPhoto);
    if (validationError) {
      if (photoUploadStatus) photoUploadStatus.textContent = validationError;
      return;
    }

    isCancelled = false;
    consentDialog?.classList.add("hidden");
    camera.stop();
    if (cameraModeBadge) cameraModeBadge.textContent = "UPLOAD FOTO";
    retryAction = () => analyzeUploadedPhoto(selectedPhoto);
    analyzeUploadedPhoto(selectedPhoto);
  });

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      retryBtn.classList.add("hidden");
      reticleOval?.classList.remove("is-locked");
      isCancelled = false;
      (retryAction || runBiometricScanSequence)();
    });
  }

  window.addEventListener("beforeunload", () => camera.stop());

  async function runBiometricScanSequence() {
    const steps = [
      { pct: 24, title: "Mendeteksi kontur wajah & pencahayaan...", sub: "Kalibrasi white balance 5500K otomatis." },
      { pct: 52, title: "Memindai area T-Zone dan rona pipi...", sub: "Mengukur spektrum melanin dan hemoglobin kulit." },
      { pct: 78, title: "Mengklasifikasikan musim warna...", sub: "Harap pertahankan posisi pandangan stabil dalam oval." },
      { pct: 92, title: "Memproses prediksi dengan model AI...", sub: "Menyusun hasil klasifikasi warna." }
    ];

    const stepInterval = Math.floor(APP_CONFIG.SCAN_PREP_DURATION_MS / steps.length);

    for (const step of steps) {
      if (isCancelled) return;
      updateProgressUI(step.pct, step.title, step.sub);
      if (step.pct >= 78 && reticleOval) {
        reticleOval.classList.add("is-locked");
      }
      await delay(stepInterval);
    }

    if (isCancelled) return;

    try {
      const frame = await camera.captureFrame();
      await submitPhoto(frame.blob, { warmthBias: frame.warmthBias }, frame.dataUrl);
    } catch (error) {
      showAnalysisError(error);
    }
  }

  async function analyzeUploadedPhoto(file) {
    updateProgressUI(45, "Mengunggah foto...", `Mengirim ${file.name} untuk dianalisis.`);
    await submitPhoto(file);
  }

  async function submitPhoto(imageBlob, diagnostics = {}, capturedPhotoDataUrl = null) {
    try {
      const analysisResult = await analyzeFaceWithAI(imageBlob, diagnostics);
      if (isCancelled) return;

      updateProgressUI(100, "Analisis Selesai!", "Membuka hasil personal color Anda...");
      storageService.saveAnalysisResult(analysisResult, capturedPhotoDataUrl);

      camera.stop();
      setTimeout(() => {
        window.location.href = "hasil.html";
      }, 350);
    } catch (error) {
      showAnalysisError(error);
    }
  }

  function showAnalysisError(error) {
    if (isCancelled) return;

    console.error("[ScanPage] Error analisis AI:", error);
    showToast(error.message || "Gagal terhubung ke server AI.", "error");
    if (statusTitle) statusTitle.textContent = "Koneksi Server AI Terkendala";
    if (statusSubtitle) {
      statusSubtitle.textContent = "Periksa URL backend di js/config.js atau tekan tombol Coba Lagi.";
    }
    retryBtn?.classList.remove("hidden");
  }

  function updateConsentButtons() {
    const hasConsent = Boolean(consentCheckbox?.checked);
    if (consentContinueBtn) consentContinueBtn.disabled = !hasConsent;
    if (uploadPhotoBtn) {
      uploadPhotoBtn.disabled = !hasConsent || !selectedPhoto || Boolean(validatePhoto(selectedPhoto));
    }
  }

  function validatePhoto(file) {
    if (!allowedImageTypes.includes(file.type)) {
      return "Pilih foto berformat JPEG, PNG, atau WebP.";
    }
    if (file.size === 0) {
      return "File foto kosong. Pilih foto lain.";
    }
    if (file.size > maxUploadBytes) {
      return "Ukuran foto maksimal 5 MB.";
    }
    return "";
  }

  function updateProgressUI(percent, title, subtitle) {
    if (progressText) progressText.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (statusTitle) statusTitle.textContent = title;
    if (statusSubtitle) statusSubtitle.textContent = subtitle;
  }
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}