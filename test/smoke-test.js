const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, '..', 'arbeidstafel.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if(!m){
  console.error('FAIL: geen <script>-blok gevonden in arbeidstafel.html');
  process.exit(1);
}
const scriptPath = path.join(os.tmpdir(), 'arbeidstafel-extracted.js');
fs.writeFileSync(scriptPath, m[1]);
try{
  execSync('node --check ' + JSON.stringify(scriptPath), {stdio: 'inherit'});
  console.log('OK   syntax-check (node --check)');
}catch(e){
  console.error('FAIL syntax-check');
  process.exit(1);
}

function elStub(){
  return new Proxy({ classList: { add(){}, remove(){}, toggle(){} }, dataset: {}, style: {} }, {
    get(t, k){ if(k in t) return t[k]; return function(){ return elStub(); }; },
    set(t, k, v){ t[k] = v; return true; }
  });
}
const store = {};
const sandbox = {
  console,
  crypto: require('crypto').webcrypto,
  document: {
    addEventListener(){},
    getElementById(){ return elStub(); },
    querySelector(){ return elStub(); },
    querySelectorAll(){ return []; }
  },
  localStorage: {
    getItem(k){ return k in store ? store[k] : null; },
    setItem(k, v){ store[k] = String(v); },
    removeItem(k){ delete store[k]; }
  },
  fetch: async () => { throw new Error('offline in test'); }
};
vm.createContext(sandbox);
vm.runInContext(m[1].replace("'use strict';", ''), sandbox);
vm.runInContext('state = sampleState();', sandbox);

let failures = 0;
function check(label, got, exp){
  const g = JSON.stringify(got);
  const e = JSON.stringify(exp);
  if(g === e) console.log('OK  ', label, '=>', g);
  else { failures++; console.error('FAIL', label, '=>', g, 'verwacht', e); }
}

(async () => {
  check('feestdag 2026-09-21 (Jom Kipoer)', sandbox.feestdagOpDatum('2026-09-21'), 'Jom Kipoer');
  check('feestdag 2026-04-27 (Koningsdag)', sandbox.feestdagOpDatum('2026-04-27'), 'Koningsdag');
  check('feestdag 2026-12-25 (Kerst)', sandbox.feestdagOpDatum('2026-12-25'), 'Eerste Kerstdag');
  check('feestdag 2027-04-22 (Pesach)', sandbox.feestdagOpDatum('2027-04-22'), 'Pesach');
  check('feestdag 2026-03-03 (Poerim)', sandbox.feestdagOpDatum('2026-03-03'), 'Poerim');
  check('feestdag 2026-04-05 bevat Paasdag', sandbox.feestdagOpDatum('2026-04-05').indexOf('Eerste Paasdag') !== -1, true);
  check('feestdag 2026-11-16 (geen)', sandbox.feestdagOpDatum('2026-11-16'), '');
  vm.runInContext('state.settings.joodsFeestdagen = false;', sandbox);
  check('feestdag 2026-09-21 met Joods UIT', sandbox.feestdagOpDatum('2026-09-21'), '');
  vm.runInContext('state.settings.joodsFeestdagen = true;', sandbox);

  check('schooljaar 2026-11-16', sandbox.schooljaarVanDatum('2026-11-16'), '2026-2027');
  check('schooljaar 2026-07-01', sandbox.schooljaarVanDatum('2026-07-01'), '2025-2026');

  check('datumreeks 1', sandbox.parseDatumReeks('10 oktober t/m 18 oktober 2026').join('..'), '2026-10-10..2026-10-18');
  check('datumreeks 2', sandbox.parseDatumReeks('19 december 2026 t/m 3 januari 2027').join('..'), '2026-12-19..2027-01-03');

  const fixture = '<table><thead><tr><th></th><th>Regio Noord</th><th>Regio Midden</th><th>Regio Zuid</th></tr></thead><tbody>'
    + '<tr><th>Herfstvakantie</th><td>10 oktober t/m 18 oktober 2026</td><td>17 oktober t/m 25 oktober 2026</td><td>17 oktober t/m 25 oktober 2026</td></tr>'
    + '<tr><th>Kerstvakantie</th><td>19 december 2026 t/m 3 januari 2027</td><td>19 december 2026 t/m 3 januari 2027</td><td>19 december 2026 t/m 3 januari 2027</td></tr>'
    + '<tr><th>Zomervakantie</th><td>10 juli t/m 22 augustus 2027</td><td>17 juli t/m 29 augustus 2027</td><td>24 juli t/m 5 september 2027</td></tr>'
    + '</tbody></table>';
  const parsed = sandbox.parseOverzichtHTML(fixture);
  check('parse: aantal midden', parsed && parsed.midden.length, 3);
  check('parse: midden[0]', parsed && parsed.midden[0].name + ' ' + parsed.midden[0].start + '..' + parsed.midden[0].end, 'Herfstvakantie 2026-10-17..2026-10-25');
  check('parse: zuid[2]', parsed && parsed.zuid[2].name + ' ' + parsed.zuid[2].start, 'Zomervakantie 2027-07-24');

  const v1 = await sandbox.vakantieOpDatum('2026-12-25', 'midden');
  check('vakantie 2026-12-25 midden (ingebakken fallback)', v1.naam, 'Kerstvakantie');
  const v2 = await sandbox.vakantieOpDatum('2026-10-20', 'midden');
  check('vakantie 2026-10-20 midden', v2.naam, 'Herfstvakantie');
  const v3 = await sandbox.vakantieOpDatum('2026-10-20', 'noord');
  check('vakantie 2026-10-20 noord (buiten range)', v3.naam, '');
  const v4 = await sandbox.vakantieOpDatum('2028-02-28', 'midden');
  check('vakantie 2028-02-28 midden', v4.naam, 'Voorjaarsvakantie');

  vm.runInContext("state.parked.push({id:'p1', datum:'2026-12-25', feestdag:'Eerste Kerstdag', vakantie:'Kerstvakantie', arbeid:'Testavond'}); state.slots.find(s => s.id === 's3').datum = '2026-12-25';", sandbox);
  sandbox.handleDropOnSlot({kind: 'parked', id: 'p1'}, 's3');
  check('parked->slot: planning', vm.runInContext('state.plan.s3.arbeid', sandbox), 'Testavond');
  check('parked->slot: feestdag meegenomen', vm.runInContext("state.slots.find(s => s.id === 's3').feestdag", sandbox), 'Eerste Kerstdag');
  check('parked->slot: vakantie meegenomen', vm.runInContext("state.slots.find(s => s.id === 's3').vakantie", sandbox), 'Kerstvakantie');

  await sandbox.autoVulDatum({type: 'slot', id: 's2', datum: '2026-09-21'});
  check('autoVul slot s2: feestdag', vm.runInContext("state.slots.find(s => s.id === 's2').feestdag", sandbox), 'Jom Kipoer');

  vm.runInContext("state.parked.push({id:'p9', datum:'2026-11-20', feestdag:'', vakantie:'', arbeid:'Nieuw ding'});", sandbox);
  sandbox.handleAppendDrop({kind: 'parked', id: 'p9'});
  check('append: aantal slots', vm.runInContext('state.slots.length', sandbox), 5);
  check('append: datum nieuwe regel', vm.runInContext('state.slots[state.slots.length-1].datum', sandbox), '2026-11-20');
  check('append: planning nieuwe regel', vm.runInContext('state.plan[state.slots[state.slots.length-1].id].arbeid', sandbox), 'Nieuw ding');
  check('append: uit parkeerplaats', vm.runInContext("state.parked.find(p => p.id === 'p9') === undefined", sandbox), true);
  check('append: geen bestaande rij verdrongen', vm.runInContext('state.plan.s4.arbeid', sandbox), 'Bevordering Bijker');

  if(failures){
    console.error(failures + ' check(s) gefaald');
    process.exit(1);
  }
  console.log('ALL OK');
})().catch(e => { console.error('FAIL exceptie:', e); process.exit(1); });
