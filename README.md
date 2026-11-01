# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 review deliverable

Review: `src/routes/kb/incidents/4471-split/+page.svx`.
Desk-visible page: `rendered/kb/incidents/4471-split/index.html`.
Replacement policy proposal: `src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`.
GitHub issue drafts: `tickets/parser.md` and `tickets/hint.md`.
Evidence: `evidence/report-classification.csv` and `evidence/summary.json`.

The export's original files, including accepted decision 0001 and the stale triage prose,
remain unchanged as historical evidence. The new review explains their contradictions and
links to a proposed replacement. This is a 4 October snapshot, not a live desk connection.

### Rebuild and verify

With Node 24, run `npm ci --ignore-scripts`, `npm run build`, and `npm run verify`.
The local Vite/Svelte/mdsvex pipeline compiles the real .svx and .svelte files and evaluates
`import.meta.glob` for tenant data and the KB index; it does not hand-transcribe the tables,
charts, or signature stamp. All pages are exported as standalone HTML, with scoped component
styles. No server or hosting account is required. The HTML is a rendered snapshot, so the
explorer shows its initial controls and computed verdict, not a hydrated interactive app.
Use the .svx and supplied components in the desk's Svelte app for full interactivity.

The new page is signed by Codex (gpt-6.1-sol), acting as Nicholas Pung's harness.
No production behavior was tested or changed. The tickets' reproduction steps are derived
from supplied source and report evidence.
