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
#include "variant.h"
#include "trainer.h"
char *Vid_GetPrefPath(void){return strdup(WEB_TEST_PREF_PATH);}
static void fresh(int mission){
 playmode=PLAYMODE_COMPUTER;WebVariant_SetEnabled(false);WebTrainer_SetEnabled(false);WebTrainer_SetSupplies(false);
 gamenum=mission;swinitlevel();WebVariant_SetEnabled(true);WebVariant_Apply(consoleplayer);compplane=false;plyrplane=true;
}
int main(void){
 char *args[]={"spawn-safety","-s","-q",NULL};SDL_SetMainReady();SDL_SetHint(SDL_HINT_RENDER_DRIVER,"software");swinit(3,args);conf_medals=false;
 for(int mission=0;mission<3;mission++){
  fresh(mission);OBJECTS *p=consoleplayer;assert(WebVariant_SpawnProtection()==100);
  OBJECTS shot={.ob_type=SHOT,.ob_owner=planes[1]},wreck={.ob_type=PLANE,.ob_state=FALLING},debris={.ob_type=EXPLOSION};
  for(int tick=0;tick<100;tick++){
   assert(!WebVariant_CanCollide(p,&shot)&&!WebVariant_CanCollide(&shot,p));
   assert(!WebVariant_CanCollide(&wreck,p)&&!WebVariant_CanCollide(p,&debris));
   int remaining=WebVariant_SpawnProtection();assert(remaining==100-tick);assert(WebVariant_SpawnProtection()==remaining);++countmove;
  }
  assert(WebVariant_SpawnProtection()==0&&WebVariant_CanCollide(p,&shot));
  p->ob_athome=true;WebVariant_Apply(p);assert(WebVariant_SpawnProtection()==0); /* Landing/refueling cannot re-arm it. */
  int home=p->ob_original_ob->x+8;GRNDTYPE strip[221];memcpy(strip,ground+home-110,sizeof(strip));
  for(int loss=0;loss<3;loss++){
   p->ob_x=p->ob_original_ob->x;p->ob_y=ground[home]-3;p->ob_state=FALLING;p->ob_athome=false;insertx(p,deletex(p));
   swcollsn();if(p->ob_state!=CRASHED)fprintf(stderr,"ground impact mission=%d loss=%d state=%d y=%d floor=%d end=%d\n",mission,loss,p->ob_state,p->ob_y,ground[home],p->ob_endsts);assert(p->ob_state==CRASHED);assert(!memcmp(strip,ground+home-110,sizeof(strip)));
   int limit=p->ob_hitcount+10;
   for(int step=0;step<limit&&p->ob_state==CRASHED;step++){swmove();swcollsn();WebVariant_Apply(p);}
   assert(p->ob_state==FLYING&&p->ob_crashcnt==loss+1&&WebVariant_SpawnProtection()>90);
   for(int step=0;step<8;step++){swmove();swcollsn();WebVariant_Apply(p);assert(p->ob_state==FLYING);}
   assert(!memcmp(strip,ground+home-110,sizeof(strip)));
  }
 }
 fresh(0);OBJECTS *p=consoleplayer;p->ob_x+=400;p->ob_y=ground[p->ob_x]-3;p->ob_athome=false;insertx(p,deletex(p));
 swcollsn();assert(PlaneIsKilled(p->ob_state)); /* Protection does not allow flying through terrain. */
 WebVariant_SetEnabled(false);OBJECTS shot={.ob_type=SHOT};assert(WebVariant_CanCollide(consoleplayer,&shot)&&WebVariant_SpawnProtection()==0);
 puts("Spawn safety: all missions, 100 tick shield, expiry, no landing refresh, three real runway crash/respawn cycles each, stable terrain and normal Classic/terrain collisions verified.");
 return 0;
}
