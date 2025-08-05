# utils/exceptions.py
from fastapi import HTTPException

def raise_not_found(item: str):
    raise HTTPException(status_code=404, detail=f"{item} não encontrado")
