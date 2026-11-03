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
        else {
            OBJECTS *victim=killed[i];
            bool crater_hit=!killer[i]&&(victim->ob_type==BOMB||victim->ob_type==MISSILE
                ||(victim->ob_type==PLANE&&victim->ob_state!=CRASHED&&victim->ob_endsts!=WINNER
                    &&(victim->ob_state==FALLING||victim->ob_state<FINISHED)));
            int left=0;GRNDTYPE before[8]={0};
            if(crater_hit){left=victim->ob_x+(victim->ob_symbol->w-8)/2;
                for(int n=0;n<8;n++)if(left+n>=0&&left+n<(int)currgame->gm_max_x)before[n]=ground[left+n];}
            swkill(victim,killer[i]);
            /* Native crater floors refer to the original DOS landscape.
             * Replace that terrain write using this mission's real surface. */
            if(crater_hit)WebVariant_Crater(left,before);
        }
    }
    for(int i=0;i<collptr;i++){collsno[i]->ob_dx=collsdx[i];collsno[i]->ob_dy=collsdy[i];}
}
