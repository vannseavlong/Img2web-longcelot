import io
import os
import re
import zipfile
from typing import List

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

app = FastAPI()

# Allow CORS from the frontend origin.
# Set ALLOWED_ORIGIN in production (e.g. https://img2webp-longcelot.web.app).
# Defaults to localhost:3000 for local dev.
_allowed_origin = os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_allowed_origin],
    allow_methods=["POST"],
    allow_headers=["*"],
)


def safe_name(filename: str) -> str:
    base = filename.rsplit(".", 1)[0]
    return re.sub(r"\s+", "_", base) + ".webp"


def process_image(data: bytes, quality: int, do_resize: bool, max_w: int, max_h: int) -> bytes:
    img = Image.open(io.BytesIO(data))

    # Preserve transparency for RGBA/P modes
    if img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    if do_resize and (max_w > 0 or max_h > 0):
        target_w = max_w if max_w > 0 else img.width
        target_h = max_h if max_h > 0 else img.height
        img.thumbnail((target_w, target_h), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue()


@app.post("/api/convert")
async def convert_images(
    files: List[UploadFile] = File(...),
    quality: int = Form(80),
    do_resize: bool = Form(False),
    max_width: int = Form(0),
    max_height: int = Form(0),
):
    results: list[tuple[str, bytes]] = []

    for file in files:
        raw = await file.read()
        webp_bytes = process_image(raw, quality, do_resize, max_width, max_height)
        results.append((safe_name(file.filename or "image"), webp_bytes))

    if len(results) == 1:
        name, data = results[0]
        return StreamingResponse(
            io.BytesIO(data),
            media_type="image/webp",
            headers={"Content-Disposition": f'attachment; filename="{name}"'},
        )

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, data in results:
            zf.writestr(name, data)
    zip_buf.seek(0)

    return StreamingResponse(
        zip_buf,
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="converted.zip"'},
    )


# Serve the Next.js static build in production.
# Must be mounted last so API routes take priority.
_static_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "out")
if os.path.isdir(_static_dir):
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
