# backend/main.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from app.routes.simulation_routes import router as simulation_router

def create_app():
    app = FastAPI(
        title="Simulador de Fluxo de Potência - SIFP",
        description="""
        API desenvolvida para simulação de fluxo de potência utilizando pandapower e modelos MATPOWER.
        
        Funcionalidades:
        * Simulação de fluxo de potência
        * Suporte a arquivos MATPOWER
        """,
        version="1.0.0",
    )

    # Configurar CORS
    origins = [
        "http://localhost:3000",
        "http://localhost:8000",
        "*",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Incluir rotas
    app.include_router(simulation_router, prefix="/sip", tags=["Simulação"])

    return app

app = create_app()

@app.get("/", tags=["Root"])
async def read_root():
    """
    Rota raiz para verificar se a API está funcionando
    """
    return {
        "message": "Sistema de Simulação de Fluxo de Potência",
        "version": app.version,
        "docs": "/docs",
        "redoc": "/redoc"
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

    # Customizar o schema OpenAPI
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Manipulador de exceções global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
