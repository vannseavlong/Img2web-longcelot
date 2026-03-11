import io
import re
import zipfile

import functions_framework
from flask import Request, make_response
from PIL import Image


def _safe_name(filename: str) -> str:
    base = filename.rsplit(".", 1)[0]
    return re.sub(r"\s+", "_", base) + ".webp"


def _process(data: bytes, quality: int, do_resize: bool, max_w: int, max_h: int) -> bytes:
    img = Image.open(io.BytesIO(data))

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


@functions_framework.http
def api(request: Request):
    """Entry point for Firebase Cloud Function — handles POST /api/convert."""
    if request.method != "POST":
        return ("Method not allowed", 405)

    files = request.files.getlist("files")
    if not files:
        return ("No files uploaded", 400)

    quality = int(request.form.get("quality", 80))
    do_resize = request.form.get("do_resize", "false").lower() == "true"
    max_width = int(request.form.get("max_width", 0))
    max_height = int(request.form.get("max_height", 0))

    results: list[tuple[str, bytes]] = []
    for f in files:
        data = f.read()
        webp = _process(data, quality, do_resize, max_width, max_height)
        results.append((_safe_name(f.filename or "image"), webp))

    if len(results) == 1:
        name, data = results[0]
        resp = make_response(data)
        resp.headers["Content-Type"] = "image/webp"
        resp.headers["Content-Disposition"] = f'attachment; filename="{name}"'
        return resp

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, data in results:
            zf.writestr(name, data)

    resp = make_response(zip_buf.getvalue())
    resp.headers["Content-Type"] = "application/zip"
    resp.headers["Content-Disposition"] = 'attachment; filename="converted.zip"'
    return resp
