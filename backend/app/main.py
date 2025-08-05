# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.simulation_routes import router as simulation_router

app = FastAPI(
    title="Simulador de Sistemas de Potência",
    description="API para simulação de fluxo de potência com pandapower",
    version="1.0.0"
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # durante o desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das rotas
app.include_router(simulation_router, prefix="/simulate", tags=["Simulação de Fluxo de Potência"])

# Rota raiz
@app.get("/")
def read_root():
    return {"message": "Simulador de Fluxo de Potência ativo"}
