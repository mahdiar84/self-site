from fastapi import APIRouter, Form
from app.database import get_connection

router = APIRouter()


@router.post("/contact")
async def contact_submit(
        name: str = Form(...),
        email: str = Form(...),
        message: str = Form(...)
):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO messages
        (name,email,message)
        VALUES (?,?,?)
    """, (name, email, message))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Message received."
    }