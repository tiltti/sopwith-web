/* Browser-only native hooks; vendored SDL Sopwith sources stay intact.
 * GPL-2.0-or-later. */
#include "variant.h"
#define gohome WebVariant_GoHome
#define moveshot WebNative_MoveShot
#include "../third_party/sdl-sopwith/src/swmove.c"
#undef moveshot

bool moveshot(OBJECTS *ob)
{
    bool visible = WebNative_MoveShot(ob);
    /* deallobj defers recycling until the next native step. Its final
     * coordinates remain available for a purely visual/audio shell burst. */
    if (!visible) WebVariant_ShellImpact(ob);
    return visible;
}
