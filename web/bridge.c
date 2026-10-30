/*
 * Sopwith Web browser integration, 2026-10-30.
 * Copyright (C) 2026 Sopwith Web contributors.
 * Licensed under GNU GPL version 2 or later; see COPYING.md.
 * The SDL Sopwith game sources remain unchanged.
 */
#include <SDL.h>
#include <emscripten.h>
#include "sw.h"
#include "swmain.h"
#include "video.h"
#include "pcsound.h"
#include "swsound.h"

static bool paused;
static Uint32 paused_at, paused_duration;

EMSCRIPTEN_KEEPALIVE void web_pause(int value)
{
    if ((value != 0) == paused) return;
    if (value) paused_at = SDL_GetTicks();
    else paused_duration += SDL_GetTicks() - paused_at;
    paused = value != 0;
}

int Timer_GetMS(void)
{
    return (int)((paused ? paused_at : SDL_GetTicks()) - paused_duration);
}

void Timer_Sleep(int milliseconds)
{
    emscripten_sleep(milliseconds);
    while (paused) emscripten_sleep(25);
}

void Timer_Init(void)
{
    /* SDL's implicit yields would make palette/input exports asynchronous
     * while the game is already sleeping. Only Timer_Sleep may yield. */
    SDL_SetHint(SDL_HINT_EMSCRIPTEN_ASYNCIFY, "0");
    SDL_SetHint(SDL_HINT_RENDER_VSYNC, "0");
    SDL_Init(SDL_INIT_TIMER);
}

EMSCRIPTEN_KEEPALIVE void web_key(int scancode, int down)
{
    SDL_Event event = {0};
    if (scancode <= SDL_SCANCODE_UNKNOWN || scancode >= SDL_NUM_SCANCODES) return;
    event.type = down ? SDL_KEYDOWN : SDL_KEYUP;
    event.key.state = down ? SDL_PRESSED : SDL_RELEASED;
    event.key.keysym.scancode = scancode;
    event.key.keysym.sym = SDL_GetKeyFromScancode(scancode);
    SDL_PushEvent(&event);
}

EMSCRIPTEN_KEEPALIVE void web_palette(int palette)
{
    if (palette < 0 || palette >= Vid_GetNumVideoPalettes()) return;
    conf_video_palette = palette;
    Vid_SetVideoPalette(palette);
}

EMSCRIPTEN_KEEPALIVE void web_sound(int enabled)
{
    soundflg = enabled != 0;
    if (enabled) Speaker_Init();
    else soundoff();
}

/* Read-only diagnostics also support verifying real gameplay and pause. */
EMSCRIPTEN_KEEPALIVE int web_read(int field)
{
    if (field == 0) return countmove;
    if (field == 6) return SDL_IsTextInputActive();
    if (!consoleplayer) return -1;
    switch (field) {
        case 1: return consoleplayer->ob_x;
        case 2: return consoleplayer->ob_y;
        case 3: return consoleplayer->ob_bombs;
        case 4: return consoleplayer->ob_life;
        case 5: return consoleplayer->ob_state;
        default: return -1;
    }
}
