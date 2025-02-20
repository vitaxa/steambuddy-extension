export type GameCheckResult = {
  gameFound: boolean,
  url?: string | undefined,
}

export interface GameChecker {
  (gameName: string, releaseDate: Date | null): Promise<GameCheckResult>;
}

export const proxyUrl = 'https://game-finder-proxy.vercel.app/proxy';

export { default as checkGameInGamePass } from './checkGameInGamePass';
export { default as checkGameInEpicGames } from './checkGameInEpicGames';
export { default as checkGameInGOG } from './checkGameInGOG';
