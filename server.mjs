import express from 'express';
import {createPhotoHandler} from './photo-server.mjs';
import {updateRoom,currentRoom} from './room-state.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import {createServer as createViteServer} from 'vite';
import {validDay,validateRecord} from './src/validation.js';
const app=express();app.use(express.json({limit:'20mb'}));
let records=JSON.parse(await fs.readFile('data/records.json','utf8'));
app.get('/api/photo',createPhotoHandler(records));
const rooms=new Map();const roomId=x=>/^[A-Z0-9]{4,12}$/.test(x);
app.get('/api/info',(req,res)=>res.json({addresses:Object.values(os.networkInterfaces()).flat().filter(x=>x.family==='IPv4'&&!x.internal).map(x=>`http://${x.address}:${process.env.PORT||5173}`),records:records.length}));
app.get('/api/records',(req,res)=>{const {month,day}=req.query;if(!validDay(+month,+day))return res.status(400).json({error:'Choose a valid birthday.'});res.json({records:records.filter(r=>r.month===+month&&r.day===+day).sort((a,b)=>a.year-b.year||a.guru.localeCompare(b.guru)),total:records.length});});
app.get('/api/rooms/:room/state',(req,res)=>{if(!roomId(req.params.room))return res.sendStatus(400);res.set('Cache-Control','no-store');res.json({state:currentRoom(rooms.get(req.params.room)?.state||null)});});
app.get('/api/rooms/:room/events',(req,res)=>{const id=req.params.room;if(!roomId(id))return res.sendStatus(400);res.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});res.flushHeaders();let room=rooms.get(id);if(!room){room={clients:new Set(),state:null};rooms.set(id,room);}room.clients.add(res);res.write(`data: ${JSON.stringify({type:'connected',state:room.state})}\n\n`);const beat=setInterval(()=>res.write(': heartbeat\n\n'),15000);req.on('close',()=>{room.clients.delete(res);clearInterval(beat);if(!room.clients.size){room.expiry=setTimeout(()=>{if(!room.clients.size)rooms.delete(id)},3600000);room.expiry.unref();}});});
app.post('/api/rooms/:room',(req,res)=>{const id=req.params.room;if(!roomId(id))return res.sendStatus(400);let room=rooms.get(id);if(!room){room={clients:new Set(),state:null};rooms.set(id,room);}try{room.state=updateRoom(room.state,req.body,records);}catch(e){return res.status(400).json({error:e.message});}for(const client of room.clients)client.write(`data: ${JSON.stringify({type:'update',state:room.state})}\n\n`);res.json({ok:true,state:room.state,displays:room.clients.size});});
// Import is intentionally available only from this computer.
app.post('/api/import',async(req,res)=>{if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))return res.sendStatus(403);if(!Array.isArray(req.body)||!req.body.every(validateRecord))return res.status(400).json({error:'Invalid archive records.'});const combined=new Map(records.map(r=>[`${r.source}:${r.year}-${r.month}-${r.day}`,r]));for(const r of req.body)combined.set(`${r.source}:${r.year}-${r.month}-${r.day}`,r);records=[...combined.values()];await fs.writeFile('data/records.json',JSON.stringify(records,null,2));res.json({count:records.length});});
if(process.env.NODE_ENV==='production'){app.use(express.static('dist'));app.get('/{*path}',(req,res)=>res.sendFile(`${process.cwd()}/dist/index.html`));}else{app.use((await createViteServer({server:{middlewareMode:true},appType:'spa'})).middlewares);}
app.listen(process.env.PORT||5173,'0.0.0.0',()=>console.log(`Vicharan ready: http://localhost:${process.env.PORT||5173}`));
