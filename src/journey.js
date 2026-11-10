export const CYCLE_MS=3500;
export const IDLE_MS=45000;
export const guruNames={PSM:'Pramukh Swami Maharaj',MSM:'Mahant Swami Maharaj'};
export const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
export function groupYears(records){const groups=new Map();for(const record of records){if(!groups.has(record.year))groups.set(record.year,[]);groups.get(record.year).push(record)}return [...groups].sort((a,b)=>b[0]-a[0]).map(([year,visits])=>({year,visits,places:[...new Set(visits.map(r=>r.place.split(',')[0]))].join(' · ')}));}
export function playback(records,state,now=Date.now()){if(!records.length||!state)return {index:0,progress:0};if(state.paused){return {index:Math.max(0,records.findIndex(r=>r.source===state.selectedSource)),progress:0}}const anchor=Math.max(0,records.findIndex(r=>r.source===state.autoSource));const elapsed=Math.max(0,now-(state.playbackStartedAt||state.id));return {index:(anchor+Math.floor(elapsed/CYCLE_MS))%records.length,progress:(elapsed%CYCLE_MS)/CYCLE_MS};}
