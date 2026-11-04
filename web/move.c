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
static bool ground_roll;
static int low_speed_ticks;
#define TAKEOFF_SPEED 5.4
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

void WebVariant_ResetFlight(void){flight_speed=0;throttle=0;last_flight_tick=-1;flight_dead=flight_ready=ground_roll=false;low_speed_ticks=0;}
int WebVariant_Throttle(void){return WebVariant_IsEnabled()?throttle*100/16:consoleplayer?consoleplayer->ob_accel*100/MAX_THROTTLE:0;}
int WebVariant_Speed(void){return (int)round(flight_speed);}
bool WebVariant_IsTaxiing(void){return WebVariant_IsEnabled()&&ground_roll;}
bool moveplyr(OBJECTS *ob)
{
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&countmove!=last_flight_tick){
        if(countmove<last_flight_tick)WebVariant_ResetFlight();
        if(!flight_ready){ground_roll=ob->ob_athome&&ob->ob_speed==0;flight_speed=ground_roll?0:ob->ob_speed;flight_ready=true;}
        if(ob->ob_athome&&ob->ob_speed==0&&!ground_roll){WebVariant_ResetFlight();flight_ready=ground_roll=true;}
        last_flight_tick=countmove;
        flight_dead=PlaneIsKilled(ob->ob_state);
        int command=latest_player_commands[ob->ob_plrnum][countmove%MAX_NET_LAG];
        if(!flight_dead&&ob->ob_endsts==PLAYING){
            if(command&K_ACCEL)throttle=imin(16,throttle+1);
            if(command&K_DEACC)throttle=imax(0,throttle-1);
        }
        if(ground_roll&&!ob->ob_home){
            /* Elevator input cannot launch a parked or slowly taxiing plane. */
            if(flight_speed<TAKEOFF_SPEED)latest_player_commands[ob->ob_plrnum][countmove%MAX_NET_LAG]&=~(K_FLAPU|K_FLAPD);
            ob->ob_speed=imax(gminspeed,(int)round(flight_speed));
        }
    }
    bool visible=WebNative_MovePlayer(ob);
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&!ob->ob_home)ob->ob_accel=(throttle+2)/4;
    return visible;
}
void WebVariant_MoveXY(OBJECTS *ob,int *x,int *y)
{
    int taxi_floor=WebVariant_IsEnabled()&&ground&&currgame?ground[clamp_range(0,ob->ob_x+8,(int)currgame->gm_max_x-1)]:0;
    if(WebVariant_IsEnabled()&&ob==consoleplayer){
        if(ob->ob_athome&&ob->ob_speed==0&&(!ground_roll||flight_dead)){WebVariant_ResetFlight();flight_ready=ground_roll=true;}
        if(ob->ob_endsts==PLAYING&&!ob->ob_home&&!ob->ob_goingsun
            &&(ob->ob_state==FLYING||ob->ob_state==WOUNDED)){
            static const int gravity[]={0,-1,-2,-3,-4,-3,-2,-1,0,1,2,3,4,3,2,1};
            double target=ground_roll?throttle:throttle?2+throttle*.875+gravity[ob->ob_angle%16]*.7:1.2+gravity[ob->ob_angle%16]*.65;
            target=fmax(0,fmin(18,target));
            double change=target-flight_speed;
            flight_speed+=fmax(-.28,fmin(.24,change));
            if(ground_roll&&flight_speed>=TAKEOFF_SPEED&&SIN(ob->ob_angle)>0)ground_roll=false;
            if(ground_roll){
                ob->ob_angle=ob->ob_orient?8:0;
                ob->ob_symbol=&symbol_plane[0].sym[ob->ob_orient?4:0];
                ob->ob_athome=flight_speed<.05;
            }else{
                double climbing=fmax(0,SIN(ob->ob_angle)/256.0);
                double minimum=4.6+2.8*climbing+(ob->ob_state==WOUNDED?.4:0);
                low_speed_ticks=flight_speed<minimum?low_speed_ticks+1:0;
                if(low_speed_ticks>=6){stallpln(ob);flight_speed=0;low_speed_ticks=0;}
            }
            if(ob->ob_state==STALLED||ob->ob_state==WOUNDSTALL){movexy(ob,x,y);return;}
            setdxdy(ob,(int)round(flight_speed*COS(ob->ob_angle)),(int)round(flight_speed*SIN(ob->ob_angle)));
            ob->ob_speed=ground_roll?imax(gminspeed,(int)round(flight_speed)):(int)round(flight_speed);
        }else{flight_speed=ob->ob_speed;if(ob->ob_home)throttle=clamp_range(0,ob->ob_accel*4,16);}
    }
    movexy(ob,x,y);
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&ground_roll&&!ob->ob_home&&ob->ob_endsts==PLAYING&&ob->ob_state==FLYING){
        int floor=ground[clamp_range(0,*x+8,(int)currgame->gm_max_x-1)];
        if(abs(floor-taxi_floor)>3||abs(*x-ob->ob_original_ob->x)>95){ground_roll=false;ob->ob_athome=false;if(flight_speed<TAKEOFF_SPEED){stallpln(ob);flight_speed=0;}}
        else {*y=ob->ob_y=floor+16;ob->ob_ly=0;updateobjpos(ob);}
    }
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
