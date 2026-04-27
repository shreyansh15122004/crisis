from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random, math, time

app = FastAPI(title="MBTI Neural Engagement Analyser", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MBTI Profile Data ──────────────────────────────────────────────────────────
MBTI_PROFILES = {
    "INFJ": {
        "name": "The Advocate",
        "dominant_network": "Default Mode Network",
        "dominant_short": "DMN",
        "stress_roi": "Temporo-Parietal Junction",
        "stress_short": "TPJ",
        "cognitive_functions": ["Ni", "Fe", "Ti", "Se"],
        "description": "Insightful, principled, and compassionate. Driven by deep intuition and a desire to help others.",
        "color": "#6C63FF",
        "base_engagement": 0.78,
        "stress_sensitivity": 0.72,
    },
    "INTJ": {
        "name": "The Architect",
        "dominant_network": "Language Network",
        "dominant_short": "LAN",
        "stress_roi": "Prefrontal Cortex",
        "stress_short": "PFC",
        "cognitive_functions": ["Ni", "Te", "Fi", "Se"],
        "description": "Strategic, independent, and determined. Natural planners who see the big picture.",
        "color": "#2D9CDB",
        "base_engagement": 0.82,
        "stress_sensitivity": 0.55,
    },
    "INFP": {
        "name": "The Mediator",
        "dominant_network": "Default Mode Network",
        "dominant_short": "DMN",
        "stress_roi": "Anterior Cingulate Cortex",
        "stress_short": "ACC",
        "cognitive_functions": ["Fi", "Ne", "Si", "Te"],
        "description": "Idealistic, empathetic, and creative. Guided by personal values and a rich inner world.",
        "color": "#9B59B6",
        "base_engagement": 0.71,
        "stress_sensitivity": 0.80,
    },
    "INTP": {
        "name": "The Logician",
        "dominant_network": "Language Network",
        "dominant_short": "LAN",
        "stress_roi": "Dorsolateral PFC",
        "stress_short": "DLPFC",
        "cognitive_functions": ["Ti", "Ne", "Si", "Fe"],
        "description": "Analytical, objective, and inventive. Loves theories and abstract thinking.",
        "color": "#00B4D8",
        "base_engagement": 0.85,
        "stress_sensitivity": 0.48,
    },
    "ENFJ": {
        "name": "The Protagonist",
        "dominant_network": "Motion Network",
        "dominant_short": "MOT",
        "stress_roi": "Temporo-Parietal Junction",
        "stress_short": "TPJ",
        "cognitive_functions": ["Fe", "Ni", "Se", "Ti"],
        "description": "Charismatic, empathetic, and inspiring. Natural leaders who bring out the best in others.",
        "color": "#F5A623",
        "base_engagement": 0.88,
        "stress_sensitivity": 0.65,
    },
    "ENFP": {
        "name": "The Campaigner",
        "dominant_network": "Motion Network",
        "dominant_short": "MOT",
        "stress_roi": "Amygdala Proxy",
        "stress_short": "AMG",
        "cognitive_functions": ["Ne", "Fi", "Te", "Si"],
        "description": "Enthusiastic, creative, and sociable. Sees life as full of possibilities.",
        "color": "#FF6B6B",
        "base_engagement": 0.90,
        "stress_sensitivity": 0.70,
    },
    "ENTJ": {
        "name": "The Commander",
        "dominant_network": "Language Network",
        "dominant_short": "LAN",
        "stress_roi": "Prefrontal Cortex",
        "stress_short": "PFC",
        "cognitive_functions": ["Te", "Ni", "Se", "Fi"],
        "description": "Bold, strategic, and efficient. Natural leaders who excel at organizing people and plans.",
        "color": "#E74C3C",
        "base_engagement": 0.87,
        "stress_sensitivity": 0.42,
    },
    "ENTP": {
        "name": "The Debater",
        "dominant_network": "Language Network",
        "dominant_short": "LAN",
        "stress_roi": "Dorsolateral PFC",
        "stress_short": "DLPFC",
        "cognitive_functions": ["Ne", "Ti", "Fe", "Si"],
        "description": "Inventive, curious, and argumentative. Loves intellectual challenges and debate.",
        "color": "#E67E22",
        "base_engagement": 0.86,
        "stress_sensitivity": 0.45,
    },
    "ISFJ": {
        "name": "The Defender",
        "dominant_network": "Auditory Network",
        "dominant_short": "AUD",
        "stress_roi": "Insula",
        "stress_short": "INS",
        "cognitive_functions": ["Si", "Fe", "Ti", "Ne"],
        "description": "Dedicated, warm, and reliable. Works hard to protect and support the people they care about.",
        "color": "#27AE60",
        "base_engagement": 0.68,
        "stress_sensitivity": 0.75,
    },
    "ISFP": {
        "name": "The Adventurer",
        "dominant_network": "Visual Network",
        "dominant_short": "VIS",
        "stress_roi": "Insula",
        "stress_short": "INS",
        "cognitive_functions": ["Fi", "Se", "Ni", "Te"],
        "description": "Flexible, charming, and sensitive. Lives in the present and enjoys exploring new experiences.",
        "color": "#1ABC9C",
        "base_engagement": 0.73,
        "stress_sensitivity": 0.78,
    },
    "ISTJ": {
        "name": "The Logistician",
        "dominant_network": "Visual Network",
        "dominant_short": "VIS",
        "stress_roi": "Caudate Nucleus",
        "stress_short": "CAU",
        "cognitive_functions": ["Si", "Te", "Fi", "Ne"],
        "description": "Practical, reliable, and fact-oriented. Takes responsibility seriously and honors commitments.",
        "color": "#3498DB",
        "base_engagement": 0.72,
        "stress_sensitivity": 0.50,
    },
    "ISTP": {
        "name": "The Virtuoso",
        "dominant_network": "Visual Network",
        "dominant_short": "VIS",
        "stress_roi": "Striatum",
        "stress_short": "STR",
        "cognitive_functions": ["Ti", "Se", "Ni", "Fe"],
        "description": "Bold, practical, and experimental. Masters of tools and mechanics who love hands-on work.",
        "color": "#2C3E50",
        "base_engagement": 0.76,
        "stress_sensitivity": 0.40,
    },
    "ESFJ": {
        "name": "The Consul",
        "dominant_network": "Auditory Network",
        "dominant_short": "AUD",
        "stress_roi": "Temporo-Parietal Junction",
        "stress_short": "TPJ",
        "cognitive_functions": ["Fe", "Si", "Ne", "Ti"],
        "description": "Caring, sociable, and traditional. Attentive to others' needs and good at bringing people together.",
        "color": "#E91E63",
        "base_engagement": 0.80,
        "stress_sensitivity": 0.68,
    },
    "ESFP": {
        "name": "The Entertainer",
        "dominant_network": "Motion Network",
        "dominant_short": "MOT",
        "stress_roi": "Amygdala Proxy",
        "stress_short": "AMG",
        "cognitive_functions": ["Se", "Fi", "Te", "Ni"],
        "description": "Spontaneous, energetic, and enthusiastic. Life of the party who loves making others smile.",
        "color": "#FF9800",
        "base_engagement": 0.89,
        "stress_sensitivity": 0.60,
    },
    "ESTJ": {
        "name": "The Executive",
        "dominant_network": "Visual Network",
        "dominant_short": "VIS",
        "stress_roi": "Caudate Nucleus",
        "stress_short": "CAU",
        "cognitive_functions": ["Te", "Si", "Ne", "Fi"],
        "description": "Organized, loyal, and assertive. Excels at managing tasks and people to achieve goals.",
        "color": "#8E44AD",
        "base_engagement": 0.83,
        "stress_sensitivity": 0.44,
    },
    "ESTP": {
        "name": "The Entrepreneur",
        "dominant_network": "Visual Network",
        "dominant_short": "VIS",
        "stress_roi": "Striatum",
        "stress_short": "STR",
        "cognitive_functions": ["Se", "Ti", "Fe", "Ni"],
        "description": "Smart, energetic, and perceptive. Loves living on the edge and takes action in the moment.",
        "color": "#D35400",
        "base_engagement": 0.88,
        "stress_sensitivity": 0.38,
    },
}

COMPATIBILITY = {
    ("INFJ","ENTP"): 0.95, ("INFJ","INTJ"): 0.88, ("INFJ","ENFP"): 0.85,
    ("INTJ","ENFP"): 0.92, ("INTJ","ENTP"): 0.88, ("INTJ","INFJ"): 0.88,
    ("INFP","ENTJ"): 0.88, ("INFP","ENFJ"): 0.85, ("INFP","INFJ"): 0.82,
    ("INTP","ENTJ"): 0.85, ("INTP","ENFJ"): 0.82, ("INTP","INFJ"): 0.80,
    ("ENFJ","INFP"): 0.85, ("ENFJ","ISFP"): 0.82, ("ENFJ","INTP"): 0.82,
    ("ENFP","INTJ"): 0.92, ("ENFP","INFJ"): 0.85, ("ENFP","INFP"): 0.80,
    ("ENTJ","INFP"): 0.88, ("ENTJ","INTP"): 0.85, ("ENTJ","ISFP"): 0.80,
    ("ENTP","INFJ"): 0.95, ("ENTP","INTJ"): 0.88, ("ENTP","ISFJ"): 0.78,
    ("ISFJ","ESTP"): 0.85, ("ISFJ","ESFP"): 0.82, ("ISFJ","ENTP"): 0.78,
    ("ISFP","ENFJ"): 0.82, ("ISFP","ENTJ"): 0.80, ("ISFP","ESFJ"): 0.78,
    ("ISTJ","ESFP"): 0.82, ("ISTJ","ESTP"): 0.80, ("ISTJ","ENFP"): 0.75,
    ("ISTP","ESFJ"): 0.80, ("ISTP","ESTJ"): 0.78, ("ISTP","ENFJ"): 0.75,
    ("ESFJ","ISTP"): 0.80, ("ESFJ","ISFP"): 0.78, ("ESFJ","INFP"): 0.75,
    ("ESFP","ISTJ"): 0.82, ("ESFP","ISFJ"): 0.82, ("ESFP","INTJ"): 0.72,
    ("ESTJ","ISTP"): 0.78, ("ESTJ","ISFP"): 0.75, ("ESTJ","INFP"): 0.70,
    ("ESTP","ISFJ"): 0.85, ("ESTP","ISTJ"): 0.80, ("ESTP","INFJ"): 0.72,
}

def get_compat(a, b):
    return COMPATIBILITY.get((a,b), COMPATIBILITY.get((b,a), 0.60))

def score_text(text: str, mbti_type: str) -> dict:
    """Simulate TRIBE v2 neural scoring — replace .score() call once weights load."""
    profile = MBTI_PROFILES[mbti_type]
    words = text.lower().split()
    length_factor = min(len(words) / 50, 1.0)

    emotion_words = {"feel","love","fear","hope","joy","pain","sad","happy","angry","calm","anxious","peace"}
    logic_words   = {"because","therefore","analysis","system","data","process","structure","logic","reason"}
    action_words  = {"do","make","build","create","run","move","act","start","go","achieve"}

    emotion_score = sum(1 for w in words if w in emotion_words) / max(len(words), 1)
    logic_score   = sum(1 for w in words if w in logic_words)   / max(len(words), 1)
    action_score  = sum(1 for w in words if w in action_words)  / max(len(words), 1)

    net = profile["dominant_short"]
    if net == "DMN":
        raw_eng = profile["base_engagement"] + emotion_score * 0.3 - logic_score * 0.1
    elif net == "LAN":
        raw_eng = profile["base_engagement"] + logic_score * 0.35 + emotion_score * 0.05
    elif net == "MOT":
        raw_eng = profile["base_engagement"] + action_score * 0.3 + emotion_score * 0.1
    elif net == "AUD":
        raw_eng = profile["base_engagement"] + emotion_score * 0.2 + length_factor * 0.1
    else:  # VIS
        raw_eng = profile["base_engagement"] + action_score * 0.2 + logic_score * 0.1

    noise = random.uniform(-0.04, 0.04)
    engagement = max(0.1, min(0.99, raw_eng + noise + length_factor * 0.05))
    stress      = max(0.05, min(0.95, profile["stress_sensitivity"] * (0.8 + emotion_score * 0.4) + noise))

    return {
        "engagement": round(engagement, 3),
        "stress":     round(stress, 3),
        "recovery":   round(max(0.1, 1.0 - stress * 0.7 + engagement * 0.3), 3),
    }

# ── Schemas ────────────────────────────────────────────────────────────────────
class AnalyseRequest(BaseModel):
    text: str
    mbti_type: str

class CompareRequest(BaseModel):
    text: str

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "MBTI Neural Engagement Analyser API", "version": "1.0.0"}

@app.get("/api/mbti-types")
def get_mbti_types():
    return {
        "types": [
            {
                "type": k,
                "name": v["name"],
                "dominant_network": v["dominant_network"],
                "dominant_short": v["dominant_short"],
                "stress_roi": v["stress_roi"],
                "stress_short": v["stress_short"],
                "cognitive_functions": v["cognitive_functions"],
                "description": v["description"],
                "color": v["color"],
            }
            for k, v in MBTI_PROFILES.items()
        ]
    }

@app.post("/api/analyse")
def analyse(req: AnalyseRequest):
    if req.mbti_type not in MBTI_PROFILES:
        raise HTTPException(status_code=400, detail=f"Unknown MBTI type: {req.mbti_type}")
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    scores = score_text(req.text, req.mbti_type)
    profile = MBTI_PROFILES[req.mbti_type]

    insight = ""
    if scores["engagement"] > 0.80:
        insight = f"High neural engagement detected in the {profile['dominant_short']} — this text strongly resonates with your cognitive style."
    elif scores["engagement"] > 0.60:
        insight = f"Moderate engagement in the {profile['dominant_short']}. This content aligns reasonably well with your dominant network."
    else:
        insight = f"Lower engagement detected. This text may not align naturally with {req.mbti_type}'s {profile['dominant_short']} processing style."

    if scores["stress"] > 0.70:
        insight += f" ⚠️ Elevated {profile['stress_short']} activation — this content may feel cognitively demanding."

    return {
        "mbti_type": req.mbti_type,
        "type_name": profile["name"],
        "text_preview": req.text[:100] + ("..." if len(req.text) > 100 else ""),
        "scores": scores,
        "dominant_network": profile["dominant_network"],
        "dominant_short": profile["dominant_short"],
        "stress_roi": profile["stress_roi"],
        "stress_short": profile["stress_short"],
        "insight": insight,
        "color": profile["color"],
    }

@app.post("/api/compare")
def compare(req: CompareRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    results = []
    for mbti_type, profile in MBTI_PROFILES.items():
        scores = score_text(req.text, mbti_type)
        results.append({
            "mbti_type": mbti_type,
            "type_name": profile["name"],
            "dominant_short": profile["dominant_short"],
            "color": profile["color"],
            "engagement": scores["engagement"],
            "stress": scores["stress"],
            "recovery": scores["recovery"],
        })
    results.sort(key=lambda x: x["engagement"], reverse=True)
    return {"text_preview": req.text[:80] + ("..." if len(req.text) > 80 else ""), "results": results}

@app.get("/api/compatibility/{type_a}/{type_b}")
def compatibility(type_a: str, type_b: str):
    if type_a not in MBTI_PROFILES or type_b not in MBTI_PROFILES:
        raise HTTPException(status_code=400, detail="Invalid MBTI type")
    score = get_compat(type_a, type_b)
    return {
        "type_a": type_a, "name_a": MBTI_PROFILES[type_a]["name"],
        "type_b": type_b, "name_b": MBTI_PROFILES[type_b]["name"],
        "compatibility": score,
        "label": "Excellent" if score > 0.88 else "Good" if score > 0.78 else "Moderate",
    }
