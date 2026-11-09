/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef WEB_VARIANT_H
#define WEB_VARIANT_H
#include "sw.h"

#define WEB_EFFECT_CAPACITY 32
#define WEB_EFFECT_STRIDE 6
#define WEB_EFFECT_HEADER 4

void WebVariant_SetEnabled(bool enabled);
bool WebVariant_IsEnabled(void);
void WebVariant_SetEasy(bool easy);
void WebVariant_Apply(OBJECTS *player);
void WebVariant_BombRelease(bool release);
int WebVariant_GoHome(OBJECTS *player);
void WebVariant_Auto(OBJECTS *plane);
int WebVariant_Aim(OBJECTS *plane,int x,int y,OBJECTS *target,bool longway);
int WebVariant_ObjectKind(const OBJECTS *ob);
void WebVariant_InitShot(OBJECTS *owner,OBJECTS *target);
void WebVariant_InitBomb(OBJECTS *owner);
void WebVariant_TargetMask(OBJECTS *target);
void WebVariant_CowMask(OBJECTS *cow);
bool WebVariant_GroundFire(void);
void WebVariant_Crater(int left,const GRNDTYPE before[8]);
void WebVariant_ResetFlight(void);
/* Optional Rainbow escort; 0 off, 1 parked, 2 launch, 3 follow,
 * 4 engage, 5 return, 6 lost. No second human player is registered. */
void WebWingman_Configure(bool enabled);
void WebWingman_ResetLevel(void);
void WebWingman_Apply(OBJECTS *player);
bool WebWingman_Is(const OBJECTS *ob);
int WebWingman_Status(void);
int WebVariant_Throttle(void);
void WebVariant_SetThrottle(int setting);
int WebVariant_Speed(void);
int WebVariant_SpeedMilli(void);
bool WebVariant_IsTaxiing(void);
bool WebVariant_IsTurning(void);
void WebVariant_ProtectSpawn(OBJECTS *plane);
int WebVariant_SpawnProtection(void);
bool WebVariant_TargetSurvives(OBJECTS *target,OBJECTS *weapon);
int WebVariant_TargetHealth(const OBJECTS *target);
void WebVariant_Test(int action);
void WebVariant_Restart(void);
bool WebVariant_CanCollide(const OBJECTS *a,const OBJECTS *b);
void WebVariant_PilotHit(OBJECTS *pilot,OBJECTS *weapon);
void WebVariant_Eject(OBJECTS *plane);
void WebVariant_ShellImpact(OBJECTS *shot);
/* [version, newest-id, count, stride], then ring records:
 * Types: 1 blast, 2 feathers, 3 cow down, 4 bomb released,
 * 5 ground cannon fired (size = signed target-kind+1, sign is direction),
 * 6 target destroyed (size < 0 means friendly),
 * 7 friendly/8 enemy pilot hit (size = player score delta),
 * 9 building hit / 10 architecture debris (size = native building width). */
const int *WebVariant_Effects(void);
#endif
