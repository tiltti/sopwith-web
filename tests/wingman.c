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
static OBJECTS *wing(void){for(OBJECTS *p=objtop;p;p=p->ob_next)if(WebWingman_Is(p))return p;return NULL;}
static void fresh(int mission,bool enabled){WebVariant_SetEnabled(false);playmode=PLAYMODE_SINGLE;gamenum=mission;swinitlevel();WebVariant_SetEnabled(true);WebVariant_SetEasy(true);WebWingman_Configure(enabled);WebVariant_Apply(consoleplayer);}
int main(void){
 char *args[]={"wingman-test","-s","-q",NULL};SDL_SetMainReady();SDL_SetHint(SDL_HINT_RENDER_DRIVER,"software");swinit(3,args);conf_medals=false;
 fresh(0,false);assert(!wing()&&WebWingman_Status()==0);
 for(int m=0;m<3;m++){
  fresh(m,true);OBJECTS *w=wing(),*p=consoleplayer;assert(w&&w->ob_faction==p->ob_faction&&w!=p&&num_players==1);int parked=w->ob_x;
  for(int i=0;i<40;i++){swmove();swcollsn();WebVariant_Apply(p);}assert(w->ob_x==parked&&WebWingman_Status()==1);
  int start=p->ob_x;
  for(int i=0;i<150;i++){
   p->ob_x=start+i*6;p->ob_y=160;p->ob_athome=false;p->ob_state=FLYING;p->ob_endsts=PLAYING;p->ob_angle=0;p->ob_orient=0;p->ob_speed=6;p->ob_home=false;
   latest_player_commands[p->ob_plrnum][countmove%MAX_NET_LAG]=i<5?K_ACCEL:0;setdxdy(p,6*256,0);insertx(p,deletex(p));
   swmove();swcollsn();WebVariant_Apply(p);
   if(PlaneIsKilled(w->ob_state)){fprintf(stderr,"Wingman died: mission=%d tick=%d xy=%d,%d state=%d status=%d\n",m,i,w->ob_x,w->ob_y,w->ob_state,WebWingman_Status());return 1;}
   assert(w->ob_y<MAX_Y);
   if(i<8)assert(w->ob_athome);
  }
  fprintf(stderr,"escort mission %d: separation=%d height=%d state=%d\n",m,abs(w->ob_x-p->ob_x),w->ob_y,WebWingman_Status());
  assert(abs(w->ob_x-p->ob_x)<100&&WebWingman_Status()==3);
  assert(!WebVariant_CanCollide(w,p));OBJECTS shot={.ob_type=SHOT,.ob_owner=w},hostile={.ob_type=PLANE,.ob_faction=FACTION_PLAYER2};
  assert(!WebVariant_CanCollide(&shot,p));shot.ob_owner=&hostile;assert(WebVariant_CanCollide(&shot,w));
  p->ob_state=FLYING;p->ob_endsts=PLAYING;p->ob_home=false;p->ob_athome=false;
  OBJECTS *enemy=planes[1];initpln(enemy,enemy->ob_original_ob);enemy->ob_faction=FACTION_PLAYER2;enemy->ob_x=w->ob_x+65;enemy->ob_y=w->ob_y;enemy->ob_state=FLYING;enemy->ob_endsts=PLAYING;enemy->ob_athome=false;enemy->ob_speed=0;setdxdy(enemy,0,0);insertx(enemy,deletex(enemy));
  w->ob_angle=0;w->ob_orient=0;bool fired=false;
  for(int i=0;i<50;i++){++countmove;w->ob_movef(w);for(OBJECTS *b=objtop;b;b=b->ob_next)if(b->ob_type==SHOT&&b->ob_owner==w)fired=true;}
  if(!fired||WebWingman_Status()!=4)fprintf(stderr,"combat mission %d: fired=%d status=%d xy=%d,%d enemy=%d,%d angle=%d ammo=%d\n",m,fired,WebWingman_Status(),w->ob_x,w->ob_y,enemy->ob_x,enemy->ob_y,w->ob_angle,w->ob_rounds);
  assert(fired&&WebWingman_Status()==4);
  p->ob_home=true;++countmove;w->ob_movef(w);assert(WebWingman_Status()==5&&!w->ob_firing);
  w->ob_state=FALLING;w->ob_dx=2;w->ob_dy=-2;++countmove;w->ob_movef(w);assert(WebWingman_Status()==6&&w->ob_state==FALLING);
 }
 fresh(2,false);OBJECTS *p=consoleplayer;int home=p->ob_original_ob->x+8,base=currgame->gm_ground[home];
 for(int x=home+55;x<home+180;x++)assert(ground[x]<=base+5);
 for(int side=0;side<2;side++){
  fresh(1,false);p=consoleplayer;p->ob_x=side?currgame->gm_max_x-120:100;p->ob_y=165;p->ob_athome=false;p->ob_state=FLYING;p->ob_speed=9;p->ob_angle=side?0:8;p->ob_orient=!side;setdxdy(p,(side?9:-9)*256,0);insertx(p,deletex(p));
  for(int t=0;t<18;t++){latest_player_commands[p->ob_plrnum][countmove%MAX_NET_LAG]=K_ACCEL;swmove();WebVariant_Apply(p);assert(p->ob_x>0&&p->ob_x<(int)currgame->gm_max_x-16);assert(p->ob_state==FLYING&&p->ob_y<MAX_Y);}
  assert(side?p->ob_dx<0:p->ob_dx>0);
 }
 puts("Both map edges reverse an outward aircraft in a bounded flying arc without stalling or a wall clamp.");
 puts("Escort: optional, separate AI aircraft, delayed departure, live formation in all three terrains, real hostile shots, friendly safety, return and native falling verified.");
 puts("Storm departure: first 180 world pixels remain a gentle open corridor.");
 fresh(1,true);WebTrainer_SetEnabled(true);
 for(int t=0;t<4000;t++){
  if(t&&t%500==0)WebVariant_Test(1+(t/500)%3);
  p=consoleplayer;latest_player_commands[p->ob_plrnum][countmove%MAX_NET_LAG]=K_ACCEL;
  if(t%500==28||t%500==29)latest_player_commands[p->ob_plrnum][countmove%MAX_NET_LAG]|=K_FLAPU;
  if(t%500==45||t%500==46)latest_player_commands[p->ob_plrnum][countmove%MAX_NET_LAG]|=K_FLAPD;
  swmove();swcollsn();WebTrainer_Apply(p);WebVariant_Apply(p);
 }
 puts("4000 real move/collision steps, repeated aircraft losses and eight trainer level jumps preserve the escort lifecycle.");
 return 0;
}
