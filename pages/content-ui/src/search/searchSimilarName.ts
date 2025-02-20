import Fuse from 'fuse.js';

export interface SearchOptions {
  keys: string[];
  threshold?: number;
}

export const searchSimilarName = <T>(list: T[], pattern: string, options: SearchOptions): T | undefined => {
  const fuse = new Fuse(list, options);
  const result = fuse.search(pattern);
  return result.length > 0 ? result[0].item : undefined;
};
