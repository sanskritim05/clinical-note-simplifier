
# Clinical Note Simplifier

https://github.com/user-attachments/assets/f3d91de3-33fa-4a49-ad9b-8455ee883791

A **FastAPI-based web application** that transforms complex clinical notes into clear, patient‑friendly language using **Groq’s LLM**, while objectively measuring readability improvements.

The app is designed to help clinicians communicate more effectively with patients by simplifying dense medical text and presenting readability metrics in a clean, modern interface.

---

## Features

### AI‑Powered Clinical Note Simplification

* Paste raw clinical notes into the app
* Sends text to **Groq’s LLM** for simplification
* Returns a clear, patient‑friendly explanation

### Readability Analysis (Before & After)

Using the `textstat` library, the backend computes:

* Flesch Reading Ease
* Flesch‑Kincaid Grade Level
* SMOG Index
* Gunning Fog Index
* Dale‑Chall Score

Results show where the note lands on a grade‑level ruler before and after, whether it meets the AMA's ≤ 6th‑grade target for patient materials, and a full before/after score panel.

### A Distinctive, Paper‑Inspired UI

* "The chart and the letter": the clinical note sits on ruled chart paper, the simplified version on a clean letter, joined by a big highlighter‑yellow **Simplify** button
* A **jargon decoder** card in the hero that cycles through common shorthand (HTN, NPO, PO BID…)
* A **readability report** with a grade‑level ruler, a "meets 6th‑grade target" stamp, and a lab‑report‑style score panel
* Instrument Serif, Bricolage Grotesque, and IBM Plex Mono on warm paper with subtle grain
* Light & dark mode (follows your system, with a toggle), fully responsive
* **Use a sample note** button and `⌘/Ctrl + Enter` shortcut

### Copy & PDF Export

* One‑click **Copy** of the simplified text
* **PDF** download with a title, section headings, and page numbers, generated in the browser with `jsPDF`

---

## Architecture Overview

```
clinical-note-simplifier/
│
├── app.py                # FastAPI app: /api routes + serves the frontend
├── groq_client.py        # Groq API wrapper
├── nlp_utils.py          # Readability metrics
├── models.py             # Pydantic request/response models
│
├── .env.example          # Template for environment variables
├── requirements.txt      # Python dependencies
├── vercel.json           # Vercel function settings
│
└── frontend/
    ├── index.html        # Main UI page
    ├── style.css         # UI styling (light + dark themes)
    └── main.js           # Frontend logic
```

---

## Tech Stack

### Backend

* **Python 3.9+**
* **FastAPI**
* **Groq API** (LLM inference, `openai/gpt-oss-120b` by default)
* **textstat** (readability metrics)
* **python-dotenv**

### Frontend

* HTML5
* CSS3 (modern layout & animations)
* Vanilla JavaScript
* jsPDF (PDF generation)

---

## Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/sanskritim05/clinical-note-simplifier.git
cd clinical-note-simplifier
```

### 2️⃣ Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate       # Windows
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Configure Environment Variables

Copy `.env.example` to `.env` and add your [Groq API key](https://console.groq.com/keys):

```env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

---

## Running the App

```bash
uvicorn app:app --reload
```

Open your browser and visit:

```
http://127.0.0.1:8000
```

---

## Deploying to Vercel

The app is ready for Vercel's zero‑config FastAPI support: Vercel finds `app` in `app.py`, runs it as a serverless function, and serves the `frontend/` files from its CDN.

1. Push the repo to GitHub and click **Add New → Project** on [vercel.com](https://vercel.com/new), then import it. (Or run `npx vercel` from the project folder.)
2. In **Settings → Environment Variables**, add `GROQ_API_KEY` (and optionally `GROQ_MODEL`).
3. Deploy. No build command or output directory is needed.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsanskritim05%2Fclinical-note-simplifier&env=GROQ_API_KEY&envDescription=Your%20Groq%20API%20key&envLink=https%3A%2F%2Fconsole.groq.com%2Fkeys)

`vercel.json` gives the function up to 60 seconds so long notes don't time out.

---

## API

`POST /api/simplify`

```json
{ "text": "58 y/o M w/ PMHx of HTN, T2DM..." }
```

Returns `simplified_text` plus `readability_before` / `readability_after` score objects. `GET /api/health` returns `{"status": "ok"}`.

---

## How It Works (Step‑by‑Step)

1. User pastes a clinical note into the text box
2. Frontend sends the note to the FastAPI backend
3. Backend:

   * Calls Groq’s LLM for simplification
   * Computes readability metrics before & after
4. Backend returns the simplified text and both sets of scores
5. Frontend:

   * Displays simplified text with section headings
   * Renders the readability report (grade ruler + score panel)
   * Enables copy & PDF download buttons

---

## Use Cases

* Improve patient understanding of visit summaries
* Assist clinicians with health‑literacy compliance
* Educational tool for medical communication
* Foundation for multilingual or accessibility‑focused extensions

---

## Privacy & Local Use

* Runs locally by default, or on your own Vercel project
* No data persistence
* Notes are processed only in memory
* Ideal for privacy‑conscious environments

---

## Future Enhancements

* Multi‑language support
* Confidence / uncertainty annotations
* Highlighted medical term explanations
* EHR‑friendly export formats

---

## License

MIT License


**Clinical Note Simplifier** — turning medical language into understanding.
