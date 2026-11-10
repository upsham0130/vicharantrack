import fs from 'node:fs';
import {createPhotoHandler} from '../photo-server.mjs';
import {updateRoom,currentRoom} from '../room-state.js';
import {validDay} from '../src/validation.js';
const records=JSON.parse(fs.readFileSync(new URL('../data/records.json',import.meta.url),'utf8'));
const photoHandler=createPhotoHandler(records);
const redisUrl=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
const redisToken=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
async function redis(command){
 if(!redisUrl||!redisToken)throw new Error('Shared room storage is not configured.');
 const r=await fetch(redisUrl,{method:'POST',headers:{Authorization:`Bearer ${redisToken}`,'Content-Type':'application/json'},body:JSON.stringify(command)});
 if(!r.ok)throw new Error('Shared room storage is unavailable.');
 const data=await r.json();if(data.error)throw new Error('Shared room storage request failed.');return data.result;
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const url=new URL(req.url,'https://vicharantrack.vercel.app');const path=url.pathname;
 try{
 if(path==='/api/photo'&&req.method==='GET')return photoHandler(req,res);
 if(path==='/api/info'&&req.method==='GET')return res.status(200).json({addresses:[],records:records.length});
 if(path==='/api/records'&&req.method==='GET'){
  const month=+url.searchParams.get('month'),day=+url.searchParams.get('day');
  if(!validDay(month,day))return res.status(400).json({error:'Choose a valid birthday.'});
  return res.status(200).json({records:records.filter(r=>r.month===month&&r.day===day).sort((a,b)=>a.year-b.year||a.guru.localeCompare(b.guru)),total:records.length});
 }
 const match=path.match(/^\/api\/rooms\/([A-Z0-9]{4,12})(\/state)?$/);
 if(!match)return res.status(404).json({error:'Not found.'});
 const key=`vicharantrack:room:${match[1]}`;
 if(req.method==='GET'&&match[2]){const raw=await redis(['GET',key]);return res.status(200).json({state:currentRoom(raw?JSON.parse(raw):null)});}
 if(req.method==='POST'&&!match[2]){
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  for(let attempt=0;attempt<5;attempt++){
   const previous=await redis(['GET',key]);let state;
   try{state=updateRoom(previous?JSON.parse(previous):null,body,records);}catch(e){return res.status(400).json({error:e.message});}
   const script="local current=redis.call('GET',KEYS[1]);if (current or '')~=ARGV[1] then return 0 end;if ARGV[2]=='null' then redis.call('DEL',KEYS[1]) else redis.call('SET',KEYS[1],ARGV[2],'EX',86400) end;return 1";
   if(await redis(['EVAL',script,1,key,previous||'',JSON.stringify(state)]))return res.status(200).json({ok:true,state});
  }
  return res.status(409).json({error:'Room changed. Try again.'});
 }
 return res.status(405).json({error:'Method not allowed.'});
 }catch(e){return res.status(503).json({error:e.message});}
}
