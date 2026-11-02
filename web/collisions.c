/* Rainbow collision extensions; original collision resolution stays vendored.
 * Collision traversal derived from David L. Clark / Simon Howard's swcollsn.c.
 * GPL-2.0-or-later. */
#include "variant.h"
#define swcollsn WebNative_CollisionStep
#include "../third_party/sdl-sopwith/src/swcollsn.c"
#undef swcollsn

void swcollsn(void)
{
    if(!WebVariant_IsEnabled()){WebNative_CollisionStep();return;}
    OBJECTS *ob,*other;
    collptr=killptr=0;collxadj=(countmove&1)?-2:2;collyadj=(countmove&1)?-1:1;
    /* Keep native sorted broad phase, masks, terrain and deferred resolution.
     * The edition filters safe bomb separation and resolves real pilots. */
    for(ob=topobj.ob_xnext;ob!=&botobj;ob=ob->ob_xnext){
        int xmax=ob->ob_x+ob->ob_symbol->w-1,ymax=ob->ob_y,ymin=ymax-ob->ob_symbol->h+1;
        for(other=ob->ob_xnext;other!=&botobj&&other->ob_x<=xmax;other=other->ob_xnext){
            if(other->ob_y<ymin||other->ob_y-other->ob_symbol->h+1>ymax
                ||!WebVariant_CanCollide(ob,other)||!CollisionTest(ob,other)||killptr>=2*MAX_OBJS-1)continue;
            killed[killptr]=ob;killer[killptr++]=other;
            killed[killptr]=other;killer[killptr++]=ob;
        }
        if((ob->ob_type==PLANE&&ob->ob_state!=FINISHED&&ob->ob_state!=WAITING&&ob->ob_y<ground[ob->ob_x+8]+24)
            ||((ob->ob_type==BOMB||ob->ob_type==MISSILE)&&ob->ob_y<ground[ob->ob_x+4]+12))tstcrash(ob);
    }
    for(int i=0;i<killptr;i++){
        if(WebVariant_ObjectKind(killed[i])==21)WebVariant_PilotHit(killed[i],killer[i]);
        else swkill(killed[i],killer[i]);
    }
    for(int i=0;i<collptr;i++){collsno[i]->ob_dx=collsdx[i];collsno[i]->ob_dy=collsdy[i];}
}
