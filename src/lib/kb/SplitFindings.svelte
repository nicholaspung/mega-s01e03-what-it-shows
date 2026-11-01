<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, readAs, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  const unique = uniqueById(reports as Report[]);
  const merged = unique.filter(r => r.mergedInto === 4471);
  const groups = groupByCause(merged, tenantOf);
  const mismatches = merged.filter(r => {
    const g = groups.find(g => g.reports.some(x => x.id === r.id));
    return g?.cause !== r.meta.intakeTag;
  }).length;
  const firstMerge = merged.map(r => r.mergedAt).filter(Boolean).sort()[0]?.slice(0, 10);
  const before = merged.filter(r => r.receivedAt.slice(0, 10) < firstMerge!).length;
</script>

<p>{reports.length} export rows → <strong>{unique.length} unique reports</strong> → {merged.length} merged into #4471.
The export repeats {reports.length - unique.length} IDs at page boundaries; count each ID once.
Intake labels disagree with the tenant-based cause for {mismatches} reports.</p>

<table>
  <thead><tr><th>Cause / ticket draft</th><th>Reports</th><th>Tenants</th><th>Received</th><th>Intake tags</th></tr></thead>
  <tbody>
    {#each groups as g (g.cause)}
      <tr>
        <td><a href={g.cause === 'parser' ? 'https://github.com/nicholaspung/mega-s01e03-what-it-shows/issues/1' : 'https://github.com/nicholaspung/mega-s01e03-what-it-shows/issues/2'}>{g.cause}</a></td>
        <td>{g.reports.length}</td><td>{g.tenants}</td><td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{Object.entries(g.taggedAs).map(([tag,n]) => `${tag} ×${n}`).join(' · ')}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.cause)}
  {#if readAs(g, notes.oneDayMove)}
    <p>{readAs(g, notes.oneDayMove)} reports read as a one-day move and remain counted under <code>{g.cause}</code> by tenant:
      {g.reports.filter(r => notes.oneDayMove.includes(r.id)).map(r => r.id).join(', ')}.
      These symptoms warrant checking timestamps during investigation, but the export does not establish a separate timezone cause.</p>
  {/if}
{/each}

<p>First report: {merged.map(r => r.receivedAt.slice(0,10)).sort()[0]}.
First merge: {firstMerge}; {before} reports had arrived on earlier calendar dates.
The received series measures incoming reports; the merged series measures desk processing.
The merge spike cannot date the start of the incident or prove a rise in product failures.</p>
