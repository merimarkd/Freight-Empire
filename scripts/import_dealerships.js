const https = require('https');
const fs = require('fs');
const path = require('path');

const stateOsmIds = {
  'AL':162110016,'AK':162109846,'AZ':162017790,'AR':162109828,'CA':162117809,
  'CO':162109727,'CT':162109048,'DE':162110040,'FL':162039,'GA':161957,
  'HI':166563,'ID':162116,'IL':122586,'IN':161816,'IA':161650,
  'KS':161644,'KY':161723,'LA':224922,'ME':63512,'MD':162112,
  'MA':165791,'MI':165789,'MN':165471,'MS':161943,'MO':161638,
  'MT':162115,'NE':161648,'NV':165473,'NH':67213,'NJ':224951,
  'NM':162014,'NY':61320,'NC':224045,'ND':161651,'OH':162173,
  'OK':161645,'OR':165476,'PA':162109,'RI':392915,'SC':224040,
  'SD':161652,'TN':161838,'TX':114690,'UT':161993,'VT':60759,
  'VA':224042,'WA':165479,'WV':162068,'WI':165466,'WY':161991,'DC':162069
};

function overpassQuery(query) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'overpass-api.de',
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json',
        'User-Agent': 'FreightEmpire/1.0 (game; contact@merimarkdigital.com)'
      }
    }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write('data=' + query);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function importState(stateCode, osmId) {
  const areaId = 3600000000 + osmId;
  const query = `[out:json][timeout:30];area(${areaId})->.st;(node["shop"="truck"](area.st);way["shop"="truck"](area.st););out center tags;`;
  const data = await overpassQuery(query);
  if (!data || !data.elements) {
    console.log(stateCode + ': FAILED or no data');
    return [];
  }
  const dealers = data.elements
    .filter(e => e.tags && e.tags.name)
    .map(e => ({
      name: e.tags.name,
      brand: e.tags.brand || null,
      lat: e.center ? e.center.lat : e.lat,
      lng: e.center ? e.center.lon : e.lon,
      address: e.tags['addr:housenumber'] && e.tags['addr:street']
        ? e.tags['addr:housenumber'] + ' ' + e.tags['addr:street']
        : null,
      city: e.tags['addr:city'] || null,
      state: e.tags['addr:state'] || stateCode,
      zip: e.tags['addr:postcode'] || null,
      phone: e.tags.phone || null,
      website: e.tags.website || null,
      isUsed: !!(e.tags.second_hand || (e.tags.name && e.tags.name.toLowerCase().includes('used')))
    }))
    .filter(d => d.lat && d.lng);
  console.log(stateCode + ': ' + dealers.length + ' dealerships found');
  return dealers;
}

async function run() {
  const allDealers = [];
  const states = Object.keys(stateOsmIds);
  for (const state of states) {
    const dealers = await importState(state, stateOsmIds[state]);
    allDealers.push(...dealers);
    await sleep(3000);
  }
  const outPath = path.join(__dirname, '../data/dealerships.json');
  fs.writeFileSync(outPath, JSON.stringify(allDealers, null, 2));
  console.log('Total dealerships imported: ' + allDealers.length);
  console.log('Saved to ' + outPath);
}

run();
