export interface StoreLink {
  name: string;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stockQuantity?: number;
  category: string;
  storeLinks?: StoreLink[];
} 