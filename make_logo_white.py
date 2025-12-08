from pathlib import Path

from PIL import Image

# Input and output paths
input_path = Path(r"C:\Projects\ireport_v1\assets\images\logov1_padded.png")
output_path = input_path.with_name("logov1_padded_white.png")

print(f"Loading: {input_path}")
img = Image.open(input_path).convert("RGBA")
pixels = img.load()

width, height = img.size

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if a > 0:
            # keep alpha, force RGB to white
            pixels[x, y] = (255, 255, 255, a)

img.save(output_path)
print(f"Saved white logo to: {output_path}")
