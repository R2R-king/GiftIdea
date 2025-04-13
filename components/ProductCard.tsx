import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { AppDispatch } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, checkInWishlist } from '@/store/slices/wishlistSlice';
import Card from './Card';

interface ProductCardProps {
  product: Product;
  inWishlist?: boolean;
  onRemoveFromWishlist?: () => void;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inWishlist = false,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInWishlist, setIsInWishlist] = useState(inWishlist);

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      if (onRemoveFromWishlist) {
        onRemoveFromWishlist();
      } else {
        dispatch(removeFromWishlist(product.id));
      }
      setIsInWishlist(false);
    } else {
      dispatch(addToWishlist(product.id));
      setIsInWishlist(true);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    } else {
      dispatch(addToCart(product.id));
    }
  };

  return (
    <div className="relative">
      <Card>
        <div className="relative">
          <Link href={`/products/${product.id}`}>
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={product.imageUrl || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl">${product.price.toFixed(2)}</span>
              </div>
            </div>
          </Link>
          <div className="p-4 pt-0 flex justify-between">
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`ml-2 p-2 rounded-full ${
                isInWishlist ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isInWishlist ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}; 