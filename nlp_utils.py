import os

import nltk
import textstat

# textstat counts syllables with NLTK's CMU pronouncing dictionary and tries to
# download it on first use. Serverless hosts like Vercel have a read-only home
# directory, so the dictionary ships with the app in ./nltk_data instead.
nltk.data.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "nltk_data"))

def compute_readability_scores(text: str) -> dict:
    return {
        "flesch_kincaid_grade": textstat.flesch_kincaid_grade(text),
        "flesch_reading_ease": textstat.flesch_reading_ease(text),
        "smog_index": textstat.smog_index(text),
        "gunning_fog": textstat.gunning_fog(text),
        "dale_chall": textstat.dale_chall_readability_score(text),
        "word_count": textstat.lexicon_count(text),
    }
