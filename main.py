import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from typing import List
import uvicorn
import json

app = FastAPI()

# Класс для управления подключениями
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Когда кто-то заходит по твоей ссылке pipipupu-production.up.railway.app - отдаем HTML
@app.get("/")
async def get_frontend():
    return FileResponse("messenger.html")

# Обработка сообщений в реальном времени (WebSockets)
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Получаем сообщение от пользователя
            data = await websocket.receive_text()
            # Рассылаем всем
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    # Railway автоматически назначает порт, по умолчанию на скрине у тебя 8080.
    # Этот код возьмет нужный порт из системы Railway:
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
