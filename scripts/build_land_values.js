const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../data/zhvi_county.csv');
const outPath = path.join(__dirname, '../data/land_values.json');

const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split('\n').filter(l => l.trim());
const headers = lines[0].split(',');

const dateColIndexes = [];
headers.forEach((h, i) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(h)) dateColIndexes.push(i);
});

const regionNameIdx = headers.indexOf('RegionName');
const stateIdx = headers.indexOf('State');

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; continue; }
    if (c === ',' && !inQuotes) { result.push(cur); cur = ''; continue; }
    cur += c;
  }
  result.push(cur);
  return result;
}

const lookup = {};
let processed = 0;

for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i]);
  const county = cols[regionNameIdx];
  const state = cols[stateIdx];
  if (!county || !state) continue;

  let homeValue = null;
  for (let j = dateColIndexes.length - 1; j >= 0; j--) {
    const v = parseFloat(cols[dateColIndexes[j]]);
    if (!isNaN(v) && v > 0) { homeValue = v; break; }
  }
  if (!homeValue) continue;

  const landPerAcre = Math.round(homeValue * 0.11);

  const key = (county + '|' + state).toUpperCase();
  lookup[key] = { county, state, homeValue: Math.round(homeValue), landPerAcre };
  processed++;
}

fs.writeFileSync(outPath, JSON.stringify(lookup));
console.log('Processed ' + processed + ' counties');
console.log('Output written to ' + outPath);

const examples = ['LOS ANGELES COUNTY|CA', 'COOK COUNTY|IL', 'MONROE COUNTY|FL'];
examples.forEach(k => {
  if (lookup[k]) console.log(k + ':', lookup[k]);
});
