/* Rainbow collision extensions; original collision resolution stays vendored.
 * Collision traversal derived from David L. Clark / Simon Howard's swcollsn.c.
 * GPL-2.0-or-later. */
#include "variant.h"
#define swcollsn WebNative_CollisionStep
#include "../third_party/sdl-sopwith/src/swcollsn.c"
#undef swcollsn

static void bounded_ground_test(OBJECTS *ob)
{
    const sopsym_t *symbol=ob->ob_symbol;
    for(int x=0;x<symbol->w;x++){
        int world_x=ob->ob_x+x;
        if(world_x<0||world_x>=(int)currgame->gm_max_x)continue;
        int y=ob->ob_y-ground[world_x];
        if(y>=symbol->h)continue;
        if(y<0||symbol->data[y*symbol->w+x]){
            if(killptr<2*MAX_OBJS){killed[killptr]=ob;killer[killptr++]=NULL;}
            return;
        }
    }
}

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
        if((ob->ob_type==PLANE&&ob->ob_state!=FINISHED&&ob->ob_state!=WAITING&&ob->ob_y<ground[clamp_range(0,ob->ob_x+8,(int)currgame->gm_max_x-1)]+24)
            ||((ob->ob_type==BOMB||ob->ob_type==MISSILE)&&ob->ob_y<ground[clamp_range(0,ob->ob_x+4,(int)currgame->gm_max_x-1)]+12))bounded_ground_test(ob);
    }
    for(int i=0;i<killptr;i++){
        if(WebVariant_ObjectKind(killed[i])==21)WebVariant_PilotHit(killed[i],killer[i]);
        else {
            OBJECTS *victim=killed[i];
            if(WebVariant_TargetSurvives(victim,killer[i]))continue;
            bool crater_hit=!killer[i]&&(victim->ob_type==BOMB||victim->ob_type==MISSILE
                ||(victim->ob_type==PLANE&&victim->ob_state!=CRASHED&&victim->ob_endsts!=WINNER
                    &&(victim->ob_state==FALLING||victim->ob_state<FINISHED)));
            int left=0,original_x=victim->ob_x;GRNDTYPE before[8]={0};
            if(crater_hit){
                /* The native crater always touches eight columns. Shift its
                 * centre inward at a world edge before calling that code;
                 * correcting the terrain afterwards cannot undo an overrun. */
                int offset=(victim->ob_symbol->w-8)/2;
                victim->ob_x=clamp_range(-offset,original_x,(int)currgame->gm_max_x-8-offset);
                updateobjpos(victim);left=victim->ob_x+offset;
                for(int n=0;n<8;n++)before[n]=ground[left+n];
            }
            swkill(victim,killer[i]);
            /* Native crater floors refer to the original DOS landscape.
             * Replace that terrain write using this mission's real surface. */
            if(crater_hit){WebVariant_Crater(left,before);victim->ob_x=original_x;updateobjpos(victim);}
        }
    }
    for(int i=0;i<collptr;i++){collsno[i]->ob_dx=collsdx[i];collsno[i]->ob_dy=collsdy[i];}
}
