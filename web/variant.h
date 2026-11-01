/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef WEB_VARIANT_H
#define WEB_VARIANT_H
#include "sw.h"

#define WEB_EFFECT_CAPACITY 32
#define WEB_EFFECT_STRIDE 6
#define WEB_EFFECT_HEADER 4

void WebVariant_SetEnabled(bool enabled);
bool WebVariant_IsEnabled(void);
void WebVariant_Apply(OBJECTS *player);
void WebVariant_BombRelease(bool release);
int WebVariant_GoHome(OBJECTS *player);
int WebVariant_ObjectKind(const OBJECTS *ob);
void WebVariant_InitShot(OBJECTS *owner,OBJECTS *target);
void WebVariant_TargetMask(OBJECTS *target);
void WebVariant_CowMask(OBJECTS *cow);
void WebVariant_ShellImpact(OBJECTS *shot);
/* [version, newest-id, count, stride], then ring records:
 * Types: 1 blast, 2 feathers, 3 cow down, 4 bomb released,
 * 5 ground cannon fired (size = signed target-kind+1, sign is direction),
 * 6 target destroyed (size < 0 means friendly). */
const int *WebVariant_Effects(void);
#endif
