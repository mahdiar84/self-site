from fastapi import APIRouter, Request, Form, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse

from app.database import get_connection
from app.auth import verify_password

router = APIRouter()
templates = Jinja2Templates(directory="templates")

ADMIN_PASSWORD_HASH = "$2b$12$uRXf.vo7hY1TranRp8sWKemMu7z8KOvmdLV6A29JUpBQCYmENTgYK"

# =========================
# ADMIN DASHBOARD
# =========================
@router.get("/admin")
async def admin_dashboard(request: Request):
    
    auth = request.cookies.get("admin_auth")
    
    if auth != "true":
        return RedirectResponse("/admin/login")

    conn = get_connection()
    cursor = conn.cursor()

    projects = cursor.execute(
        "SELECT * FROM projects ORDER BY id DESC"
    ).fetchall()

    certificates = cursor.execute(
        "SELECT * FROM certificates ORDER BY id DESC"
    ).fetchall()

    messages = cursor.execute(
        "SELECT * FROM messages ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return templates.TemplateResponse(
        "admin.html",
        {
            "request": request,
            "projects": projects,
            "certificates": certificates,
            "messages": messages
        }
    )

@router.get("/admin/login")
async def admin_login_page(request: Request):
    return templates.TemplateResponse(
        "admin_login.html",
        {"request": request}
    )
    
@router.post("/admin/login")
async def admin_login(
    request: Request,
    password: str = Form(...)
):

    if verify_password(password, ADMIN_PASSWORD_HASH):

        response = RedirectResponse("/admin", status_code=303)
        response.set_cookie(
            key="admin_auth",
            value="true",
            httponly=True
        )
        return response

    return templates.TemplateResponse(
        "admin_login.html",
        {
            "request": request,
            "error": "Wrong password"
        }
    )
    
@router.get("/admin/logout")
async def logout():
    response = RedirectResponse("/admin/login")
    response.delete_cookie("admin_auth")
    return response

# =========================
# PROJECTS CRUD
# =========================

@router.get("/admin/projects/add")
async def add_project_page(request: Request):
    return templates.TemplateResponse(
        "add_project.html",
        {"request": request}
    )


@router.post("/admin/projects/add")
async def add_project(
    title: str = Form(...),
    description: str = Form(...),
    technologies: str = Form(""),
    github_url: str = Form("")
):

    conn = get_connection()

    conn.execute("""
        INSERT INTO projects (title, description, technologies, github_url)
        VALUES (?, ?, ?, ?)
    """, (title, description, technologies, github_url))

    conn.commit()
    conn.close()

    return RedirectResponse("/admin", status_code=303)


@router.get("/admin/projects/edit/{project_id}")
async def edit_project_page(request: Request, project_id: int):

    conn = get_connection()
    cursor = conn.cursor()

    project = cursor.execute(
        "SELECT * FROM projects WHERE id = ?",
        (project_id,)
    ).fetchone()

    conn.close()

    return templates.TemplateResponse(
        "edit_project.html",
        {
            "request": request,
            "project": project
        }
    )


@router.post("/admin/projects/edit/{project_id}")
async def update_project(
    project_id: int,
    title: str = Form(...),
    description: str = Form(...),
    technologies: str = Form(""),
    github_url: str = Form("")
):

    conn = get_connection()

    conn.execute("""
        UPDATE projects
        SET title = ?,
            description = ?,
            technologies = ?,
            github_url = ?
        WHERE id = ?
    """, (title, description, technologies, github_url, project_id))

    conn.commit()
    conn.close()

    return RedirectResponse("/admin", status_code=303)


@router.post("/admin/projects/delete/{project_id}")
async def delete_project(project_id: int):

    conn = get_connection()

    conn.execute(
        "DELETE FROM projects WHERE id = ?",
        (project_id,)
    )

    conn.commit()
    conn.close()

    return RedirectResponse("/admin", status_code=303)


# =========================
# CERTIFICATES CRUD
# =========================

@router.get("/admin/certificates/add")
async def add_certificate_page(request: Request):
    return templates.TemplateResponse(
        "add_certificate.html",
        {"request": request}
    )


@router.post("/admin/certificates/add")
async def add_certificate(
    title: str = Form(...),
    issuer: str = Form(""),
    url: str = Form(""),
    image_url: str = Form("")
):

    conn = get_connection()

    conn.execute("""
        INSERT INTO certificates (title, issuer, url, image_url)
        VALUES (?, ?, ?, ?)
    """, (title, issuer, url, image_url))

    conn.commit()
    conn.close()

    return RedirectResponse("/admin", status_code=303)


@router.post("/admin/certificates/delete/{cert_id}")
async def delete_certificate(cert_id: int):

    conn = get_connection()

    conn.execute(
        "DELETE FROM certificates WHERE id = ?",
        (cert_id,)
    )

    conn.commit()
    conn.close()

    return RedirectResponse("/admin", status_code=303)

@router.get("/admin/certificates/edit/{cert_id}")
async def edit_certificate_page(request: Request, cert_id: int):

    conn = get_connection()

    certificate = conn.execute(
        "SELECT * FROM certificates WHERE id = ?",
        (cert_id,)
    ).fetchone()

    conn.close()

    return templates.TemplateResponse(
        "edit_certificate.html",
        {
            "request": request,
            "certificate": certificate
        }
    )
    
@router.post("/admin/certificates/edit/{cert_id}")
async def update_certificate(
    cert_id: int,
    title: str = Form(...),
    issuer: str = Form(""),
    url: str = Form(""),
    image_url: str = Form("")
):

    conn = get_connection()

    conn.execute("""
        UPDATE certificates
        SET title = ?,
            issuer = ?,
            url = ?,
            image_url = ?
        WHERE id = ?
    """, (title, issuer, url, image_url, cert_id))

    conn.commit()
    conn.close()

    return RedirectResponse("/admin", status_code=303)


# =========================
# MESSAGES
# =========================

@router.post("/admin/messages/delete/{message_id}")
async def delete_message(message_id: int):

    conn = get_connection()

    conn.execute(
        "DELETE FROM messages WHERE id = ?",
        (message_id,)
    )

    conn.commit()
    conn.close()

    return RedirectResponse("/admin", status_code=303)

@router.get("/lang/{lang}")
async def set_language(lang: str):

    # safety check (only allow these two)
    if lang not in ["en", "fa"]:
        lang = "en"

    response = RedirectResponse("/", status_code=302)

    response.set_cookie(
        key="lang",
        value=lang,
        httponly=True
    )

    return response