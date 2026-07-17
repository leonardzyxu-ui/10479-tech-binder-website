#!/usr/bin/env python3
"""Prepare deterministic, offline-safe robot imagery for the Tech Binder site."""

from pathlib import Path

from PIL import Image


SOURCE = Path("/Users/leoxu/Desktop/Robot Pics")
OUTPUT = Path(__file__).resolve().parents[1] / "binder_assets" / "10479"


def visible_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Image contains no visible pixels")
    return bbox


def remove_exact_white(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, alpha = pixels[x, y]
            if red == green == blue == 255:
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def save_block_cad_pair() -> None:
    non_sketch = Image.open(
        SOURCE / "Newer" / "Block CAD Replacement - Non Sketch.PNG"
    ).convert("RGBA")
    sketch = remove_exact_white(
        Image.open(SOURCE / "Newer" / "Block CAD Replacement - Sketch.PNG")
    )

    if non_sketch.size != sketch.size:
        raise ValueError("Block CAD replacement images must share source dimensions")

    boxes = [visible_bbox(non_sketch), visible_bbox(sketch)]
    left = min(box[0] for box in boxes)
    top = min(box[1] for box in boxes)
    right = max(box[2] for box in boxes)
    bottom = max(box[3] for box in boxes)
    side = max(right - left, bottom - top)

    # Keep one shared transform so the comparison slider cannot jump or drift.
    center_y = (top + bottom) / 2
    source_top = round(center_y - side / 2)

    for image, filename, quality in (
        (non_sketch, "nexus-render-square.webp", 90),
        (sketch, "nexus-sketch-square.webp", 92),
    ):
        canvas = Image.new("RGBA", (side, side), (255, 255, 255, 0))
        canvas.alpha_composite(image, dest=(-left, -source_top))
        canvas.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
        canvas.save(OUTPUT / filename, "WEBP", quality=quality, method=6)

    print(
        f"block-cad square={side} source-window=({left}, {source_top}, "
        f"{left + side}, {source_top + side}) union-bbox=({left}, {top}, {right}, {bottom})"
    )


def optimize_robot_images() -> None:
    sources = {
        "robot-hero.webp": SOURCE / "Newer" / "!10479-26-10000-0601-NEWEST.PNG",
        "robot-angle.webp": SOURCE / "Newer" / "10479-0601-Angled.PNG",
        "chassis.webp": SOURCE / "10479-0601-Chassis-Below.PNG",
        "intake.webp": SOURCE / "10479-0601-Intake.PNG",
        "indexer.webp": SOURCE / "10479-0601-Indexer.PNG",
        "shooter.webp": SOURCE / "10479-0601-Shooter.PNG",
        "swerve.webp": SOURCE / "Swerve-0601.PNG",
        "simulator.webp": Path(
            "/Users/leoxu/Library/CloudStorage/OneDrive-YKPaoSchool上海民办包玉刚实验学校/"
            "FRC2025-26/FRC-Dev/2026_rebuilt/tmp/powerhouse-simulator-fps.png"
        ),
        "simulator-field.webp": Path(
            "/Users/leoxu/Library/CloudStorage/OneDrive-YKPaoSchool上海民办包玉刚实验学校/"
            "FRC2025-26/FRC-Dev/2026_rebuilt/tmp/simulator-visual-qa/01-top.png"
        ),
        "glb-viewer.webp": Path(
            "/Users/leoxu/Library/CloudStorage/OneDrive-YKPaoSchool上海民办包玉刚实验学校/"
            "FRC2025-26/FRC-Dev/2026_rebuilt/tmp/glb-viewer-adjustments/"
            "studio-retina-stable.png"
        ),
    }
    for filename, source in sources.items():
        image = Image.open(source).convert("RGBA")
        image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
        image.save(OUTPUT / filename, "WEBP", quality=88, method=6)
        print(f"{filename}: {source.name} -> {image.size}")


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    save_block_cad_pair()
    optimize_robot_images()
