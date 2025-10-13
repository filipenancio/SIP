# backend/main.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes.simulation_routes import router as simulation_router

app = FastAPI(
    title="Simulador de Sistemas de Potência",
    description="API para simulação de fluxo de potência utilizando pandapower.",
    version="1.0.0"
)

# Configuração de CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # Frontend React padrão
    "http://localhost:8000",  # Backend durante desenvolvimento
    "*"  # Permitir todos durante desenvolvimento
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global error handler: {str(exc)}")  # Debug logging
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

app.include_router(
    simulation_router,
    prefix="/simulate",
    tags=["Simulação de Fluxo de Potência"]
)

@app.get("/", tags=["Root"])
async def read_root():
    """
    Rota raiz para verificar se a API está funcionando.
    """
    return {
        "message": "Simulador de Fluxo de Potência ativo",
        "version": app.version,
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
