# MBTI Neural Engagement Analyser
### Shreyansh Singh · 0901CS231130 · MITS Gwalior · Minor Project 2026

---

## Quick Start

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be live at → http://localhost:8000
Swagger docs at   → http://localhost:8000/docs

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App will open at → http://localhost:3000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mbti-types` | All 16 MBTI profiles |
| POST | `/api/analyse` | Score text for one MBTI type |
| POST | `/api/compare` | Score text across all 16 types |
| GET | `/api/compatibility/{a}/{b}` | Compatibility between two types |

### POST /api/analyse — Example
```json
{
  "text": "I feel overwhelmed and need some quiet time to reflect.",
  "mbti_type": "INFJ"
}
```

---

## Project Structure

```
mbti-app/
├── backend/
│   ├── main.py           ← FastAPI app + all endpoints + scoring engine
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx      ← React entry point
        └── App.jsx       ← Full app (Analyse, Compare, Profiles, About pages)
```

---

## Pages

- **Analyse** — Select MBTI type, enter text, get engagement + stress + recovery scores
- **Compare** — Score same text across all 16 types with sortable bar chart
- **Profiles** — Browse all 16 MBTI types with brain network mappings
- **About** — Project info, tech stack, student/guide details

---

## Note on TRIBE v2 Integration

The current scoring engine uses a linguistic heuristic model that simulates
TRIBE v2 predictions based on word-level features. To use real TRIBE v2:

```python
# In main.py, replace score_text() with:
import sys
sys.path.insert(0, "../models/tribev2")
from tribev2 import TribeModel

model = TribeModel.from_pretrained("facebook/tribev2", cache_folder="./models/cache")

def score_text(text, mbti_type):
    df = model.get_events_dataframe(text=text)
    preds, _ = model.predict(events=df)  # (T, 20480)
    # ... ROI extraction logic
```
