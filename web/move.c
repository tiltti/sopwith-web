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
    WebVariant_TargetMask(ob);
    return visible;
}
