"""
Batch-remove image backgrounds.

Install dependencies:
    python -m pip install rembg Pillow onnxruntime

Examples:
    python remove_background.py .\\input_images
    python remove_background.py .\\input_images --output-dir .\\transparent --output-format webp
"""

from __future__ import annotations

import argparse
from collections import Counter
from collections import deque
from pathlib import Path

from PIL import Image

SUPPORTED_EXTENSIONS = {".bmp", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"}


def remove_white_background(image: Image.Image, padding: int = 18) -> Image.Image:
    """Make the edge-connected white background transparent and trim empty margins."""
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    queue = deque()

    def is_background(x: int, y: int) -> bool:
        red, green, blue, _ = pixels[x, y]
        return min(red, green, blue) >= 220 and max(red, green, blue) - min(red, green, blue) <= 80

    def add_edge_pixel(x: int, y: int) -> None:
        index = y * width + x
        if not visited[index] and is_background(x, y):
            visited[index] = 1
            queue.append(index)

    for x in range(width):
        add_edge_pixel(x, 0)
        add_edge_pixel(x, height - 1)
    for y in range(height):
        add_edge_pixel(0, y)
        add_edge_pixel(width - 1, y)

    while queue:
        index = queue.popleft()
        x = index % width
        y = index // width
        red, green, blue, _ = pixels[x, y]
        minimum = min(red, green, blue)
        alpha = 255 - minimum

        if alpha <= 12:
            pixels[x, y] = (red, green, blue, 0)
        else:
            pixels[x, y] = (
                min(255, round((red - minimum) * 255 / alpha)),
                min(255, round((green - minimum) * 255 / alpha)),
                min(255, round((blue - minimum) * 255 / alpha)),
                alpha,
            )

        for neighbor_x, neighbor_y in (
            (x - 1, y),
            (x + 1, y),
            (x, y - 1),
            (x, y + 1),
        ):
            if (
                0 <= neighbor_x < width
                and 0 <= neighbor_y < height
                and not visited[neighbor_y * width + neighbor_x]
                and is_background(neighbor_x, neighbor_y)
            ):
                neighbor_index = neighbor_y * width + neighbor_x
                visited[neighbor_index] = 1
                queue.append(neighbor_index)

    visible_alpha = image.getchannel("A").point(lambda value: 255 if value > 12 else 0)
    bounds = visible_alpha.getbbox()
    if bounds:
        left, top, right, bottom = bounds
        bounds = (
            max(0, left - padding),
            max(0, top - padding),
            min(width, right + padding),
            min(height, bottom + padding),
        )
        image = image.crop(bounds)

    return image


def remove_image_background(
    source: Path,
    destination: Path,
    output_format: str,
    method: str,
) -> None:
    """Remove one image's background and save it with an alpha channel."""
    with Image.open(source) as image:
        if method == "white":
            foreground = remove_white_background(image)
        else:
            from rembg import remove

            foreground = remove(image.convert("RGBA"))

    if output_format == "webp":
        foreground.save(destination, format="WEBP", lossless=True)
    else:
        foreground.save(destination, format="PNG")


def process_folder(
    input_dir: Path,
    output_dir: Path,
    output_format: str,
    method: str,
) -> int:
    """Process supported image files directly inside input_dir; return the failure count."""
    images = sorted(
        path
        for path in input_dir.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )
    if not images:
        raise ValueError(f"No supported images found in: {input_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)
    stem_counts = Counter(path.stem.casefold() for path in images)
    extension = ".webp" if output_format == "webp" else ".png"
    failures = 0

    for source in images:
        output_stem = source.stem
        if stem_counts[source.stem.casefold()] > 1:
            output_stem = f"{output_stem}_{source.suffix.lower().lstrip('.')}"
        destination = output_dir / f"{output_stem}_no_bg{extension}"

        try:
            remove_image_background(source, destination, output_format, method)
            print(f"Saved: {destination}")
        except (OSError, RuntimeError, ValueError) as error:
            failures += 1
            print(f"Failed: {source} ({error})")

    return failures


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Remove backgrounds from images in a folder."
    )
    parser.add_argument("input_dir", type=Path, help="Folder containing source images")
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Folder for transparent images (default: INPUT_DIR/no_background)",
    )
    parser.add_argument(
        "--output-format",
        choices=("png", "webp"),
        default="png",
        help="Transparent output format (default: png)",
    )
    parser.add_argument(
        "--method",
        choices=("rembg", "white"),
        default="rembg",
        help="Background removal method (white is for plain white backgrounds)",
    )
    args = parser.parse_args()

    input_dir = args.input_dir.expanduser()
    if not input_dir.is_dir():
        parser.error(f"Input folder does not exist or is not a directory: {input_dir}")

    output_dir = args.output_dir or input_dir / "no_background"
    output_dir = output_dir.expanduser()

    try:
        failures = process_folder(
            input_dir, output_dir, args.output_format, args.method
        )
    except ValueError as error:
        parser.error(str(error))

    if failures:
        print(f"Finished with {failures} failed image(s).")
        return 1

    print("All images processed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
