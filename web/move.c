/* Browser-only native hooks; vendored SDL Sopwith sources stay intact.
 * GPL-2.0-or-later. */
#include "variant.h"
#define gohome WebVariant_GoHome
#define moveshot WebNative_MoveShot
#define moveox WebNative_MoveOx
#define movetarg WebNative_MoveTarget
#define initshot WebVariant_InitShot
#include "../third_party/sdl-sopwith/src/swmove.c"
#undef moveshot
#undef moveox
#undef movetarg
#undef initshot

bool moveshot(OBJECTS *ob)
{
    bool visible = WebNative_MoveShot(ob);
    /* deallobj defers recycling until the next native step. Its final
     * coordinates remain available for a purely visual/audio shell burst. */
    if (!visible) WebVariant_ShellImpact(ob);
    return visible;
}

bool moveox(OBJECTS *ob)
{
    bool visible=WebNative_MoveOx(ob);
    WebVariant_CowMask(ob);
    return visible;
}

bool movetarg(OBJECTS *ob)
{
    bool visible=WebNative_MoveTarget(ob);
    /* Native single-player acquisition skips computer aircraft. Give the
     * player's tanks/AA the missing hostile target without changing the
     * native firing cadence or the classic edition's rules. */
    int aggression=target_aggression[ob->ob_orient];
    if(WebVariant_IsEnabled()&&ob->ob_state==STANDING&&!ob->ob_firing&&gamenum>0
        &&aggression>0&&(gamenum>1||countmove%aggression==aggression-1)
        &&(ob->ob_orient==TARGET_TANK||WebVariant_ObjectKind(ob)==20)){
        for(OBJECTS *plane=objtop;plane;plane=plane->ob_next){
            if(plane->ob_type!=PLANE||plane->ob_faction==ob->ob_faction||PlaneIsKilled(plane->ob_state))continue;
            int distance=range(ob->ob_x,ob->ob_y,plane->ob_x,plane->ob_y);
            if(in_range(1,distance,targrnge-1)){WebVariant_InitShot(ob,plane);ob->ob_firing=plane;break;}
        }
    }
    WebVariant_TargetMask(ob);
    return visible;
}
