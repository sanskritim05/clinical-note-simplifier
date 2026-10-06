import logging

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from models import SimplifyRequest, SimplifyResponse
from groq_client import simplify_clinical_text, MissingAPIKeyError
from nlp_utils import compute_readability_scores

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="Clinical Note Simplifier")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/simplify", response_model=SimplifyResponse)
def simplify(req: SimplifyRequest):
    original = req.text.strip()
    if not original:
        raise HTTPException(status_code=422, detail="Please paste a clinical note first.")

    try:
        simplified = simplify_clinical_text(original)
    except MissingAPIKeyError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        logger.exception("Groq request failed")
        raise HTTPException(
            status_code=502,
            detail="The language model could not be reached. Please try again in a moment.",
        )

    return SimplifyResponse(
        original_text=original,
        simplified_text=simplified,
        readability_before=compute_readability_scores(original),
        readability_after=compute_readability_scores(simplified),
    )


# Frontend (index.html, CSS, JS). Mounted last so the /api routes above take
# priority. On Vercel these files are promoted to the CDN automatically.
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
