/* Rainbow Patrol-only rules and visual events. GPL-2.0-or-later. */
#include <string.h>
#include <stdlib.h>
#include "sw.h"
#include "swmain.h"
#include "swinit.h"
#include "swauto.h"
#include "swobject.h"
#include "variant.h"

static bool enabled;
static int last_tick = -1;
static int effects[WEB_EFFECT_HEADER + WEB_EFFECT_CAPACITY * WEB_EFFECT_STRIDE] = {1,0,0,WEB_EFFECT_STRIDE};
static OBJECTS *previous[512];
static int previous_count;
static OBJECTS *previous_bombs[256];
static int previous_bomb_count;
static int bomb_requests;
static OBJECTS *previous_shots[512];
static int previous_shot_life[512];
static int previous_shot_count;

void WebVariant_SetEnabled(bool value)
{
    enabled = value;
    last_tick = -1;
    previous_count = 0;
    previous_bomb_count = 0;
    previous_shot_count = bomb_requests = 0;
    memset(effects, 0, sizeof(effects));
    effects[0] = 1;
    effects[3] = WEB_EFFECT_STRIDE;
}

bool WebVariant_IsEnabled(void) { return enabled; }
const int *WebVariant_Effects(void) { return effects; }
void WebVariant_BombRelease(bool release)
{
    if (!release) bomb_requests = 0;
    else if (enabled && bomb_requests < MAXBOMBS) ++bomb_requests;
}
int WebVariant_GoHome(OBJECTS *ob)
{
    /* The native pilot checks HOME before movement, but collision checks
     * happen after movement. Capture one flight step earlier so a final
     * descent cannot hit the runway before next tick's landing handoff. */
    if(enabled && ob==consoleplayer && !ob->ob_athome
        && (ob->ob_state==FLYING||ob->ob_state==WOUNDED)
        && abs(ob->ob_x-ob->ob_original_ob->x)<HOME+gmaxspeed+4
        && abs(ob->ob_y-ob->ob_orig_y)<HOME+gmaxspeed+6) {
        initplyr(ob,ob->ob_original_ob);initdisp(true);return 0;
    }
    return gohome(ob);
}

static void emit(int type, OBJECTS *ob, int size)
{
    int id = ++effects[1];
    int *r = effects + WEB_EFFECT_HEADER + ((id - 1) % WEB_EFFECT_CAPACITY) * WEB_EFFECT_STRIDE;
    if (effects[2] < WEB_EFFECT_CAPACITY) ++effects[2];
    r[0] = id; r[1] = countmove; r[2] = type;
    r[3] = ob->ob_x + (ob->ob_symbol ? ob->ob_symbol->w / 2 : 0);
    r[4] = ob->ob_y - (ob->ob_symbol ? ob->ob_symbol->h / 2 : 0);
    r[5] = size;
}

void WebVariant_ShellImpact(OBJECTS *ob)
{
    if (!enabled || !ob || ob->ob_type != SHOT || !ob->ob_owner
        || ob->ob_owner->ob_type != TARGET || ob->ob_owner->ob_orient != TARGET_TANK
        || !currgame || ob->ob_x < 0 || ob->ob_x >= (int)currgame->gm_max_x
        || ob->ob_y >= MAX_Y) return;
    emit(1, ob, 1);
}

void WebVariant_Apply(OBJECTS *player)
{
    if (!enabled || !player || playmode == PLAYMODE_UNSET) return;
    /* Native initbomb leaves a 9-tick delay after the launching tick. A cap
     * of one remaining tick gives this edition a two-tick / 200 ms interval.
     * Ammo, launch velocity, collision and enemy cooldown remain native. */
    if (player->ob_endsts == PLAYING && player->ob_bdelay > 1) player->ob_bdelay = 1;
    if (countmove == last_tick) return;
    if (countmove < last_tick) previous_count = previous_bomb_count = previous_shot_count = bomb_requests = 0;
    last_tick = countmove;
    OBJECTS *current[512], *owners[128], *bombs[256], *shots[512];
    int current_count = 0, owner_count = 0, bomb_count = 0, shot_count = 0, shot_life[512];
    for (OBJECTS *ob = objtop; ob; ob = ob->ob_next) {
        if (ob->ob_type == SHOT && ob->ob_owner && ob->ob_owner->ob_type == TARGET) {
            bool known = false;
            for (int i=0;i<previous_shot_count;++i) if(previous_shots[i]==ob&&ob->ob_life<=previous_shot_life[i]){known=true;break;}
            if (!known) {
                OBJECTS *owner=ob->ob_owner;
                int direction=ob->ob_dx<0?-1:1;
                ob->ob_x=owner->ob_x+owner->ob_symbol->w/2+direction*(owner->ob_orient==TARGET_TANK?8:5);
                ob->ob_y=owner->ob_orient==TARGET_TANK?owner->ob_y-owner->ob_symbol->h/3:owner->ob_y+2;
                insertx(ob, deletex(ob));
                emit(5, ob, direction*(owner->ob_orient+1));
                if(ob->ob_owner->ob_orient==TARGET_TANK) {
                    ob->ob_dy += 3;
                    ob->ob_life = 28;
                }
            }
            if (ob->ob_owner->ob_orient==TARGET_TANK && !(countmove%2)) --ob->ob_dy;
            if(shot_count<512){shots[shot_count]=ob;shot_life[shot_count++]=ob->ob_life;}
        }
        if(ob->ob_type == BOMB && ob->ob_owner == player && ob->ob_life >= 0) {
            bool known = false;
            for(int i=0;i<previous_bomb_count;++i)if(previous_bombs[i]==ob){known=true;break;}
            /* Separate a rapid salvo vertically instead of letting freshly
             * dropped bombs overlap and collide with one another. */
            if(!known)ob->ob_dy -= 4;
            if(bomb_count<256)bombs[bomb_count++]=ob;
        }
        bool explosion = ob->ob_type == EXPLOSION;
        bool feathers = ob->ob_type == BIRD && ob->ob_life == -1;
        bool cow = ob->ob_type == OX && ob->ob_state != STANDING;
        bool destroyed = (ob->ob_type == TARGET && ob->ob_state != STANDING && ob->ob_state != REBUILDING)
            || (ob->ob_type == PLANE && ob != player && ob->ob_faction != player->ob_faction
                && (ob->ob_state == FALLING || ob->ob_state == CRASHED))
            || (ob->ob_type == BALLOON && ob->ob_faction != player->ob_faction && ob->ob_state == FINISHED);
        bool impact = (ob->ob_type == BOMB || ob->ob_type == MISSILE) && ob->ob_life < 0;
        if (!explosion && !feathers && !cow && !destroyed && !impact) continue;
        bool seen = false;
        for (int i = 0; i < previous_count; ++i) if (previous[i] == ob) { seen = true; break; }
        if (current_count < 512) current[current_count++] = ob;
        if (seen) continue;
        if (feathers) { emit(2, ob, 1); continue; }
        if (cow) { emit(3, ob, 1); continue; }
        if (destroyed) { emit(6, ob, ob->ob_faction==player->ob_faction?-1:ob->ob_type==TARGET?ob->ob_orient+1:20+ob->ob_type); continue; }
        OBJECTS *owner = impact ? ob : ob->ob_owner;
        if (!owner) continue;
        bool grouped = false;
        for (int i = 0; i < owner_count; ++i) if (owners[i] == owner) { grouped = true; break; }
        if (grouped) continue;
        if (owner_count < 128) owners[owner_count++] = owner;
        emit(1, owner, owner->ob_type == TARGET ? 3 : owner->ob_type == PLANE ? 2 : 1);
    }
    memcpy(previous, current, current_count * sizeof(*current));
    previous_count = current_count;
    memcpy(previous_bombs,bombs,bomb_count*sizeof(*bombs));
    previous_bomb_count=bomb_count;
    memcpy(previous_shots,shots,shot_count*sizeof(*shots));
    memcpy(previous_shot_life,shot_life,shot_count*sizeof(*shot_life));
    previous_shot_count=shot_count;
    if (player->ob_endsts != PLAYING || !player->ob_bombs || player->ob_athome
        || (player->ob_state != FLYING && player->ob_state != WOUNDED && player->ob_state != STALLED && player->ob_state != WOUNDSTALL)) {
        bomb_requests=0;
    } else if (bomb_requests && !player->ob_bdelay) {
        OBJECTS *before=objbot;
        initbomb(player);
        --bomb_requests;
        if(objbot!=before)emit(4,objbot,1);
    }
}
