# Rainbow Patrol artwork

Created for this project on 2026-11-01 with the built-in OpenAI imagegen tool.
The selected full PNG outputs are retained here and distributed with the
project's GPL-2.0-or-later source. They are not taken from another game.

- `rainbow-sprites-v1.png`: 1254×1254 RGBA sprite atlas. The adapter uses
  explicitly measured source rectangles, preserves aspect ratios, rotates
  aircraft and fits artwork to the occupied native sprite bounds. Original
  C collision masks are read only and remain unchanged.
- `rainbow-splash-v1.png`: 1586×992 RGB splash with the Rainbow Patrol title.
  The user's RETRY screenshot was supplied as a palette/energy reference,
  not an edit target. That screenshot is not distributed here.
- `rainbow-extras-v1.png`: 1774×887 RGBA supplemental atlas for flags, a
  water tower, ruins, a tank wreck, missile, flare and windsock. The first
  atlas was a style reference. Source rectangles are measured explicitly.

The Canvas renderer uses a 640×400 logical flight area plus a 68-pixel HUD,
rendered into a 1920×1404 framebuffer. The
art is Amiga-inspired; this is not a claim of authentic Amiga palette or
hardware compatibility. Clouds and combat particles are original code art.

## Final sprite-atlas prompt

Use case: stylized-concept. Asset type: ONE production sprite atlas PNG for
an original 2D side-view aircraft game, Sopwith: Rainbow Patrol. Generate a
square 1024x1024 transparent canvas divided into an EXACT 4-column x 4-row
grid, each cell 256x256. NO labels, no borders, no text, no scenery. Each
independent sprite is centred in its cell and contained inside a 24px
transparent margin. Consistent genuine 1991 Amiga deluxe pixel art: clean
1px edges on a virtual 64px cell grid (4x nearest-neighbour pixels), 24-32
carefully shaded colors, warm cream highlights, teal shadows, coral red,
ochre, mint greens. Detailed charming side-on objects, orthographic side
view, no perspective floor, no drop shadows. All moving objects face RIGHT.
Strong readable silhouette and handplaced clusters, richer than CGA. Exact
row order: Row 1: coral-and-cream WWI biplane with two wings and struts
propeller and small black wheels; violet-and-mint enemy biplane; cream cow
with brown patches small horns and four legs; charcoal grey damaged wrecked
biplane. Row 2: mint-green curved aircraft hangar with dark open doorway;
sandy brick factory with two slim chimneys and sawtooth roof; olive green
tank with tracks and barrel facing right; ochre cylindrical fuel storage
tank. Row 3: military canvas-backed olive truck; cream-and-teal tanker
truck; small sand-colored canvas military tent; teal radio mast tower.
Row 4: yellow observation balloon with tiny basket; compact black iron bomb
with brass fins pointing down; white gull with wings raised; white gull with
wings lowered. The sprites should occupy most of the usable 208x208 inner
cell width OR height, maintaining natural proportions, never crossing a
grid cell. Transparent empty space around each. Absolutely no RETRY logo,
no borrowed existing game art.

The selected output used a larger, non-uniform layout; measured source
rectangles replace the requested regular grid in the actual adapter.

## Final splash prompt

Use case: stylized-concept. Asset type: finished full-screen 8:5 landscape
splash screen for an original Amiga-era pixel-art flying game 'RAINBOW
PATROL'. The attached RETRY image is a reference ONLY for joyful color
palette and chunky title-screen energy. Create a clearly different original
composition and aircraft, no copying its plane, letterforms, layout or
logo. Original coral-red and cream WWI Sopwith-style BIPLANE, TWO WINGS with
struts, brass propeller, small black wheels, banking dynamically toward
upper RIGHT, side-three-quarter view, occupying upper-right half. The sky
is bright azure with layers of softly shaded cream/mint clouds, a distant
emerald coastal island and a small sweeping rainbow far behind. Beautiful
1992 Amiga 32-color game title art, hand-painted pixels and dithered shade
ramps, crisp visible pixel clusters, not a vector flat cartoon or
photorealistic image. Large bespoke title occupying left and middle: exact
text 'RAINBOW' on line one and 'PATROL' on line two. Heavy original beveled
pixel slab letters, warm ivory/gold faces, coral lower shading, deep
teal/indigo offset extrusion, thin bright specular glints, playful but
highly readable. Small exact text 'SOPWITH TRIBUTE' above title. NO other
text, no RETRY, no company logos, no border or UI. Lower 20 percent should
have calmer medium-blue open sky and cloud edges, clear enough for actual
HTML mode choices and a press-to-play prompt to be overlaid. Not a mockup:
make the complete polished game art background, landscape aspect ratio
8:5, target 1280x800.

## Final supplemental-atlas prompt

Use case: stylized-concept. Create ONE supplemental production sprite atlas
for Sopwith: Rainbow Patrol. Attached image is STYLE REFERENCE ONLY: match
its original Amiga-era pixel art, shaded cream/mint/ochre/coral, dark teal
contours, side-view orthographic game objects. New 4-column by 2-row
transparent atlas, wide landscape. Every sprite isolated in a separate
equal cell with very large transparent gutters, no crossing cells, no stray
pixels, no labels or borders. Exactly 8 sprites, row-major order:
1) slender flagpole with a waving mint-and-cream pennant, no emblem;
2) riveted blue-green water tower, round tank on four tall lattice legs;
3) ruined sandy brick factory with broken chimney and rubble, no flames;
4) collapsed curved mint aircraft hangar with dark damaged door, no flames;
5) burnt-out olive tank wreck, sagging tracks and bent barrel facing right;
6) small horizontal brass-and-coral rocket/missile pointing RIGHT, no exhaust;
7) radial golden emergency flare with short bright sparks;
8) small windsock striped coral and cream on a thin pole. Hand-painted 1991
Amiga deluxe-game pixel clusters, not CGA and not a vector icon. Preserve
natural proportions and leave generous transparent space all around each
object. No company logos, no text. Transparent background.


## Cow reaction atlas, 2026-11-01

File: `rainbow-cow-reaction-v1.png` (1254 × 1254 RGBA). Generated with the
built-in OpenAI imagegen tool, using this project's main sprite atlas as the
character/style reference. The complete original output is retained. Runtime
source rectangles and animation timing are in `rainbow-assets.js`.

Final prompt:

> Use case: stylized-concept. Asset type: one production cow reaction animation sprite atlas, transparent square canvas, exactly FOUR separate cow poses in a 2x2 layout with very generous empty gutters. The attached atlas is a character and style reference ONLY. Use the same cream dairy cow with warm brown patches, little horns and pink udder, side view facing RIGHT, rich original Amiga-style shaded pixel art. Maintain the same proportions, character and colors across all four poses. Top left: cow startled, head raised, front knees beginning to buckle. Top right: cow visibly TOPPLING ONTO ITS SIDE, legs folding under its belly, body tilted about 30 degrees. Bottom left: cow falling onto the ground, body on its side, legs folded, small dizzy eye and head resting sideways. Bottom right: cow LYING FLAT ON ITS SIDE, brown-and-cream body horizontal, folded legs, eyes closed, head resting on the ground. Non-graphic cartoon arcade reaction: absolutely no blood, wounds, gore, grayscale or shrinking. Each entire pose has a transparent background, no ground rectangle, no text, no labels, no borders, no extra objects. Crisp illustrated game asset detail matching the attached original art, NOT simple CGA pixels. All four cows fully separated with ample padding. The last pose must clearly read as a fallen cow lying down, not a standing cow scaled smaller.
