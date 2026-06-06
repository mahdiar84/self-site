from database import get_connection

conn = get_connection()

cursor = conn.cursor()

cursor.execute("""
INSERT INTO projects
(title,description,technologies,github_url,image_url)

VALUES
(
    'Student Performance Predictor',
    'Machine Learning model for student prediction.',
    'Python, Scikit-Learn, Pandas',
    'https://github.com/mahdiar84/Student-Performance-Predictor.git',
    ''
)
""")

conn.commit()
conn.close()