import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createPhotoHandler} from './photo-server.mjs';

const image='https://www.baps.org/Data/Thumbnails/example.jpg';
function response() {
  return {headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.code=code;return this;},send(body){this.body=body;return this;},end(){return this;}};
}
test('photo proxy rejects unlisted URLs without fetching them', async () => {
  const res=response();
  await createPhotoHandler([{image}])({url:'/api/photo?image=https://example.com/private'},res);
  assert.equal(res.code,404);
});
test('photo proxy resizes originals, caches successes and falls back to thumbnails', async t => {
  const bytes=await sharp({create:{width:2200,height:1400,channels:3,background:'#182944'}}).jpeg().toBuffer();
  const urls=[];
  t.mock.method(globalThis,'fetch',async url=>{urls.push(url);return new Response(bytes,{status:url.includes('WebImages')?404:200});});
  const res=response();
  await createPhotoHandler([{image}])({url:`/api/photo?image=${encodeURIComponent(image)}`},res);
  assert.equal(res.code,200);
  assert.deepEqual(urls,[image.replace('/Thumbnails/','/WebImages/'),image]);
  const metadata=await sharp(res.body).metadata();
  assert.equal(metadata.width,960);
  assert.equal(metadata.format,'jpeg');
  assert.match(res.headers['Cache-Control'],/s-maxage=2592000/);
});
test('unavailable photos are not cached as successful responses', async t => {
  t.mock.method(globalThis,'fetch',async()=>new Response('',{status:404}));
  const res=response();
  await createPhotoHandler([{image}])({url:`/api/photo?image=${encodeURIComponent(image)}`},res);
  assert.equal(res.code,502);
  assert.equal(res.headers['Cache-Control'],'no-store');
});
