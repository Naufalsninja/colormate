import { APP_CONFIG, FALLBACK_IMAGES } from "../config.js";

const MOCK_PROFILES = {
  soft_autumn: {
    season: "Soft Autumn",
    undertone: "Warm Muted",
    spectrum: "Emas Lembut",
    confidence: 98.4,
    contrast_level: "Medium-Soft",
    description:
      "Harmoni warna alami dengan rona lembut, bersahaja (earthy), dan kehangatan keemasan yang menonjolkan pesona alamimu dengan anggun dan berseri.",
    palette: [
      { name: "Warm Terracotta", hex: "#C86D51" },
      { name: "Dusty Peach", hex: "#E69A8D" },
      { name: "Spiced Sand", hex: "#D8A47F" },
      { name: "Muted Olive", hex: "#8A865D" },
      { name: "Caramel Latte", hex: "#B5835A" },
      { name: "Apricot Nude", hex: "#E2B29F" },
      { name: "Burnt Rose", hex: "#A35C66" },
      { name: "Almond Warm", hex: "#C9A788" }
    ],
    recommendations: [
      {
        id: "prod-lip-04",
        category: "Lipstick",
        name: "Velvet Matte Silk Lip",
        subtitle: "Rose Cedar Edition",
        shade_name: "04 Terracotta Whisper",
        shade_hex: "#B85949",
        match_score: 96,
        image_url: FALLBACK_IMAGES.PRODUCTS.Lipstick
      },
      {
        id: "prod-blush-02",
        category: "Blush",
        name: "Luminous Mineral Blush",
        subtitle: "Golden Peach Radiant Finish",
        shade_name: "02 Warm Apricot Glow",
        shade_hex: "#E28B6D",
        match_score: 94,
        image_url: FALLBACK_IMAGES.PRODUCTS.Blush
      },
      {
        id: "prod-eye-01",
        category: "Eyeshadow",
        name: "Quad Silk Shadow",
        subtitle: "Earthy Romance Palette",
        shade_name: "01 Soft Amber Palette",
        shade_hex: "#B07455",
        match_score: 92,
        image_url: FALLBACK_IMAGES.PRODUCTS.Eyeshadow
      }
    ]
  },
  cool_summer: {
    season: "Cool Summer",
    undertone: "Cool Soft",
    spectrum: "Perak & Mawar Sejuk",
    confidence: 97.6,
    contrast_level: "Soft-Cool",
    description:
      "Rona kulit berundertone sejuk dengan kelembutan pastel dan nuansa rose-ash yang memberikan efek cerah alami dan elegan tanpa terlihat berlebihan.",
    palette: [
      { name: "Dusty Rose", hex: "#C98290" },
      { name: "Soft Mauve", hex: "#B48395" },
      { name: "Powder Berry", hex: "#9E5B74" },
      { name: "Cool Cocoa", hex: "#8E7378" },
      { name: "Petal Pink", hex: "#E6B2BE" },
      { name: "Muted Plum", hex: "#7D5268" },
      { name: "Orchid Mist", hex: "#C89EB3" },
      { name: "Rose Taupe", hex: "#A8848B" }
    ],
    recommendations: [
      {
        id: "prod-lip-07",
        category: "Lipstick",
        name: "Velvet Matte Silk Lip",
        subtitle: "Parisian Mauve Edition",
        shade_name: "07 Dusty Rose Petal",
        shade_hex: "#C27586",
        match_score: 95,
        image_url: FALLBACK_IMAGES.PRODUCTS.Lipstick
      },
      {
        id: "prod-blush-05",
        category: "Blush",
        name: "Luminous Mineral Blush",
        subtitle: "Cool Rosy Satin Finish",
        shade_name: "05 Soft Peony Flush",
        shade_hex: "#DF94A6",
        match_score: 93,
        image_url: FALLBACK_IMAGES.PRODUCTS.Blush
      },
      {
        id: "prod-eye-03",
        category: "Eyeshadow",
        name: "Quad Silk Shadow",
        subtitle: "Velvet Mauve Harmony",
        shade_name: "03 Rose Quartz Quad",
        shade_hex: "#9B6E82",
        match_score: 91,
        image_url: FALLBACK_IMAGES.PRODUCTS.Eyeshadow
      }
    ]
  }
};

export function getDefaultMockResult() {
  return structuredClone(MOCK_PROFILES.soft_autumn);
}

export async function analyzeFaceWithAI(imageBlob, diagnostics = {}) {
  if (APP_CONFIG.USE_MOCK_AI) {
    return simulateMockAnalysis(diagnostics);
  }

  if (!imageBlob) {
    throw new Error("Foto tidak tersedia. Pastikan izin kamera aktif lalu coba lagi.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append("file", imageBlob, imageBlob.name || "face_capture.jpg");
    formData.append("processing_consent", "true");
    formData.append("storage_consent", "false");
    formData.append("consent_version", APP_CONFIG.CONSENT_VERSION);

    const url = `${APP_CONFIG.API_BASE_URL}${APP_CONFIG.ENDPOINTS.ANALYZE_FACE}`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Server AI merespons dengan status ${response.status}`);
    }

    const payload = await response.json();
    return normalizeAnalysisResponse(payload);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Koneksi ke server AI melebihi batas waktu. Silakan coba lagi.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function notifyBeautyAdvisor() {
  return APP_CONFIG.USE_MOCK_AI;
}

function normalizeAnalysisResponse(raw) {
  const analysis = raw?.analysis;
  if (analysis) {
    const confidence = Number(analysis.confidence_score);
    const predictedSeason = analysis.predicted_class || analysis.season || "Belum tersedia";

    return {
      season: formatSeason(predictedSeason),
      undertone: "Belum tersedia",
      spectrum: "Belum tersedia",
      confidence: Number.isFinite(confidence) ? Math.round(confidence * 100) : 0,
      contrast_level: "Belum tersedia",
      description:
        raw.disclaimer ||
        analysis.summary ||
        "Hasil ini merupakan prediksi eksperimental model AI.",
      palette: Array.isArray(analysis.palette) ? analysis.palette : [],
      recommendations: Array.isArray(analysis.recommendations)
        ? analysis.recommendations
        : []
    };
  }

  const fallback = getDefaultMockResult();
  const data = raw?.data ?? raw ?? {};

  return {
    season: data.season || fallback.season,
    undertone: data.undertone || fallback.undertone,
    spectrum: data.spectrum || fallback.spectrum,
    confidence: Number(data.confidence) || fallback.confidence,
    contrast_level: data.contrast_level || fallback.contrast_level,
    description: data.description || fallback.description,
    palette:
      Array.isArray(data.palette) && data.palette.length > 0
        ? data.palette
        : fallback.palette,
    recommendations:
      Array.isArray(data.recommendations) && data.recommendations.length > 0
        ? data.recommendations.map((item, idx) => ({
            id: item.id || `prod-${idx + 1}`,
            category: item.category || "Makeup",
            name: item.name || "Atelier Recommended Product",
            subtitle: item.subtitle || "Personalized Formula",
            shade_name: item.shade_name || "Signature Shade",
            shade_hex: item.shade_hex || "#C86D51",
            match_score: Number(item.match_score) || 92,
            image_url:
              item.image_url ||
              FALLBACK_IMAGES.PRODUCTS[item.category] ||
              FALLBACK_IMAGES.PRODUCTS.Lipstick
          }))
        : fallback.recommendations
  };
}

function formatSeason(value) {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function simulateMockAnalysis(diagnostics) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = diagnostics.warmthBias === "cool" ? "cool_summer" : "soft_autumn";
      resolve(structuredClone(MOCK_PROFILES[key]));
    }, 800);
  });
}