import textstat
import spacy

nlp = spacy.load("en_core_web_sm")

def compute_readability_scores(text: str) -> dict:
    return {
        "flesch_reading_ease": textstat.flesch_reading_ease(text),
        "flesch_kincaid_grade": textstat.flesch_kincaid_grade(text),
        "smog_index": textstat.smog_index(text),
        "gunning_fog": textstat.gunning_fog(text),
        "dale_chall": textstat.dale_chall_readability_score(text),
    }

def extract_entities(text: str) -> list:
    doc = nlp(text)
    return [
        {"text": ent.text, "label": ent.label_}
        for ent in doc.ents
    ]
