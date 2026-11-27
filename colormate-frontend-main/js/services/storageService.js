const KEYS = {
  ANALYSIS_RESULT: "colormate_analysis_result_v1",
  CAPTURED_PHOTO: "colormate_captured_photo_v1",
  ATELIER_BAG: "colormate_atelier_bag_v1"
};

export const storageService = {
  saveAnalysisResult(result, capturedPhotoDataUrl = null) {
    try {
      sessionStorage.setItem(KEYS.ANALYSIS_RESULT, JSON.stringify(result));
      if (capturedPhotoDataUrl) {
        sessionStorage.setItem(KEYS.CAPTURED_PHOTO, capturedPhotoDataUrl);
      }
    } catch (error) {
      console.warn("[StorageService] Gagal menyimpan hasil analisis:", error);
    }
  },

  getAnalysisResult() {
    try {
      const raw = sessionStorage.getItem(KEYS.ANALYSIS_RESULT);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getCapturedPhoto() {
    try {
      return sessionStorage.getItem(KEYS.CAPTURED_PHOTO);
    } catch {
      return null;
    }
  },

  getBag() {
    try {
      const raw = sessionStorage.getItem(KEYS.ATELIER_BAG);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  toggleBagItem(product) {
    const currentBag = this.getBag();
    const existsIndex = currentBag.findIndex((item) => item.id === product.id);

    let added = false;
    if (existsIndex >= 0) {
      currentBag.splice(existsIndex, 1);
      added = false;
    } else {
      currentBag.push(product);
      added = true;
    }

    try {
      sessionStorage.setItem(KEYS.ATELIER_BAG, JSON.stringify(currentBag));
    } catch (error) {
      console.warn("[StorageService] Gagal memperbarui Atelier Bag:", error);
    }

    return { bag: currentBag, added };
  },

  isInBag(productId) {
    return this.getBag().some((item) => item.id === productId);
  },

  clearSession() {
    Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key));
  }
};