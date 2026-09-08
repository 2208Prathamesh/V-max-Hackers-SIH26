# 05. Conversational AI, Grounding & Decision Support

## 🤖 AI Chatbot Pipeline (`backend/src/services/chatService.js`)

Unlike generic LLM wrappers that query a model blindly, WeatherGPT implements a **Retrieval-Augmented Meteorological Grounding** pipeline:

```
[ User Text Query / Voice Input ]
               │
               ▼
[ 1. NLP Query Analysis & Intent Extraction ]
  - Location Resolver (Regex + Geocoding API)
  - Language Detector (mr, hi, bn, ta, te, en)
               │
               ▼
[ 2. Parallel Meteorological Data Retrieval ]
  ├─> Live Weather & 7-Day Forecast (Open-Meteo)
  ├─> Official Warning Check (IMD District API)
  ├─> NWP Model Confidence (ECMWF vs GFS)
  └─> Precision Agro Advisory (Soil, Wind, ET0)
               │
               ▼
[ 3. Grounded Context Construction ]
  - Synthesized JSON facts packed into strict prompt
  - Anti-hallucination boundary enforcement
               │
               ▼
[ 4. Dual-Mode Generation Engine ]
  ├─► [ Online Mode ]  Google Gemini 1.5 Flash (temp: 0.3)
  └─► [ Offline Mode ] Deterministic Multilingual Fallback
               │
               ▼
[ 5. Structured JSON Output to Client ]
  - Conversational Markdown text
  - Live metric widgets (current, hourly, alerts, air quality)
```

---

## 🎯 Grounded Prompt Engineering (`promptTemplates.js`)

### System Instruction Guardrails
The system instructions enforce strict scientific and communicative constraints:
1. **Fact Grounding:** The model is strictly instructed to use *only* the facts provided in the prompt context. If a metric is missing, it explicitly admits it rather than hallucinating numbers.
2. **Alert Prioritization:** If an active IMD alert (Orange or Red) is present, it **must** be highlighted prominently in the first sentence.
3. **Actionable Tone:** The model adopts a warm, polite, and encouraging tone, providing clear recommendations (e.g. carrying an umbrella, protecting crops, or delaying travel).
4. **Low Temperature:** Uses `temperature: 0.3` and `topP: 0.85` to enforce deterministic, reproducible responses.

---

## 🌐 Deterministic Multilingual Offline Engine (`geminiService.js`)

If the `GEMINI_API_KEY` is not configured, or if an internet outage occurs, WeatherGPT seamlessly switches to its built-in rule-based multilingual generator. It delivers complete, grammatically accurate answers with rich markdown formatting:

### Supported Offline Languages:
1. **Marathi (मराठी):**
   > *"नमस्कार! सध्या **पुणे** मध्ये हवामान **निरभ्र** असून तापमान **28°C** आहे... आज पाऊस पडण्याची शक्यता **15%** आहे. बाहेर पडताना टोपी वापरा!"*
2. **Hindi (हिन्दी):**
   > *"नमस्ते! वर्तमान में **पुणे** में मौसम **साफ** है और तापमान **28°C** है... IMD चेतावनी: कोई सक्रिय चेतावनी नहीं है।"*
3. **Bengali (বাংলা):** Native weather reports for eastern agrarian belts.
4. **Tamil (தமிழ்) & Telugu (తెలుగు):** Localized terminology for southern coastal and farming regions.
5. **English:** Standard conversational format.

---

## 🌾 Agro-Meteorological Decision Engine (`advisoryService.js`)

Agriculture in India is heavily dependent on micro-climatic conditions. WeatherGPT analyzes multi-depth meteorological parameters to generate automated crop guidance:

### 1. Soil & Atmospheric Parameters Analyzed:
- $\text{Topsoil Moisture } (0–1\text{ cm})$: Vital for seed germination and crusting.
- $\text{Soil Temperature } (0\text{ cm})$: Controls root metabolic activity.
- $ET_0 \text{ (FAO-56 Penman-Monteith)}$: Daily reference evapotranspiration rate ($\text{mm/day}$).
- $\text{Wind Speed at } 10\text{m}$: Determines pesticide droplet drift.
- $3\text{-Day Cumulative Precipitation } (\sum P_{3d})$: Informs irrigation scheduling.

### 2. Irrigation Decision Matrix:
```
IF (Next 3 Days Rain > 25 mm)
   ==> DELAY_IRRIGATION: "Postpone irrigation. Significant rainfall (>25mm) expected in 72h."
ELSE IF (Soil Moisture < 0.18 m³/m³)
   ==> IRRIGATE_SOON: "Immediate light irrigation recommended. Topsoil moisture critically low."
ELSE IF (Soil Moisture > 0.38 m³/m³)
   ==> ADEQUATE: "Adequate soil moisture available. Ensure proper field drainage to prevent root rot."
ELSE
   ==> NORMAL: "Follow standard seasonal irrigation intervals."
```

### 3. Pesticide & Fertilizer Spray Window:
```
IF (Wind Speed > 20 km/h)
   ==> UNFAVORABLE: "High wind speed (>20 km/h) can cause chemical drift. Delay spraying."
ELSE IF (Next 48h Rain > 10 mm)
   ==> UNFAVORABLE: "Rain expected within 48h. Postpone spraying to prevent chemical washout."
ELSE
   ==> FAVORABLE: "Optimal weather window for foliar spray and fertilizer application."
```

### 4. Crop-Specific Disease & Stress Diagnostics:
- **Cotton:** Flags bollworm and whitefly risk when relative humidity $> 75\%$ and temperature $> 28^\circ\text{C}$.
- **Wheat:** Detects **terminal heat stress** during grain filling when ambient temperature $> 32^\circ\text{C}$, suggesting potassium nitrate spray.
- **Rice / Paddy:** Recommends maintaining $3–5\text{ cm}$ standing water and checks submergence risks during heavy monsoon downpours.
- **Sugarcane:** Suggests trash mulching during dry spells to conserve subsoil moisture.

---

## 🚨 Disaster Emergency & Safety Engine

When severe meteorological events occur, `/api/advisories/disaster` delivers targeted emergency protocols:

### Hazard Checklists:
- **Cyclone:** Tie down loose outdoor items, stay indoors away from windows, charge backup batteries, identify nearest cyclone shelter.
- **Urban / Flash Flood:** Move to higher elevations, never walk or drive through flowing water, switch off the main electrical breaker.
- **Severe Heatwave:** Stay indoors between 12:00 PM and 3:30 PM, consume ORS / hydration fluids, provide shaded shelter for livestock.
- **Lightning & Thunderstorm:** Seek substantial enclosed shelter; avoid tall solitary trees, tin sheds, and open bodies of water.

### Integrated Emergency Directory:
- **NDMA National Emergency:** `1078`
- **State Emergency Operations Center (SEOC):** `1070`
- **District Emergency Operations Center (DEOC):** `1077`
- **Unified Emergency Services:** `112`
- **Ambulance:** `108`

---

## 🎙️ Voice Processing Architecture (`voiceService.js`)

To bridge literacy barriers, WeatherGPT provides an end-to-end voice interface:

1. **Speech-to-Text (STT):**
   - Frontend captures microphone audio as `audio/webm` or `audio/wav` chunks.
   - Converts audio to Base64 payload and sends to `POST /api/voice/transcribe`.
   - Transcribes query using OpenAI Whisper or browser Web Speech API.
2. **Text-to-Speech (TTS):**
   - Assistant text response is sent to `POST /api/voice/synthesize`.
   - Returns synthesis profile compatible with Piper neural voices or browser native speech synthesis (`speechSynthesis.speak`).
