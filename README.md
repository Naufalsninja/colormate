# ColorMate

ColorMate Atelier frontend and ColorMate MLOps backend.

## Project folders

- `colormate-frontend-main/`: static HTML/CSS/JavaScript frontend. Configure
  this as the Vercel project root.
- `colormate-mlops-develop/`: FastAPI backend, model inference code, and MLOps
  resources.

## Run the backend locally

From `colormate-mlops-develop/`:

```powershell
python -m pip install -r backend\requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

The frontend targets `https://colormate.onrender.com` by default. For local
backend testing, change `API_BASE_URL` in
`colormate-frontend-main/js/config.js` to `http://localhost:8000`. Model
inference also requires the checkpoint at
`colormate-mlops-develop/models/checkpoints/colormate_resnet18_experiment01.pt`
or a path configured with `COLORMATE_CHECKPOINT_PATH`.
