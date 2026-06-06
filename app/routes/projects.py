from fastapi import APIRouter
from app.database import get_connection

router = APIRouter()


@router.get("/api/projects")
async def get_projects():

    conn = get_connection()

    projects = conn.execute(
        "SELECT * FROM projects"
    ).fetchall()

    conn.close()

    return [dict(project) for project in projects]