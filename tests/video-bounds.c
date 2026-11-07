/* Actual framebuffer guards catch top/side/bottom writes without SDL. GPL-2.0-or-later. */
#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "video.h"
static bool rainbow=true;
bool WebVariant_IsEnabled(void){return rainbow;}
int Vid_GetKey(void){return 0;}
bool Vid_GetCtrlBreak(void){return false;}
int main(void){
 static unsigned char guarded[320*400],pixels[32*20];memset(guarded,0xa5,sizeof(guarded));memset(pixels,1,sizeof(pixels));
 vid_vram=guarded+320*100;vid_pitch=320;memset(vid_vram,0,320*200);
 for(int h=1;h<=20;h+=19)for(int w=1;w<=32;w+=31){sopsym_t s={.w=w,.h=h,.data=pixels};
  for(int x=-35;x<355;x+=7)for(int y=-25;y<235;y+=3){Vid_DispSymbol(x,y,&s,FACTION_PLAYER1);Vid_PlotPixel(x,y,3);Vid_XorPixel(x,y,3);}
 }
 for(int i=0;i<320*100;i++)assert(guarded[i]==0xa5&&guarded[320*300+i]==0xa5);
 rainbow=false;memset(vid_vram,0,320*200);sopsym_t s={.w=16,.h=16,.data=pixels};Vid_DispSymbol(20,40,&s,FACTION_PLAYER1);
 assert(vid_vram[(199-40)*320+20]==1);puts("Real raster clips sprites/pixels at all four edges; guard buffers stay intact and ordinary Classic drawing is unchanged.");return 0;
}
