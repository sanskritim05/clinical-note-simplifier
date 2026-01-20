# 🏥 Clinical Note Simplifier

A **FastAPI-based web application** that transforms complex clinical notes into clear, patient‑friendly language using **Groq’s LLM**, while objectively measuring readability improvements.

The app is designed to help clinicians communicate more effectively with patients by simplifying dense medical text and presenting readability metrics in a clean, modern interface.

---

## ✨ Features

### 🧠 AI‑Powered Clinical Note Simplification

* Paste raw clinical notes into the app
* Sends text to **Groq’s LLM** for simplification
* Returns a clear, patient‑friendly explanation

### 📊 Readability Analysis (Before & After)

Using the `textstat` library, the backend computes:

* Flesch Reading Ease
* Flesch‑Kincaid Grade Level
* SMOG Index
* Gunning Fog Index
* Dale‑Chall Score

Results are displayed side‑by‑side in a comparison table so users can clearly see improvement.

### 🖥️ Modern, Medical‑Grade UI

* Clean typography (Inter font)
* Responsive layout
* Subtle fade‑in animations
* Loading spinner during model processing
* Aligned action buttons for clarity

### 📋 Copy to Clipboard

* One‑click **Copy Simplified Text** button
* Appears only after results are generated

### 📄 PDF Export

* Download the simplified note as a **PDF**
* Generated directly in the browser using `jsPDF`

### 🔄 Reset & Start Over

* **New Note** button clears input
* Hides results and resets the UI state

---

## 🏗 Architecture Overview

```
Frontend (HTML / CSS / JavaScript)
│
├── Text input for clinical notes
├── Fetch request to FastAPI backend
├── Loading spinner + animations
├── Render simplified text
├── Readability comparison table
├── Copy & PDF export logic
│
Backend (FastAPI / Python)
│
├── Receives clinical note text
├── Sends text to Groq LLM
├── Computes readability metrics (textstat)
├── Returns structured JSON response
│
Environment Variables (.env)
│
├── GROQ_API_KEY
├── GROQ_MODEL
├── APP_ENV
```

---

## 🧩 Tech Stack

### Backend

* **Python 3.9+**
* **FastAPI**
* **Groq API** (LLM inference)
* **textstat** (readability metrics)
* **python-dotenv**

### Frontend

* HTML5
* CSS3 (modern layout & animations)
* Vanilla JavaScript
* jsPDF (PDF generation)

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/clinical-note-simplifier.git
cd clinical-note-simplifier
```

### 2️⃣ Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\\Scripts\\activate     # Windows
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
APP_ENV=development
```

---

## ▶️ Running the App

```bash
uvicorn main:app --reload
```

Open your browser and visit:

```
http://127.0.0.1:8000
```

---

## 🧪 How It Works (Step‑by‑Step)

1. User pastes a clinical note into the text box
2. Frontend sends the note to the FastAPI backend
3. Backend:

   * Calls Groq’s LLM for simplification
   * Computes readability metrics before & after
4. Backend returns structured JSON
5. Frontend:

   * Displays simplified text
   * Renders readability comparison table
   * Enables copy & PDF download buttons

---

## 📦 API Response Format

```json
{
  "simplified_text": "Patient-friendly explanation...",
  "readability_before": {
    "flesch": 32.1,
    "fk_grade": 14.2,
    "smog": 12.8
  },
  "readability_after": {
    "flesch": 72.4,
    "fk_grade": 6.1,
    "smog": 5.9
  }
}
```

---

## 🎯 Use Cases

* Improve patient understanding of visit summaries
* Assist clinicians with health‑literacy compliance
* Educational tool for medical communication
* Foundation for multilingual or accessibility‑focused extensions

---

## 🔒 Privacy & Local Use

* Runs locally by default
* No data persistence
* Notes are processed only in memory
* Ideal for privacy‑conscious environments

---

## 🛣️ Future Enhancements

* Dark mode
* Multi‑language support
* Confidence / uncertainty annotations
* Highlighted medical term explanations
* EHR‑friendly export formats

---

## 📜 License

MIT License

---

## 🙌 Acknowledgements

* Groq for fast LLM inference
* FastAPI for a clean backend framework
* textstat for readability scoring

---

**Clinical Note Simplifier** — turning medical language into understanding.
