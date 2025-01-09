import sys
from dotenv import load_dotenv
# import os
# os.environ['HF_TOKEN']=""
# os.environ['PORT'] = "5000"

load_dotenv()
sys.path = sys.path + ["./app"]

from fastapi import FastAPI
from pydantic import BaseModel
from services.llm_service import LLMService

app = FastAPI()
llm_service = LLMService()

class TextData(BaseModel):
    text: str
    lang: str

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.post("/summarize")
async def summarize(data: TextData):
    text = data.text
    lang = data.lang
    result = llm_service.summarize_text(text, lang)
    return result
