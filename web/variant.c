/* Rainbow Patrol-only rules and visual events. GPL-2.0-or-later. */
#include <string.h>
#include <stdlib.h>
#include "sw.h"
#include "swmain.h"
#include "swinit.h"
#include "swauto.h"
#include "swobject.h"
#include "swmove.h"
#include "variant.h"

static bool enabled;
static bool easy_mode,player_was_dead;
static int grace_until,fire_count;
static struct {OBJECTS *owner;int tick;} fire_times[128];
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
static bool level_ready;
static OBJECTS *emplacements[24];
static original_ob_t emplacement_origins[24];
static int emplacement_count;
static unsigned char gun_pixels[2][256];
static sopsym_t gun_masks[2];

void WebVariant_SetEnabled(bool value)
{
    enabled = value;level_ready=false;emplacement_count=0;
    easy_mode=false;player_was_dead=false;grace_until=0;fire_count=0;
    last_tick = -1;
    previous_count = 0;
    previous_bomb_count = 0;
    previous_shot_count = bomb_requests = 0;
    memset(effects, 0, sizeof(effects));
    effects[0] = 1;
    effects[3] = WEB_EFFECT_STRIDE;
}

bool WebVariant_IsEnabled(void) { return enabled; }
void WebVariant_SetEasy(bool easy){easy_mode=enabled&&easy;grace_until=countmove+30;fire_count=0;}
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

int WebVariant_ObjectKind(const OBJECTS *ob)
{
    if(enabled)for(int i=0;i<emplacement_count;i++)if(emplacements[i]==ob)return 20;
    return ob->ob_original_ob?ob->ob_original_ob->orient:0;
}
void WebVariant_TargetMask(OBJECTS *ob)
{
    if(!enabled)return;
    int kind=WebVariant_ObjectKind(ob);
    if(kind!=20&&ob->ob_orient!=TARGET_TANK)return;
    if(kind==20)ob->ob_symbol=&gun_masks[ob->ob_state!=STANDING];
    const OBJECTS *aim=ob->ob_firing;
    if(!aim&&consoleplayer&&consoleplayer->ob_faction!=ob->ob_faction)aim=consoleplayer;
    if(aim)ob->ob_angle=aim->ob_x<ob->ob_x?8:0;
}
void WebVariant_InitShot(OBJECTS *owner,OBJECTS *target)
{
    /* Buildings are scenery/targets. Their separate ground emplacements
     * own the defensive guns; only tanks and emplacements fire. */
    if(enabled&&owner->ob_type==TARGET&&owner->ob_orient!=TARGET_TANK&&WebVariant_ObjectKind(owner)!=20)return;
    int slot=-1;
    if(easy_mode&&consoleplayer&&owner->ob_faction!=consoleplayer->ob_faction
        &&(owner->ob_type==PLANE||owner->ob_type==TARGET)){
        if(countmove<grace_until)return;
        int reach=owner->ob_type==PLANE?96:80,interval=owner->ob_type==PLANE?4:6;
        if(range(owner->ob_x,owner->ob_y,consoleplayer->ob_x,consoleplayer->ob_y)>reach*reach)return;
        for(int i=0;i<fire_count;i++)if(fire_times[i].owner==owner){slot=i;break;}
        if(slot>=0&&countmove-fire_times[slot].tick<interval)return;
        if(slot<0&&fire_count<128){slot=fire_count++;fire_times[slot].owner=owner;fire_times[slot].tick=-1000000;}
    }
    OBJECTS *before=objbot;
    initshot(owner,target);
    if(slot>=0&&objbot!=before)fire_times[slot].tick=countmove;
}
static bool emplacement_clear(int x)
{
    if(x<30||x+16>=(int)currgame->gm_max_x-30)return false;
    for(OBJECTS *ob=objtop;ob;ob=ob->ob_next){
        if(ob->ob_type==PLANE&&ob->ob_original_ob&&abs(x-ob->ob_original_ob->x)<85)return false;
        if((ob->ob_type==TARGET||ob->ob_type==OX)&&ob->ob_symbol&&x<ob->ob_x+ob->ob_symbol->w+8&&x+24>ob->ob_x)return false;
    }
    return true;
}
static void add_emplacement(int x,faction_t faction)
{
    if(emplacement_count>=24||!emplacement_clear(x))return;
    int base=0;
    for(int n=x;n<x+16;n++)base=imax(base,ground[n]);
    if(base+16>MAX_Y-32)return;
    int i=emplacement_count++;
    emplacement_origins[i]=(original_ob_t){.type=TARGET,.x=x,.orient=TARGET_CUSTOM1,.faction=faction};
    OBJECTS *ob=allocobj(),*previous=ob->ob_prev;
    memset(ob,0,sizeof(*ob));ob->ob_prev=previous;
    ob->ob_type=TARGET;ob->ob_state=STANDING;ob->ob_orient=TARGET_CUSTOM1;
    ob->ob_x=x;ob->ob_y=base+16;ob->ob_original_ob=&emplacement_origins[i];
    ob->ob_faction=faction;ob->ob_clr=faction;ob->ob_movef=movetarg;ob->ob_onmap=ob->ob_drwflg=true;
    emplacements[i]=ob;WebVariant_TargetMask(ob);insertx(ob,&topobj);++numtarg[faction];
}
static void lower_end_buildings(void)
{
    const int reach=128,roof=MAX_Y-32,width=currgame->gm_max_x;
    /* Leave the outer map walls and central airfields alone. Lower the highest
     * end targets with their hillside, keeping a smooth transition into
     * the source landscape instead of burying/moving only the artwork. */
    for(OBJECTS *ob=objtop;ob;ob=ob->ob_next){
        if(ob->ob_type!=TARGET||!ob->ob_symbol||(ob->ob_x>=width/6&&ob->ob_x<width*5/6)
            ||ob->ob_orient==TARGET_TANK||ob->ob_orient==TARGET_TRUCK
            ||ob->ob_orient==TARGET_TANKER_TRUCK||ob->ob_orient==TARGET_FLAG)continue;
        int base=0;
        for(int x=ob->ob_x;x<ob->ob_x+ob->ob_symbol->w;x++)base=imax(base,currgame->gm_ground[x]);
        int drop=base+ob->ob_symbol->h-roof;if(drop<=0)continue;
        int left=ob->ob_x-8,right=ob->ob_x+ob->ob_symbol->w+8;
        for(int x=imax(1,left-reach);x<imin(width-1,right+reach);x++){
            int distance=x<left?left-x:x>right?x-right:0,t=reach-distance;
            int offset=(drop*t*t*(3*reach-2*t)+reach*reach*reach/2)/(reach*reach*reach);
            ground[x]=imin(ground[x],imax(0,(int)currgame->gm_ground[x]-offset));
        }
    }
}
static void setup_level(void)
{
    level_ready=true;emplacement_count=0;
    grace_until=countmove+30;fire_count=0;player_was_dead=false;
    /* Restore the continuous source landscape. The upstream initializer
     * flattens each target's footprint with abrupt vertical joins. */
    memcpy(ground,currgame->gm_ground,sizeof(*ground)*currgame->gm_max_x);
    lower_end_buildings();
    for(int state=0;state<2;state++){
        memset(gun_pixels[state],0,256);
        for(int y=state?11:3;y<16;y++)for(int x=1;x<15;x++)
            if(y>12||(!state&&((x>6&&x<10)||(y>8&&((x>1&&x<5)||(x>11&&x<15))))))gun_pixels[state][y*16+x]=1;
        gun_masks[state].w=gun_masks[state].h=16;gun_masks[state].data=gun_pixels[state];
    }
    OBJECTS *hosts[64];int host_count=0;
    for(OBJECTS *ob=objtop;ob;ob=ob->ob_next){
        if(ob->ob_type==TARGET&&ob->ob_symbol){
            int base=0;
            if(ob->ob_orient==TARGET_TANK||ob->ob_orient==TARGET_TRUCK||ob->ob_orient==TARGET_TANKER_TRUCK)base=ground[ob->ob_x+ob->ob_symbol->w/2];
            else for(int x=ob->ob_x;x<ob->ob_x+ob->ob_symbol->w;x++)base=imax(base,ground[x]);
            ob->ob_y=base+ob->ob_symbol->h;
            if(host_count<64&&(ob->ob_orient==TARGET_HANGAR||ob->ob_orient==TARGET_FACTORY||ob->ob_orient==TARGET_OIL_TANK))hosts[host_count++]=ob;
        }else if(ob->ob_type==OX)ob->ob_y=ground[ob->ob_x+8]+16;
    }
    for(int i=0;i<host_count;i++){
        int x=hosts[i]->ob_x+(i%2?-32:34);
        if(!emplacement_clear(x))x=hosts[i]->ob_x+(i%2?34:-32);
        add_emplacement(x,hosts[i]->ob_faction==FACTION_NONE?FACTION_PLAYER2:hosts[i]->ob_faction);
    }
    /* Additional hill defenses have their own collision masks and target
     * counts. Avoid every runway and all existing scenery. */
    for(int x=100;x<(int)currgame->gm_max_x-100&&emplacement_count<20;x+=130){
        int slope=abs((int)ground[x+15]-(int)ground[x]);if(slope>=3&&slope<=16)add_emplacement(x,FACTION_PLAYER2);
    }
}

void WebVariant_CowMask(OBJECTS *cow)
{
    static unsigned char pixels[2][8][256];
    static sopsym_t masks[2][8];
    static bool ready[2][8];
    if(!enabled||!cow||cow->ob_type!=OX||!cow->ob_symbol||!cow->ob_original_ob)return;
    int state=cow->ob_state!=STANDING,transform=cow->ob_original_ob->transform;
    if(transform<0||transform>=8)return;
    sopsym_t *source=cow->ob_symbol;
    if(source==&masks[state][transform])return;
    if(!ready[state][transform]){
        int left=source->w,top=source->h,right=0,bottom=0;
        for(int y=0;y<source->h;y++)for(int x=0;x<source->w;x++)if(source->data[y*source->w+x]){
            left=imin(left,x);right=imax(right,x+1);top=imin(top,y);bottom=imax(bottom,y+1);
        }
        if(right<=left||bottom<=top)return;
        for(int y=0;y<7;y++)for(int x=0;x<9;x++){
            int sx=left+(2*x+1)*(right-left)/18,sy=top+(2*y+1)*(bottom-top)/14;
            pixels[state][transform][(9+y)*16+4+x]=source->data[sy*source->w+sx];
        }
        masks[state][transform].w=masks[state][transform].h=16;
        masks[state][transform].data=pixels[state][transform];ready[state][transform]=true;
    }
    cow->ob_symbol=&masks[state][transform];
}

void WebVariant_Apply(OBJECTS *player)
{
    if (!enabled || !player || playmode == PLAYMODE_UNSET) return;
    /* Native initbomb leaves a 9-tick delay after the launching tick. A cap
     * of one remaining tick gives this edition a two-tick / 200 ms interval.
     * Ammo, launch velocity, collision and enemy cooldown remain native. */
    if (player->ob_endsts == PLAYING && player->ob_bdelay > 1) player->ob_bdelay = 1;
    if (countmove == last_tick) return;
    if (countmove < last_tick){previous_count = previous_bomb_count = previous_shot_count = bomb_requests = 0;level_ready=false;}
    if(!level_ready)setup_level();
    bool alive=player->ob_state==FLYING||player->ob_state==STALLED||player->ob_state==WOUNDED||player->ob_state==WOUNDSTALL;
    if(alive&&player_was_dead)grace_until=countmove+30;
    player_was_dead=!alive;
    last_tick = countmove;
    OBJECTS *current[512], *owners[128], *bombs[256], *shots[512];
    int current_count = 0, owner_count = 0, bomb_count = 0, shot_count = 0, shot_life[512];
    for (OBJECTS *ob = objtop; ob; ob = ob->ob_next) {
        if(ob->ob_type==OX)WebVariant_CowMask(ob);
        if (ob->ob_type == SHOT && ob->ob_owner && ob->ob_owner->ob_type == TARGET) {
            bool known = false;
            for (int i=0;i<previous_shot_count;++i) if(previous_shots[i]==ob&&ob->ob_life<=previous_shot_life[i]){known=true;break;}
            if (!known) {
                OBJECTS *owner=ob->ob_owner;
                int direction=ob->ob_dx<0?-1:1;
                ob->ob_x=owner->ob_x+owner->ob_symbol->w/2+direction*(owner->ob_orient==TARGET_TANK?8:5);
                ob->ob_y=owner->ob_orient==TARGET_TANK?owner->ob_y-owner->ob_symbol->h/3:owner->ob_y-5;
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
        bool feathers = (ob->ob_type == BIRD && ob->ob_life == -1)
            || (ob->ob_type == FLOCK && ob->ob_life == -1 && ob->ob_state == FINISHED);
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
        if (feathers) { emit(2, ob, ob->ob_type==FLOCK?6:1); continue; }
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
