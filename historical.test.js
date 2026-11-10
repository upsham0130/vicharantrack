import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const records=JSON.parse(fs.readFileSync('data/records.json'));
test('historical additions retain provenance and have no invented pictures',()=>{const added=records.filter(r=>r.source.startsWith('historical:'));assert.ok(added.length>31000);for(const r of added){assert.equal(r.image,null);assert.ok(r.sourceDocument);}assert.ok(records.some(r=>r.year===1950&&r.month===5&&r.day===19&&r.guru==='PSM'&&r.place.startsWith('Ahmedabad')));});
test('PSM 2016 is Sarangpur through August 12 and excludes August 13 onward',()=>{const days=new Set(records.filter(r=>r.guru==='PSM'&&r.year===2016).map(r=>{assert.equal(r.place,'Sarangpur, India');assert.ok(r.month<8||r.month===8&&r.day<13);return `${r.month}-${r.day}`}));assert.equal(days.size,225);assert.ok(days.has('8-12'));assert.ok(!days.has('8-13'));});
test('MSM supplied range includes arrival, departure and same-day visits',()=>{for(const place of ['Bochasan','Chansad','Atladara'])assert.ok(records.some(r=>r.guru==='MSM'&&r.year===2016&&r.month===8&&r.day===25&&r.place.startsWith(place)),place);});
