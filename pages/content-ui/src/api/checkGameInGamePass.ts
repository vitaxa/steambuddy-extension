import axios from 'axios';
import { GameChecker, GameCheckResult, proxyUrl } from './index';
import { GamePassDetailedProduct } from './interfaces/xboxGamesPass';

const checkGameInGamePass: GameChecker = async (gameName) => {
  try {
    const allGamesUrl = 'https://catalog.gamepass.com/sigls/v2?id=29a81209-df6f-41fd-a528-2ae6b91f719c&language=en-us&market=US';
    const allGamesDetailsUrl = 'https://catalog.gamepass.com/products?market=US&language=en-US&hydration=MobileDetailsForConsole';

    const findGame = async () => {
      try {
        const { data: allGamesData } = await axios.get(proxyUrl, {
          params: { url: allGamesUrl },
        });

        const gameIds = allGamesData
          .map((game: { id?: string }) => game.id)
          .filter(Boolean);

        const { data: allGamesDetails } = await axios.post(proxyUrl, { Products: gameIds }, {
          params: { url: allGamesDetailsUrl },
        });

        const detailedProducts: GamePassDetailedProduct = allGamesDetails.Products;
        const productArray = Object.values(detailedProducts);
        const searchName = gameName.toLowerCase();
        const sameName = productArray.find(value => {
          const title = value.ProductTitle.toLowerCase();
          return title === searchName || title.includes(searchName) || searchName.includes(title);
        });

        return sameName ? sameName.ProductTitle : undefined;
      } catch (error) {
        console.error('Error fetching xbox game pass data:', error);
        return undefined;
      }
    };
    const result = await findGame();
    const gameCheckResult: GameCheckResult = {
      gameFound: !!result,
      url: `https://www.xbox.com/en-us/Search/Results?q=${encodeURIComponent(gameName)}`,
    };

    return gameCheckResult;
  } catch (error) {
    console.error('Error checking Game Pass:', error);
    return { gameFound: false };
  }
};

export default checkGameInGamePass;
