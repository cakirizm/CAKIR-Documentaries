#!/usr/bin/env python3
"""Cut the open tent doorway out of the reference cover so real photos can move behind it."""
from PIL import Image, ImageDraw, ImageFilter
import sys
SRC = sys.argv[1]; OUT = sys.argv[2]; PREV = sys.argv[3] if len(sys.argv) > 3 else None
s = 1920 / 1672
im = Image.open(SRC).convert('RGBA').resize((1920, 1080), Image.LANCZOS)
pts = [(870, 0), (1310, 0), (1380, 40), (1450, 80), (1520, 140), (1575, 200), (1600, 245), (1602, 300), (1598, 400), (1585, 480), (1565, 560), (1543, 620), (1512, 680), (1480, 726),
       (1440, 736), (1380, 758), (1330, 786), (1300, 800), (1100, 806), (900, 806), (740, 804), (668, 758), (618, 718), (574, 668), (526, 598), (494, 520), (466, 440), (455, 335), (457, 250), (467, 175), (492, 120), (532, 88), (650, 56), (760, 26)]
m = Image.new('L', (1920, 1080), 255)
ImageDraw.Draw(m).polygon([(x * s, y * s) for x, y in pts], fill=0)
m = m.filter(ImageFilter.GaussianBlur(3))
im.putalpha(m)
im.save(OUT)
if PREV:
    bg = Image.new('RGBA', (1920, 1080), (255, 0, 0, 255)); bg.alpha_composite(im); bg.convert('RGB').resize((960, 540)).save(PREV, quality=85)
