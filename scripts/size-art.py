"""Resize the master art in assets-src/art to the largest size each layer is shown at.

Run with Python 3 + Pillow:  python3 scripts/size-art.py
Targets are in pixels of width (~12px per frame unit: 3x phones, 2x desktops).
"""
import os
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), '..', 'assets-src', 'art')
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'art')

TARGET = {
    'arch_event': 1200, 'balustrade': 1536, 'banana_leaves': 680, 'blossom_branch': 840,
    'brass_urn': 280, 'chhatra_umbrella': 280, 'chhatri_large': 600, 'chhatri_slim': 290,
    'courtyard': 1600, 'cypress_pair': 280, 'dandiya_pair': 230, 'door_left': 420,
    'door_right': 420, 'elephant_royal': 880, 'emblem_buta': 400, 'flowering_tree': 380,
    'gate_frame': 1200, 'garden_side': 640, 'haldi_pavilion': 700, 'horse_white': 460,
    'jasmine_strings': 750, 'lantern_hanging': 140, 'mandap_floral': 750, 'marigold_toran': 1040,
    'palace_terrace': 1500, 'peacock_lookback': 400, 'peacock_standing': 400,
    'red_flower_bush': 1600, 'rose_garland': 960, 'vine_hanging': 330, 'wisteria_hanging': 520,
    'ganesha': 560, 'monogram': 620,
    'ganesha': 560, 'monogram': 620,
}

total = 0
for name in sorted(os.listdir(SRC)):
    if not name.endswith('.webp') or name[:-5] not in TARGET:
        continue
    key = name[:-5]
    im = Image.open(os.path.join(SRC, name)).convert('RGBA')
    w = min(TARGET.get(key, im.width), im.width)
    if w < im.width:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, name)
    im.save(path, 'WEBP', quality=80, method=6, alpha_quality=88)
    kb = os.path.getsize(path) // 1024
    total += kb
    print(f'{key:18} {im.width}x{im.height} {kb}KB')
print(f'total {total/1024:.1f}MB')
