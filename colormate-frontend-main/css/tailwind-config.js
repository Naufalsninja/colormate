window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#904857",
        "on-primary": "#ffffff",
        "primary-container": "#e08b9b",
        "on-primary-container": "#622433",
        "primary-fixed": "#ffd9de",
        "primary-fixed-dim": "#ffb2bf",
        "on-primary-fixed": "#3c0616",
        "on-primary-fixed-variant": "#733140",
        "inverse-primary": "#ffb2bf",

        "secondary": "#735c00",
        "on-secondary": "#ffffff",
        "secondary-container": "#fed65b",
        "on-secondary-container": "#745c00",
        "secondary-fixed": "#ffe088",
        "secondary-fixed-dim": "#e9c349",
        "on-secondary-fixed": "#241a00",
        "on-secondary-fixed-variant": "#574500",

        "tertiary": "#725760",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#bb9ba5",
        "on-tertiary-container": "#4a333b",
        "tertiary-fixed": "#fdd9e4",
        "tertiary-fixed-dim": "#e0bec8",
        "on-tertiary-fixed": "#2a151d",
        "on-tertiary-fixed-variant": "#594049",

        "background": "#fff8f8",
        "on-background": "#25181c",
        "surface": "#fff8f8",
        "surface-bright": "#fff8f8",
        "surface-dim": "#ecd4d9",
        "surface-tint": "#904857",
        "surface-variant": "#f5dce2",
        "on-surface": "#25181c",
        "on-surface-variant": "#534345",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fff0f2",
        "surface-container": "#ffe8ed",
        "surface-container-high": "#fbe2e7",
        "surface-container-highest": "#f5dce2",
        "inverse-surface": "#3b2c31",
        "inverse-on-surface": "#ffecf0",

        "outline": "#857275",
        "outline-variant": "#d8c1c4",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "space-xs": "0.375rem",
        "space-sm": "0.75rem",
        "space-md": "1.25rem",
        "space-lg": "2rem",
        "space-xl": "3rem",
        "gutter": "1.5rem",
        "margin": "2rem"
      },
      fontFamily: {
        "display-lg": ["Playfair Display", "serif"],
        "display-md": ["Playfair Display", "serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "headline-md": ["Playfair Display", "serif"],
        "title-lg": ["Plus Jakarta Sans", "sans-serif"],
        "title-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "label-lg": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["Plus Jakarta Sans", "sans-serif"],
        "label-sm": ["Plus Jakarta Sans", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["3rem", { lineHeight: "3.5rem", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-md": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.01em", fontWeight: "500" }],
        "headline-lg": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "600" }],
        "headline-md": ["1.375rem", { lineHeight: "1.875rem", fontWeight: "500" }],
        "title-lg": ["1.125rem", { lineHeight: "1.625rem", fontWeight: "600" }],
        "title-md": ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.625rem", fontWeight: "400" }],
        "body-md": ["0.9375rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "label-lg": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.04em", fontWeight: "600" }],
        "label-md": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.06em", fontWeight: "500" }],
        "label-sm": ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.08em", fontWeight: "600" }]
      }
    }
  }
};