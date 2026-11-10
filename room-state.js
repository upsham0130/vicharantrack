import {validDay} from './src/validation.js';
import {IDLE_MS} from './src/journey.js';
export function currentRoom(state,now=Date.now()){return state?.expiresAt&&now>=state.expiresAt?null:state;}
export function updateRoom(current,body,records,now=Date.now()) {
 current=currentRoom(current,now);const {action}=body;
 if(action==='reset')return null;
 const refresh=state=>({...state,expiresAt:now+IDLE_MS});
 if(action){
  if(action==='touch')return current?refresh(current):null;
  if(!current?.month)throw new Error('Enter a birthday first.');
  if(action==='zoom'){if(body.delta!==1&&body.delta!==-1)throw new Error('Choose zoom in or zoom out.');return refresh({...current,mapZoom:Math.max(2,Math.min(14,(current.mapZoom??4)+body.delta))})}
  if(action==='fit')return refresh({...current,mapZoom:null});
  if(action==='select'){
   const record=records.find(r=>r.source===body.source&&r.month===current.month&&r.day===current.day);
   if(!record)throw new Error('Choose a year from this birthday.');
   return refresh({...current,autoSource:record.source,playbackStartedAt:now,selectedSource:null,selectedYear:record.year,paused:false});
  }
  if(action==='play')return refresh({...current,paused:false,autoSource:current.selectedSource||current.autoSource||null,playbackStartedAt:now,selectedSource:null,selectedYear:null});
  if(action==='pause'){const record=records.find(r=>r.source===body.source&&r.month===current.month&&r.day===current.day);return refresh({...current,paused:true,selectedSource:record?.source||current.selectedSource,selectedYear:record?.year||current.selectedYear})}
  throw new Error('Unknown action.');
 }
 if(!validDay(+body.month,+body.day))throw new Error('Choose a valid birthday.');
 return refresh({month:+body.month,day:+body.day,id:now,mapZoom:null,paused:false,selectedSource:null,autoSource:null,playbackStartedAt:now});
}
