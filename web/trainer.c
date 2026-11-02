/*
 * Copyright (C) 2026 Sopwith Web contributors.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
#include "trainer.h"

static bool trainer_enabled;

void WebTrainer_SetEnabled(bool enabled)
{
    trainer_enabled = enabled;
}

bool WebTrainer_IsEnabled(void)
{
    return trainer_enabled;
}

void WebTrainer_Apply(OBJECTS *player_plane)
{
    if (!trainer_enabled || !player_plane || player_plane->ob_endsts != PLAYING) return;

    /* Replenish supplies between game ticks. Leave damage, the crash state,
     * respawn delay, firing rates and mission outcomes to the game. */
    player_plane->ob_rounds = MAXROUNDS;
    player_plane->ob_bombs = MAXBOMBS;
    player_plane->ob_crashcnt = 0;
    /* Falling/crashed planes use ob_life as a timer, and QUIT is a sentinel.
     * Refilling those would change the normal death/exit sequence. */
    if(player_plane->ob_life>QUIT&&(player_plane->ob_state==FLYING
        ||player_plane->ob_state==STALLED||player_plane->ob_state==WOUNDED
        ||player_plane->ob_state==WOUNDSTALL))player_plane->ob_life=MAXFUEL;
}
