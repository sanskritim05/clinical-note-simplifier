from pydantic import BaseModel

class SimplifyRequest(BaseModel):
    text: str

class SimplifyResponse(BaseModel):
    original_text: str
    simplified_text: str
    readability_before: dict
    readability_after: dict
