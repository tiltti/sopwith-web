#!/usr/bin/env python3
"""Trace the immutable original glyph atlases into usable OpenType fonts.

Install typography-requirements.txt in a local tool venv. Raw PNGs are never
edited. Alpha contours, including dry-chalk holes, become native font outlines.
FontBuilder API: https://github.com/fonttools/fonttools/blob/main/Lib/fontTools/fontBuilder.py
SPDX-License-Identifier: GPL-2.0-or-later
"""
from collections import defaultdict
from pathlib import Path
from statistics import median
import hashlib
import json

from PIL import Image
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString

ROOT = Path(__file__).resolve().parents[1]
BASE_ROWS = ['ABCDEFGH', 'IJKLMNOP', 'QRSTUVWX', 'YZ012345',
             '6789.,:;', '+-/()?!%', "<>=[]'&#"]
SPECS = [
    ('Chalk', 'rainbow-chalk-glyphs-v1.png',
     [(26,127),(165,260),(297,399),(429,522),(555,644),(668,763),(785,876),(901,1000)],
     BASE_ROWS + ['AEMNORST']),
    ('Engraved', 'rainbow-engraved-glyphs-v1.png',
     [(41,135),(192,288),(339,449),(483,578),(620,714),(749,858),(889,990)], BASE_ROWS),
]


def outlines(mask, scale, baseline, left):
    """Follow oriented pixel-union edges; hole contours retain opposite winding."""
    w, h = mask.size
    pixels = mask.tobytes()
    filled = lambda x,y: 0 <= x < w and 0 <= y < h and pixels[y*w+x]
    edges = defaultdict(set)
    for y in range(h):
        for x in range(w):
            if not filled(x,y): continue
            if not filled(x,y-1): edges[x,y].add((x+1,y))
            if not filled(x+1,y): edges[x+1,y].add((x+1,y+1))
            if not filled(x,y+1): edges[x+1,y+1].add((x,y+1))
            if not filled(x-1,y): edges[x,y+1].add((x,y))
    pen = TTGlyphPen(None)
    while edges:
        start = min(edges)
        loop = [start]
        p = start
        while True:
            ends = edges[p]
            q = min(ends)
            ends.remove(q)
            if not ends: del edges[p]
            p = q
            if p == start: break
            loop.append(p)
        area = sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(loop,loop[1:]+loop[:1]))
        if abs(area) < 6: continue
        corners = []
        for i,p in enumerate(loop):
            a,b = loop[i-1],loop[(i+1)%len(loop)]
            if (p[0]-a[0])*(b[1]-p[1]) != (p[1]-a[1])*(b[0]-p[0]): corners.append(p)
        if len(corners) < 3: continue
        points = [(round((x-left)*scale), round((baseline-y)*scale)) for x,y in corners]
        pen.moveTo(points[0])
        for point in points[1:]: pen.lineTo(point)
        pen.closePath()
    return pen.glyph()


def build(kind, atlas_name, bands, rows):
    alpha = Image.open(ROOT/'dist/assets'/atlas_name).getchannel('A')
    crops = []
    for row,chars in enumerate(rows):
        for col,char in enumerate(chars):
            x0,x1 = round(col*alpha.width/8),round((col+1)*alpha.width/8)
            y0,y1 = bands[row]
            mask = alpha.crop((x0,y0,x1,y1)).point(lambda value: 255 if value >= 125 else 0)
            box = mask.getbbox()
            if not box: raise ValueError(f'Empty glyph {kind}/{row}/{char}')
            crops.append((row,char,mask,box))
    cap = median(box[3]-box[1] for row,char,mask,box in crops[:26])
    scale = 760/cap
    baselines = {row:median(box[3] for r,ch,mask,box in crops if r==row and (ch.isalnum() or row>=5)) for row in range(len(rows))}
    glyphs = {'.notdef':TTGlyphPen(None).glyph(), 'space':TTGlyphPen(None).glyph()}
    metrics = {'.notdef':(650,0),'space':(320,0)}
    cmap = {32:'space'}
    for row,char,mask,box in crops:
        name = f'uni{ord(char):04X}' + ('.alt' if row==7 else '')
        glyph = outlines(mask,scale,baselines[row],box[0])
        width = round((box[2]-box[0])*scale)
        advance = width+125
        lsb = 62
        if char.isdigit():
            advance = 720
            # Tabular counters keep a stable centre through every digit.
            if width > 620:
                digit_scale = scale*620/width
                glyph = outlines(mask,digit_scale,baselines[row],box[0])
                width = 620
            lsb = (advance-width)//2
        # Shift the outline itself, so hmtx and glyf agree on the side bearing.
        if glyph.numberOfContours:
            glyph.coordinates.translate((lsb,0))
        glyphs[name] = glyph
        metrics[name] = (advance,lsb)
        if row != 7:
            cmap[ord(char)] = name
            if char.isalpha(): cmap[ord(char.lower())] = name
    for char,source in {'−':'-','–':'-','—':'-','’':"'",'‘':"'",'·':'.','•':'.'}.items(): cmap[ord(char)] = cmap[ord(source)]
    family = 'Patrol '+kind
    fb = FontBuilder(1000,isTTF=True)
    fb.setupGlyphOrder(list(glyphs))
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=1000,descent=-250)
    fb.setupNameTable({'familyName':family,'styleName':'Regular','uniqueFontIdentifier':family+'-2026-v1',
                      'fullName':family,'psName':'Patrol'+kind+'-Regular','version':'Version 1.000',
                      'copyright':'Original Sopwith Web artwork, 2026. GPL-2.0-or-later.',
                      'licenseDescription':'GNU General Public License version 2 or later; original image-derived outlines.',
                      'licenseInfoURL':'https://www.gnu.org/licenses/old-licenses/gpl-2.0.html'})
    fb.setupOS2(sTypoAscender=1000,sTypoDescender=-250,usWinAscent=1100,usWinDescent=300,sCapHeight=760,sxHeight=760)
    fb.setupPost()
    if kind=='Chalk':
        rules=' '.join(f"sub @Context uni{ord(c):04X}' by uni{ord(c):04X}.alt;" for c in 'AEMNORST')
        addOpenTypeFeaturesFromString(fb.font,'@Context = [uni0041 uni0045 uni0049 uni004F uni0055 uni0052 uni0053]; feature calt { '+rules+' } calt;')
    fb.font['head'].created = fb.font['head'].modified = 3876854400
    fb.font.recalcTimestamp = False
    directory = ROOT/'dist/assets/fonts/patrol'
    directory.mkdir(parents=True,exist_ok=True)
    fb.font.flavor = 'woff2'
    path = directory/('Patrol'+kind+'-Regular.woff2')
    fb.save(path)
    print(path.relative_to(ROOT),path.stat().st_size,'bytes',len(glyphs),'glyphs')
    return {'path':path.relative_to(ROOT).as_posix(),'bytes':path.stat().st_size,
            'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'glyphCount':len(glyphs),
            'source': 'dist/assets/'+atlas_name,'bands':bands}


if __name__=='__main__':
    records=[build(*spec) for spec in SPECS]
    (ROOT/'web/patrol-fonts-v15.json').write_text(json.dumps({'tool':'scripts/build_patrol_fonts.py','files':records},indent=2)+'\n')
