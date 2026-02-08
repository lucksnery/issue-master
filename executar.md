python -m venv venv
backend\venv\Scripts\Activate
pip install fastapi uvicorn pydantic

cd backend
uvicorn main:app --reload

pip install google-generativeai