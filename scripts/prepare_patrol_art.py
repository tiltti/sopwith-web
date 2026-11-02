#!/usr/bin/env python3
"""Original GPL-2.0-or-later departure sheet. Ground pilots use imagegen raster art."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'dist/assets'
def rect(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>'
def path(d,c,stroke=None):return f'<path d="{d}" fill="{c}"'+(f' stroke="{stroke}" stroke-width="1.2" stroke-linejoin="round"' if stroke else '')+'/>'
def sheet(name,w,h,body):
    (ROOT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>\n')
planes=''
for frame in range(3):
 # A rear three-quarter airframe, then level rear, then a distant silhouette.
 body=path('M44 18 L50 18 L53 51 L42 51Z','#c35f53','#263b55')
 body+=path('M7 29 L44 25 L50 25 L89 29 L88 35 L52 33 L43 33 L8 35Z','#e7bc70','#263b55')
 body+=path('M15 41 L43 36 L53 36 L81 41 L79 45 L52 43 L43 43 L16 45Z','#d58d58','#263b55')
 body+=path('M43 19 Q48 12 53 19 L52 45 L48 53 L43 45Z','#e58266','#263b55')
 body+=rect(46,21,4,22,'#ffc98e')+rect(45,15,6,7,'#345a69')
 body+=path('M44 44 L27 49 L27 53 L45 51 L48 57 L51 51 L69 53 L69 49 L52 44Z','#edb273','#263b55')
 body+=path('M48 38 L45 52 L48 57 L51 52Z','#c65368','#263b55')
 for x in [23,70]:body+=rect(x,32,2,10,'#6a5352')+rect(x+1,32,1,10,'#fff1bc')
 angle=[-10,0,7][frame]
 planes+=f'<g transform="translate({frame*96} 0)"><g transform="rotate({angle} 48 32)">{body}</g></g>'
sheet('patrol-departure-v1.svg',288,64,planes)
print('Original rear-view departure frames written.')
