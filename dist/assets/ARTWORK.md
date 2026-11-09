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
rendered into a 1920×1488 framebuffer. The
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


## Defense / pilot atlas, 2026-11-01

`rainbow-defense-pilots-v1.png` (1536×1024 RGBA) is the complete selected output
from the built-in OpenAI imagegen tool. The original main atlas was a style
reference. Source rectangles were measured without altering the image.
The top row supplies integrated crewed AA guns facing right/left and their
wreck; the bottom row supplies freefall, cream parachute and burning-canopy poses.
The generated soft alpha outside each object is cropped by the source rectangles.

Final prompt:

> Use case: stylized-concept. Asset type: production game sprite atlas, SIX separate sprites in a 3-column by 2-row grid on a genuinely transparent background. Use the attached original atlas as STYLE REFERENCE only: richly shaded Amiga-era pixel art with crisp readable silhouettes, warm olive metal, brass, cream highlights and dark navy outlines, not vector icons and not coarse CGA pixels. Exactly six clearly separated complete sprites, generous transparent gutters, no labels, no text, no scenery. Top row left: a standalone small WWII-style antiaircraft gun emplacement aimed diagonally UP RIGHT, mounted on a broad low olive tripod pedestal with two small olive-uniformed helmeted crew members physically operating it, complete base, gun, wheels/gears and coherent crew all one integrated sprite. Top row middle: same complete antiaircraft emplacement aimed UP LEFT with coherent crew. Top row right: a damaged destroyed version of the emplacement, collapsed bent barrel, dark olive wreck and a little debris, no crew gore. Bottom row left: a small WWI biplane pilot jumping/falling freely, goggles, leather helmet, brown flight suit and cream scarf, arms and legs apart; only the human figure and packed parachute. Bottom row middle: same pilot hanging below a fully deployed round CREAM PARACHUTE with thin clearly visible suspension lines, full canopy and pilot together, entire pose inside its cell. Bottom row right: same full parachute pose with an amber/red canopy and a few orange flames on the fabric edge, pilot intact, cartoon peril with absolutely no blood or gore. All shapes and humans must have meaningful illustrated detail like the source atlas, not crude rectangles. No ground strips. Each sprite individually centered within its own grid cell, no touching or overlap between sprites. Landscape atlas composition.

## Look studies A/B/C

`look-lab.html` uses this project's own sprite crops and a standalone code-drawn
scene at three background pixel/detail levels. These are static art-direction
studies, not recordings of live gameplay. Clouds use flat color clusters,
without a shade gradient. Terrain, foundations, rays and rainbows are code art.
No RETRY pixels are bundled. Selecting a study does not yet select a live-game
renderer profile.

## Original sound-control vectors (2026-11-02)

`sound-on.svg` and `sound-off.svg` are original code-authored pixel speaker icons
for this project, licensed GPL-2.0-or-later. They are vector UI assets, not
imagegen output or artwork copied from another game.


## Mission / pilot SVG sheets (2026-11-02)

`patrol-departure-v1.svg` (288×64) contains three original rear-view biplane
frames, GPL-2.0-or-later; reproduce with `scripts/prepare_patrol_art.py`.

The rejected geometric pilot SVG sheet has been removed. The original detailed airborne pilot remains the character reference. The new
four-frame sway sheet below animates the same cream and burning canopies.

`rainbow-pilot-walk-v3.png` (1536×1024, transparent RGBA) was created with the
built-in OpenAI image_gen tool on 2026-11-02, using that original pilot atlas as
a character/style reference. It preserves the brown suit, goggles, scarf and
backpack in eight ground poses on a 4×2 grid. The unmodified complete tool output
is included; the exact prompt, reference/output hashes and dimensions are in
`web/pilot-walk-v3-generation.json`. There is no third-party reference art. The
sheet is distributed with the GPL-2.0-or-later game. Every cell has the same
measured sole baseline, used by the renderer to anchor feet to terrain.

## Painted coast, cockpit and flight animation (2026-11-02)

The ten full PNG outputs below were made with the built-in OpenAI imagegen
 tool, copied unchanged into this project and distributed with the GPL-2.0-or-later
 game. No Wings or RETRY assets were copied. The selected environment concept
was this project's own generated coastal scene, explicitly selected by the user
with an image attachment; its image takes precedence over earlier A/B/C labels.

| Asset | Runtime use |
| --- | --- |
| `rainbow-scenery-v1.png` | Distant coast / blue sky, slower scrolling layer |
| `rainbow-clouds-v1.png` | Three painted clouds and three meadow decorations |
| `rainbow-turf-v1.png` | Painted meadow edge warped along the real ground surface |
| `rainbow-soil-v1.png` | World-anchored soil texture clipped to native mutable ground |
| `rainbow-cockpit-v1.png` | Wood/leather panel, brass instrument faces and plates |
| `rainbow-wing-badge-v1.png` | Victory / pause wings, live text in the enamel centre |
| `rainbow-debrief-v1.png` | Quiet airfield, pilot and aircraft beside menus / high scores |
| `rainbow-departure-v2.png` | Four rear-view aircraft poses replacing the earlier vector |
| `rainbow-parachute-sway-v4.png` | Four cream and four burning-canopy pendulum poses |
| `rainbow-aircraft-roll-v1.png` | Four axial roll poses per faction for falling aircraft |

All are 1536×1024. The exact prompt sets are in
`web/flight-art-v08-prompts.json`, `web/environment-v08-prompts.json` and
`web/aircraft-roll-v08-prompt.json`; dimensions, byte lengths and SHA-256 are in
`web/flight-art-v08-files.json`. Runtime cropping preserves the original alpha.
The earlier SVG departure sheet is retained as historical source, no longer used.
The environment materials follow the real height field and crater updates;
clouds and decorations cannot alter collisions. Cockpit needles and markings
are live code drawn over the blank painted instrument faces.

## Scoreboard / cockpit sprites (2026-11-03)

Three original full outputs made with built-in OpenAI imagegen, shown to the
project owner in chat, then copied unchanged into this directory:

- `rainbow-scoreboard-frame-v1.png` (1254×1254 RGB): nine-slice old wooden
  scoreboard with brass corners and an empty dark writing surface.
- `rainbow-scoreboard-parts-v1.png` (1254×1254 RGBA): normal/selected row slats,
  mechanical flip-character tile and winged blank title plate. CSS crops the
  raw atlas at runtime; names, ranks and scores remain live accessible text.
- `rainbow-cockpit-instruments-v2.png` (1536×1024 RGBA): fuel dial, navigation
  and score windows, bomb icon, ammunition bezel and home badge. The canvas
  adapter crops these and draws calibrated needles/labels over blank faces.

Exact prompts, references, immutable output hashes and dimensions are in
`web/score-cockpit-v09-prompts.json` and `web/score-cockpit-v09-files.json`.
References were this project's cockpit and debrief art. No third-party game
art was copied. These images are distributed with the GPL-2.0-or-later game.

## Explosions and instrument details (2026-11-03)

Three original built-in OpenAI imagegen outputs, all shown in chat and copied
unchanged into the project (1536×1024 RGBA each):

- `rainbow-explosions-v2.png`: eight sequential ignition/fire/smoke frames in a
  4×2 sheet. Runtime crops retain a fixed animation centre and transparent margin.
- `rainbow-dashboard-details-v3.png`: blank LIVES/LVL/AMMO bezels, five empty bomb
  clips, and embossed YOU / FRIEND / ENEMY / BIRDS tapes in a 4×2 atlas.
- `rainbow-gauge-layers-v1.png`: ivory/charcoal blank dials, blued spade/brass leaf
  hands, transparent convex-glass highlight and pivot cap. Runtime crops use
  measured pivots. Needles rotate independently; live serif graduations are
  rendered between dial and glass at the 3× framebuffer resolution.

Exact production and two design-review gauge prompts are retained in
`web/effects-dashboard-v10-prompts.json`; production PNG hashes and dimensions
are in `web/effects-dashboard-v10-files.json`. The gauge concepts used our own
cockpit materials as references, followed by the layer sheet using those
concepts. Review-only concept PNGs remain in the owner's local research folder.
No third-party game art was copied. These original game images are distributed
with the GPL-2.0-or-later game. No paid-provider CLI/API workflow was used.

## Three-mission campaign artwork (2026-11-03)

Six original built-in OpenAI imagegen outputs were shown in chat and copied
unchanged into this directory, each 1536×1024:

- `rainbow-winter-scenery-v1.png`: snowy coastal valleys and winter sky.
- `rainbow-storm-scenery-v1.png`: storm clouds, mountains and a ruined city skyline.
- `rainbow-world-details-v1.png`: four buried fossil/antiquity details, British
  Union Jack and Imperial German black-white-red flags, snowy firs and brick ruin.
- `rainbow-winter-city-targets-v1.png`: four snow-covered and four damaged city
  buildings, cropped into native target bounds at runtime.
- `rainbow-mission-materials-v1.png`: four frozen-earth/snow/rubble/paving tiles.
- `rainbow-medal-ceremony-v1.png`: campaign victory, medal presentation on the
  right with room for the live score board on the left.

The existing original painted coast was the style reference. Exact prompts and
immutable output hashes/dimensions are in `web/campaign-v11-prompts.json` and
`web/campaign-v11-files.json`. No commercial-game images were copied or bundled.
Transparency of the sprite sheets is preserved; runtime crops and world-space
placement leave collision masks untouched. Original production artwork is
provided with this GPL-2.0-or-later game. No paid-provider API/CLI was used.

## Airfields and water (2026-11-04)

Two original 1536×1024 built-in OpenAI imagegen outputs were displayed in chat
and copied unchanged into this directory, preserving the building atlas alpha:

- `rainbow-airfield-buildings-v2.png`: three open aircraft hangars, a coastal
  manor, winter rail depot, city clock tower, brick factory and mountain mill.
- `rainbow-water-airstrip-v1.png`: coastal, icy and stormy water tiles plus dry
  dirt, packed snow and wet-gravel airstrip surfaces.

Exact prompts, original project style references, output dimensions and hashes
are in `web/airfields-v12-prompts.json` and `web/airfields-v12-files.json`.
The game crops these immutable outputs at runtime. Larger architecture has
matching enlarged native collision masks. Water is distant scenery behind the
foreground terrain. Original art is provided with the GPL-2.0-or-later game;
no commercial-game assets or paid-provider API/CLI workflow were used.

Earlier in-game boards used unmodified **Patrick Hand**, Copyright 2010–2012 Patrick
Wagesreiter, under SIL OFL 1.1. The font, license and source/hash receipt are
in `fonts/patrick-hand/` for historical source preservation. Current Rainbow
lettering is documented below.

## Destruction, mounted flags and sidebar (2026-11-04)

Three original built-in OpenAI imagegen outputs were displayed in chat, copied
unchanged and retain transparent alpha:

- `rainbow-airfield-ruins-v1.png`: eight matching bombed-out buildings and
  separate roof, brick, timber and metal fragments. Ruins keep the intact
  footprint and ground baseline; debris rotates and lands on native terrain.
- `rainbow-sidebar-buttons-v1.png`: eight brass/enamel pause, resume, sound,
  manual, settings, fullscreen and hangar buttons. CSS crops the raw atlas.
- `rainbow-mounted-flags-v1.png`: rooftop pole, angled wall staff and wall
  banner, each in British Union Jack / Imperial German black-white-red colours.

Exact prompts and output hashes/dimensions are in
`web/flight-destruction-v13-prompts.json` and `flight-destruction-v13-files.json`.
Only this project's own building/cockpit images were references. No commercial
game assets or paid-provider API/CLI were used. Original art is distributed
with the GPL-2.0-or-later game. All cropping/animation happens at runtime; the
full generated PNGs are preserved unchanged.

## Three-state architecture (2026-11-05)

Two original built-in OpenAI imagegen outputs were displayed in chat and copied
unchanged with their transparent alpha:

- `rainbow-buildings-damaged-v1.png`: twelve recognizable still-standing
  one-bomb states, with missing roof sections, blasted walls and broken windows.
  These match every architecture/mission combination, including the field
  tent, winter cottage, snowy supply shed and city crane workshop.
- `rainbow-small-building-ruins-v1.png`: four matching fully collapsed final
  states for those smaller targets. The previous eight airfield ruins remain
  in use for the larger architecture.

Exact prompts, own-project image references, dimensions and immutable hashes
are in `web/building-states-v14-prompts.json` and `building-states-v14-files.json`.
Runtime selects intact art above half health, damaged art after one bomb (or
twelve bullets), and final ruins at destruction. All three keep the same
visible width and foundation. Cropping happens at runtime; raw PNGs are retained
unchanged. Original art is distributed with the GPL-2.0-or-later game. No
commercial-game artwork or paid-provider API/CLI workflow was used.

## Chalk lettering, shared classroom and mission station (2026-11-07)

All new images were generated with built-in OpenAI imagegen, shown in chat,
and copied unchanged. Raw PNG dimensions/hashes and exact prompts are in
`web/typography-v15-files.json` and `web/typography-v15-prompts.json`.

- `rainbow-chalk-glyphs-v1.png`: the original dry-chalk capital/punctuation
  atlas plus eight handwritten alternate capitals.
- `rainbow-engraved-glyphs-v1.png`: original antique Roman lettering and
  mechanical-counter figures for brass/enamel plaques and instruments.
- `rainbow-slate-v1.png`: subtle erased slate behind live menu text.
- `rainbow-classroom-v1.png`: one shared physical board, instructor and student
  pilot. Live controls use a projective transform into that board's corners.
- `rainbow-mission-station-v2.png`: the approved hangar console with the small
  fake-sky display behind the simulator seat replaced by timber. The background
  omits its pilot figures so the separate sprites can restore and animate them.
- `rainbow-pilot-selection-v1.png`: rookie and ace, each with three matching
  attention/salute frames; runtime uses raw cell crops, without editing the PNG.

The original concept reference and earlier approved hangar composition are in
`web/art-reference/`. Mission preview JPGs are unchanged local captures of this
project's own coast, winter and storm scenes; the SVG runtime crops their view.

`fonts/patrol/PatrolChalk-Regular.woff2` and `PatrolEngraved-Regular.woff2`
contain alpha-contour outlines traced from the corresponding original PNGs,
including chalk gaps. `scripts/build_patrol_fonts.py` is their editable source
with pinned dependencies; `web/patrol-fonts-v15.json` records derived hashes.
These fonts and original artwork are distributed with the GPL-2.0-or-later game.
No paid provider/API/CLI or third-party commercial-game files were used.

## Climate-specific buried discoveries (2026-11-07)

`rainbow-winter-relics-v1.png` has eight frost-edged discoveries: mammoth tusks,
antlers, quartz, an antique sledge, ancient pine, slate fossils, a cellar arch
and old climbing tools. `rainbow-city-relics-v1.png` has eight buried industrial
ruins: drains, a railway wheel, workshop gears, broken biplane structure, water
pipes, a cellar, iron girder and supply crates. Winter/storm use their own atlas;
coast retains its original fossils. Four-by-two cell crops happen at runtime.

Both original built-in imagegen PNGs were shown in chat and preserved unchanged
with real alpha. This project's own `rainbow-world-details-v1.png` supplied the
style reference. Exact prompts and output hashes are in
`web/wingman-weather-v16-prompts.json` and `wingman-weather-v16-files.json`.
The art is distributed with the GPL-2.0-or-later game; no commercial-game files
or paid-provider API/CLI workflow were used.

Flags now anchor their fixture to measured opaque roof/facade pixels in each
prepared sprite. No extra flag texture was generated. Winter frost and night
lamps are original Canvas layers over the unchanged brass/wood instrument art;
the dial markings, dual altimeter hands and glass remain separate live layers.
The briefing chart is live SVG on a paper-colour face, generated from native
terrain/target records; it is not a replacement gameplay screenshot.

## Bronze honor-board plaques (2026-11-07)

`rainbow-honor-plates-v1.png` is an original transparent 1536×1024 built-in
OpenAI imagegen output, shown in chat and preserved unchanged. The project's
own scoreboard-parts atlas supplied the material/style reference. The new
atlas has no baked lettering: live Patrol Engraved text puts each champion's
initials, score and level on a bronze nameplate over a timber backing.
The currently entered score has a brighter polished plate. The winged bronze
header and alternating aged rows keep all ten records and navigation visible.

Runtime source rectangles `[x,y,width,height]` are regular `[46,110,1444,103]`,
highlight `[46,344,1444,103]`, header `[18,547,1500,190]` and aged
`[46,843,1444,103]`. Canvas crops preserve the raw PNG and its transparency.
Exact prompt and integrity receipt: `web/honor-ui-v17-prompts.json` and
`web/honor-ui-v17-files.json`. These original plaques are distributed with
the GPL-2.0-or-later game. The classroom keeps one shared slate; its Back
control is now separate on the floor, outside the writing surface.

## Settings workshop (2026-11-07)

`rainbow-settings-workshop-v1.png` is an original 1536×1024 built-in imagegen
background, shown in chat and copied unchanged. Its one empty slate occupies
the left side. Real settings controls fit inside that writing area; Back is
below it. A mechanic checks an earpiece beside a timber radio box, tools and
the biplane on the right. The image contains no baked UI text or buttons.
The full prompt and PNG hash/dimensions are in
`web/settings-workshop-v19-prompts.json` and `settings-workshop-v19-files.json`.
No new font or borrowed game art was used. The existing Patrol Chalk and
Patrol Engraved fonts and original button sprites remain live UI layers.

Corresponding sources now have separate code, two balanced raster-art parts
and audio downloads. Extract all four into one directory to restore the
complete tree; every original art PNG remains in the distributed sources.

## Pause shelter and mechanical throttle (2026-11-07)

Both full 1536×1024 built-in imagegen PNGs were shown in chat and copied
unchanged. `rainbow-pause-rest-v1.png` is a sunset airfield rest shelter with
one blank slate on the left and a standing pilot at right. The actual pause
controls are live HTML on that slate, without a second panel covering him.

`rainbow-throttle-lever-v1.png` is a transparent original control-parts atlas.
The brass rail uses `[34,430,1173,266]`; the grip/collar/short-stem crop is
`[1269,216,195,430]` (the longer raw stem remains in the unchanged PNG).
The rail's straight centers stretch while corners/rivets keep uniform scale.
The separate grip travels along it from IDLE to FULL, driven by the existing
16-step native throttle, with no percentage or digital bar. X/Z still control
it. The nearby score/lives pieces move slightly upward to leave a clear lane.
Both pieces and the live engraved labels remain clipped inside the cockpit.

Prompts, dimensions and SHA-256 receipts are in `web/pause-flight-v20-*.json`.
No provider API/CLI, borrowed commercial-game imagery or new external audio
was used. The art is distributed with the GPL-2.0-or-later game.

## Title alternatives (2026-11-08)

Two new full 1536×1024 built-in imagegen PNGs were shown in chat and copied
unchanged. B, `rainbow-splash-airfield-v2.png`, shows a sunny coastal airfield,
the main biplane, friendly wingman, hangar crew, cow and distant ground defenses.
C, `rainbow-splash-campaign-v3.png`, combines coast, winter valley and storm
city, with a following aircraft and distant parachutist. Both have original
sculpted Rainbow Patrol title emblems and quiet lower-right areas for live UI.
`web/splash-v21-prompts.json` retains the exact prompts; `splash-v21-files.json`
records original dimensions, bytes and SHA-256 hashes. No external references,
commercial-game graphics or paid-provider API/CLI were used.

`splash-lab.html` compares A/B/C with menu placement and provides links to
try each artwork in the actual game. The source PNG is never altered to bake
menu text into it. Optional `?splash=airfield` / `?splash=campaign` requests
select only those local images, without storing a preference. The selected
ordinary launch default is now Three Fronts; `?splash=current` still explicitly
shows the original `rainbow-splash-v1.png` for comparison.
The fullscreen utility is next to sound at top-right, outside the four-item
game list; it reuses the existing fullscreen action rather than creating a
second display setting.

## Refueling/loading splash (2026-11-08)

`rainbow-loading-refuel-v1.png` is a full original 1536×1024 built-in imagegen
output, displayed in chat and copied unchanged. A parked coral/cream biplane
is refueled by hand pump while ground crew and a pilot hurry around it. The
propeller is stopped. The dark lower-left supply-chest canvas holds live HTML
startup text and an indeterminate loading bar, without a central dialog or
baked lettering. The image is preloaded from the title page and used during
the real startup interval; no extra game-start delay was introduced.

Prompt, dimensions and original SHA-256 hash are in `web/launch-v22-*.json`.
This is original GPL-2.0-or-later project artwork with no third-party source
images or new audio. The selected Three Fronts title art also appears on the
site's game card; all earlier title PNGs remain unchanged in the sources.

## Escort livery (2026-11-09)

The optional wingman reuses the original friendly aircraft art with a cached,
selective blue-teal paint transform in `rainbow-assets.js`. Warm red painted
areas change color; transparency, cream/metal detail, dimensions and native
collision masks are retained. Player and escort cache identities are separate.
The floating 2 above the escort is removed; cockpit escort status remains.
`tests/wingman-preview.html` shows the two production sprite outputs together.
No source raster is overwritten or newly generated for this palette change.
