interface Product {
  id: string;
  slug: string;
  title: string;
  releaseDate: string;
}

interface GogCatalogSearchResponse {
  pages: number;
  productCount: number;
  products: Product[];
}
