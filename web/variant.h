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
/* [version, newest-id, count, stride], then ring records:
 * [id, native-tick, type (1 blast / 2 feathers), world-x, world-y, size]. */
const int *WebVariant_Effects(void);
#endif
