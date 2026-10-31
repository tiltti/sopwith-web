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
     * respawn delay, fuel, firing rates and mission outcomes to the game. */
    player_plane->ob_rounds = MAXROUNDS;
    player_plane->ob_bombs = MAXBOMBS;
    player_plane->ob_crashcnt = 0;
}
