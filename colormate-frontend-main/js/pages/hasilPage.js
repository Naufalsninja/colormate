import { FALLBACK_IMAGES } from "../config.js";
import { notifyBeautyAdvisor } from "../services/aiService.js";
import { storageService } from "../services/storageService.js";
import { showToast } from "../utils/dom.js";

document.addEventListener("DOMContentLoaded", () => {
  const analysisData = storageService.getAnalysisResult();
  if (!analysisData) {
    window.location.replace("index.html");
    return;
  }

  const capturedPhoto = storageService.getCapturedPhoto();

  renderProfileSummary(analysisData, capturedPhoto);
  renderColorPalette(analysisData.palette);
  renderProductRecommendations(analysisData.recommendations);
  setupActions(analysisData);
  setupBottomNavigation();
  updateBagBadge();
});

function renderProfileSummary(data, capturedPhoto) {
  const avatarMain = document.getElementById("resultUserPhoto");
  const avatarHeader = document.getElementById("headerUserPhoto");
  const photoUrl = capturedPhoto || FALLBACK_IMAGES.PORTRAIT;

  if (avatarMain) avatarMain.src = photoUrl;
  if (avatarHeader) avatarHeader.src = photoUrl;

  setText("resultSeasonTitle", data.season);
  setText("resultUndertone", `Undertone: ${data.undertone}`);
  setText("resultSpectrum", `Spektrum Rona: ${data.spectrum}`);
  setText("resultDescription", data.description);
  setText("resultConfidence", `Presisi Algoritma ${data.confidence}%`);
  setText(
    "resultContrast",
    data.contrast_level
      ? `Tingkat Kontras: ${data.contrast_level}`
      : "Tingkat Kontras: Belum tersedia"
  );
}

function renderColorPalette(palette) {
  const grid = document.getElementById("colorPaletteGrid");
  if (!grid) return;

  grid.innerHTML = "";
  if (palette.length === 0) {
    grid.textContent = "Palet warna belum disediakan oleh model backend.";
    return;
  }

  palette.forEach((swatch) => {
    const card = document.createElement("button");
    card.type = "button";
    card.title = `Salin kode warna ${swatch.hex}`;
    card.className =
      "flex flex-col items-center p-space-sm rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-transform active:scale-95 cursor-pointer focus:outline-none";

    const circle = document.createElement("div");
    circle.className = "w-14 h-14 rounded-full shadow-inner mb-space-xs border border-black/5";
    circle.style.backgroundColor = swatch.hex;

    const nameEl = document.createElement("span");
    nameEl.className = "font-title-md text-title-md text-on-surface text-center line-clamp-1";
    nameEl.textContent = swatch.name;

    const hexEl = document.createElement("span");
    hexEl.className = "font-label-sm text-label-sm text-outline";
    hexEl.textContent = swatch.hex;

    card.append(circle, nameEl, hexEl);

    card.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(swatch.hex);
        showToast(`Kode warna ${swatch.name} (${swatch.hex}) disalin!`, "content_copy");
      } catch {
        showToast(`${swatch.name}: ${swatch.hex}`, "palette");
      }
    });

    grid.appendChild(card);
  });
}

function renderProductRecommendations(products) {
  const container = document.getElementById("productRecommendationsGrid");
  if (!container) return;

  container.innerHTML = "";
  if (products.length === 0) {
    container.textContent = "Rekomendasi produk belum tersedia dari API backend.";
    return;
  }

  products.forEach((product) => {
    const isSaved = storageService.isInBag(product.id);

    const card = document.createElement("article");
    card.className =
      "flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md";

    card.innerHTML = `
      <div class="flex flex-col">
        <div class="relative w-full h-48 rounded-xl overflow-hidden mb-space-sm bg-surface-container-low flex items-center justify-center">
          <img class="w-full h-full object-cover" alt="${escapeHtml(product.name)}" src="${escapeHtml(product.image_url)}" />
          <div class="absolute top-2.5 right-2.5 px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-title-md text-title-md shadow-xs flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">verified</span>
            <span>Match ${product.match_score}%</span>
          </div>
          <div class="absolute bottom-2.5 left-2.5 px-space-sm py-0.5 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-on-surface tracking-wider uppercase">
            ${escapeHtml(product.category)}
          </div>
        </div>
        <h3 class="font-title-lg text-title-lg text-on-surface leading-snug">${escapeHtml(product.name)}</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mb-space-xs">${escapeHtml(product.subtitle)}</p>
        <div class="flex items-center gap-2 mt-1 py-1.5 px-space-sm rounded-lg bg-surface-container-low">
          <span class="w-4 h-4 rounded-full shrink-0 shadow-xs" style="background-color: ${escapeHtml(product.shade_hex)};"></span>
          <span class="font-label-lg text-label-lg text-on-surface">Shade: ${escapeHtml(product.shade_name)}</span>
        </div>
      </div>
    `;

    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    updateProductButtonState(actionBtn, isSaved);

    actionBtn.addEventListener("click", () => {
      const { added } = storageService.toggleBagItem(product);
      updateProductButtonState(actionBtn, added);
      updateBagBadge();
      showToast(
        added ? `${product.name} ditambahkan ke Atelier Bag` : `${product.name} dihapus dari Bag`,
        added ? "shopping_bag" : "remove_shopping_cart"
      );
    });

    card.appendChild(actionBtn);
    container.appendChild(card);
  });
}

function updateProductButtonState(button, isSaved) {
  if (isSaved) {
    button.className =
      "mt-space-md w-full py-space-sm px-space-md rounded-full bg-primary text-on-primary font-title-md text-title-md transition-colors flex items-center justify-center gap-2";
    button.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">check</span>
      <span>Tersimpan di Atelier Bag</span>
    `;
  } else {
    button.className =
      "mt-space-md w-full py-space-sm px-space-md rounded-full bg-surface-container-high text-primary hover:bg-primary-fixed font-title-md text-title-md transition-colors flex items-center justify-center gap-2";
    button.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">add</span>
      <span>Simpan ke Atelier Bag</span>
    `;
  }
}

function setupActions(data) {
  const finishBtn = document.getElementById("btnFinishSession");
  const shareBtn = document.getElementById("btnShareResult");
  const advisorBtn = document.getElementById("btnConsultAdvisor");
  const closeDrawerBtn = document.getElementById("btnCloseBagDrawer");
  const bagBackdrop = document.getElementById("bagDrawerBackdrop");

  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      storageService.clearSession();
      window.location.href = "index.html";
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      const shades = data.recommendations
        .map((r) => `• ${r.category}: ${r.name} (${r.shade_name})`)
        .join("\n");
      const text = encodeURIComponent(
        `✨ Hasil ColorMate Atelier AI ✨\nPersonal Color: ${data.season}\nUndertone: ${data.undertone}\n\nRekomendasi Produk:\n${shades}`
      );
      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    });
  }

  if (advisorBtn) {
    advisorBtn.addEventListener("click", async () => {
      const notified = await notifyBeautyAdvisor();
      showToast(
        notified
          ? "Permintaan konsultasi terkirim ke Beauty Advisor!"
          : "Layanan Beauty Advisor belum tersedia.",
        "support_agent"
      );
    });
  }

  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeBagDrawer);
  if (bagBackdrop) bagBackdrop.addEventListener("click", closeBagDrawer);
}

function setupBottomNavigation() {
  const navLinks = document.querySelectorAll("nav a[data-path]");
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const path = link.getAttribute("data-path");

      if (path === "skin-analysis") {
        window.location.href = "scan.html";
        return;
      }

      if (path === "consultation-bag") {
        openBagDrawer();
        return;
      }

      if (path === "curated-regimen") {
        document.getElementById("productRecommendationsGrid")?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      navLinks.forEach((item) => {
        item.classList.remove("text-primary", "font-title-md");
        item.classList.add("text-on-surface-variant");
      });
      link.classList.remove("text-on-surface-variant");
      link.classList.add("text-primary", "font-title-md");
    });
  });
}

function updateBagBadge() {
  const badge = document.getElementById("bagCountBadge");
  const count = storageService.getBag().length;
  if (!badge) return;

  if (count > 0) {
    badge.textContent = String(count);
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function openBagDrawer() {
  const drawer = document.getElementById("atelierBagDrawer");
  const list = document.getElementById("bagItemsContainer");
  if (!drawer || !list) return;

  const items = storageService.getBag();
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = `
      <div class="text-center py-10 text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">shopping_bag</span>
        <p class="font-body-md">Atelier Bag Anda masih kosong.</p>
        <p class="font-label-sm text-outline mt-1">Pilih produk rekomendasi untuk menyimpannya di sini.</p>
      </div>
    `;
  } else {
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between p-3 rounded-xl bg-surface-container-low";
      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-6 h-6 rounded-full shrink-0 border border-black/10" style="background-color: ${escapeHtml(item.shade_hex)};"></span>
          <div class="truncate">
            <p class="font-title-md text-on-surface truncate">${escapeHtml(item.name)}</p>
            <p class="font-label-sm text-on-surface-variant truncate">${escapeHtml(item.shade_name)}</p>
          </div>
        </div>
        <span class="font-label-sm text-primary font-semibold ml-2">${item.match_score}%</span>
      `;
      list.appendChild(row);
    });
  }

  drawer.classList.remove("hidden");
}

function closeBagDrawer() {
  document.getElementById("atelierBagDrawer")?.classList.add("hidden");
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}