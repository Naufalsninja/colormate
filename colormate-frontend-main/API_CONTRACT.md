# Kontrak API ColorMate

Frontend statis di `colormate-frontend-main` menggunakan backend FastAPI di
`colormate-mlops-develop/backend`.

## Analisis Foto

- **Method:** `POST`
- **Path:** `/api/v1/analyze/upload`
- **Content-Type:** `multipart/form-data`
- **Request fields:**
  - `file`: foto JPEG hasil kamera (maksimal 5 MB).
  - `processing_consent`: `true`, dikirim setelah pengguna menyetujui pemrosesan.
  - `storage_consent`: `false`; backend saat ini tidak menyimpan foto.
  - `consent_version`: versi teks persetujuan yang ditampilkan frontend.
- **Local CORS origins:** `http://localhost:5500` dan
  `http://127.0.0.1:5500`, selain port 3000 yang sudah diizinkan.
  Untuk origin lain, atur `CORS_ORIGINS` pada proses backend sebagai daftar
  origin dipisahkan koma.

## Respons Sukses

```json
{
  "status": "success",
  "message": "Photo analyzed successfully.",
  "image": {
    "valid": true,
    "format": "JPEG",
    "width": 1280,
    "height": 720,
    "size_bytes": 123456
  },
  "analysis": {
    "predicted_class": "autumn_muted",
    "season": "autumn",
    "confidence_score": 0.984,
    "class_index": 0,
    "model": "ResNet18",
    "experiment": "experiment01",
    "checkpoint_epoch": 10,
    "device": "cpu"
  },
  "consent": {
    "processing_consent": true,
    "storage_consent": false,
    "consent_version": "2026-11-27"
  },
  "storage_status": "not_stored",
  "disclaimer": "Experimental AI prediction. This result is not a definitive personal color assessment."
}
```

Backend saat ini hanya mengembalikan klasifikasi musim dan confidence; palet
warna, undertone, dan rekomendasi produk belum tersedia dari API.
