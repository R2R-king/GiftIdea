import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addToFavorites, removeFromFavorites } from '@/store/slices/favoritesSlice';

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  image: string;
  rating: number;
  location: string;
}

export const useFavorites = () => {
  const dispatch = useDispatch();
  const favoriteItems = useSelector((state: RootState) => state.favorites.items);

  const isFavorite = (productId: string) => {
    return favoriteItems.some(item => item.id === productId);
  };

  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      dispatch(removeFromFavorites(product.id));
    } else {
      dispatch(addToFavorites({
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        image: product.image,
        rating: product.rating,
        location: product.location
      }));
    }
  };

  const removeFavorite = (productId: string) => {
    dispatch(removeFromFavorites(productId));
  };

  return {
    favoriteItems,
    isFavorite,
    toggleFavorite,
    removeFavorite
  };
}; 