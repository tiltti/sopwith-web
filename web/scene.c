/*
 * Read-only scene adapter for Sopwith: Rainbow Patrol.
 * Copyright (C) 2026 Sopwith Web contributors. GPL-2.0-or-later.
 * No upstream game state, sprite masks or collision rules are changed.
 */
#include <stdint.h>
#include <string.h>
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif
#include "sw.h"
#include "swmain.h"
#include "swinit.h"
#include "scene.h"
#include "variant.h"

static int scene[WEB_SCENE_HEADER + SCR_WDTH + WEB_SCENE_OBJECTS * WEB_SCENE_STRIDE];

EMSCRIPTEN_KEEPALIVE const int *web_scene(void)
{
    OBJECTS *ob;
    int n = 0;
    memset(scene, 0, sizeof(scene));
    scene[0] = WEB_SCENE_VERSION;
    scene[1] = countmove;
    scene[2] = displx;
    if (!currgame || !ground || !consoleplayer || playmode == PLAYMODE_UNSET) return scene;
    scene[3] = currgame->gm_max_x;
    scene[4] = consoleplayer->ob_x;
    scene[5] = consoleplayer->ob_y;
    scene[6] = consoleplayer->ob_life;
    scene[7] = consoleplayer->ob_rounds;
    scene[8] = consoleplayer->ob_bombs;
    scene[9] = clamp_min(0, maxcrash - consoleplayer->ob_crashcnt);
    scene[10] = consoleplayer->ob_score.score;
    scene[11] = consoleplayer->ob_speed;
    scene[12] = consoleplayer->ob_endsts;
    scene[13] = consoleplayer->ob_state;
    scene[15] = consoleplayer->ob_original_ob ? consoleplayer->ob_original_ob->x : consoleplayer->ob_x;
    scene[16] = consoleplayer->ob_home;
    scene[17] = consoleplayer->ob_athome;
    scene[18] = gamenum;
    scene[19] = consoleplayer->ob_angle;
    scene[20] = consoleplayer->ob_orient;
    scene[21] = clamp_range(0, scene[15] - 110, (int)currgame->gm_max_x - 221);
    scene[22] = ground[scene[21]];
    scene[23] = ground[scene[21] + clamp_max(220, (int)currgame->gm_max_x - 1)];
    scene[24] = (int)(uintptr_t)ground;
    for (int x = 0; x < SCR_WDTH; ++x) {
        int wx = clamp_range(0, displx + x, (int)currgame->gm_max_x - 1);
        scene[WEB_SCENE_HEADER + x] = ground[wx];
    }
    for (ob = objtop; ob && n < WEB_SCENE_OBJECTS; ob = ob->ob_next) {
        if (!ob->ob_drwflg || !ob->ob_symbol || !ob->ob_symbol->data) continue;
        /* Include distant planes/targets for the navigation strip as well. */
        int *r = &scene[WEB_SCENE_HEADER + SCR_WDTH + n * WEB_SCENE_STRIDE];
        r[0] = ob->ob_type; r[1] = ob->ob_state;
        r[2] = ob->ob_x; r[3] = ob->ob_y;
        r[4] = ob->ob_angle; r[5] = ob->ob_orient;
        r[6] = ob->ob_faction;
        r[7] = ob->ob_symbol->w; r[8] = ob->ob_symbol->h;
        r[9] = (int)(uintptr_t)ob->ob_symbol->data;
        r[10] = ob == consoleplayer;
        r[11] = ob->ob_life;
        r[12] = ob->ob_dx; r[13] = ob->ob_dy;
        r[14] = ob->ob_clr;
        r[15] = WebVariant_ObjectKind(ob);
        r[16] = (int)(uintptr_t)ob;
        r[17] = ob->ob_owner == consoleplayer ? 1 : !ob->ob_owner ? 0
            : ob->ob_owner->ob_type == TARGET ? 100 + ob->ob_owner->ob_orient
            : ob->ob_owner->ob_type == PLANE ? 2 : 0;
        ++n;
    }
    scene[14] = n;
    return scene;
}
