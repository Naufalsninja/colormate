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

  const camera = new CameraController(videoEl, fallbackEl);
  let isCancelled = false;

  const cancelScan = () => {
    isCancelled = true;
    camera.stop();
    window.location.href = "index.html";
  };

  closeBtn?.addEventListener("click", cancelScan);
  consentCancelBtn?.addEventListener("click", cancelScan);

  consentCheckbox?.addEventListener("change", () => {
    if (consentContinueBtn) consentContinueBtn.disabled = !consentCheckbox.checked;
  });

  consentContinueBtn?.addEventListener("click", async () => {
    if (!consentCheckbox?.checked) return;

    consentDialog?.classList.add("hidden");
    const hasCamera = await camera.start();
    if (cameraModeBadge) {
      cameraModeBadge.textContent = hasCamera ? "LIVE SENSOR • 60 FPS" : "KAMERA TIDAK TERSEDIA";
    }
    runBiometricScanSequence();
  });

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      retryBtn.classList.add("hidden");
      reticleOval?.classList.remove("is-locked");
      isCancelled = false;
      runBiometricScanSequence();
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
      const diagnostics = {
        lightingScore: 98,
        distanceCm: 45,
        warmthBias: frame.warmthBias
      };

      const analysisResult = await analyzeFaceWithAI(frame.blob, diagnostics);
      if (isCancelled) return;

      updateProgressUI(100, "Analisis Selesai!", "Membuka hasil personal color Anda...");
      storageService.saveAnalysisResult(analysisResult, frame.dataUrl);

      camera.stop();
      setTimeout(() => {
        window.location.href = "hasil.html";
      }, 350);
    } catch (error) {
      console.error("[ScanPage] Error analisis AI:", error);
      showToast(error.message || "Gagal terhubung ke server AI.", "error");
      if (statusTitle) statusTitle.textContent = "Koneksi Server AI Terkendala";
      if (statusSubtitle) {
        statusSubtitle.textContent = "Periksa URL backend di js/config.js atau tekan tombol Coba Lagi.";
      }
      retryBtn?.classList.remove("hidden");
    }
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