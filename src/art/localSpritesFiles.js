// Dev-server only (imported by localSprites.js when import.meta.env.DEV): the git-ignored local
// sprite frames and overrides. Kept in its own module so production builds never include them.
export const frameUrls = import.meta.glob('/local-assets/sprites/*/*/*.png', { eager: true, query: '?url', import: 'default' });
export const overrideFiles = import.meta.glob('/local-assets/sprites/overrides.json', { eager: true, import: 'default' });
