import assert from 'node:assert/strict';
import fs from 'node:fs';
import { raw, reports, groups, tenantOf, notes, generateEvidence } from './analyze.mjs';
import { causeOf, sameCause } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

assert.equal(raw.length,427);
assert.equal(reports.length,412);
assert.deepEqual(Object.fromEntries(groups.map(g=>[g.cause,g.reports.length])),{parser:379,hint:33});
assert.equal(groups.reduce((n,g)=>n+g.reports.length,0),reports.length);
assert.equal(new Set(groups.flatMap(g=>g.reports.map(r=>r.id))).size,reports.length);
for(const id of notes.oneDayMove) {
 const r=reports.find(r=>r.id===id); assert.ok(r); assert.equal(causeOf(r,tenantOf(r)),'parser');
}
const side=(tenant,channel)=>({tenant,channel});
const form=side('alder.physio','form'),app=side('alder.physio','app');
assert.equal(sameCause(form,tenantOf(form),app,tenantOf(app)),false);
const email=side('kettle.books','email');
assert.equal(sameCause(email,tenantOf(email),app,tenantOf(app)),true);
assert.equal(causeOf(side('unknown.sender','email'),undefined),null);
assert.equal(causeOf({channel:'form'},{locale:'en-US',form:'booking-v3'}),null);
generateEvidence();
const html=fs.readFileSync('rendered/kb/incidents/4471-split/index.html','utf8');
const source=fs.readFileSync('src/routes/kb/incidents/4471-split/+page.svx','utf8');
const signature=source.match(/^signature: '([^']+)'/m)?.[1];
assert.ok(signature?.startsWith('v1.'), 'Page must use the course-issued signature');
for(const text of ['379','33','412','183','R-41620','booking-v3 form retired','not_planned','fix(dates): parse dd/mm for eu locales',deskRef(signature)]) assert.ok(html.includes(text), 'Missing rendered content: '+text);
assert.ok(!html.includes('no desk ref:'));
assert.ok(html.includes('<svg'));
for(const g of groups) {
 const ticket=fs.readFileSync('tickets/'+g.cause+'.md','utf8');
 for(const r of g.reports) assert.ok(ticket.includes(r.id));
 assert.ok(ticket.includes(g.cause === 'parser' ? 'state reason: completed' : 'state reason: not_planned'));
}
console.log('Verified unique counts, cause separation, all report IDs, one-day footnotes, dedupe counterexamples, unknown tenants, month-first control, and actual rendered signature/timeline.');
