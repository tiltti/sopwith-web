/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef SOPWITH_WEB_TRAINER_H
#define SOPWITH_WEB_TRAINER_H

#include "sw.h"

void WebTrainer_SetEnabled(bool enabled);
bool WebTrainer_IsEnabled(void);
void WebTrainer_SetSupplies(bool enabled);
bool WebTrainer_HasSupplies(void);
void WebTrainer_Apply(OBJECTS *player_plane);

#endif
