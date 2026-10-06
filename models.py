from pydantic import BaseModel, Field

class SimplifyRequest(BaseModel):
    text: str = Field(..., max_length=20000)

class SimplifyResponse(BaseModel):
    original_text: str
    simplified_text: str
    readability_before: dict
    readability_after: dict
