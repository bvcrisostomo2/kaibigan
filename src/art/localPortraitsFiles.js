// Dev-server only (imported by localPortraits.js when import.meta.env.DEV): the git-ignored local
// portrait images. Kept in its own module so production builds never include them.
export const portraitUrls = import.meta.glob('/local-assets/portraits/*.png', { eager: true, query: '?url', import: 'default' });
