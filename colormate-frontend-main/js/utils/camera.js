export class CameraController {
  constructor(videoElement, fallbackElement) {
    this.video = videoElement;
    this.fallback = fallbackElement;
    this.stream = null;
    this.isActive = false;
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.activateFallback();
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.video.srcObject = this.stream;
      await this.video.play();
      this.video.classList.remove("hidden");
      if (this.fallback) this.fallback.classList.add("hidden");
      this.isActive = true;
      return true;
    } catch (error) {
      console.warn("[CameraController] Kamera tidak tersedia:", error.message);
      this.activateFallback();
      return false;
    }
  }

  activateFallback() {
    this.isActive = false;
    if (this.video) this.video.classList.add("hidden");
    if (this.fallback) this.fallback.classList.remove("hidden");
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.isActive = false;
  }

  async captureFrame() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (this.isActive && this.video.videoWidth > 0) {
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;

      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

      const warmthBias = estimateWarmthBias(ctx, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));

      return { blob, dataUrl, warmthBias };
    }

    return { blob: null, dataUrl: null, warmthBias: "warm" };
  }
}

function estimateWarmthBias(ctx, width, height) {
  try {
    const sampleSize = 60;
    const x = Math.max(0, Math.floor(width / 2 - sampleSize / 2));
    const y = Math.max(0, Math.floor(height / 2 - sampleSize / 2));
    const { data } = ctx.getImageData(x, y, sampleSize, sampleSize);

    let totalR = 0;
    let totalB = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalB += data[i + 2];
    }
    return totalR / Math.max(1, totalB) >= 1.18 ? "warm" : "cool";
  } catch {
    return "warm";
  }
}