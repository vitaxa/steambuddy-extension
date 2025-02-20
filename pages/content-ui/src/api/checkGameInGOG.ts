import axios from 'axios';
import { GameChecker, GameCheckResult, proxyUrl } from '@src/api/index';
import { searchSimilarName } from '@src/search/searchSimilarName';

const checkGameInGOG: GameChecker = async (gameName, releaseDate: Date | null) => {
  const catalogSearchUrl = `https://catalog.gog.com/v1/catalog?limit=48&query=like%3A${encodeURIComponent(gameName)}
  &order=desc%3Ascore&productType=in%3Agame%2Cpack&page=1&countryCode=US&locale=en-US&currencyCode=USD`
  const findGame = async () => {
    try {
      const response = await axios.get<GogCatalogSearchResponse>(proxyUrl, {
        params: { url: catalogSearchUrl },
      });
      const titles = response.data.products.filter(product => {
        if (releaseDate) {
          const parsedDate = parseDate(product.releaseDate);
          return parsedDate.getTime() === releaseDate.getTime();
        }
        return true
      }).map(product => product.title);
      const options = {
        keys: ['title'],
        threshold: 0.1,
      };
      const similarNameResult = searchSimilarName(titles, gameName, options);

      return !!similarNameResult;
    } catch (error) {
      console.error('Error fetching GOG data:', error);
      return false
    }
  };
  const result = await findGame()

  const gameCheckResult: GameCheckResult = {
    gameFound: result,
    url: `https://www.gog.com/en/games?query=${encodeURIComponent(gameName)}&order=desc:score&hideDLCs=true`
  };

  function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split(".");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return gameCheckResult;
};

export default checkGameInGOG;
