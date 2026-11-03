/* SPDX-License-Identifier: GPL-2.0-or-later */
/* Exercise the trainer against the real upstream crash and weapon functions. */
#include <SDL.h>
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "sw.h"
#include "swinit.h"
#include "swmain.h"
#include "swmove.h"
#include "swobject.h"
#include "swcollsn.h"
#include "trainer.h"
#include "variant.h"

/* Isolate test preferences from the player's actual native SDL preferences. */
char *Vid_GetPrefPath(void) { return strdup(WEB_TEST_PREF_PATH); }

static void fresh_game(bool trainer)
{
    playmode = PLAYMODE_SINGLE;
    WebVariant_SetEnabled(false);
    WebTrainer_SetEnabled(trainer);
    swinitlevel();
    WebTrainer_Apply(consoleplayer);
    compplane = false;
    plyrplane = true;
}

static void crash_and_wait(void)
{
    int delay, i;
    crashpln(consoleplayer);
    delay = consoleplayer->ob_hitcount;
    assert(delay >= MAXCRCOUNT);
    WebTrainer_Apply(consoleplayer);
    assert(consoleplayer->ob_state == CRASHED);
    assert(consoleplayer->ob_hitcount == delay);
    for (i = 0; i <= delay && consoleplayer->ob_endsts == PLAYING; ++i) {
        moveplyr(consoleplayer);
        WebTrainer_Apply(consoleplayer);
        if (i < delay) assert(consoleplayer->ob_state == CRASHED);
    }
}

static bool fire_weapon(bool bomb)
{
    OBJECTS *before = objbot;
    if (bomb) initbomb(consoleplayer);
    else initshot(consoleplayer, NULL);
    if (before == objbot) return false;
    assert(objbot->ob_type == (bomb ? BOMB : SHOT));
    deallobj(objbot);
    /* Same deferred-object recycling as the upstream game loop. */
    delbot->ob_next = objfree;
    objfree = deltop;
    deltop = delbot = NULL;
    return true;
}

int main(void)
{
    char *args[] = {"trainer-test", "-s", "-q", NULL};
    int i;
    SDL_SetMainReady();
    SDL_SetHint(SDL_HINT_RENDER_DRIVER, "software");
    SDL_SetHint(SDL_HINT_RENDER_VSYNC, "0");
    swinit(3, args);
    conf_medals = false;

    fresh_game(false);
    for (i = 0; i < MAXCRASH; ++i) crash_and_wait();
    assert(consoleplayer->ob_endsts == LOSER);
    puts("Normal game: fifth crash still ends the game.");

    fresh_game(true);
    for (i = 0; i < MAXCRASH + 3; ++i) {
        crash_and_wait();
        assert(consoleplayer->ob_endsts == PLAYING);
        assert(consoleplayer->ob_state == FLYING);
        assert(consoleplayer->ob_athome);
    }
    puts("Trainer: eight normal crash/respawn cycles survive the five-life limit.");

    fresh_game(false);
    for (i = 0; i < MAXROUNDS; ++i) assert(fire_weapon(false));
    assert(!fire_weapon(false));
    fresh_game(true);
    for (i = 0; i < MAXROUNDS + 20; ++i) {
        WebTrainer_Apply(consoleplayer);
        assert(fire_weapon(false));
    }
    puts("Gun: normal ammunition runs out at 200; trainer fires 220 rounds.");

    fresh_game(false);
    for (i = 0; i < MAXBOMBS; ++i) {
        consoleplayer->ob_bdelay = 0;
        assert(fire_weapon(true));
    }
    consoleplayer->ob_bdelay = 0;
    assert(!fire_weapon(true));
    fresh_game(true);
    for (i = 0; i < MAXBOMBS + 5; ++i) {
        consoleplayer->ob_bdelay = 0;
        WebTrainer_Apply(consoleplayer);
        assert(fire_weapon(true));
        WebTrainer_Apply(consoleplayer);
        assert(consoleplayer->ob_bdelay == 10);
        assert(!fire_weapon(true));
    }
    puts("Bombs: normal supply runs out at five; trainer replenishes with normal cooldown.");

    consoleplayer->ob_life = 1234;
    WebTrainer_Apply(consoleplayer);
    assert(consoleplayer->ob_life == MAXFUEL);
    consoleplayer->ob_state=FALLING;consoleplayer->ob_life=7;
    WebTrainer_Apply(consoleplayer);assert(consoleplayer->ob_life==7);
    consoleplayer->ob_state=CRASHED;WebTrainer_Apply(consoleplayer);assert(consoleplayer->ob_life==7);
    consoleplayer->ob_state=FLYING;consoleplayer->ob_life=QUIT;
    WebTrainer_Apply(consoleplayer);assert(consoleplayer->ob_life==QUIT);
    WebTrainer_SetEnabled(false);
    consoleplayer->ob_life=1234;WebTrainer_Apply(consoleplayer);assert(consoleplayer->ob_life==1234);
    consoleplayer->ob_bdelay = 0;
    assert(fire_weapon(true));
    assert(consoleplayer->ob_bombs == MAXBOMBS - 1);
    assert(fire_weapon(false));
    assert(consoleplayer->ob_rounds == MAXROUNDS - 1);
    WebTrainer_Apply(consoleplayer);
    assert(consoleplayer->ob_bombs == MAXBOMBS - 1);
    consoleplayer->ob_endsts = WINNER;
    WebTrainer_SetEnabled(true);
    consoleplayer->ob_crashcnt = 3;
    WebTrainer_Apply(consoleplayer);
    assert(consoleplayer->ob_endsts == WINNER && consoleplayer->ob_crashcnt == 3);
    puts("Trainer fuel: live aircraft refill; falling/crash timers, quit and mission outcomes are preserved. Disabling restores normal fuel use.");

    fresh_game(false);
    WebVariant_SetEnabled(true);
    consoleplayer->ob_y = 170;
    consoleplayer->ob_dx = 4;
    consoleplayer->ob_dy = 0;
    consoleplayer->ob_athome = false;
    OBJECTS *enemy = planes[1];
    enemy->ob_bdelay = 8;
    int launched = 0;
    for (i = 0; i < 10; ++i) {
        OBJECTS *old = objbot;
        initbomb(consoleplayer);
        if (old != objbot) ++launched;
        if (consoleplayer->ob_bdelay) --consoleplayer->ob_bdelay;
        for (OBJECTS *ob = objtop; ob; ob = ob->ob_next) {
            if (ob->ob_type == BOMB) movebomb(ob);
        }
        swcollsn();
        ++countmove;
        WebVariant_Apply(consoleplayer);
    }
    int in_air = 0;
    for (OBJECTS *ob = objtop; ob; ob = ob->ob_next) if (ob->ob_type == BOMB) ++in_air;
    assert(launched == 5 && in_air == 5 && consoleplayer->ob_bombs == 0);
    assert(enemy->ob_bdelay == 8);
    OBJECTS *old = objbot;
    initbomb(consoleplayer);
    assert(old == objbot);
    puts("Rainbow: five bombs coexist in flight, ammo is consumed, empty stock blocks firing; enemies retain their delay.");

    fresh_game(false);WebVariant_SetEnabled(true);
    consoleplayer->ob_athome=false;consoleplayer->ob_y=170;
    for(i=0;i<20;i++){++countmove;WebVariant_Apply(consoleplayer);}
    assert(consoleplayer->ob_bombs==5);
    WebVariant_BombRelease(true);++countmove;WebVariant_Apply(consoleplayer);
    assert(consoleplayer->ob_bombs==4 && objbot->ob_type==BOMB);
    assert(WebVariant_Effects()[1]==1 && WebVariant_Effects()[6]==4);
    for(i=0;i<20;i++){++countmove;WebVariant_Apply(consoleplayer);}
    assert(consoleplayer->ob_bombs==4);
    WebVariant_BombRelease(true);WebVariant_BombRelease(false);++countmove;WebVariant_Apply(consoleplayer);
    assert(consoleplayer->ob_bombs==4);
    puts("Rainbow B: hold does not fire; one release spends one bomb; blur/pause cancel pending releases.");

    consoleplayer->ob_bdelay = 9;
    WebVariant_SetEnabled(false);
    WebVariant_Apply(consoleplayer);
    assert(consoleplayer->ob_bdelay == 9);
    puts("Classic: disabled variant leaves the original bomb interval untouched.");

    fresh_game(false);
    WebVariant_SetEnabled(true);
    initexpl(consoleplayer, 1);
    ++countmove;
    WebVariant_Apply(consoleplayer);
    const int *events = WebVariant_Effects();
    assert(events[1] == 1 && events[2] == 1);
    assert(events[WEB_EFFECT_HEADER+2] == 1);
    assert(events[WEB_EFFECT_HEADER+5] == 2);
    ++countmove; WebVariant_Apply(consoleplayer);
    assert(events[1] == 1);
    /* A bird killed by a normal native collision has life == -1 until its
     * next move. The adapter adds only visual feedback to that state. */
    OBJECTS *bird = allocobj();
    bird->ob_type = BIRD;bird->ob_life = -1;bird->ob_symbol = &symbol_pixel;
    bird->ob_x = 1100;bird->ob_y = 100;
    ++countmove;WebVariant_Apply(consoleplayer);
    assert(events[1] == 2 && events[WEB_EFFECT_HEADER+WEB_EFFECT_STRIDE+2] == 2);
    ++countmove;WebVariant_Apply(consoleplayer);assert(events[1] == 2);
    assert(consoleplayer->ob_endsts == PLAYING && bird->ob_life == -1);
    puts("Rainbow effects: native explosion fragments group into one blast; bird hits produce one feather event without extra damage.");
    fresh_game(false);WebVariant_SetEnabled(true);
    OBJECTS *tank=NULL,*cow=NULL;
    for(OBJECTS *ob=objtop;ob;ob=ob->ob_next){
        if(ob->ob_type==TARGET&&ob->ob_orient==TARGET_TANK)tank=ob;
        if(ob->ob_type==OX)cow=ob;
    }
    assert(tank&&cow);consoleplayer->ob_x=tank->ob_x+40;consoleplayer->ob_y=tank->ob_y+30;consoleplayer->ob_dx=consoleplayer->ob_dy=0;
    initshot(tank,consoleplayer);OBJECTS *shell=objbot;
    assert(shell->ob_type==SHOT);int initial_dy=shell->ob_dy;
    countmove=200;WebVariant_Apply(consoleplayer);
    assert(shell->ob_life==28&&shell->ob_dy==initial_dy+2);
    events=WebVariant_Effects();assert(events[1]==1&&events[6]==5);
    countmove++;WebVariant_Apply(consoleplayer);assert(events[1]==1);
    countmove++;WebVariant_Apply(consoleplayer);assert(shell->ob_dy==initial_dy+1&&events[1]==1);
    cow->ob_state=CRASHED;tank->ob_state=CRASHED;tank->ob_faction=FACTION_PLAYER2;
    countmove++;WebVariant_Apply(consoleplayer);assert(events[1]==3);
    int cows=0,targets=0;
    for(i=0;i<events[2];i++){int type=events[4+i*6+2];cows+=type==3;targets+=type==6;}
    assert(cows==1&&targets==1);
    countmove++;WebVariant_Apply(consoleplayer);assert(events[1]==3);
    OBJECTS *enemy_plane=planes[1];enemy_plane->ob_faction=FACTION_PLAYER2;enemy_plane->ob_state=FALLING;
    countmove++;int before_plane=events[1];WebVariant_Apply(consoleplayer);assert(events[1]==before_plane+1);
    countmove++;WebVariant_Apply(consoleplayer);assert(events[1]==before_plane+1);
    shell->ob_life=1;int before_impact=events[1];assert(!moveshot(shell));
    assert(events[1]==before_impact+1&&events[4+(before_impact%32)*6+2]==1);
    puts("Rainbow ground combat: one muzzle event, ballistic tank shell, one cow reaction and one target-destroyed event.");
    fresh_game(false);int base_targets=numtarg[FACTION_PLAYER1]+numtarg[FACTION_PLAYER2];
    WebVariant_SetEnabled(true);++countmove;WebVariant_Apply(consoleplayer);
    int guns=0,slopes=0,lowered_left=0,lowered_right=0;OBJECTS *gun=NULL,*building=NULL;
    for(OBJECTS *ob=objtop;ob;ob=ob->ob_next){
        if(WebVariant_ObjectKind(ob)==20){
            guns++;gun=ob;assert(ob->ob_symbol->w==16);assert(ob->ob_y<=MAX_Y-32);assert(abs(ob->ob_x-consoleplayer->ob_original_ob->x)>=85);
            slopes+=abs((int)ground[ob->ob_x+15]-(int)ground[ob->ob_x])>=3;
        }else if(ob->ob_type==TARGET&&ob->ob_orient==TARGET_FACTORY)building=ob;
        if(ob->ob_type==TARGET&&WebVariant_ObjectKind(ob)!=20){
            int original_base=0;for(int x=ob->ob_x;x<ob->ob_x+ob->ob_symbol->w;x++)original_base=imax(original_base,currgame->gm_ground[x]);
            if(original_base+ob->ob_symbol->h>MAX_Y-32&&(ob->ob_x<500||ob->ob_x>2500)){
                assert(ob->ob_y<=MAX_Y-32);if(ob->ob_x<500)lowered_left++;else lowered_right++;
            }
        }
        if(ob->ob_type==OX){cow=ob;int left=16,right=0,top=16,bottom=0;
            for(int y=0;y<16;y++)for(int x=0;x<16;x++)if(ob->ob_symbol->data[y*16+x]){left=imin(left,x);right=imax(right,x+1);top=imin(top,y);bottom=imax(bottom,y+1);}
            assert(right-left<=9&&bottom-top<=7);
        }
    }
    assert(guns>0&&slopes>0&&gun&&building);
    assert(numtarg[FACTION_PLAYER1]+numtarg[FACTION_PLAYER2]==base_targets+guns);
    assert(lowered_left>0&&lowered_right>0);
    for(i=0;i<(int)currgame->gm_max_x;i++){
        assert(ground[i]<=currgame->gm_ground[i]);
        if((i>=500&&i<2500)||i==0||i==(int)currgame->gm_max_x-1)assert(ground[i]==currgame->gm_ground[i]);
        if(i)assert(abs((int)ground[i]-(int)ground[i-1])<=imax(2,abs((int)currgame->gm_ground[i]-(int)currgame->gm_ground[i-1])+1));
    }
    int cow_floor=cow->ob_y-16;consoleplayer->ob_x=cow->ob_x-32;consoleplayer->ob_y=cow_floor+14;
    consoleplayer->ob_angle=consoleplayer->ob_orient=0;consoleplayer->ob_dx=consoleplayer->ob_dy=0;
    initshot(consoleplayer,NULL);OBJECTS *level_shot=objbot;
    assert(level_shot->ob_type==SHOT&&level_shot->ob_dy==0&&level_shot->ob_y==cow_floor+6);
    bool cow_hit=false;for(int x=cow->ob_x;x<cow->ob_x+16;x++){level_shot->ob_x=x;cow_hit|=CollisionTest(level_shot,cow);}assert(cow_hit);
    puts("Rainbow end targets: lowered roofs at both ends, smooth hillsides, unchanged middle and walls; low horizontal gunfire can hit the resized cow.");
    OBJECTS *before_shot=objbot;WebVariant_InitShot(building,consoleplayer);assert(objbot==before_shot);
    consoleplayer->ob_x=gun->ob_x+30;consoleplayer->ob_y=gun->ob_y+25;consoleplayer->ob_dx=consoleplayer->ob_dy=0;
    WebVariant_InitShot(gun,consoleplayer);assert(objbot!=before_shot&&objbot->ob_owner==gun);
    puts("Rainbow terrain/defenses: continuous source slopes, independent AA targets on hills, runway clearance, target counts, resized cow masks and no invisible building guns verified.");
    OBJECTS *flock=allocobj();flock->ob_type=FLOCK;flock->ob_state=FINISHED;flock->ob_life=-1;flock->ob_symbol=&symbol_pixel;
    ++countmove;WebVariant_Apply(consoleplayer);events=WebVariant_Effects();int newest=4+((events[1]-1)%32)*6;
    assert(events[newest+2]==2&&events[newest+5]==6);
    puts("Bird flock collision: one grouped feather/squawk event with flock intensity.");
    gun->ob_faction=FACTION_PLAYER2;consoleplayer->ob_faction=FACTION_PLAYER1;
    consoleplayer->ob_state=FLYING;consoleplayer->ob_x=gun->ob_x+30;consoleplayer->ob_y=gun->ob_y+25;
    gamenum=0;countmove=1;WebVariant_SetEasy(true);before_shot=objbot;movetarg(gun);assert(objbot==before_shot);
    WebVariant_SetEasy(false);gamenum=0;targrnge=75*75;movetarg(gun);
    assert(playmode==PLAYMODE_SINGLE&&objbot!=before_shot&&objbot->ob_owner==gun);
    puts("Single player: Easy ground AA stays quiet; Normal AA fires from level 1 without air-combat mode.");
    gun->ob_faction=FACTION_PLAYER1;enemy_plane=planes[1];enemy_plane->ob_type=PLANE;
    enemy_plane->ob_state=FLYING;enemy_plane->ob_faction=FACTION_PLAYER2;enemy_plane->ob_symbol=consoleplayer->ob_symbol;
    enemy_plane->ob_x=gun->ob_x+30;enemy_plane->ob_y=gun->ob_y+25;
    enemy_plane->ob_dx=enemy_plane->ob_dy=0;enemy_plane->ob_rounds=MAXROUNDS;
    consoleplayer->ob_x=gun->ob_x-25;countmove=3;before_shot=objbot;movetarg(gun);
    assert(objbot!=before_shot&&gun->ob_firing==enemy_plane&&gun->ob_angle==0);
    OBJECTS *friendly_tank=NULL;for(OBJECTS *ob=objtop;ob;ob=ob->ob_next)if(ob->ob_type==TARGET&&ob->ob_orient==TARGET_TANK){friendly_tank=ob;break;}
    assert(friendly_tank);friendly_tank->ob_faction=FACTION_PLAYER1;
    enemy_plane->ob_x=friendly_tank->ob_x-30;enemy_plane->ob_y=friendly_tank->ob_y+25;
    countmove=5;before_shot=objbot;movetarg(friendly_tank);
    assert(objbot!=before_shot&&friendly_tank->ob_firing==enemy_plane&&friendly_tank->ob_angle==8);
    enemy_plane->ob_state=CRASHED;countmove=7;before_shot=objbot;movetarg(friendly_tank);assert(objbot==before_shot);
    puts("Friendly AA and tanks fire at live enemy computer planes, aim at the actual target, and ignore friendly/dead aircraft.");

    gun->ob_faction=FACTION_PLAYER2;consoleplayer->ob_x=gun->ob_x+30;consoleplayer->ob_y=gun->ob_y+25;
    countmove=50;WebVariant_SetEasy(true);before_shot=objbot;WebVariant_InitShot(gun,consoleplayer);assert(objbot==before_shot);
    countmove=80;WebVariant_InitShot(gun,consoleplayer);assert(objbot==before_shot);
    countmove=81;WebVariant_InitShot(gun,consoleplayer);assert(objbot==before_shot);
    WebVariant_InitShot(consoleplayer,NULL);assert(objbot!=before_shot);
    before_shot=objbot;countmove=86;WebVariant_InitShot(gun,consoleplayer);assert(objbot==before_shot);
    enemy_plane->ob_state=FLYING;enemy_plane->ob_x=consoleplayer->ob_x+110;enemy_plane->ob_y=consoleplayer->ob_y;
    before_shot=objbot;countmove=90;WebVariant_InitShot(enemy_plane,consoleplayer);assert(objbot==before_shot);
    enemy_plane->ob_x=consoleplayer->ob_x+60;WebVariant_InitShot(enemy_plane,consoleplayer);assert(objbot!=before_shot);before_shot=objbot;
    countmove=91;WebVariant_InitShot(enemy_plane,consoleplayer);assert(objbot==before_shot);
    countmove=94;WebVariant_InitShot(enemy_plane,consoleplayer);assert(objbot!=before_shot);
    countmove=100;consoleplayer->ob_state=CRASHED;WebVariant_Apply(consoleplayer);
    countmove=101;consoleplayer->ob_state=FLYING;WebVariant_Apply(consoleplayer);before_shot=objbot;
    countmove=110;WebVariant_InitShot(gun,consoleplayer);assert(objbot==before_shot);
    countmove=131;WebVariant_InitShot(gun,consoleplayer);assert(objbot==before_shot);
    WebVariant_SetEasy(false);countmove=132;WebVariant_InitShot(gun,consoleplayer);assert(objbot!=before_shot);
    puts("Easy combat: shorter hostile range, per-owner shot intervals and three-second spawn grace; player weapons and normal difficulty unchanged.");
    return 0;
}
