from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.database import create_tables, get_connection
from app.routes.contact import router as contact_router
from app.routes.projects import router as project_router
from app.routes.admin import router as admin_router

from app.translations import translations

app = FastAPI()

create_tables()
app.include_router(contact_router)
app.include_router(project_router)
app.include_router(admin_router)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")


@app.get("/")
async def home(request: Request):
    
    lang = request.cookies.get("lang", "en")
    t = translations.get(lang, translations["en"])

    conn = get_connection()

    projects = conn.execute(
        "SELECT * FROM projects"
    ).fetchall()
    
    certificates = conn.execute("SELECT * FROM certificates").fetchall()

    conn.close()

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        {
            "request": request,
            "projects": projects,
            "certificates" : certificates,
            "lang" : lang,
            "t": t
        }
    )
