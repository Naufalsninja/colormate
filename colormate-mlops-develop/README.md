
# ColorMate MLOps

Backend FastAPI dan pipeline MLOps untuk klasifikasi personal color ColorMate.
Frontend statis ColorMate Atelier berada di direktori sibling
`colormate-frontend-main`.

## Menjalankan backend lokal

Dari direktori repository ini:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

API tersedia di `http://localhost:8000`; dokumentasi interaktif ada di
`http://localhost:8000/docs`. Untuk prediksi, checkpoint model harus tersedia
di `models/checkpoints/colormate_resnet18_experiment01.pt` atau lokasinya
ditentukan lewat `COLORMATE_CHECKPOINT_PATH`.

Frontend mengirim foto ke `POST /api/v1/analyze/upload`. Default CORS backend
mengizinkan frontend lokal pada port 5500 dan 3000 serta
`https://colormate-colormate-frontend-main.vercel.app`. Jika domain frontend
berbeda atau `CORS_ORIGINS` diatur, isi variabel tersebut dengan origin yang
tepat, dipisahkan koma.

## Struktur

- `backend/`: aplikasi FastAPI, validasi foto, dan inferensi model.
- `frontend/`: frontend Next.js eksperimental lama.
- `models/`, `data/`, `scripts/`, `reports/`: artefak dan pipeline MLOps.
- `../colormate-frontend-main/`: frontend ColorMate Atelier yang digunakan
  bersama backend ini.
