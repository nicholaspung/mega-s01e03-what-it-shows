# booking-v3 date hint contradicts day-first tenant parsing — 33 reports

## Impact and scope

33 unique reports merged into support ticket #4471, across 3 tenants. Received 2026-04-17 through 2026-09-22, in the 2026-10-04 export. These are report counts, not distinct people or proven failing bookings. Deduplicate overlapping export pages by report ID before counting.

booking-v3 prints MM/DD/YYYY for day-first tenants, while the form interprets input in the tenant’s day-first order. People following the hint get a swapped date. The shared-parser failure has a separate ticket; fixing that parser does not correct this hint.

## Reproduction and expected behavior

For copper.studio (es-ES), open booking-v3: the hint prints MM/DD/YYYY. Following it, enter 01/06/2026 for 6 January. Day-first interpretation produces 1 June. The visible hint and the actual parser must use the same tenant date order.

These reproductions follow the supplied cause logic and report examples; no production system was exercised.

## Evidence

Classification uses src/lib/kb/causes.ts causeOf, Intl.DateTimeFormat for tenant date order, and src/lib/data/tenants. It does not group on subject, browser locale, or intakeTag. Intake labels in this group: parser: 15; hint: 18.

- R-41230, copper.studio, form: My client came on 1 June instead of 6 January. We sorted it out.
- R-41241, alder.physio, form: We had two people show up on 8 June. They were booked for 6 August.

Affected tenants: alder.physio/de-DE (12 reports), copper.studio/es-ES (11), pale.harbour/pt-PT (10). All 33 are form reports. App/email reports from these same tenants belong to the parser group.

## Acceptance checks

- Generate the booking-v3 hint from the tenant’s actual date order.
- Verify de-DE, es-ES, and pt-PT hints and parsed results agree.
- Preserve appropriate month-first hints for month-first tenants and correct booking-v2 behavior.
- Verify app/email parser behavior independently; do not close this ticket solely on the shared parser fix.

## Counting and timeline

Reports arrived from April; the first merge was 2 July. ReceivedAt dates measure report arrivals, mergedAt dates measure desk work. A July merge spike is not the start of customer impact. See the computed KB timeline and evidence/report-classification.csv.

## Report IDs (33)

R-41230, R-41241, R-41251, R-41259, R-41262, R-41275, R-41294, R-41305, R-41308, R-41366, R-41372, R-41384, R-41387, R-41396, R-41400, R-41406, R-41415, R-41416, R-41418, R-41428, R-41439, R-41441, R-41449, R-41453, R-41456, R-41460, R-41472, R-41485, R-41493, R-41539, R-41572, R-41582, R-41584

Prepared by Codex (gpt-6.1-sol), harness for Nicholas Pung. Source: course-supplied support-kb export; no production fix or reproduction is claimed.
