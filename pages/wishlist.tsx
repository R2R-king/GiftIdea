import React from 'react';
import Head from 'next/head';
import { Wishlist } from '@/components/Wishlist';
import AuthGuard from '@/components/AuthGuard';

const WishlistPage = () => {
  return (
    <AuthGuard>
      <Head>
        <title>My Wishlist | Gift Idea</title>
        <meta name="description" content="View and manage your wishlist items" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <Wishlist />
      </div>
    </AuthGuard>
  );
};

export default WishlistPage; 