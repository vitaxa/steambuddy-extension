import axios from 'axios';
import { GameChecker, GameCheckResult, proxyUrl } from './index';
import { searchSimilarName } from '@src/search/searchSimilarName';

interface GameElement {
  title: string;
}

interface SearchStoreResponse {
  elements: GameElement[];
}

interface CatalogResponse {
  searchStore: SearchStoreResponse;
}

interface ApiResponse {
  data: {
    Catalog: CatalogResponse;
  };
}

const STORE_QUERY = 'query searchStoreQuery($allowCountries: String, $category: String, $count: Int, $country: String!, $keywords: String, $locale: String, $namespace: String, $itemNs: String, $sortBy: String, $sortDir: String, $start: Int, $tag: String, $releaseDate: String, $withPrice: Boolean = false, $withPromotions: Boolean = false) { Catalog { searchStore(allowCountries: $allowCountries, category: $category, count: $count, country: $country, keywords: $keywords, locale: $locale, namespace: $namespace, itemNs: $itemNs, sortBy: $sortBy, sortDir: $sortDir, releaseDate: $releaseDate, start: $start, tag: $tag) { elements { title id namespace description effectiveDate keyImages { type url } seller { id name } productSlug urlSlug url tags { id } items { id namespace } customAttributes { key value } categories { path } price(country: $country) @include(if: $withPrice) { totalPrice { discountPrice originalPrice voucherDiscount discount currencyCode currencyInfo { decimals } fmtPrice(locale: $locale) { originalPrice discountPrice intermediatePrice } } lineOffers { appliedRules { id endDate discountSetting { discountType } } } } promotions(category: $category) @include(if: $withPromotions) { promotionalOffers { promotionalOffers { startDate endDate discountSetting { discountType discountPercentage } } } upcomingPromotionalOffers { promotionalOffers { startDate endDate discountSetting { discountType discountPercentage } } } } } paging { count total } } } }';

const checkGameInEpicGames: GameChecker = async (gameName) => {
  try {
    const findGame = async () => {
      try {
        const response = await axios.post<ApiResponse>(proxyUrl + '?url=https://graphql.epicgames.com/graphql', {
          query: STORE_QUERY,
          variables: {
            'count': 5,
            'category': 'games/edition/base|bundles/games|games/edition|editors|addons|games/demo|software/edition/base|games/experience',
            'allowCountries': 'US',
            'namespace': '',
            'sortBy': 'title',
            'sortDir': 'ASC',
            'releaseDate': null,
            'start': 0,
            'keywords': `${gameName}`,
            'tag': '',
            'withPrice': false,
            'locale': 'en-US',
            'country': 'US',
          },
        });
        if (response.status === 200) {
          const titles = response.data.data.Catalog.searchStore.elements.map(element => element.title);
          const options = {
            keys: ['title'],
            threshold: 0.1,
          };
          const similarNameResult = searchSimilarName(titles, gameName, options);
          return !!similarNameResult;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error fetching EGS games:', error);
        return false;
      }
    };
    const result = await findGame();
    const gameCheckResult: GameCheckResult = {
      gameFound: result,
      url: `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(gameName)}&sortBy=relevancy&sortDir=DESC&count=40`,
    };

    return gameCheckResult;
  } catch (error) {
    console.error('Error checking EGS:', error);
    return { gameFound: false };
  }
};

export default checkGameInEpicGames;
