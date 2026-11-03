/* Browser-only native hooks; vendored SDL Sopwith sources stay intact.
 * GPL-2.0-or-later. */
#include "variant.h"
#include <math.h>
#include "swmain.h"
#include "swmove.h"
#include "swobject.h"
static double flight_speed;
static int throttle,last_flight_tick=-1;
static bool flight_dead,flight_ready;
void WebVariant_MoveXY(OBJECTS *ob,int *x,int *y);
#define gohome WebVariant_GoHome
#define swauto WebVariant_Auto
#define aim WebVariant_Aim
#define swrestart WebVariant_Restart
#define moveplyr WebNative_MovePlayer
#define movexy WebVariant_MoveXY
#define moveshot WebNative_MoveShot
#define moveox WebNative_MoveOx
#define movetarg WebNative_MoveTarget
#define initshot WebVariant_InitShot
#include "../third_party/sdl-sopwith/src/swmove.c"
#undef moveshot
#undef moveox
#undef movetarg
#undef initshot
#undef moveplyr
#undef movexy
#undef swauto
#undef aim
#undef swrestart

void WebVariant_ResetFlight(void){flight_speed=0;throttle=0;last_flight_tick=-1;flight_dead=flight_ready=false;}
int WebVariant_Throttle(void){return WebVariant_IsEnabled()?throttle*100/16:consoleplayer?consoleplayer->ob_accel*100/MAX_THROTTLE:0;}
int WebVariant_Speed(void){return (int)round(flight_speed);}
bool moveplyr(OBJECTS *ob)
{
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&countmove!=last_flight_tick){
        if(countmove<last_flight_tick)WebVariant_ResetFlight();
        if(!flight_ready){flight_speed=ob->ob_athome?0:ob->ob_speed;flight_ready=true;}
        last_flight_tick=countmove;
        flight_dead=PlaneIsKilled(ob->ob_state);
        int command=latest_player_commands[ob->ob_plrnum][countmove%MAX_NET_LAG];
        if(!flight_dead&&ob->ob_endsts==PLAYING){
            if(command&K_ACCEL)throttle=imin(16,throttle+1);
            if(command&K_DEACC)throttle=imax(0,throttle-1);
        }
    }
    bool visible=WebNative_MovePlayer(ob);
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&!ob->ob_home)ob->ob_accel=(throttle+2)/4;
    return visible;
}
void WebVariant_MoveXY(OBJECTS *ob,int *x,int *y)
{
    if(WebVariant_IsEnabled()&&ob==consoleplayer){
        if(flight_dead&&ob->ob_athome&&ob->ob_speed==0)WebVariant_ResetFlight();
        if(ob->ob_endsts==PLAYING&&!ob->ob_home&&!ob->ob_goingsun
            &&(ob->ob_state==FLYING||ob->ob_state==WOUNDED)){
            static const int gravity[]={0,-1,-2,-3,-4,-3,-2,-1,0,1,2,3,4,3,2,1};
            double target=throttle?gminspeed+throttle*.75+gravity[ob->ob_angle%16]*.6:gminspeed-1;
            if(ob->ob_athome&&!throttle)target=0;
            target=fmax(0,fmin(18,target));
            double change=target-flight_speed;
            flight_speed+=fmax(-.28,fmin(.24,change));
            setdxdy(ob,(int)round(flight_speed*COS(ob->ob_angle)),(int)round(flight_speed*SIN(ob->ob_angle)));
            /* Keep native stall checks stable during the slower ground roll. */
            bool runway=ob->ob_y<=ground[clamp_range(0,ob->ob_x+8,(int)currgame->gm_max_x-1)]+26;
            ob->ob_speed=runway&&throttle?imax(gminspeed,(int)round(flight_speed)):(int)round(flight_speed);
        }else{flight_speed=ob->ob_speed;if(ob->ob_home)throttle=clamp_range(0,ob->ob_accel*4,16);}
    }
    movexy(ob,x,y);
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&ob->ob_home&&!ob->ob_athome
        &&ob->ob_endsts==PLAYING&&(ob->ob_state==FLYING||ob->ob_state==WOUNDED)){
        /* Navigation uses coarse 100 ms decisions. Keep its airframe clear of
         * generated ridges and buildings between those decisions. Manual flight
         * and damage from enemy weapons retain their normal collision rules. */
        int clearance=0;
        for(int n=0;n<16;n++)clearance=imax(clearance,ground[clamp_range(0,*x+n,(int)currgame->gm_max_x-1)]+20);
        for(OBJECTS *other=objtop;other;other=other->ob_next)
            if((other->ob_type==TARGET||other->ob_type==OX)&&other->ob_symbol
                &&other->ob_x<*x+16&&other->ob_x+other->ob_symbol->w>*x)clearance=imax(clearance,other->ob_y+20);
        clearance=imin(MAX_Y-8,clearance);
        if(*y<clearance){*y=ob->ob_y=clearance;ob->ob_ly=0;updateobjpos(ob);}
    }
}

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
    int mission=gamenum;
    if(WebVariant_IsEnabled())gamenum=WebVariant_GroundFire()?imax(1,gamenum):0;
    bool visible=WebNative_MoveTarget(ob);
    gamenum=mission;
    /* Native single-player acquisition skips computer aircraft. Give the
     * player's tanks/AA the missing hostile target without changing the
     * native firing cadence or the classic edition's rules. */
    int aggression=target_aggression[ob->ob_orient];
    if(WebVariant_GroundFire()&&ob->ob_state==STANDING&&!ob->ob_firing
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
