from PIL import Image
from pathlib import Path

# Input and output paths
input_path = Path(r"C:\Projects\ireport_v1\assets\images\logov1_padded_white.png")
output_path = input_path.with_name("logov1_adaptive_white.png")

# Load the image
img = Image.open(input_path).convert("RGBA")
original_size = img.size[0]  # Assuming square

# Target size for adaptive icon (1024x1024 is standard)
target_size = 1024

# The logo should be ~66% of the total size (leaving 17% padding on each side)
logo_size = int(target_size * 0.60)  # 60% to be safe

# Resize the logo
img_resized = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

# Create a new transparent canvas
canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))

# Calculate position to center the logo
offset = (target_size - logo_size) // 2

# Paste the logo onto the canvas
canvas.paste(img_resized, (offset, offset), img_resized)

# Save the result
canvas.save(output_path)
print(f"Created adaptive icon with proper padding: {output_path}")
print(f"Logo size: {logo_size}x{logo_size} centered in {target_size}x{target_size} canvas")
