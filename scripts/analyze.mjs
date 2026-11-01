import fs from 'node:fs';
import { causeOf, groupByCause, uniqueById } from '../src/lib/kb/causes.ts';
const data = new URL('../src/lib/data/', import.meta.url);
export const raw = JSON.parse(fs.readFileSync(new URL('reports-4471.json', data)));
export const tenants = fs.readdirSync(new URL('tenants/', data)).map(name => JSON.parse(fs.readFileSync(new URL('tenants/'+name, data))));
export const tenantOf = r => tenants.find(t => t.handle === r.tenant);
export const reports = uniqueById(raw).filter(r => r.mergedInto === 4471);
export const groups = groupByCause(reports, tenantOf);
export const notes = JSON.parse(fs.readFileSync(new URL('desk-notes.json', data)));
export function generateEvidence() {
  fs.mkdirSync('evidence', {recursive:true});
  fs.writeFileSync('evidence/report-classification.csv', 'id,cause,tenant,locale,form,channel,intakeTag,receivedAt,mergedAt\n'+reports.map(r => {
    const t=tenantOf(r);
    return [r.id,causeOf(r,t),r.tenant,t.locale,t.form,r.channel,r.meta.intakeTag,r.receivedAt,r.mergedAt].join(',');
  }).join('\n')+'\n');
  const titles = {
    parser: 'Shared parser reads day-first tenant dates as month-first — 379 reports',
    hint: 'booking-v3 date hint contradicts day-first tenant parsing — 33 reports'
  };
  for(const g of groups) {
    const parser=g.cause==='parser';
    const body=`# ${titles[g.cause]}\n\n## Impact and scope\n\n${g.reports.length} unique reports merged into support ticket #4471, across ${g.tenants} tenants. Received ${g.firstSeen} through ${g.lastSeen}, in the 2026-10-04 export. These are report counts, not distinct people or proven failing bookings. Deduplicate overlapping export pages by report ID before counting.\n\n${parser ? 'The shared parser always reads month before day, while these tenants use day-first dates. The affected paths are app, email, and booking-v2 form reports. booking-v3 form hint failures have a separate ticket.' : 'booking-v3 prints MM/DD/YYYY for day-first tenants, while the form interprets input in the tenant’s day-first order. People following the hint get a swapped date. The shared-parser failure has a separate ticket; fixing that parser does not correct this hint.'}\n\n## Reproduction and expected behavior\n\n${parser ? 'For harbour.dental (en-GB), send 07/04/2026 through the shared parser. It should preserve 7 April; month-first interpretation produces 4 July. Reproduce independently in app and email paths and in booking-v2 form intake.' : 'For copper.studio (es-ES), open booking-v3: the hint prints MM/DD/YYYY. Following it, enter 01/06/2026 for 6 January. Day-first interpretation produces 1 June. The visible hint and the actual parser must use the same tenant date order.'}\n\nThese reproductions follow the supplied cause logic and report examples; no production system was exercised.\n\n## Evidence\n\nClassification uses src/lib/kb/causes.ts causeOf, Intl.DateTimeFormat for tenant date order, and src/lib/data/tenants. It does not group on subject, browser locale, or intakeTag. Intake labels in this group: ${Object.entries(g.taggedAs).map(([k,v])=>`${k}: ${v}`).join('; ')}.\n\n${g.reports.slice(0,2).map(r=>`- ${r.id}, ${r.tenant}, ${r.channel}: ${r.body}`).join('\n')}\n\n${parser ? `The ${notes.oneDayMove.length} reports the desk read as a one-day move remain included here by tenant: ${notes.oneDayMove.join(', ')}. Inspect timestamps and timezone behavior during investigation; the export does not establish a third cause, so do not double-count these reports.` : 'Affected tenants: alder.physio/de-DE (12 reports), copper.studio/es-ES (11), pale.harbour/pt-PT (10). All 33 are form reports. App/email reports from these same tenants belong to the parser group.'}\n\n## Acceptance checks\n\n${parser ? '- Parse according to the tenant’s date order, covering ambiguous dates such as 07/04 and 04/07.\n- Cover app, email, and booking-v2 form paths; retain valid month-first behavior for month-first tenants.\n- Inspect the five one-day descriptions without declaring an unsupported timezone root cause.\n- Verify the separate booking-v3 hint fix independently.' : '- Generate the booking-v3 hint from the tenant’s actual date order.\n- Verify de-DE, es-ES, and pt-PT hints and parsed results agree.\n- Preserve appropriate month-first hints for month-first tenants and correct booking-v2 behavior.\n- Verify app/email parser behavior independently; do not close this ticket solely on the shared parser fix.'}\n\n## Counting and timeline\n\nReports arrived from April; the first merge was 2 July. ReceivedAt dates measure report arrivals, mergedAt dates measure desk work. A July merge spike is not the start of customer impact. See the computed KB timeline and evidence/report-classification.csv.\n\n## Report IDs (${g.reports.length})\n\n${g.reports.map(r=>r.id).join(', ')}\n\nPrepared by Codex (gpt-6.1-sol), harness for Nicholas Pung. Source: course-supplied support-kb export; no production fix or reproduction is claimed.\n`;
    fs.writeFileSync('tickets/'+g.cause+'.md',body);
  }
  fs.writeFileSync('evidence/summary.json',JSON.stringify({rawRows:raw.length,uniqueReports:reports.length,groups:groups.map(({reports,...rest})=>({...rest,count:reports.length})),oneDayMove:notes.oneDayMove},null,2)+'\n');
}
if(process.argv[1] && import.meta.url === new URL('file://'+process.argv[1]).href) generateEvidence();
