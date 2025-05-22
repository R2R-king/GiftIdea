export interface StoreLink {
  name: string;
  url: string;
}

export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number | string;
  imageUrl?: string;
  image?: string;
  stockQuantity?: number;
  category: string;
  subtitle?: string;
  features?: string[];
  formattedPrice?: string;
  storeLinks?: StoreLink[];
  isFavorite?: boolean;
  occasion?: string;
  budget?: string;
  type?: string;
  location?: string;
  rating?: number;
} 