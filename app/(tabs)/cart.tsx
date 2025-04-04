import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { 
  Trash2, 
  Heart, 
  ShoppingBag,
  CreditCard,
  MapPin,
  Truck,
  Package,
  CalendarClock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import TabBarShadow from '@/components/TabBarShadow';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useAppLocalization } from '@/components/LocalizationWrapper';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const { t } = useAppLocalization();
  
  const cartItems = [
    {
      id: '1',
      name: 'Heart Shaped Chocolate Box',
      price: '$24.99',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1549007994-cb8bed91e518?w=500',
    },
    {
      id: '2',
      name: 'Red Rose Bouquet',
      price: '$35.99',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=500',
    },
    {
      id: '3',
      name: 'Valentine\'s Day Card',
      price: '$5.50',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=500',
    },
  ];

  // Рассчитываем итоговые суммы
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price.substring(1)) * item.quantity, 0);
  const shipping = 4.99;
  const discount = 5.00;
  const total = subtotal + shipping - discount;

  return (
    <View style={styles.container}>
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[COLORS.valentineBackground, COLORS.valentineLightBackground]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <StatusBar style="light" />
      
      {/* Заголовок */}
      <LinearGradient
        colors={[COLORS.valentinePink, COLORS.valentineLightPink]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.headerSubtitle}>
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Элементы корзины */}
        <View style={styles.cartItemsContainer}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
                
                <View style={styles.itemActions}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton}>
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.saveButton}>
                      <Heart size={18} color={COLORS.valentinePink} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeButton}>
                      <Trash2 size={18} color={COLORS.gray600} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Доставка и итоги */}
        <View style={styles.cartSummarySection}>
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Shipping Options</Text>
            
            <TouchableOpacity style={styles.deliveryOption}>
              <View style={[styles.deliveryIconContainer, { backgroundColor: COLORS.valentineLightPink }]}>
                <Truck size={20} color={COLORS.valentinePink} />
              </View>
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryTitle}>Standard Delivery</Text>
                <Text style={styles.deliveryDate}>Feb 14 - Feb 16</Text>
              </View>
              <Text style={styles.deliveryPrice}>$4.99</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.deliveryOption, styles.selectedDelivery]}>
              <View style={[styles.deliveryIconContainer, { backgroundColor: COLORS.valentineLightPink }]}>
                <CalendarClock size={20} color={COLORS.valentinePink} />
              </View>
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryTitle}>Express Delivery</Text>
                <Text style={styles.deliveryDate}>Feb 13</Text>
              </View>
              <Text style={styles.deliveryPrice}>$9.99</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deliveryOption}>
              <View style={[styles.deliveryIconContainer, { backgroundColor: COLORS.valentineLightPink }]}>
                <Package size={20} color={COLORS.valentinePink} />
              </View>
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryTitle}>In-Store Pickup</Text>
                <Text style={styles.deliveryDate}>Today</Text>
              </View>
              <Text style={styles.deliveryPrice}>Free</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cartTotals}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: COLORS.valentinePink }]}>-${discount.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Кнопка оформления заказа */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity style={styles.checkoutButton}>
          <CreditCard size={20} color="#FFFFFF" />
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>

      <TabBarShadow />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOWS.pink,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  cartItemsContainer: {
    padding: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  itemImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.valentinePink,
    marginBottom: SPACING.sm,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  quantityText: {
    width: 30,
    textAlign: 'center',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.valentineLightPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartSummarySection: {
    padding: SPACING.lg,
  },
  deliverySection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.md,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: SPACING.sm,
  },
  selectedDelivery: {
    borderColor: COLORS.valentinePink,
    backgroundColor: COLORS.valentineLightBackground,
  },
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  deliveryDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
  },
  deliveryPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  cartTotals: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
  },
  summaryValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  totalRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  totalValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.valentinePink,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    ...SHADOWS.medium,
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.valentinePink,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.pink,
  },
  checkoutButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
}); 