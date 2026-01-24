import os
import re
import argparse
from PIL import Image

# Default folders (can be overridden with CLI)
input_folder = r"D:\Inter@Company\bEasy_LandingPage\png2webp\input"
output_folder = r"D:\Inter@Company\bEasy_LandingPage\png2webp\output"


def parse_args():
    p = argparse.ArgumentParser(description="Convert PNGs to WebP with optional compression and resizing")
    p.add_argument("--input", "-i", default=input_folder, help="Input folder (default: same folder)")
    p.add_argument("--output", "-o", default=output_folder, help="Output folder (default: ./output)")
    p.add_argument("--quality", "-q", type=int, default=100, help="WebP quality 0-100 (lower = smaller)")
    p.add_argument("--max-width", type=int, default=0, help="Max width to resize to (0 = no resize)")
    p.add_argument("--max-height", type=int, default=0, help="Max height to resize to (0 = no resize)")
    p.add_argument("--resize", action="store_true", help="Enable resizing to max width/height while preserving aspect ratio")
    p.add_argument("--dry-run", action="store_true", help="Print what would be done without writing files")
    return p.parse_args()


def human_size(n):
    # Simple human-readable file size
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024.0:
            return f"{n:.1f}{unit}"
        n /= 1024.0
    return f"{n:.1f}TB"


def main():
    args = parse_args()
    input_dir = args.input
    out_dir = args.output
    quality = max(0, min(100, args.quality))
    max_w = args.max_width
    max_h = args.max_height
    do_resize = args.resize and (max_w > 0 or max_h > 0)
    dry = args.dry_run

    os.makedirs(out_dir, exist_ok=True)

    files = [f for f in os.listdir(input_dir) if f.lower().endswith('.png')] ## Image extension to process
    if not files:
        print("No PNG files found.")
        return

    for filename in files:
        png_path = os.path.join(input_dir, filename)

        try:
            orig_size = os.path.getsize(png_path)
            img = Image.open(png_path)

            # Optionally resize while preserving aspect ratio
            if do_resize:
                # Build target tuple; 0 means unconstrained
                target_w = max_w if max_w > 0 else img.width
                target_h = max_h if max_h > 0 else img.height
                # Use thumbnail (in-place) to preserve aspect ratio
                img.thumbnail((target_w, target_h), Image.LANCZOS)

            # Build a safe output filename: replace any whitespace sequence with underscore
            base_name = os.path.splitext(filename)[0]
            safe_base = re.sub(r"\s+", "_", base_name)
            webp_filename = safe_base + ".webp"
            webp_path = os.path.join(out_dir, webp_filename)

            print(f"Converting: {filename} -> {webp_filename} (quality={quality}{', resized' if do_resize else ''})")

            if not dry:
                # Save as WebP with chosen quality and a higher method for better compression
                img.save(webp_path, "WEBP", quality=quality, method=6)

                new_size = os.path.getsize(webp_path)
                saved = orig_size - new_size
                pct = (saved / orig_size * 100) if orig_size else 0
                print(f"  {human_size(orig_size)} -> {human_size(new_size)}  (saved {human_size(saved)} = {pct:.1f}%)")
            else:
                print("  (dry-run) would write file")

        except Exception as e:
            print(f"❌ Error converting {filename}: {e}")
            continue

    print("✅ Done: PNG -> WebP conversions completed.")


if __name__ == '__main__':
    main()