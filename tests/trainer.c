/* SPDX-License-Identifier: GPL-2.0-or-later */
/* Exercise the trainer against the real upstream crash and weapon functions. */
#include <SDL.h>
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "sw.h"
#include "swinit.h"
#include "swmain.h"
#include "swmove.h"
#include "swobject.h"
#include "trainer.h"

/* Isolate test preferences from the player's actual native SDL preferences. */
char *Vid_GetPrefPath(void) { return strdup(WEB_TEST_PREF_PATH); }

static void fresh_game(bool trainer)
{
    playmode = PLAYMODE_SINGLE;
    WebTrainer_SetEnabled(trainer);
    swinitlevel();
    WebTrainer_Apply(consoleplayer);
    compplane = false;
    plyrplane = true;
}

static void crash_and_wait(void)
{
    int delay, i;
    crashpln(consoleplayer);
    delay = consoleplayer->ob_hitcount;
    assert(delay >= MAXCRCOUNT);
    WebTrainer_Apply(consoleplayer);
    assert(consoleplayer->ob_state == CRASHED);
    assert(consoleplayer->ob_hitcount == delay);
    for (i = 0; i <= delay && consoleplayer->ob_endsts == PLAYING; ++i) {
        moveplyr(consoleplayer);
        WebTrainer_Apply(consoleplayer);
        if (i < delay) assert(consoleplayer->ob_state == CRASHED);
    }
}

static bool fire_weapon(bool bomb)
{
    OBJECTS *before = objbot;
    if (bomb) initbomb(consoleplayer);
    else initshot(consoleplayer, NULL);
    if (before == objbot) return false;
    assert(objbot->ob_type == (bomb ? BOMB : SHOT));
    deallobj(objbot);
    /* Same deferred-object recycling as the upstream game loop. */
    delbot->ob_next = objfree;
    objfree = deltop;
    deltop = delbot = NULL;
    return true;
}

int main(void)
{
    char *args[] = {"trainer-test", "-s", "-q", NULL};
    int i;
    SDL_SetMainReady();
    SDL_SetHint(SDL_HINT_RENDER_DRIVER, "software");
    SDL_SetHint(SDL_HINT_RENDER_VSYNC, "0");
    swinit(3, args);
    conf_medals = false;

    fresh_game(false);
    for (i = 0; i < MAXCRASH; ++i) crash_and_wait();
    assert(consoleplayer->ob_endsts == LOSER);
    puts("Normal game: fifth crash still ends the game.");

    fresh_game(true);
    for (i = 0; i < MAXCRASH + 3; ++i) {
        crash_and_wait();
        assert(consoleplayer->ob_endsts == PLAYING);
        assert(consoleplayer->ob_state == FLYING);
        assert(consoleplayer->ob_athome);
    }
    puts("Trainer: eight normal crash/respawn cycles survive the five-life limit.");

    fresh_game(false);
    for (i = 0; i < MAXROUNDS; ++i) assert(fire_weapon(false));
    assert(!fire_weapon(false));
    fresh_game(true);
    for (i = 0; i < MAXROUNDS + 20; ++i) {
        WebTrainer_Apply(consoleplayer);
        assert(fire_weapon(false));
    }
    puts("Gun: normal ammunition runs out at 200; trainer fires 220 rounds.");

    fresh_game(false);
    for (i = 0; i < MAXBOMBS; ++i) {
        consoleplayer->ob_bdelay = 0;
        assert(fire_weapon(true));
    }
    consoleplayer->ob_bdelay = 0;
    assert(!fire_weapon(true));
    fresh_game(true);
    for (i = 0; i < MAXBOMBS + 5; ++i) {
        consoleplayer->ob_bdelay = 0;
        WebTrainer_Apply(consoleplayer);
        assert(fire_weapon(true));
        WebTrainer_Apply(consoleplayer);
        assert(consoleplayer->ob_bdelay == 10);
        assert(!fire_weapon(true));
    }
    puts("Bombs: normal supply runs out at five; trainer replenishes with normal cooldown.");

    consoleplayer->ob_life = 1234;
    WebTrainer_Apply(consoleplayer);
    assert(consoleplayer->ob_life == 1234);
    WebTrainer_SetEnabled(false);
    consoleplayer->ob_bdelay = 0;
    assert(fire_weapon(true));
    assert(consoleplayer->ob_bombs == MAXBOMBS - 1);
    assert(fire_weapon(false));
    assert(consoleplayer->ob_rounds == MAXROUNDS - 1);
    WebTrainer_Apply(consoleplayer);
    assert(consoleplayer->ob_bombs == MAXBOMBS - 1);
    consoleplayer->ob_endsts = WINNER;
    WebTrainer_SetEnabled(true);
    consoleplayer->ob_crashcnt = 3;
    WebTrainer_Apply(consoleplayer);
    assert(consoleplayer->ob_endsts == WINNER && consoleplayer->ob_crashcnt == 3);
    puts("Fuel and mission outcomes are unchanged; disabling trainer restores normal resource use.");
    return 0;
}
