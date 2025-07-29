# main.py
from fastapi import FastAPI
import psycopg2
import os

app = FastAPI()

@app.get("/")
def health():
    return {"status": "Auth Service is running!"}

@app.get("/login")
def login(username: str, password: str):
    return {"token": f"fake-token-for-{username}"}

