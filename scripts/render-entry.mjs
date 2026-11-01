import { render } from 'svelte/server';
const modules = import.meta.glob('/src/routes/kb/**/+page.svx', { eager: true });
export const pages = Object.entries(modules).map(([file, mod]) => {
  const { head, body } = render(mod.default);
  return ({
  route: file.replace('/src/routes/', '').replace('/+page.svx', ''),
  metadata: mod.metadata,
  head, body
});
});
