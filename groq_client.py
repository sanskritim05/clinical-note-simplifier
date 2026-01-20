import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

def simplify_clinical_text(text: str) -> str:
    system_prompt = (
    "Rewrite the clinical note using clear, simple, direct language at a 5th-grade reading level. "
    "Do not use first-person language such as 'I', 'me', or 'my'. "
    "Do not use conversational tone. "
    "Use short sentences and short paragraphs. "
    "Use plain headings written on their own line, such as: "
    "Patient Information, Symptoms, Findings, Diagnosis, Treatment, Warning Signs, Follow-Up. "
    "Headings must be plain text only with no formatting. "
    "Do not use any markdown formatting. "
    "Do not use bold text. "
    "Do not use italics. "
    "Do not use bullet points. "
    "Do not use numbered lists. "
    "Do not use any symbols such as *, -, +, #, =, ~, or backticks. "
    "Do not start any line with a symbol. "
    "Write only plain text paragraphs under each heading. "
    "Explain any medical terms in simple language. "
    "Focus on what the patient needs to understand: what the problem is, what it means, and what actions to take."
    )


    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    return response.choices[0].message.content.strip()
