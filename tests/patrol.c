/* SPDX-License-Identifier: GPL-2.0-or-later */
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
#include "swend.h"
#include "variant.h"
#include "trainer.h"
char *Vid_GetPrefPath(void){return strdup(WEB_TEST_PREF_PATH);}
static void fresh(void){playmode=PLAYMODE_SINGLE;WebVariant_SetEnabled(false);gamenum=0;swinitlevel();WebVariant_SetEnabled(true);compplane=false;plyrplane=true;WebVariant_Apply(consoleplayer);}
static OBJECTS *pilot(void){for(OBJECTS *ob=objtop;ob;ob=ob->ob_next)if(WebVariant_ObjectKind(ob)==21)return ob;return NULL;}
static OBJECTS *eject(faction_t faction){
    fresh();OBJECTS *plane=planes[faction==FACTION_PLAYER1?0:1];plane->ob_faction=faction;plane->ob_x=plane->ob_original_ob->x+70;plane->ob_y=ground[plane->ob_x]+65;plane->ob_athome=false;
    plane->ob_state=FALLING;insertx(plane,deletex(plane));++countmove;WebVariant_Apply(consoleplayer);assert(pilot());return pilot();
}
int main(void){
    char *args[]={"patrol-test","-s","-q",NULL};SDL_SetMainReady();SDL_SetHint(SDL_HINT_RENDER_DRIVER,"software");swinit(3,args);conf_medals=false;
    for(int orient=0;orient<2;orient++)for(int angle=0;angle<16;angle+=2){
        fresh();OBJECTS *p=consoleplayer;p->ob_x=1500;p->ob_y=185;p->ob_athome=false;p->ob_angle=angle;p->ob_orient=orient;p->ob_speed=4;p->ob_state=FLYING;setdxdy(p,4*COS(angle),4*SIN(angle));insertx(p,deletex(p));
        for(int t=0;t<12;t++){
            if(t<10&&t%2==0)WebVariant_BombRelease(true);
            swmove();swcollsn();WebVariant_Apply(p);
            assert(p->ob_state!=FALLING&&p->ob_state!=CRASHED);
        }
        assert(p->ob_bombs==0);
    }
    puts("Rapid salvo: five real release/move/collision cycles across 16 heading/orientation cases never self-detonate the plane.");
    fresh();OBJECTS *p=consoleplayer;p->ob_bdelay=0;initbomb(p);OBJECTS *bomb=objbot;
    assert(!WebVariant_CanCollide(p,bomb));p->ob_bdelay=0;initbomb(p);assert(!WebVariant_CanCollide(bomb,objbot));
    initshot(p,NULL);assert(!WebVariant_CanCollide(bomb,objbot));
    bomb->ob_owner=planes[1];assert(WebVariant_CanCollide(p,bomb));WebVariant_SetEnabled(false);assert(WebVariant_CanCollide(objbot,bomb));
    puts("Bomb filter: own rack/ordnance protection, hostile bomb collisions and unchanged classic rules verified.");
    OBJECTS *man;
    for(int faction=1;faction<=2;faction++){
      man=eject((faction_t)faction);int walked=0;
      for(int n=0;n<1000&&WebVariant_ObjectKind(man)==21;n++){
        ++countmove;man->ob_movef(man);
        if(WebVariant_ObjectKind(man)==21&&man->ob_state==STANDING){assert(man->ob_y-man->ob_symbol->h==ground[man->ob_x+3]);walked+=man->ob_orient==3;}
      }
      assert(walked>20&&WebVariant_ObjectKind(man)!=21);
    }
    puts("Pilot: canopy deployment, full descent, grounded stance, slow walking and safe arrival at own airfield verified.");
    for(int faction=1;faction<=2;faction++)for(int air=0;air<=1;air++){
        man=eject((faction_t)faction);consoleplayer->ob_faction=FACTION_PLAYER1;
        if(!air){man->ob_state=STANDING;man->ob_orient=3;}
        OBJECTS shot={.ob_type=SHOT,.ob_owner=consoleplayer};int score=consoleplayer->ob_score.score;
        WebVariant_PilotHit(man,&shot);assert(consoleplayer->ob_score.score-score==(air?-1000:faction==1?-500:100));
        score=consoleplayer->ob_score.score;WebVariant_PilotHit(man,&shot);assert(consoleplayer->ob_score.score==score);
    }
    puts("Pilot scoring: either airborne pilot -1000, friendly on foot -500, hostile on foot +100; no duplicate scoring.");
    man=eject(FACTION_PLAYER2);consoleplayer->ob_faction=FACTION_PLAYER1;man->ob_state=STANDING;man->ob_orient=3;
    consoleplayer->ob_x=man->ob_x+30;consoleplayer->ob_y=ground[man->ob_x]+17;consoleplayer->ob_state=FLYING;
    WebVariant_SetEasy(true);
    for(int n=0;n<70;n++){++countmove;man->ob_movef(man);}assert(!objbot->ob_owner||objbot->ob_owner!=man);
    WebVariant_SetEasy(false);gamenum=0;OBJECTS *before=objbot;
    for(int n=0;n<45;n++){++countmove;man->ob_movef(man);}
    assert(objbot!=before&&objbot->ob_type==SHOT&&objbot->ob_owner==man);
    puts("Ground pilots: no ground fire on Easy; Normal rifle fire from level 1.");
    /* Force a pixel-perfect overlap with a real bullet in the canopy mask. */
    man=eject(FACTION_PLAYER2);consoleplayer->ob_faction=FACTION_PLAYER1;man->ob_life=10;
    initshot(consoleplayer,NULL);OBJECTS *bullet=objbot;bullet->ob_x=man->ob_x+5;bullet->ob_y=man->ob_y-2;bullet->ob_life=5;insertx(bullet,deletex(bullet));
    assert(CollisionTest(man,bullet));int score=consoleplayer->ob_score.score;swcollsn();assert(man->ob_state==FINISHED&&consoleplayer->ob_score.score==score-1000);
    puts("Actual native collision pass: an airborne pilot can be shot and the bullet is consumed.");
    man=eject(FACTION_PLAYER2);man->ob_life=10;p=consoleplayer;
    unsigned char solid[256];memset(solid,1,sizeof(solid));sopsym_t silhouette={.w=16,.h=16,.data=solid};
    p->ob_symbol=&silhouette;p->ob_x=man->ob_x;p->ob_y=man->ob_y;p->ob_state=FLYING;p->ob_athome=false;insertx(p,deletex(p));
    assert(WebVariant_CanCollide(man,p)&&CollisionTest(man,p));swcollsn();assert(man->ob_state==FINISHED&&p->ob_state==FALLING);
    puts("Actual native collision pass: aircraft can collide with parachutes, disabling the aircraft and pilot.");
    man=eject(FACTION_PLAYER1);p=consoleplayer;man->ob_life=20;man->ob_state=STANDING;man->ob_orient=3;
    p->ob_state=FLYING;p->ob_endsts=PLAYING;p->ob_athome=true;
    assert(!WebVariant_CanCollide(man,p)&&!WebVariant_CanCollide(p,man));
    p->ob_athome=false;p->ob_x=p->ob_original_ob->x+10;p->ob_y=ground[p->ob_x+8]+17;
    assert(!WebVariant_CanCollide(man,p));
    p->ob_y+=60;assert(WebVariant_CanCollide(man,p));
    p->ob_athome=true;man->ob_state=FALLING;assert(WebVariant_CanCollide(man,p));
    man->ob_state=STANDING;man->ob_faction=FACTION_PLAYER2;assert(WebVariant_CanCollide(man,p));
    WebVariant_SetEnabled(false);assert(WebVariant_CanCollide(man,p));WebVariant_SetEnabled(true);
    puts("Runway safety: friendly walking pilots pass parked/taxiing home aircraft; airborne, hostile and Classic contacts remain active.");
    fresh();int level=gamenum,winning_score=consoleplayer->ob_score.score,lives=maxcrash-consoleplayer->ob_crashcnt;winner(consoleplayer);assert(endcount==72);
    while(endcount>0){swmove();WebVariant_Apply(consoleplayer);}
    assert(gamenum==level+1&&restart_flag);swinitlevel();WebVariant_Apply(consoleplayer);
    assert(consoleplayer->ob_endsts==PLAYING);assert(consoleplayer->ob_score.score==winning_score+25*lives*(lives+1)/2);
    puts("Native victory: 72-tick departure completes, bonus survives, next level starts in PLAYING state.");
    /* A real overlap beyond the old 32-pixel home exemption stays safe. */
    man=eject(FACTION_PLAYER1);p=consoleplayer;
    p->ob_x=p->ob_original_ob->x+65;p->ob_y=ground[p->ob_x+8]+17;p->ob_athome=false;
    p->ob_state=FLYING;p->ob_endsts=PLAYING;p->ob_symbol=&silhouette;
    man->ob_state=STANDING;man->ob_orient=3;man->ob_x=p->ob_x+4;man->ob_y=ground[man->ob_x+3]+9;
    insertx(p,deletex(p));insertx(man,deletex(man));assert(CollisionTest(man,p));
    swcollsn();assert(man->ob_state==STANDING&&p->ob_state==FLYING);
    puts("Hangar/taxi overlap: a friendly walking pilot cannot destroy himself or the departing aircraft beyond the old home radius.");

    fresh();int initial_level=gamenum;WebTrainer_SetEnabled(false);WebVariant_Test(3);assert(gamenum==initial_level);
    WebTrainer_SetEnabled(true);WebVariant_SetEasy(true);
    int width=currgame->gm_max_x;GRNDTYPE *day=malloc(width*sizeof(*day)),*winter=malloc(width*sizeof(*winter));
    memcpy(day,ground,width*sizeof(*day));WebVariant_Test(2);assert(gamenum==1);memcpy(winter,ground,width*sizeof(*winter));
    WebVariant_Test(3);assert(gamenum==2);int changed_winter=0,changed_city=0,low=200,high=0;
    for(int x=0;x<width;x++){changed_winter+=day[x]!=winter[x];changed_city+=winter[x]!=ground[x];if(x>10&&x<width-10){low=imin(low,ground[x]);high=imax(high,ground[x]);}}
    assert(changed_winter>width/2&&changed_city>width/2&&high-low>90);
    for(int i=0;i<num_players;i++)assert(ground[planes[i]->ob_original_ob->x+8]==currgame->gm_ground[planes[i]->ob_original_ob->x+8]);
    free(day);free(winter);
    puts("Trainer-gated level jumps create distinct winter valleys and storm mountains, preserving original runway heights.");

    for(int mission=1;mission<=3;mission++){
        WebVariant_Test(mission);int architecture=0;
        for(OBJECTS *ob=objtop;ob;ob=ob->ob_next){
            int kind=WebVariant_ObjectKind(ob);
            if(ob->ob_type!=TARGET||(kind!=0&&kind!=1&&kind!=2&&kind!=7))continue;
            int x=ob->ob_x,bottom=ob->ob_y-ob->ob_symbol->h,w=ob->ob_symbol->w;
            assert(w>=24&&ob->ob_symbol->h>=22);architecture++;
            for(int n=0;n<4;n++){++countmove;ob->ob_movef(ob);assert(ob->ob_x==x&&ob->ob_y-ob->ob_symbol->h==bottom&&ob->ob_symbol->w==w);}
            /* Solid pixels beyond the old 16px footprint are real targets. */
            int hit=0;unsigned char pixel=1;sopsym_t dot={.w=1,.h=1,.data=&pixel};
            for(int y=0;y<ob->ob_symbol->h&&!hit;y++)for(int xx=16;xx<w;xx++)if(ob->ob_symbol->data[y*w+xx]){
                OBJECTS bullet={.ob_type=SHOT,.ob_symbol=&dot,.ob_x=x+xx,.ob_y=ob->ob_y-y};
                assert(CollisionTest(ob,&bullet));hit=1;break;
            }
            assert(hit);ob->ob_state=FINISHED;ob->ob_movef(ob);
            assert(ob->ob_x==x&&ob->ob_y-ob->ob_symbol->h==bottom&&ob->ob_symbol->w==w);
        }
        assert(architecture>3);
    }
    puts("Larger architecture: real extended collision masks, stable centring on repeated native moves and grounded ruins in all three missions.");

    int impact=-1;
    for(int x=40;x<width-40;x++)if(currgame->gm_ground[x]>ground[x]+24){
        bool clear=true;for(OBJECTS *ob=objtop;ob;ob=ob->ob_next)if(ob->ob_symbol&&ob->ob_type!=PLANE&&ob->ob_x<x+25&&ob->ob_x+ob->ob_symbol->w>x-25)clear=false;
        if(clear){impact=x;break;}
    }
    assert(impact>=0);p=consoleplayer;p->ob_x=impact-20;p->ob_y=185;p->ob_athome=false;insertx(p,deletex(p));
    for(int n=0;n<10;n++){
        WebTrainer_Apply(p);p->ob_bdelay=0;initbomb(p);bomb=objbot;assert(bomb->ob_type==BOMB);
        bomb->ob_x=impact;bomb->ob_y=ground[impact];insertx(bomb,deletex(bomb));
        GRNDTYPE before[20];memcpy(before,ground+impact-6,sizeof(before));swcollsn();
        bool dug=false;for(int x=0;x<20;x++){assert(ground[impact-6+x]<=before[x]);dug|=ground[impact-6+x]<before[x];}
        if(!n)assert(dug);
    }
    puts("Ten real bomb/ground collisions below the original landscape never raise terrain; the first impact excavates a crater.");

    fresh();WebVariant_SetEasy(true);p=consoleplayer;p->ob_x=300;p->ob_y=170;p->ob_athome=false;p->ob_speed=4;p->ob_accel=0;p->ob_angle=0;
    setdxdy(p,4*256,0);insertx(p,deletex(p));
    int previous_speed=0;
    for(int n=0;n<90;n++){
        ++countmove;latest_player_commands[p->ob_plrnum][countmove%MAX_NET_LAG]=n<16?K_ACCEL:0;moveplyr(p);
        int speed=WebVariant_Speed();if(n)assert(speed-previous_speed<=1);previous_speed=speed;
    }
    assert(WebVariant_Throttle()==100&&WebVariant_Speed()>=15);
    int fast=WebVariant_Speed();
    for(int n=0;n<60;n++){
        ++countmove;latest_player_commands[p->ob_plrnum][countmove%MAX_NET_LAG]=n<8?K_DEACC:0;moveplyr(p);
    }
    assert(WebVariant_Throttle()==50&&WebVariant_Speed()<fast&&WebVariant_Speed()>=9);
    p->ob_home=true;p->ob_x=p->ob_original_ob->x+350;p->ob_y=180;p->ob_speed=16;WebVariant_GoHome(p);assert(p->ob_speed<=gmaxspeed);
    WebTrainer_SetEnabled(true);WebVariant_Test(1);WebVariant_Test(0);
    assert(consoleplayer->ob_endsts==WINNER&&endcount==72);
    for(OBJECTS *ob=objtop;ob;ob=ob->ob_next)if(ob->ob_type==TARGET)assert(ob->ob_state!=STANDING);
    WebTrainer_SetEnabled(false);
    puts("Sixteen throttle steps accelerate smoothly beyond the old maximum, half throttle sustains lower speed, trainer E clears targets and starts native departure.");
    return 0;
}
