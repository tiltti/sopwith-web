/* Native return-to-base scenario audit. GPL-2.0-or-later. */
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
#include "variant.h"
char *Vid_GetPrefPath(void) { return strdup(WEB_TEST_PREF_PATH); }
int main(void) {
    SDL_SetMainReady();SDL_SetHint(SDL_HINT_RENDER_DRIVER,"software");
    char *args[]={"home-test","-s","-q",NULL};swinit(3,args);conf_medals=false;conf_animals=false;
    int failures=0,successes=0;
    for(int edition=0;edition<2;edition++){
    failures=successes=0;
    for(int offset=-700;offset<=700;offset+=350)for(int altitude=25;altitude<=125;altitude+=50)for(int direction=-1;direction<=1;direction+=2) {
        playmode=PLAYMODE_SINGLE;WebVariant_SetEnabled(edition==1);swinitlevel();
        OBJECTS *p=consoleplayer;
        int x=clamp_range(20,p->ob_original_ob->x+offset,currgame->gm_max_x-30);
        p->ob_x=x;p->ob_y=clamp_max(ground[x]+altitude,180);p->ob_athome=false;p->ob_home=true;
        /* Begin clear of solid scenery; an initial overlap cannot be
         * recovered by any autopilot before the first collision pass. */
        for(OBJECTS *ob=objtop;ob;ob=ob->ob_next)
            if(ob!=p&&(ob->ob_type==TARGET||ob->ob_type==OX)&&ob->ob_symbol
                &&ob->ob_x<x+16&&ob->ob_x+ob->ob_symbol->w>x)
                p->ob_y=clamp_max(imax(p->ob_y,ob->ob_y+24),180);
        p->ob_angle=direction>0?0:8;p->ob_orient=direction<0;p->ob_speed=6;p->ob_accel=2;
        setdxdy(p,direction*6*256,0);insertx(p,deletex(p));
        for(int step=0;step<900&&!p->ob_athome&&p->ob_state!=CRASHED;step++) {
            memset(latest_player_commands,0,sizeof(latest_player_commands));
            swmove();swcollsn();WebVariant_Apply(p);
            if(p->ob_state==FALLING||p->ob_state==WOUNDED||p->ob_state==WOUNDSTALL)break;
        }
        if(p->ob_athome&&p->ob_state==FLYING)successes++;
        else {failures++;printf("Home failure offset=%d altitude=%d direction=%d final=(%d,%d) state=%d home=%d\n",offset,altitude,direction,p->ob_x,p->ob_y,p->ob_state,p->ob_home);}
    }
    printf("Return-to-base audit (%s): %d succeeded, %d failed.\n",edition?"Rainbow":"classic baseline",successes,failures);
    }
    return failures?1:0;
}
