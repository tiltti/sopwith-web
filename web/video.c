/* Bounds-safe Rainbow raster adapter. GPL-2.0-or-later.
 * The unchanged upstream raster clips the bottom and sides, but assumes
 * sprites never cross the top. Faster aircraft can violate that assumption. */
#include "variant.h"
#include "video.h"
#define Vid_DispSymbol WebNative_DispSymbol
#define Vid_PlotPixel WebNative_PlotPixel
#define Vid_XorPixel WebNative_XorPixel
#include "../third_party/sdl-sopwith/src/video.c"
#undef Vid_DispSymbol
#undef Vid_PlotPixel
#undef Vid_XorPixel

void Vid_PlotPixel(int x,int y,int colour)
{
    if(WebVariant_IsEnabled()&&(!in_range(0,x,SCR_WDTH-1)||!in_range(0,y,SCR_HGHT-1)))return;
    WebNative_PlotPixel(x,y,colour);
}
void Vid_XorPixel(int x,int y,int colour)
{
    if(WebVariant_IsEnabled()&&(!in_range(0,x,SCR_WDTH-1)||!in_range(0,y,SCR_HGHT-1)))return;
    WebNative_XorPixel(x,y,colour);
}
void Vid_DispSymbol(int x,int y,sopsym_t *symbol,faction_t colour)
{
    if(!WebVariant_IsEnabled()){WebNative_DispSymbol(x,y,symbol,colour);return;}
    if(!symbol||!symbol->data||x>=SCR_WDTH||x+symbol->w<=0||y<0||y-symbol->h+1>=SCR_HGHT)return;
    sopsym_t visible=*symbol;
    int skip=imax(0,y-(SCR_HGHT-1));visible.data+=skip*symbol->w;visible.h-=skip;
    WebNative_DispSymbol(x,imin(y,SCR_HGHT-1),&visible,colour);
}
