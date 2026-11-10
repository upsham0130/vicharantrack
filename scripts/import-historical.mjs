import fs from 'node:fs';
const file='data/records.json';
const original=JSON.parse(fs.readFileSync(file));
const input=JSON.parse(fs.readFileSync('data/historical-source.json'));
const aliases={AMDAVAD:'Ahmedabad',ATLADARA:'Atladara (Vadodara)','DAR-ES-SALAAM':'Dar es Salaam',MAHESANA:'Mehsana','SHATAABDI STHAL':'Ahmedabad'};
const canonical=value=>(aliases[value.toUpperCase()]||value).toUpperCase().replace(/[^A-Z0-9]/g,'');
const known=new Map(original.map(r=>[canonical(r.place.split(',')[0]),r.place]));
function place(value){value=aliases[value.toUpperCase()]||value;return known.get(canonical(value))||value.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());}
// Never retain a PSM visit on or after August 13, 2016.
const records=original.filter(r=>!(r.guru==='PSM'&&r.year>=2016&&(r.year>2016||r.month>8||r.month===8&&r.day>=13)));
const key=r=>`${r.guru}:${r.year}-${r.month}-${r.day}:${canonical(r.place.split(',')[0])}`;
const seen=new Set(records.map(key));let added={psm:0,msm:0,psm2016:0};
function add(r,type){if(seen.has(key(r)))return;seen.add(key(r));records.push(r);added[type]++;}
for(const r of input.psm)add({guru:'PSM',year:r.year,month:r.month,day:r.day,place:place(r.place),image:null,source:`historical:psm-workbook:${r.row}`,sourceDocument:'PSM Vicharan_1950_2015 (Original v2).xlsx',sourceRow:r.row,originalPlace:r.place},'psm');
const digits=value=>value.replace(/[૦-૯]/g,c=>String(c.charCodeAt(0)-0xAE6));
function date(value){const[d,m,y]=digits(value).split('/').map(Number);return new Date(Date.UTC(y,m-1,d));}
let invalid=[];
for(const [i,r] of input.msm.entries()){
 const start=date(r.start),end=date(r.end);
 if(end<start||end-start>1000*86400000){invalid.push({i,...r});continue;}
 for(let d=new Date(start);d<=end;d.setUTCDate(d.getUTCDate()+1))add({guru:'MSM',year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate(),place:place(r.english),image:null,source:`historical:msm-pdf:${i+1}`,sourceDocument:'MSM Vichran Detail.pdf',sourcePage:r.page,originalPlace:r.place,dateRange:`${digits(r.start)} – ${digits(r.end)}`},'msm');
}
if(invalid.length)throw Error(JSON.stringify(invalid));
for(let d=new Date(Date.UTC(2016,0,1));d<new Date(Date.UTC(2016,7,13));d.setUTCDate(d.getUTCDate()+1))add({guru:'PSM',year:2016,month:d.getUTCMonth()+1,day:d.getUTCDate(),place:'Sarangpur, India',image:null,source:'historical:psm-2016:user',sourceDocument:'User-provided 2016 Sarangpur residence'},'psm2016');
fs.writeFileSync(file,JSON.stringify(records,null,2));
fs.writeFileSync('data/historical-import-report.json',JSON.stringify({original:original.length,total:records.length,added,removed:original.length-records.filter(r=>!r.source.startsWith('historical:')).length,rangePolicy:'Arrival and departure dates included; distinct same-day places preserved; existing archive photos preferred for matching guru/date/place.',psm2016:'January 1 through August 12, excluding August 13 and later.'},null,2));
console.log(fs.readFileSync('data/historical-import-report.json','utf8'));

