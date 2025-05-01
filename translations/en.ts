const translations = {
  tabs: {
    feed: 'Feed',
    catalog: 'Catalog',
    chat: 'AI Chat',
    profile: 'Profile',
    home: 'Home',
    shop: 'Shop',
    cart: 'Cart',
    favorites: 'Favorites',
  },
  feed: {
    header: 'Events & Recommendations',
    greeting: 'Hello, %s! 👋',
    findGifts: 'Find the perfect gift for your loved ones',
    searchPlaceholder: 'Search for gifts...',
    specialOffers: 'Special Offers',
    viewAll: 'All',
    viewButton: 'View',
    categories: 'Categories',
    popular: 'Popular',
    giftIdeas: 'Don\'t know what to gift?',
    giftIdeasDesc: 'Our AI assistant will help you find the perfect gift for any occasion',
    startButton: 'Start',
    category: {
      all: 'All',
      flowers: 'Flowers',
      chocolates: 'Chocolates',
      jewellery: 'Jewellery',
      cosmetics: 'Cosmetics'
    },
    specialOffer: {
      discount30: '30% Discount',
      discountDesc: 'On all gift sets for her',
      gift: 'Free Gift',
      giftDesc: 'With orders over $80'
    }
  },
  events: {
    date: {
      ongoing: 'Ongoing',
    },
    createButton: 'Create',
    addEvent: 'Add New Event',
    addEventSubtext: 'Don\'t miss an important date',
    createEventTitle: 'Create New Event',
    eventName: 'Event Name',
    eventNamePlaceholder: 'Example: Mom\'s Birthday',
    eventDate: 'Event Date',
    eventDatePlaceholder: 'Example: 14 February',
    eventDateHelp: 'Format: date and month name, for example "14 February"',
    eventImage: 'Image URL (optional)',
    customEvent: 'My Event',
    cancel: 'Cancel',
    save: 'Save',
    delete: {
      title: 'Delete Event',
      message: 'Are you sure you want to delete the event "{name}"?',
      confirm: 'Delete',
      cancel: 'Cancel',
      cannotDelete: 'Cannot Delete',
      cannotDeleteMessage: 'Standard events cannot be deleted',
      ok: 'OK'
    },
    errors: {
      nameRequired: 'Please enter an event name',
      dateRequired: 'Please enter an event date',
      dateFormat: 'Invalid date format. Use the format "14 February"',
      dateMonthInvalid: 'Invalid month name',
      dateDayInvalid: 'Invalid day number',
    },
  },
  partners: {
    categories: {
      fashion: 'Fashion & Accessories',
      electronics: 'Electronics',
      handmade: 'Handmade',
    },
  },
  profile: {
    settings: 'Settings',
    favorites: 'Favorites',
    orders: 'Orders',
    logout: 'Log Out',
    language: 'Language',
    valentineOffer: 'Holiday Special Offer',
    offerDescription: 'Special discount on festive gifts',
    editProfile: 'Edit Profile',
    premiumMember: 'Premium Member',
    account: 'My Account',
    version: 'Version',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    notifications: 'Notifications',
    help: 'Help & Support'
  },
  catalog: {
    header: 'Gift Catalog',
    search: 'Search gifts...',
    filter: 'Filter',
    sort: 'Sort',
    title: 'Gift Catalog',
    subtitle: 'Find the perfect gift for any occasion',
    noProducts: 'No products found'
  },
  chat: {
    header: 'AI Gift Assistant',
    placeholder: 'Ask for gift recommendations...',
    send: 'Send',
  },
  favorites: {
    title: 'My Favorites',
    subtitle: 'Your collection of favorite items',
    empty: 'Your Favorites is Empty',
    emptyDesc: 'Items added to your favorites will appear here',
    browse: 'Browse Products',
    addedToCart: 'Item added to your cart!'
  },
  cart: {
    title: 'Cart',
    subtitle: 'items',
    subtotalLabel: 'Subtotal',
    shippingLabel: 'Shipping',
    discountLabel: 'Discount',
    totalLabel: 'Total',
    emptyCart: 'Your cart is empty',
    emptyCartDesc: 'Add items to your cart to proceed with checkout',
    shippingOptionsTitle: 'Shipping Options',
    orderSummaryTitle: 'Order Summary',
    proceedToCheckout: 'Proceed to Checkout',
    backToShopping: 'Back to Shopping',
    standardDelivery: 'Standard Delivery',
    expressDelivery: 'Express Delivery',
    pickupDelivery: 'In-Store Pickup',
    today: 'Today',
    free: 'Free',
    item: 'item',
    items: 'items',
    manyItems: 'items'
  },
  filters: {
    search_placeholder: 'Search...',
    occasions: {
      title: 'Occasions',
      birthday: 'Birthday',
      anniversary: 'Anniversary',
      new_year: 'New Year',
      valentine: 'Valentine\'s Day'
    },
    budgets: {
      title: 'Budget',
      cheap: 'Budget-friendly',
      medium: 'Mid-range',
      expensive: 'Premium'
    },
    types: {
      title: 'Gift Type',
      emotional: 'Emotional',
      practical: 'Practical',
      experience: 'Experience',
      handmade: 'Handmade'
    },
    locations: {
      title: 'Location',
      all: 'All locations',
      nearby: 'Nearby',
      delivery: 'Delivery'
    },
    clear: 'Clear All',
    apply: 'Apply Filters'
  },
  common: {
    cancel: 'Cancel',
    remove: 'Remove',
    add: 'Add',
    save: 'Save'
  }
};

export default translations; 