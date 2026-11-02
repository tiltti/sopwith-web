#!/usr/bin/env python3
"""Original GPL-2.0-or-later vector sprite sheets. No third-party visual assets."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'dist/assets'
def rect(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>'
def path(d,c,stroke=None):return f'<path d="{d}" fill="{c}"'+(f' stroke="{stroke}" stroke-width="1.2" stroke-linejoin="round"' if stroke else '')+'/>'
def sheet(name,w,h,body):
    (ROOT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>\n')
pilots=''
for team in range(2):
 for frame in range(10):
  coat='#508a7d' if team==0 else '#78836c';helmet='#31595b' if team==0 else '#4b5660';ink='#263b55';skin='#efbf86'
  body=''
  if frame>=8:
   lean=1 if frame==9 else 0
   body+=path(f'M2 17 Q3 2 16 3 Q29 2 30 17 Q26 12 22 17 Q16 12 10 17 Q6 12 2 17Z','#fff1cc',ink)
   body+=path('M10 16 Q9 6 16 3 Q22 6 22 16 L18 14 L14 14Z','#efcc88')
   for x in [3,10,22,29]:body+=path(f'M{x} 17 L{16+lean} 41','none','#c4e5df')
  if frame==5:
   body+=path('M7 58 L11 53 L20 52 L28 57 L27 60 L17 58 L8 61Z',coat,ink)
   body+=rect(4,54,7,6,skin)+rect(3,53,8,2,helmet)
  else:
   bob=-1 if frame in [1,3,7,9] else 0
   body+=f'<g transform="translate(0 {bob})">'
   body+=path('M12 42 L21 42 L22 52 L12 53Z',coat,ink)+rect(12,49,10,2,'#a28964')
   body+=rect(13,34,7,8,skin)+path('M11 38 L12 33 L20 32 L23 37 L22 39 L11 39Z',helmet,ink)
   body+=rect(15,39,2,1,ink)+rect(19,40,3,2,'#d99869')
   leg1,leg2=((8,25) if frame==1 else (23,11) if frame==2 else (11,21))
   if frame>=7:leg1,leg2=(10+frame%2*2,25-frame%2*3)
   body+=path(f'M14 52 L{leg1} 59 L{leg1+3} 61 L17 54 L{leg2} 60 L{leg2+3} 60 L20 51Z',coat,ink)
   body+=rect(leg1-1,59,5,3,ink)+rect(leg2,59,5,3,ink)
   if frame==4:
    body+=path('M20 44 L27 43 L28 46 L20 48Z',coat,ink)+rect(23,42,8,2,'#765b42')+rect(27,41,5,1,ink)
   elif frame>=7:
    body+=path('M12 44 L7 36 M21 44 L26 36','none',coat)+rect(6,34,3,4,skin)+rect(25,34,3,4,skin)
   else:
    body+=path(f'M12 44 L{10 if frame!=2 else 8} 51 L12 53 M21 44 L{25 if frame==2 else 23} 50','none',coat)
   body+='</g>'
  pilots+=f'<g transform="translate({frame*32} {team*64})">{body}</g>'
sheet('patrol-pilots-v2.svg',320,128,pilots)
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
print('Original pilot poses and rear-view departure frames written.')
