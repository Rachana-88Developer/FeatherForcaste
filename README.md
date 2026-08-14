# 🪶 FeatherForcaste

> **Climate Prediction Using Bird Sounds** — A nature-inspired machine learning system that predicts climate and weather patterns by analyzing bird vocalizations using bio-inspired optimization algorithms.

---

## 🌿 Overview

FeatherForcaste is an original research project that leverages the natural sensitivity of birds to environmental changes. Birds alter their vocalizations in response to temperature, humidity, pressure, and seasonal shifts. This project captures that relationship by training predictive models on bird sound datasets, optimized using **Nature-Inspired Algorithms**.

---

## 💡 Original Idea

Birds are nature's weather sensors — they respond to barometric pressure drops, temperature shifts, and seasonal transitions through changes in their calls and singing patterns. FeatherForcaste treats bird audio as a climate signal and uses it to forecast weather and climate conditions, combining **bioacoustics** with **computational intelligence**.

---

## 🚀 Features

- 🎵 **Bird Sound Analysis** — Extracts acoustic features (MFCC, spectral features) from bird audio datasets
- 🌦️ **Climate Prediction** — Predicts temperature, humidity, and weather patterns from sound data
- 🧬 **Nature-Inspired Optimization** — Original implementations of PSO and GWO for model tuning
- 📊 **Data Visualization** — Climate prediction graphs and feature importance plots
- 🔬 **Research-Grade Implementation** — Built for academic and real-world environmental applications

---

## 🧠 Algorithms Implemented

### 🐦 Particle Swarm Optimization (PSO)
Simulates the social behavior of bird flocks to optimize model hyperparameters and feature selection for climate prediction.

### 🐺 Grey Wolf Optimizer (GWO)
Mimics the leadership hierarchy and hunting strategy of grey wolves to find optimal model configurations.

Both algorithms are **originally implemented** from scratch without third-party optimization libraries.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python, TypeScript |
| Audio Processing | Librosa, NumPy |
| Machine Learning | Scikit-learn, TensorFlow |
| Optimization | Custom PSO & GWO (original) |
| Frontend | React / Next.js (TypeScript) |
| Database | Supabase |
| Deployment | Cloudflare Workers (Wrangler) |
| Package Manager | Bun |

---

## 📁 Project Structure

```
FeatherForcaste/
├── src/                    # Frontend source (TypeScript/React)
├── public/                 # Static assets
├── supabase/               # Supabase config and migrations
├── backend/                # Python ML backend
│   ├── pso.py              # Particle Swarm Optimization
│   ├── gwo.py              # Grey Wolf Optimizer
│   ├── feature_extraction.py  # Audio feature extraction
│   └── climate_model.py    # Climate prediction model
├── .env                    # Environment variables
├── bunfig.toml             # Bun config
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+ or Bun
- Supabase account

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python climate_model.py
```

### Frontend Setup
```bash
bun install
bun run dev
```

### Environment Variables
Create a `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

---

## 🔬 How It Works

1. **Audio Input** — Bird sound recordings are fed into the system
2. **Feature Extraction** — MFCC, chroma, spectral centroid features extracted using Librosa
3. **Optimization** — PSO / GWO tunes the prediction model parameters
4. **Prediction** — The model outputs climate forecasts (temperature, humidity, weather type)
5. **Visualization** — Results displayed on an interactive frontend dashboard

---

## 📊 Dataset

- Bird sound datasets sourced from open bioacoustic repositories
- Climate data correlated with recording timestamps and locations
- Custom preprocessing pipeline for audio normalization

---

## 🏆 Research Contribution

- Original idea combining **bioacoustics + nature-inspired computing**
- Custom from-scratch implementations of PSO and GWO
- Novel approach to climate prediction without traditional meteorological sensors

---

## 👩‍💻 Author

**Rachana** — [Rachana-88Developer](https://github.com/Rachana-88Developer)

---

## 📄 License

This project is for academic and research purposes.

---

> *"Nature has always known the weather — we just learned to listen."* 🪶
