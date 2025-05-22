import { Product } from '@/types/product';

/**
 * Тестовые данные продуктов для проверки работы карточки товара
 */
export const testProducts: Product[] = [
  {
    id: 1,
    name: "Букет роз \"Валентин\"",
    description: "Идеальный подарок на День святого Валентина. Роскошный букет свежих роз в элегантной упаковке с любовным посланием. Свежие цветы, премиум упаковка, возможность добавить открытку.",
    price: 3690,
    formattedPrice: "3 690 ₽",
    category: "Цветы",
    subtitle: "Свежие розы с подарочной упаковкой",
    imageUrl: "https://source.unsplash.com/800x800/?roses,bouquet,valentine",
    features: ["Свежие цветы", "Премиум упаковка", "Возможность добавить открытку"],
    storeLinks: [
      { name: "Цветочный магазин", url: "https://wildberries.ru/catalog/0/search.aspx?search=букет%20роз" },
      { name: "ЯндексМаркет", url: "https://market.yandex.ru/search?text=букет%20роз%20валентин" }
    ]
  },
  {
    id: 2,
    name: "iPhone 13 Pro Max",
    description: "Новейший iPhone с мощной камерой и большим экраном станет отличным подарком для любительницы современных технологий. Он сочетает в себе стиль, производительность и функциональность.",
    price: 79990,
    formattedPrice: "79 990 ₽",
    category: "Электроника",
    subtitle: "Смартфон",
    imageUrl: "https://source.unsplash.com/800x800/?iphone13,smartphone,apple",
    features: ["Дисплей Super Retina XDR", "Тройная камера Pro", "Чип A15 Bionic", "iOS 15"],
    storeLinks: [
      { name: "re:Store", url: "https://www.re-store.ru/catalog/iphone-13-pro-max/" },
      { name: "М.Видео", url: "https://www.mvideo.ru/products/smartfon-iphone-13-pro-max" }
    ]
  },
  {
    id: 3,
    name: "Кольцо с бриллиантом",
    description: "Прекрасное кольцо с небольшим бриллиантом подчеркнет её индивидуальность и станет символом вашей любви. Это классический и всегда уместный подарок.",
    price: 45000,
    formattedPrice: "45 000 ₽",
    category: "Ювелирные украшения",
    subtitle: "Кольцо",
    imageUrl: "https://source.unsplash.com/800x800/?diamond,ring,jewelry",
    features: ["Бриллиант 0.3 карата", "Золото 585 пробы", "Сертификат подлинности", "Подарочная упаковка"],
    storeLinks: [
      { name: "Sunlight", url: "https://sunlight.net/catalog/koltsa-s-brilliantami/" },
      { name: "Sokolov", url: "https://sokolov.ru/jewelry-catalog/rings/diamond-rings/" }
    ]
  },
  {
    id: 4,
    name: "Набор косметики Dior",
    description: "Премиальный набор косметики от Dior включает в себя несколько популярных продуктов бренда. Идеальный подарок для любительницы роскошного макияжа.",
    price: 12500,
    formattedPrice: "12 500 ₽",
    category: "Косметика",
    subtitle: "Набор косметики",
    imageUrl: "https://source.unsplash.com/800x800/?dior,cosmetics,makeup",
    features: ["Помада Rouge Dior", "Тушь для ресниц Diorshow", "Тональный крем Dior Forever", "Подарочная коробка"],
    storeLinks: [
      { name: "Sephora", url: "https://sephora.ru/brand/dior/" },
      { name: "ЛЭтуаль", url: "https://www.letu.ru/browse/Dior" }
    ]
  },
  {
    id: 5,
    name: "Парфюм Chanel Coco Mademoiselle",
    description: "Классический аромат от Chanel, который сочетает в себе свежие и восточные нотки. Идеальный подарок для элегантной и утонченной женщины.",
    price: 8700,
    formattedPrice: "8 700 ₽",
    category: "Парфюмерия",
    subtitle: "Парфюмерная вода",
    imageUrl: "https://source.unsplash.com/800x800/?chanel,perfume,fragrance",
    features: ["Объём 50/100/150 мл", "Восточно-цветочный аромат", "Стойкий шлейф", "Культовый дизайн флакона"],
    storeLinks: [
      { name: "РИВ ГОШ", url: "https://rivegauche.ru/brands/chanel" },
      { name: "Золотое яблоко", url: "https://goldapple.ru/brands/chanel" }
    ]
  }
];

// Функция для получения тестового продукта по ID
export const getTestProductById = (id: number | string): Product | undefined => {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  return testProducts.find(product => product.id === numId);
};

export default testProducts; 