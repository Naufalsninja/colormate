# ColorMate Frontend

Frontend statis ColorMate Atelier yang terhubung ke FastAPI pada direktori
`colormate-mlops-develop/backend`.

## Menjalankan lokal

1. Jalankan backend dari direktori `colormate-mlops-develop`:

   ```powershell
   python -m uvicorn backend.app.main:app --reload --port 8000
   ```

2. Dari direktori `colormate-frontend-main`, jalankan server statis:

   ```powershell
   python -m http.server 5500
   ```

3. Buka `http://localhost:5500` dan setujui pemrosesan foto. Pilih kamera atau
   upload foto JPEG, PNG, atau WebP (maksimal 5 MB); backend menerima foto di
   `/api/v1/analyze/upload`.

`js/config.js` berisi URL backend (`API_BASE_URL`), endpoint, dan versi teks
persetujuan. URL default backend adalah `https://colormate.onrender.com`;
ubah ke `http://localhost:8000` saat memakai backend lokal. Render Free dapat
menidurkan service saat tidak aktif, sehingga permintaan pertama mungkin perlu
waktu lebih lama untuk tersambung.

API saat ini hanya menyediakan prediksi musim dan confidence. Palet warna,
undertone, dan rekomendasi produk akan ditampilkan sebagai belum tersedia
sampai backend menyediakan data tersebut.