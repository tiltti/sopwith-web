/* Rainbow Patrol-only rules and visual events. GPL-2.0-or-later. */
#include <string.h>
#include "sw.h"
#include "swmain.h"
#include "variant.h"

static bool enabled;
static int last_tick = -1;
static int effects[WEB_EFFECT_HEADER + WEB_EFFECT_CAPACITY * WEB_EFFECT_STRIDE] = {1,0,0,WEB_EFFECT_STRIDE};
static OBJECTS *previous[512];
static int previous_count;
static OBJECTS *previous_bombs[256];
static int previous_bomb_count;

void WebVariant_SetEnabled(bool value)
{
    enabled = value;
    last_tick = -1;
    previous_count = 0;
    previous_bomb_count = 0;
    memset(effects, 0, sizeof(effects));
    effects[0] = 1;
    effects[3] = WEB_EFFECT_STRIDE;
}

bool WebVariant_IsEnabled(void) { return enabled; }
const int *WebVariant_Effects(void) { return effects; }

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

void WebVariant_Apply(OBJECTS *player)
{
    if (!enabled || !player || playmode == PLAYMODE_UNSET) return;
    /* Native initbomb leaves a 9-tick delay after the launching tick. A cap
     * of one remaining tick gives this edition a two-tick / 200 ms interval.
     * Ammo, launch velocity, collision and enemy cooldown remain native. */
    if (player->ob_endsts == PLAYING && player->ob_bdelay > 1) player->ob_bdelay = 1;
    if (countmove == last_tick) return;
    if (countmove < last_tick) previous_count = previous_bomb_count = 0;
    last_tick = countmove;
    OBJECTS *current[512], *owners[128], *bombs[256];
    int current_count = 0, owner_count = 0, bomb_count = 0;
    for (OBJECTS *ob = objtop; ob; ob = ob->ob_next) {
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
        if (!explosion && !feathers) continue;
        bool seen = false;
        for (int i = 0; i < previous_count; ++i) if (previous[i] == ob) { seen = true; break; }
        if (current_count < 512) current[current_count++] = ob;
        if (seen) continue;
        if (feathers) { emit(2, ob, 1); continue; }
        OBJECTS *owner = ob->ob_owner;
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
}
