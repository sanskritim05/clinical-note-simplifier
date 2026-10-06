# Clinical Note Simplifier

**Turn clinical notes into plain language patients can actually read, and measure how much easier it got.**

[Live demo](https://clinical-note-simplifier.vercel.app) · [Run it locally](#quick-start) 

Clinical notes are written for other clinicians: dense, abbreviated, and full of jargon. Patients read them anyway, now that visit notes are shared through patient portals. This app takes a note, rewrites it at a 5th‑grade reading level with an LLM, and scores the original and the rewrite with standard readability formulas so you can see the difference rather than take it on faith.

For example, the included sample discharge summary:

| | Original | Simplified |
|---|---|---|
| Flesch–Kincaid grade | 20.0 (graduate level) | ~6 |
| Flesch reading ease (0–100) | below 0 | ~65 |
| Gunning fog | 25.0 | ~9 |

*(Simplified scores vary slightly from run to run.)*

---

## Features

- **Plain‑language rewrite**: sends the note to an LLM on [Groq](https://groq.com) with instructions to write short sentences under clear headings (Symptoms, Diagnosis, Treatment, Warning Signs…) and to explain every medical term.
- **Before/after readability report**:
  - Five standard scores from [`textstat`](https://github.com/textstat/textstat): Flesch–Kincaid grade, Flesch reading ease, SMOG, Gunning fog, and Dale–Chall.
  - A grade‑level ruler that shows where the note started and where it ended up.
  - A stamp when the result meets the AMA's recommendation that patient materials be written at or below a 6th‑grade level.
- **Copy or download as PDF**: the PDF has a title, numbered sections, and page numbers, and is generated in the browser with jsPDF.
- **A UI built around the idea**: the note sits on ruled "chart" paper and the rewrite on a clean "letter," with a jargon decoder that cycles through shorthand like HTN → *high blood pressure*. It has light and dark themes and works on phones.
- **Small and dependency‑light**: a FastAPI backend and a plain HTML/CSS/JS frontend, with no build step.

---

## How it works

```
Browser ──POST /api/simplify──▶ FastAPI
                                 ├─▶ Groq LLM: rewrite the note in plain language
                                 └─▶ textstat: score the original and the rewrite
Browser ◀── simplified text + both sets of scores
```

1. You paste a note (or click **Use a sample note**) and press **Simplify** (or `⌘/Ctrl + Enter`).
2. The backend sends the note to Groq with a system prompt that sets the reading level, structure, and formatting rules.
3. The backend scores both texts with `textstat` and returns everything in one response.
4. The frontend splits the rewrite into sections and draws the readability report.

Nothing is saved. Each note exists only for the length of its request.

---

## Quick start

You'll need Python 3.9+ and a free [Groq API key](https://console.groq.com/keys).

```bash
git clone https://github.com/sanskritim05/clinical-note-simplifier.git
cd clinical-note-simplifier

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then add your GROQ_API_KEY
uvicorn app:app --reload
```

Open http://127.0.0.1:8000.

### Configuration

| Variable | Required | Default | Notes |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | | Your Groq API key |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | Any chat model your key can access |

---

## API

### `POST /api/simplify`

```json
{ "text": "HOSPITAL COURSE: The patient is a 58-year-old male with..." }
```

Response:

```json
{
  "original_text": "...",
  "simplified_text": "Patient Information\nThe patient is a 58 year old man...",
  "readability_before": {
    "flesch_kincaid_grade": 20.0,
    "flesch_reading_ease": -12.1,
    "smog_index": 20.3,
    "gunning_fog": 25.0,
    "dale_chall": 14.3,
    "word_count": 183
  },
  "readability_after": { "...": "same keys" }
}
```

Errors return `{"detail": "..."}`:

| Status | Meaning |
|---|---|
| `422` | Empty note, or longer than 20,000 characters |
| `500` | `GROQ_API_KEY` is not set |
| `502` | The Groq request failed (the full error is logged on the server) |

### `GET /api/health`

Returns `{"status": "ok"}`.

---

## Project structure

```
clinical-note-simplifier/
├── app.py            # FastAPI app: /api routes, serves the frontend
├── groq_client.py    # Prompt + Groq API call
├── nlp_utils.py      # Readability scores (textstat)
├── models.py         # Request/response models
├── frontend/
│   ├── index.html
│   ├── style.css     # Light + dark themes
│   └── main.js       # UI logic, readability report, PDF export
├── nltk_data/        # Bundled CMU dictionary for textstat
├── requirements.txt
├── vercel.json
└── .env.example
```

---

## Limitations

- **Review before sharing.** LLMs can leave out details or add advice that wasn't in the original note. Treat the output as a draft for a clinician to check, not something to send straight to a patient.
- **Don't paste real patient data** unless your setup allows it. The app stores nothing but each note is sent to Groq's API for processing, so de‑identify notes or make sure you have the right agreements in place.
- **Readability formulas have blind spots.** They measure sentence length and syllables, not meaning. Heavy shorthand (`HTN`, `PO BID`) looks like short, easy words, so an abbreviation‑packed note can score lower than it should. A note written in full sentences shows the true size of the improvement.

---

## License

[MIT](LICENSE)
