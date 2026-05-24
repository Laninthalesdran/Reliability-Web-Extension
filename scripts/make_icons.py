# Generates the stoplight icon set (run: python scripts/make_icons.py). Requires Pillow.
from PIL import Image, ImageDraw
import os
SIZES = [16, 32, 48, 96, 128]
BG = (17, 36, 58, 255)      # #11243a (popup header)
RED, AMBER, GREEN = (192,57,43,255), (226,150,15,255), (28,157,75,255)
os.makedirs(os.path.join(os.path.dirname(__file__), "..", "public", "icon"), exist_ok=True)
for s in SIZES:
    img = Image.new("RGBA", (s, s), (0,0,0,0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0,0,s-1,s-1], radius=max(2, s//6), fill=BG)
    dot = max(2, int(s*0.18)); cx = s//2; gap = int(s*0.26)
    for y, c in zip([s//2-gap, s//2, s//2+gap], [RED, AMBER, GREEN]):
        d.ellipse([cx-dot//2, y-dot//2, cx+dot//2, y+dot//2], fill=c)
    img.save(os.path.join(os.path.dirname(__file__), "..", "public", "icon", f"{s}.png"))
print("icons:", SIZES)
