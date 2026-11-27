import { showToast } from "../utils/dom.js";
import { storageService } from "../services/storageService.js";
import { notifyBeautyAdvisor } from "../services/aiService.js";

document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("btnScanTrigger");
  const advisorBtn = document.getElementById("btnCallAdvisor");

  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      scanBtn.classList.add("scale-95");
      storageService.clearSession();

      setTimeout(() => {
        window.location.href = "scan.html";
      }, 150);
    });
  }

  if (advisorBtn) {
    advisorBtn.addEventListener("click", async () => {
      const notified = await notifyBeautyAdvisor();
      showToast(
        notified
          ? "Beauty Advisor sedang menuju ke cermin Anda..."
          : "Layanan Beauty Advisor belum tersedia.",
        "support_agent"
      );
    });
  }
});