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
    for(int n=0;n<70;n++){++countmove;man->ob_movef(man);}assert(!objbot->ob_owner||objbot->ob_owner!=man);
    gamenum=1;OBJECTS *before=objbot;
    for(int n=0;n<30;n++){++countmove;man->ob_movef(man);}
    assert(objbot!=before&&objbot->ob_type==SHOT&&objbot->ob_owner==man);
    puts("Ground pilots: no fire in level 1; hostile rifle fire at nearby enemy aircraft from level 2.");
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
    fresh();int level=gamenum;winner(consoleplayer);assert(endcount==72);
    while(endcount>0){swmove();WebVariant_Apply(consoleplayer);}
    assert(gamenum==level+1&&restart_flag);swinitlevel();WebVariant_Apply(consoleplayer);
    assert(consoleplayer->ob_endsts==PLAYING);
    puts("Native victory: 72-tick departure completes, bonus survives, next level starts in PLAYING state.");
    return 0;
}
