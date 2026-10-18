// The kitbash sprite sets' frames and overrides (imported by localSprites.js). Kept in its own module
// so the frames load in their own chunk, after the game's code.
export const frameUrls = import.meta.glob('/local-assets/sprites/*/*/*.png', { eager: true, query: '?url', import: 'default' });
export const overrideFiles = import.meta.glob('/local-assets/sprites/overrides.json', { eager: true, import: 'default' });
