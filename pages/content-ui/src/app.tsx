import React, { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { checkGameInEpicGames, checkGameInGamePass, checkGameInGOG, GameCheckResult } from './api';
import { formatDate } from './steam/format-utils';

interface PlatformResult {
  name: string;
  checker: (gameName: string, releaseDate: Date | null) => Promise<GameCheckResult>;
  logo: string;
  found: boolean;
  url?: string | undefined;
}

const platforms = [
  { name: 'Xbox Game Pass', checker: checkGameInGamePass, logo: 'content-ui/xbox-game-pass-logo.svg' },
  { name: 'Epic Games', checker: checkGameInEpicGames, logo: 'content-ui/epic-games-logo.svg' },
  { name: 'GOG', checker: checkGameInGOG, logo: 'content-ui/gog-logo.svg' },
];

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [gameServiceResult, setGameServiceResult] = useState<PlatformResult[] | null>(null);
  const [rootBlock, setRootBlock] = useState<Root | null>(null);

  useEffect(() => {
    if (!isOnSteamAppPage()) return;

    const blockWithAdditionalInfo = findRightBlock();
    const gameName = findGameName();

    if (gameName && blockWithAdditionalInfo) {
      const newRootBlock = createGameInfoBlock(blockWithAdditionalInfo);
      setRootBlock(newRootBlock);
      setIsLoading(true);
      const releaseDateText = findReleaseDate();
      let releaseData: Date | null = null;
      if (releaseDateText) {
        releaseData = formatDate(releaseDateText);
      }
      checkGameInServices(gameName, releaseData)
        .then(gameServiceResult => {
          setIsLoading(false);
          if (gameServiceResult) {
            setGameServiceResult(gameServiceResult);
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.error('Error checking services:', error);
        });
    }
  }, []);

  useEffect(() => {
    if (rootBlock) {
      if (isLoading) {
        rootBlock.render(<img
          src={chrome.runtime.getURL('content-ui/loading-2.svg')}
          alt={`loading`}
        />);
      } else if (gameServiceResult) {
        insertGameInfoElements(gameServiceResult, rootBlock);
      }
    }
  }, [isLoading, gameServiceResult, rootBlock]);

  const findRightBlock = (): Element | null => {
    const divBlock = document.querySelector('.block.responsive_apppage_details_right.heading');
    if (divBlock) {
      return divBlock;
    } else {
      return document.querySelector('.block.responsive_apppage_details_left');
    }
  };

  const findReleaseDate = (): string | null | undefined => {
    return document.querySelector('.release_date .date')?.textContent;
  };

  const findGameName = (): string | null | undefined => {
    const gameNameElement = document.getElementById('appHubAppName');
    if (gameNameElement?.textContent && isOnlyLatinCharacters(gameNameElement.textContent)) {
      return gameNameElement.textContent;
    } else {
      const gameNameHeadingElement = document.getElementsByClassName('game_area_purchase_game')[0]?.getElementsByTagName('h1')[0];
      const purchaseGameTitle = gameNameHeadingElement?.textContent ? extractGameTitleFromPurchaseTextBlock(gameNameHeadingElement?.textContent) : null;
      if (purchaseGameTitle && !isOnlyLatinCharacters(purchaseGameTitle)) {
        const drmElements = document.getElementsByClassName('DRM_notice');
        const lastDrmElement = drmElements[drmElements.length - 1];
        const linkElement = lastDrmElement.querySelector('a');

        return linkElement?.textContent ? extractGameTitleFromEulaTextBlock(linkElement.textContent) : null;
      }

      return purchaseGameTitle ? extractGameTitleFromPurchaseTextBlock(purchaseGameTitle) : null;
    }
  };

  const extractGameTitleFromPurchaseTextBlock = (text: string): string => {
    const regex = /^\S+\s+/;
    const gameTitle = text.replace(regex, '');

    return gameTitle.trim();
  };

  const extractGameTitleFromEulaTextBlock = (text: string): string => {
    return text.split('EULA')[0].trim();
  };

  const isOnlyLatinCharacters = (input: string): boolean => {
    const regex = /^[a-zA-Z\s0-9,:!?.'"®-]+$/;
    return regex.test(input);
  };

  const checkGameInServices = async (gameName: string, releaseDate: Date | null): Promise<PlatformResult[] | undefined> => {
    try {
      return await Promise.all(
        platforms.map(async (platform) => {
          const gameCheckResult = await platform.checker(gameName, releaseDate);
          return {
            ...platform,
            found: gameCheckResult.gameFound,
            url: gameCheckResult.url,
          };
        }),
      );
    } catch (error) {
      console.error('Error checking services:', error);
      return undefined;
    }
  };

  const insertGameInfoElements = (gameCheckResult: PlatformResult[], rootBlock: Root) => {
    const isAnyFound = gameCheckResult.find(platform => platform.found);
    if (!isAnyFound) {
      rootBlock.render(<><p className="reason against">{chrome.i18n.getMessage('otherStoresNotFound')}</p></>);
    } else {
      const platformElements = gameCheckResult.filter(platform => platform.found)
        .map(platform => (
          <a key={platform.name} href={platform.url} target="_blank" rel="noreferrer">
            <img
              key={platform.name}
              src={chrome.runtime.getURL(platform.logo)}
              alt={`${platform.name} logo`}
            />
          </a>
        ));
      rootBlock.render(<>{platformElements}</>);
    }
  };

  const createGameInfoBlock = (targetElement: Element): Root => {
    const divTitleBlock = createDivElement('block responsive_apppage_details_right heading', chrome.i18n.getMessage('otherStoresTitle'));
    const divGamePlatformBlock = createDivElement('block responsive_apppage_details_right recommendation_reasons');
    divGamePlatformBlock.setAttribute('style', 'display: flex; flex-direction: column; padding-left: 0; align-items: center; justify-content: center; gap: 20px;');

    if (targetElement.parentNode) {
      targetElement.parentNode.insertBefore(divTitleBlock, targetElement);
      targetElement.parentNode.insertBefore(divGamePlatformBlock, targetElement);
    }
    return createRoot(divGamePlatformBlock);
  };

  return null;
}

function isOnSteamAppPage() {
  const url = window.location.href;
  if (!url.startsWith('https://store.steampowered.com/app/')) {
    return false;
  }
  const remainder = url.slice('https://store.steampowered.com/app/'.length);
  const appIdEndIndex = remainder.indexOf('/');
  if (appIdEndIndex === -1) {
    return false;
  }
  const appId = remainder.slice(0, appIdEndIndex);
  return /^\d+$/.test(appId);
}

function createDivElement(className: string, textContent?: string) {
  const div = document.createElement('div');
  div.className = className;
  if (textContent) {
    div.textContent = textContent;
  }
  return div;
}
