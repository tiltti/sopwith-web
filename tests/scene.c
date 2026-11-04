/* SPDX-License-Identifier: GPL-2.0-or-later */
#include <assert.h>
#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include "sw.h"
#include "swmain.h"
#include "scene.h"

const GAMES *currgame;
GRNDTYPE *ground;
OBJECTS *consoleplayer, *objtop;
int countmove, displx, maxcrash, gamenum, endcount;
playmode_t playmode;

bool WebVariant_IsEnabled(void){return false;}
int WebVariant_Speed(void){return 0;}
int WebVariant_Throttle(void){return 0;}
int WebVariant_TargetHealth(const OBJECTS *ob){(void)ob;return 0;}
int WebVariant_ObjectKind(const OBJECTS *ob){return ob->ob_original_ob?ob->ob_original_ob->orient:0;}

int main(void)
{
    const int *s = web_scene();
    assert(s[0] == WEB_SCENE_VERSION && s[3] == 0);
    GRNDTYPE terrain[640];
    for (int i = 0; i < 640; ++i) terrain[i] = i % 190;
    GAMES game = {.gm_max_x=640};
    unsigned char mask[] = {0, 1, 2, 3};
    sopsym_t symbol = {.data=mask, .w=2, .h=2};
    original_ob_t original = {.x=70, .orient=3};
    OBJECTS enemy = {.ob_type=TARGET, .ob_x=500, .ob_y=50, .ob_symbol=&symbol,
                     .ob_drwflg=true, .ob_original_ob=&original};
    OBJECTS player = {.ob_type=PLANE, .ob_state=FLYING, .ob_x=160, .ob_y=100,
                      .ob_life=8700, .ob_rounds=199, .ob_bombs=4, .ob_crashcnt=2,
                      .ob_faction=FACTION_PLAYER1, .ob_symbol=&symbol,
                      .ob_drwflg=true, .ob_original_ob=&original, .ob_next=&enemy};
    enemy.ob_owner=&player;
    OBJECTS before_player=player, before_enemy=enemy;
    currgame=&game; ground=terrain; consoleplayer=objtop=&player;
    playmode=PLAYMODE_SINGLE; countmove=123; displx=8; maxcrash=5;endcount=72;
    s=web_scene();
    assert(s[1]==123 && s[2]==8 && s[3]==640);
    assert(s[4]==160 && s[5]==100 && s[6]==8700 && s[7]==199 && s[8]==4);
    assert(s[9]==3 && s[14]==2 && s[15]==70);
    assert(s[25]==72);
    assert(s[21]==0 && s[22]==(int)terrain[0] && s[23]==(int)terrain[220]);
    assert(s[WEB_SCENE_HEADER]==8 && s[WEB_SCENE_HEADER+319]==327%190);
    const int *r=s+WEB_SCENE_HEADER+320;
    assert(r[0]==PLANE && r[2]==160 && r[3]==100 && r[6]==FACTION_PLAYER1);
    assert(r[7]==2 && r[8]==2 && r[10]==1);
    assert(r[16]==(int)(uintptr_t)&player);
    r+=WEB_SCENE_STRIDE;
    assert(r[0]==TARGET && r[2]==500 && r[10]==0 && r[15]==3);
    assert(r[16]==(int)(uintptr_t)&enemy&&r[17]==1);
    assert(memcmp(&player,&before_player,sizeof(player))==0);
    assert(memcmp(&enemy,&before_enemy,sizeof(enemy))==0);
    assert(terrain[8]==8 && mask[2]==2);
    /* Uninstantiated symbols are skipped and edge terrain reads are clamped. */
    enemy.ob_symbol=NULL; displx=639;
    s=web_scene(); assert(s[14]==1 && s[WEB_SCENE_HEADER+319]==639%190);
    playmode=PLAYMODE_UNSET;
    s=web_scene(); assert(s[3]==0 && s[14]==0);
    puts("Scene ABI: terrain, player/resources, distant objects, bounds and read-only game state verified.");
    return 0;
}
