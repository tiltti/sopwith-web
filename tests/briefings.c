/* Export genuine native mission profiles for the briefing chart. GPL-2.0-or-later. */
#include <SDL.h>
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "sw.h"
#include "swinit.h"
#include "swmain.h"
#include "variant.h"
char *Vid_GetPrefPath(void){return strdup(WEB_TEST_PREF_PATH);}
int main(void){
 char *args[]={"briefings","-s","-q",NULL};SDL_SetMainReady();SDL_SetHint(SDL_HINT_RENDER_DRIVER,"software");swinit(3,args);conf_medals=false;
 FILE *out=fopen(WEB_TEST_PREF_PATH "briefings.json","w");assert(out);fputs("{\"version\":1,\"missions\":[",out);
 for(int m=0;m<3;m++){
  WebVariant_SetEnabled(false);playmode=PLAYMODE_SINGLE;gamenum=m;swinitlevel();WebVariant_SetEnabled(true);WebVariant_Apply(consoleplayer);
  int width=currgame->gm_max_x;fprintf(out,"%s{\"width\":%d,\"home\":%d,\"ground\":[",m?",":"",width,consoleplayer->ob_original_ob->x);
  for(int i=0;i<100;i++)fprintf(out,"%s%d",i?",":"",ground[i*(width-1)/99]);fputs("],\"targets\":[",out);int count=0;
  for(OBJECTS *ob=objtop;ob;ob=ob->ob_next)if(ob->ob_type==TARGET&&ob->ob_state==STANDING&&ob->ob_faction==FACTION_PLAYER2){
   fprintf(out,"%s[%d,%d,%d]",count++?",":"",ob->ob_x,ob->ob_y,WebVariant_ObjectKind(ob));
  }fputs("]}",out);
 }fputs("]}\n",out);fclose(out);puts("Three native terrain profiles, airfield positions and hostile target positions exported.");return 0;
}
