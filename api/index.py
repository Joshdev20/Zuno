"""Zuno platform API.

A deliberately small FastAPI service: it exposes the shared curriculum and keeps
anonymous progress in memory. There is no database yet, which is why progress
lives in a process-local store and is treated as best effort.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
CURRICULUM_DIR = ROOT / "shared" / "curriculum"
TRACK_IDS = ("html", "css", "js", "python")

app = FastAPI(title="Zuno API", version="0.1.0", docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("ZUNO_ALLOWED_ORIGINS", "*").split(",")],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _load_track(track_id: str) -> dict[str, Any]:
    path = CURRICULUM_DIR / f"{track_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Unknown track '{track_id}'")
    return json.loads(path.read_text(encoding="utf-8"))


_tracks_cache: list[dict[str, Any]] | None = None
_cache_lock = Lock()


def all_tracks() -> list[dict[str, Any]]:
    global _tracks_cache
    with _cache_lock:
        if _tracks_cache is None:
            _tracks_cache = [_load_track(track_id) for track_id in TRACK_IDS]
        return _tracks_cache


class ProgressPayload(BaseModel):
    completed: list[str] = Field(default_factory=list)
    xp: int = 0
    streak: int = 0
    active_days: list[str] = Field(default_factory=list)


_progress: dict[str, dict[str, Any]] = {}
_progress_lock = Lock()


@app.get("/api/health")
def health() -> dict[str, Any]:
    tracks = all_tracks()
    return {
        "status": "ok",
        "service": "zuno-api",
        "tracks": len(tracks),
        "lessons": sum(len(track["lessons"]) for track in tracks),
        "storage": "memory",
    }


@app.get("/api/curriculum")
def curriculum() -> dict[str, Any]:
    return {"tracks": all_tracks()}


@app.get("/api/curriculum/{track_id}")
def track(track_id: str) -> dict[str, Any]:
    return _load_track(track_id)


@app.get("/api/curriculum/{track_id}/lessons/{lesson_id}")
def lesson(track_id: str, lesson_id: str) -> dict[str, Any]:
    for entry in _load_track(track_id)["lessons"]:
        if entry["id"] == lesson_id:
            return entry
    raise HTTPException(status_code=404, detail=f"Unknown lesson '{lesson_id}'")


@app.get("/api/progress/{client_id}")
def read_progress(client_id: str) -> dict[str, Any]:
    with _progress_lock:
        stored = _progress.get(client_id)
    if stored is None:
        raise HTTPException(status_code=404, detail="No progress stored for this client")
    return stored


@app.post("/api/progress/{client_id}")
def write_progress(client_id: str, payload: ProgressPayload) -> dict[str, Any]:
    record = {
        **payload.model_dump(),
        "client_id": client_id,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    with _progress_lock:
        _progress[client_id] = record
    return {"saved": True, "record": record}
