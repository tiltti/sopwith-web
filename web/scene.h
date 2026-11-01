/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef WEB_SCENE_H
#define WEB_SCENE_H

/* Read-only scene ABI for the optional Rainbow Patrol renderer. All values
 * are signed 32-bit integers. The game owns symbol memory; callers only read
 * it synchronously between ticks, and must not retain heap views. */
/* Header: version, tick, camera-x, world-width, player-x/y, fuel, ammo,
 * bombs, remaining-lives, score, speed, end-status, player-state, object-count,
 * home-x, returning-home, at-home, level, angle, orientation,
 * rainbow-left-x, rainbow-left-ground-y, rainbow-right-ground-y,
 * ground-height-array-pointer, 3 reserved. Rainbow span is 220 native pixels.
 * Then 320 visible ground heights (native upward Y coordinates).
 * Object record: type, state, world-x/y, angle, orientation, faction, width,
 * height, sprite-byte-pointer, is-player, life, dx/dy, colour, original-orient,
 * object-id, owner-kind (1 player, 2 other plane, 100+target-kind).
 * Sprite bytes index the original 4-colour masks; zero is transparent. */
#define WEB_SCENE_VERSION 3
#define WEB_SCENE_HEADER 28
#define WEB_SCENE_STRIDE 18
#define WEB_SCENE_OBJECTS 256

const int *web_scene(void);

#endif
