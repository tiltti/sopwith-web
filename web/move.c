/* Browser-only native hooks; vendored SDL Sopwith sources stay intact.
 * GPL-2.0-or-later. */
#include "variant.h"
#include "trainer.h"
#include <math.h>
#include "swmain.h"
#include "swmove.h"
#include "swobject.h"
static double flight_speed;
static int throttle,last_flight_tick=-1;
static bool flight_dead,flight_ready;
static bool ground_roll;
static int low_speed_ticks;
static bool edge_turn;
static double edge_heading;
static int edge_direction;
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

void WebVariant_ResetFlight(void){flight_speed=0;throttle=0;last_flight_tick=-1;flight_dead=flight_ready=ground_roll=edge_turn=false;low_speed_ticks=0;}
int WebVariant_Throttle(void){return WebVariant_IsEnabled()?throttle*100/16:consoleplayer?consoleplayer->ob_accel*100/MAX_THROTTLE:0;}
int WebVariant_Speed(void){return (int)round(flight_speed);}
int WebVariant_SpeedMilli(void){return (int)round(flight_speed*1000);}
bool WebVariant_IsTaxiing(void){return WebVariant_IsEnabled()&&ground_roll;}
bool WebVariant_IsTurning(void){return WebVariant_IsEnabled()&&edge_turn;}
bool moveplyr(OBJECTS *ob)
{
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&countmove!=last_flight_tick){
        if(countmove<last_flight_tick)WebVariant_ResetFlight();
        if(!flight_ready){ground_roll=ob->ob_athome&&ob->ob_speed==0;flight_speed=ground_roll?0:ob->ob_speed;flight_ready=true;}
        if(ob->ob_athome&&ob->ob_speed==0&&!ground_roll){WebVariant_ResetFlight();flight_ready=ground_roll=true;}
        last_flight_tick=countmove;
        flight_dead=PlaneIsKilled(ob->ob_state);
        int command=latest_player_commands[ob->ob_plrnum][countmove%MAX_NET_LAG];
        if(edge_turn)latest_player_commands[ob->ob_plrnum][countmove%MAX_NET_LAG]&=~(K_FLAPU|K_FLAPD|K_FLIP);
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
            /* At idle a descent trades altitude for airspeed. The old idle
             * target stayed below stall even in a vertical dive, and its
             * separate power branch would make a tiny throttle increase
             * reduce speed. Blend both continuously; retain full-power pace. */
            double power=throttle/16.0,g=gravity[ob->ob_angle%16];
            double target=ground_roll?throttle:2.8+13.2*power+g*(g>0?2.0-1.3*power:.7);
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
                if(low_speed_ticks>=6&&!edge_turn){stallpln(ob);flight_speed=0;low_speed_ticks=0;}
            }
            if(ob->ob_state==STALLED||ob->ob_state==WOUNDSTALL){movexy(ob,x,y);return;}
            setdxdy(ob,(int)round(flight_speed*COS(ob->ob_angle)),(int)round(flight_speed*SIN(ob->ob_angle)));
            ob->ob_speed=ground_roll?imax(gminspeed,(int)round(flight_speed)):(int)round(flight_speed);
        }else{flight_speed=ob->ob_speed;if(ob->ob_home)throttle=clamp_range(0,ob->ob_accel*4,16);}
    }
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&!ob->ob_home&&!ground_roll&&ob->ob_endsts==PLAYING&&PlaneIsFlying(ob->ob_state)){
        int width=currgame->gm_max_x;
        if(!edge_turn&&((ob->ob_x<110&&ob->ob_dx<0)||(ob->ob_x>width-126&&ob->ob_dx>0))){
            edge_turn=true;edge_direction=ob->ob_dx>0?1:-1;edge_heading=edge_direction>0?0:M_PI;
        }
        if(edge_turn){
            edge_heading+=edge_direction*.26;
            double progress=edge_direction>0?edge_heading:M_PI-edge_heading;
            if(progress>=M_PI){edge_heading=edge_direction>0?M_PI:0;edge_turn=false;}
            flight_speed=fmax(6,flight_speed);low_speed_ticks=0;
            ob->ob_angle=((int)round(edge_heading*8/M_PI)+16)%16;ob->ob_orient=cos(edge_heading)<0;
            setdxdy(ob,(int)round(flight_speed*cos(edge_heading)*256),(int)round(flight_speed*sin(edge_heading)*256));
            ob->ob_speed=(int)round(flight_speed);
            if(ob->ob_orient){int a=(16-ob->ob_angle)%16;ob->ob_symbol=&symbol_plane[a%4].sym[4+a/4];}
            else ob->ob_symbol=&symbol_plane[ob->ob_angle%4].sym[ob->ob_angle/4];
        }
    }else if(ob==consoleplayer)edge_turn=false;
    movexy(ob,x,y);
    if(WebVariant_IsEnabled()&&ob==consoleplayer&&edge_turn&&*y>188){*y=ob->ob_y=188;ob->ob_ly=0;}
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

/* The escort uses a bounded continuous pursuit controller at the native
 * 10 Hz tick. Movement/projectiles still enter the native collision lists;
 * disabled aircraft immediately hand back to Sopwith's falling/crash code. */
static bool escort_enabled;
static OBJECTS *escort;
static original_ob_t escort_origin;
static int escort_status,escort_delay=-1,escort_grounded,escort_tick=-1;
static double escort_heading,escort_speed;

void WebWingman_ResetLevel(void)
{
    escort=NULL;escort_status=0;escort_delay=-1;escort_grounded=0;
    escort_tick=-1;escort_heading=escort_speed=0;
}
void WebWingman_Configure(bool value){escort_enabled=value&&WebVariant_IsEnabled();WebWingman_ResetLevel();}
bool WebWingman_Is(const OBJECTS *ob){return escort_enabled&&ob&&ob==escort;}
int WebWingman_Status(void){return escort_enabled?escort_status:0;}
static double escort_angle(double value){while(value>M_PI)value-=2*M_PI;while(value<-M_PI)value+=2*M_PI;return value;}
static void escort_park(OBJECTS *ob)
{
    initpln(ob,&escort_origin);ob->ob_faction=consoleplayer->ob_faction;ob->ob_clr=ob->ob_faction;
    ob->ob_state=FLYING;ob->ob_endsts=PLAYING;ob->ob_owner=ob;
    ob->ob_bombs=ob->ob_missiles=ob->ob_bursts=0;ob->ob_rounds=MAXROUNDS;ob->ob_life=MAXFUEL;
    escort_heading=ob->ob_orient?M_PI:0;escort_speed=0;escort_delay=-1;escort_status=1;
}
static bool move_escort(OBJECTS *ob)
{
    OBJECTS *leader=consoleplayer,*target=NULL;
    compplane=true;plyrplane=false;ob->ob_firing=NULL;ob->ob_target=NULL;
    ob->ob_bombing=ob->ob_bfiring=false;ob->ob_mfiring=NULL;
    if(leader->ob_athome)++escort_grounded;else escort_grounded=0;
    if(PlaneIsKilled(ob->ob_state)){
        escort_status=6;
        /* A fresh player aircraft/refuelling visit restores the escort too.
         * There is no mid-air teleport or endless autonomous respawn. */
        if(ob->ob_state==CRASHED&&leader->ob_athome&&leader->ob_endsts==PLAYING&&escort_grounded>10){escort_park(ob);return true;}
        return movepln(ob);
    }
    bool returning=leader->ob_home||leader->ob_athome||PlaneIsKilled(leader->ob_state)||leader->ob_endsts!=PLAYING||ob->ob_life<1500||ob->ob_rounds<=0;
    if(ob->ob_athome){
        escort_status=1;refuel(ob);
        if(returning){escort_delay=-1;return true;}
        if(leader->ob_y-ground[clamp_range(0,leader->ob_x+8,(int)currgame->gm_max_x-1)]<22)return true;
        if(escort_delay<0)escort_delay=countmove+8;
        if(countmove<escort_delay)return true;
        ob->ob_athome=false;escort_status=2;escort_speed=0;
    }
    int width=(int)currgame->gm_max_x;
    int direction=leader->ob_dx<0?-1:leader->ob_dx>0?1:COS(leader->ob_angle)<0?-1:1;
    double tx=leader->ob_x-direction*48,ty=leader->ob_y+18;
    double vx=leader->ob_dx,vy=leader->ob_dy;
    if(returning){tx=escort_origin.x;ty=ob->ob_orig_y+3;vx=vy=0;escort_status=5;}
    else {
        escort_status=escort_status==2&&escort_speed<6?2:3;
        int closest=160*160;
        for(OBJECTS *other=objtop;other;other=other->ob_next){
            if(other->ob_type!=PLANE||other==ob||other->ob_faction==ob->ob_faction||other->ob_state==FINISHED||other->ob_state==WAITING||PlaneIsKilled(other->ob_state)||other->ob_endsts!=PLAYING)continue;
            int dx=other->ob_x-leader->ob_x,dy=other->ob_y-leader->ob_y,d=dx*dx+dy*dy;
            if(d<closest&&abs(other->ob_x-ob->ob_x)<180){closest=d;target=other;}
        }
        if(target){tx=target->ob_x+target->ob_dx*3;ty=target->ob_y+target->ob_dy*3;vx=vy=0;escort_status=4;}
    }
    tx=fmax(8,fmin(width-24,tx));ty=fmax(24,fmin(187,ty));
    double wantx=vx+(tx-ob->ob_x)*.12,wanty=vy+(ty-ob->ob_y)*.12;
    int look=(wantx<0?-1:1),clearance=0;
    for(int ahead=0;ahead<=150;ahead+=5){int x=clamp_range(0,ob->ob_x+8+look*ahead,width-1);clearance=imax(clearance,ground[x]+25);}
    for(OBJECTS *other=objtop;other;other=other->ob_next)
        if(other->ob_type==TARGET&&other->ob_state==STANDING&&other->ob_x<ob->ob_x+160&&other->ob_x+other->ob_symbol->w>ob->ob_x-150)clearance=imax(clearance,other->ob_y+23);
    /* Near its runway, descend toward the fixed original parking spot. */
    bool landing=returning&&abs(ob->ob_x-escort_origin.x)<55;
    if(!landing)wanty=fmax(wanty,(fmin(188,clearance)-ob->ob_y)*.16);
    if(ob->ob_y>182)wanty=fmin(wanty,-1.5-(ob->ob_y-182)*.35);
    if(landing&&abs(ob->ob_x-escort_origin.x)<12&&abs(ob->ob_y-ob->ob_orig_y)<14){escort_park(ob);return true;}
    double desired=atan2(wanty,wantx),turn=escort_angle(desired-escort_heading);
    escort_heading=escort_angle(escort_heading+fmax(-.22,fmin(.22,turn)));
    double limit=fmax(7,fmin(22,leader->ob_speed+3+hypot(tx-ob->ob_x,ty-ob->ob_y)*.05)),speed=fmax(5.5,fmin(limit,hypot(wantx,wanty)));
    if(escort_status==2)speed=6.5;
    escort_speed+=fmax(-.35,fmin(escort_status==2?.65:.45,speed-escort_speed));
    /* A short ground roll, then rotate; do not jump straight into formation. */
    bool taxi=escort_status==2&&escort_speed<5.5;
    if(taxi)escort_heading=escort_origin.orient?M_PI:0;
    ob->ob_angle=((int)round(escort_heading*8/M_PI)+16)%16;ob->ob_orient=cos(escort_heading)<0;
    if(ob->ob_orient){int a=(16-ob->ob_angle)%16;ob->ob_symbol=&symbol_plane[a%4].sym[4+a/4];}
    else ob->ob_symbol=&symbol_plane[ob->ob_angle%4].sym[ob->ob_angle/4];
    ob->ob_speed=(int)round(escort_speed);ob->ob_flaps=0;
    setdxdy(ob,(int)round(cos(escort_heading)*escort_speed*256),(int)round(sin(escort_heading)*escort_speed*256));
    int x,y;movexy(ob,&x,&y);ob->ob_x=clamp_range(0,x,width-17);
    if(ob->ob_y>191){ob->ob_y=191;ob->ob_ly=0;}
    if(taxi){ob->ob_y=ground[ob->ob_x+8]+16;ob->ob_ly=0;}
    ob->ob_life-=ob->ob_speed;ob->ob_drwflg=ob->ob_onmap=true;updateobjpos(ob);
    if(target&&ob->ob_rounds>0&&countmove%4==0){
        double angle=atan2(target->ob_y+target->ob_dy*2-ob->ob_y,target->ob_x+target->ob_dx*2-ob->ob_x);
        if(hypot(target->ob_x-ob->ob_x,target->ob_y-ob->ob_y)<110&&fabs(escort_angle(angle-ob->ob_angle*M_PI/8))<.18){WebVariant_InitShot(ob,NULL);ob->ob_firing=target;}
    }
    /* Hostile pilots can acquire the escort, rather than always ignoring it. */
    for(OBJECTS *other=objtop;other;other=other->ob_next)
        if(other->ob_type==PLANE&&other->ob_faction!=ob->ob_faction&&other->ob_movef==movecomp&&abs(other->ob_x-ob->ob_x)<130
            &&(!other->ob_target||abs(other->ob_target->ob_x-other->ob_x)>abs(ob->ob_x-other->ob_x)))other->ob_target=ob;
    return true;
}
void WebWingman_Apply(OBJECTS *player)
{
    if(!escort_enabled||!player||!currgame||!ground)return;
    if(countmove==escort_tick)return;escort_tick=countmove;
    if(!escort&&num_planes<MAX_PLANES){
        escort_origin=*player->ob_original_ob;
        escort_origin.x=clamp_range(25,escort_origin.x+(escort_origin.orient?32:-32),(int)currgame->gm_max_x-45);
        escort_origin.faction=player->ob_faction;
        escort=initpln(NULL,&escort_origin);escort->ob_movef=move_escort;escort_park(escort);escort->ob_drwflg=true;
    }
    if(escort&&WebTrainer_IsEnabled()){escort->ob_life=MAXFUEL;escort->ob_rounds=MAXROUNDS;}
}
