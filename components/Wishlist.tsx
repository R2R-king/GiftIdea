import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchWishlist, removeFromWishlist, selectWishlistItems, selectWishlistLoading } from '@/store/slices/wishlistSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';

export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemoveFromWishlist = (productId: number) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleMoveToCart = (productId: number) => {
    dispatch(addToCart(productId));
    dispatch(removeFromWishlist(productId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Items added to your wishlist will appear here"
        actionText="Browse products"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onRemoveFromWishlist={() => handleRemoveFromWishlist(product.id)}
            onAddToCart={() => handleMoveToCart(product.id)}
            inWishlist={true}
          />
        ))}
      </div>
    </div>
  );
}; 