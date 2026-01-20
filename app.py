from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from models import SimplifyRequest, SimplifyResponse
from groq_client import simplify_clinical_text
from nlp_utils import compute_readability_scores

app = FastAPI()

# Serve static files (JS, CSS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve HTML templates
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def serve_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/simplify", response_model=SimplifyResponse)
def simplify(req: SimplifyRequest):
    original = req.text
    simplified = simplify_clinical_text(original)

    return SimplifyResponse(
        original_text=original,
        simplified_text=simplified,
        readability_before=compute_readability_scores(original),
        readability_after=compute_readability_scores(simplified)
    )
