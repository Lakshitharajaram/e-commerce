import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// NOTE: Stripe is temporarily disabled to resolve build errors.
// import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
const StripeProvider = ({ children }) => <>{children}</>;
const useStripe = () => ({
  initPaymentSheet: async () => ({}),
  presentPaymentSheet: async () => ({})
});

// --- Constants & Theme ---
const { width } = Dimensions.get('window');
const SPACING = 16;
const COLORS = {
  primary: '#1e3a5f', // Navy Blue
  primaryDark: '#152a45',
  secondary: '#2d4a6f',
  accent: '#f7fafc', // Light Gray
  surface: '#FFFFFF',
  text: '#2d3748', // Dark Gray
  textSecondary: '#4a5568', // Medium Gray
  border: '#e2e8f0',
  success: '#00B894',
  rating: '#FDCC0D', // Gold
  danger: '#FF7675',
  gradientStart: '#1e3a5f',
  gradientMid: '#2d4a6f',
  gradientEnd: '#1e3a5f',
  pinkGradient: ['#EC4899', '#DB2777'],
};

// --- Mock Data ---
const FEATURED_PRODUCTS = [
  { id: '1', name: "Premium Wireless Headphones", price: 24999, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", rating: 4.8, discount: 25, reviews: 120, description: "Experience high-fidelity audio with our premium wireless headphones." },
  { id: '2', name: "Smart Watch Pro", price: 37499, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", rating: 4.9, discount: 15, reviews: 85, description: "Stay connected and track your fitness with the Smart Watch Pro." },
  { id: '3', name: "Laptop Stand Aluminum", price: 6699, category: "Electronics", image: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?auto=format&fit=crop&w=600&q=80", rating: 4.7, discount: 20, reviews: 45, description: "Ergonomic aluminum stand for your laptop." },
  { id: '4', name: "Wireless Mouse", price: 4199, category: "Electronics", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80", rating: 4.6, discount: 10, reviews: 200, description: "Precision control with our ergonomic wireless mouse." },
  { id: '5', name: "Mechanical Keyboard", price: 12499, category: "Electronics", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80", rating: 4.8, discount: 0, reviews: 340, description: "Tactile switches for the ultimate typing experience." },
  { id: '6', name: "4K Action Camera", price: 28999, category: "Electronics", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80", rating: 4.5, discount: 18, reviews: 90, description: "Capture your adventures in stunning 4K resolution." },
  { id: '7', name: "Running Sneakers", price: 8999, category: "Fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", rating: 4.7, discount: 30, reviews: 150, description: "Lightweight and comfortable for long runs." },
  { id: '8', name: "Leather Backpack", price: 15999, category: "Fashion", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80", rating: 4.9, discount: 5, reviews: 60, description: "Genuine leather backpack for style and durability." },
  { id: '9', name: "Designer Sunglasses", price: 10499, category: "Fashion", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", rating: 4.6, discount: 12, reviews: 75, description: "UV protection with a classic frame design." },
  { id: '10', name: "Modern Coffee Maker", price: 18999, category: "Home", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80", rating: 4.8, discount: 22, reviews: 110, description: "Brew functionality with sleek modern design." },
  { id: '11', name: "Smart Air Purifier", price: 21999, category: "Home", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80", rating: 4.7, discount: 15, reviews: 40, description: "Clean air for your home with smart monitoring." },
  { id: '12', name: "Succulent Plant Set", price: 2499, category: "Home", image: "https://images.unsplash.com/photo-1459416493396-b6b93727494c?auto=format&fit=crop&w=600&q=80", rating: 4.9, discount: 0, reviews: 300, description: "Low maintenance plants to brighten your space." },
];

const FLASH_DEALS = [
  { id: 'fd1', name: "Premium Earbuds", price: 12999, originalPrice: 19999, timeLeft: "2h 45m", stock: 12, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80", rating: 4.5, description: "Compact earbuds with powerful bass." },
  { id: 'fd2', name: "Smart Band", price: 8999, originalPrice: 14999, timeLeft: "1h 15m", stock: 5, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=300&q=80", rating: 4.3, description: "Track your fitness goals effortlessly." },
  { id: 'fd3', name: "VR Headset", price: 29999, originalPrice: 45000, timeLeft: "4h 20m", stock: 3, image: "https://images.unsplash.com/photo-1622979135225-d2ba269fb1ac?auto=format&fit=crop&w=300&q=80", rating: 4.9, description: "Immersive VR experience." },
];

const CATEGORIES = [
  { id: 'All', name: 'All Products', icon: 'grid-outline', color: ['#64748B', '#475569'] },
  { id: 'Electronics', name: 'Electronics', icon: 'phone-portrait-outline', color: ['#3B82F6', '#2563EB'] },
  { id: 'Fashion', name: 'Fashion', icon: 'shirt-outline', color: ['#8B5CF6', '#7C3AED'] },
  { id: 'Home', name: 'Home', icon: 'home-outline', color: ['#10B981', '#059669'] },
];

// --- Components ---

const Header = ({ user, cartCount, onCartPress, onSignOut }) => (
  <LinearGradient
    colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.headerGradient}
  >
    <View style={styles.headerContent}>
      <View>
        <Text style={styles.headerGreeting}>Hello, {user?.name || 'Guest'} 👋</Text>
        <Text style={styles.headerTitle}>LuxeMart</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={styles.iconButton} onPress={onCartPress}>
          <Ionicons name="cart-outline" size={24} color="white" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, { marginLeft: 10 }]} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={{ marginLeft: 12 }} />
      <TextInput placeholder="Search for products..." placeholderTextColor={COLORS.textSecondary} style={styles.searchInput} />
      <TouchableOpacity style={styles.searchButton}>
        <Ionicons name="search" size={16} color="white" />
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = () => {
    if (email.length > 3) {
      const name = email.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      onLogin({ email, name: formattedName });
    } else {
      Alert.alert("Invalid Input", "Please enter a valid email.");
    }
  };

  return (
    <View style={styles.loginContainer}>
      <LinearGradient colors={[COLORS.primary, '#1e293b']} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.loginCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
        <View style={styles.loginIconContainer}>
          <Ionicons name="bag-handle" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.brandName}>LuxeMart</Text>
        <Text style={styles.loginSubtitle}>Premium Shopping Redefined</Text>
        <Text style={styles.loginInstruction}>Sign in to access your exclusive offers</Text>

        <TextInput
          placeholder="Email Address"
          style={styles.loginInput}
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          style={styles.loginInput}
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.loginFooter}>New to LuxeMart? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Create Account</Text></Text>
        </View>
      </Animated.View>
    </View>
  );
};

const AccountProfile = ({ user, onSignOut }) => (
  <View style={{ flex: 1, backgroundColor: COLORS.accent }}>
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{ padding: SPACING * 2, paddingTop: SPACING * 4, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
    >
      <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 8 }}>
        <Text style={{ fontSize: 40, fontWeight: 'bold', color: COLORS.primary }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{user?.name || 'User Name'}</Text>
      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>{user?.email || 'user@example.com'}</Text>
    </LinearGradient>

    <ScrollView contentContainerStyle={{ padding: SPACING }}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>My Account</Text>

        <TouchableOpacity style={styles.profileMenuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="bag-check-outline" size={20} color="#0EA5E9" />
          </View>
          <Text style={styles.menuText}>My Orders</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileMenuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="heart-outline" size={20} color="#EC4899" />
          </View>
          <Text style={styles.menuText}>Wishlist</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileMenuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="location-outline" size={20} color="#D97706" />
          </View>
          <Text style={styles.menuText}>Shipping Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileMenuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="settings-outline" size={20} color="#4B5563" />
          </View>
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', color: COLORS.textSecondary, marginTop: 24, fontSize: 12 }}>Version 1.0.0</Text>
    </ScrollView>
  </View>
);

const PaymentScreen = ({ cart, onBack, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const tax = total * 0.05;
  const grandTotal = total + tax;

  const initializePaymentSheet = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Payment Successful", "Your order has been placed successfully!", [{ text: "OK", onPress: onComplete }]);
    }, 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      <View style={styles.simpleHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: SPACING }}>
        <View style={styles.paymentSummaryCard}>
          <Text style={styles.paymentTitle}>Order Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>₹{total.toLocaleString()}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tax (5%)</Text><Text style={styles.summaryValue}>₹{tax.toLocaleString()}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{grandTotal.toLocaleString()}</Text></View>
        </View>
        <TouchableOpacity style={styles.paymentMethodCard} onPress={initializePaymentSheet}>
          <Ionicons name="card" size={24} color={COLORS.primary} />
          <Text style={styles.paymentMethodText}>Credit / Debit Card (Stripe)</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons name="lock-closed" size={16} color={COLORS.textSecondary} />
          <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 4 }}>Secure 256-bit SSL Encrypted</Text>
        </View>
      </ScrollView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: 'white', fontWeight: 'bold' }}>Processing...</Text>
        </View>
      )}
    </View>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState('LOGIN');
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  // Flash Deals Animation Ref
  const flashListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Auto-scroll Flash Deals (Mock Animation)
  useEffect(() => {
    // In a real refined app, we would use Reanimated for smooth continuous looping
  }, [screen]);

  // Derived state for products
  const filteredProducts = activeCategory === 'All'
    ? FEATURED_PRODUCTS
    : FEATURED_PRODUCTS.filter(p => p.category === activeCategory);

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen('HOME');
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => { setUser(null); setScreen('LOGIN'); } }
    ]);
  };

  const handleProductPress = (product) => { setSelectedProduct(product); setScreen('DETAILS'); };

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    Alert.alert(
      "Added to Cart",
      `${product.name} is in your cart.`,
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "Go to Cart", onPress: () => setScreen('CART') }
      ]
    );
  };

  const handleRemoveFromCart = (index) => { const newCart = [...cart]; newCart.splice(index, 1); setCart(newCart); };

  if (screen === 'LOGIN') return <SafeAreaProvider><LoginScreen onLogin={handleLogin} /></SafeAreaProvider>;

  const Content = () => {
    if (screen === 'DETAILS' && selectedProduct) {
      return (
        <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <Image source={{ uri: selectedProduct.image }} style={{ width: '100%', height: 350 }} />
            <TouchableOpacity style={styles.backButton} onPress={() => setScreen('HOME')}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.detailCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.detailPrice}>₹{selectedProduct.price.toLocaleString()}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 4 }}>{selectedProduct.rating}</Text>
                </View>
              </View>
              <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
              <Text style={styles.descriptionText}>{selectedProduct.description || "No description available."}</Text>
              <TouchableOpacity style={styles.mainActionButton} onPress={() => handleAddToCart(selectedProduct)}>
                <Text style={styles.mainActionText}>Add to Cart</Text>
                <Ionicons name="cart" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    if (screen === 'ACCOUNT') {
      return <AccountProfile user={user} onSignOut={handleSignOut} />;
    }

    if (screen === 'CART') {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      return (
        <View style={{ flex: 1, backgroundColor: COLORS.accent }}>
          <View style={styles.simpleHeader}>
            <TouchableOpacity onPress={() => setScreen('HOME')}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>My Cart ({cart.length})</Text>
            <TouchableOpacity onPress={() => setCart([])}>
              <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: SPACING }}>
            {cart.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.cartImage} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cartTitle}>{item.name}</Text>
                  <Text style={styles.cartPrice}>₹{item.price.toLocaleString()}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveFromCart(index)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
            {cart.length === 0 && <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textSecondary }}>Your cart is empty.</Text>}
          </ScrollView>
          {cart.length > 0 && (
            <View style={styles.checkoutFooter}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutButton} onPress={() => setScreen('PAYMENT')}>
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    if (screen === 'PAYMENT') {
      return <PaymentScreen cart={cart} onBack={() => setScreen('CART')} onComplete={() => { setCart([]); setScreen('HOME'); }} />;
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <Header user={user} cartCount={cart.length} onCartPress={() => setScreen('CART')} onSignOut={handleSignOut} />

          <View style={{ marginTop: -20, paddingHorizontal: SPACING }}>
            {/* Flash Deals */}
            <LinearGradient
              colors={['#EC4899', '#EF4444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.flashDealsContainer}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="flash" size={20} color="white" />
                  <Text style={styles.flashTitle}>Flash Deals</Text>
                </View>
                <View style={styles.timerBadge}><Text style={styles.timerText}>Running Out!</Text></View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {FLASH_DEALS.map((deal) => (
                  <TouchableOpacity key={deal.id} style={styles.flashCard} onPress={() => handleProductPress(deal)}>
                    <Image source={{ uri: deal.image }} style={styles.flashImage} />
                    <Text style={styles.flashName} numberOfLines={1}>{deal.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                      <Text style={styles.flashPrice}>₹{deal.price.toLocaleString()}</Text>
                      <Text style={styles.flashOriginal}>₹{deal.originalPrice.toLocaleString()}</Text>
                    </View>
                    <View style={styles.stockBar}>
                      <View style={[styles.stockFill, { width: `${(deal.stock / 20) * 100}%` }]} />
                    </View>
                    <Text style={styles.stockText}>{deal.stock} left</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>

            {/* Categories */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => setActiveCategory(cat.id)}>
                      <LinearGradient
                        colors={isActive ? cat.color : ['#F1F5F9', '#E2E8F0']}
                        style={[styles.categoryIconContainer, isActive && { elevation: 8 }]}
                      >
                        <Ionicons name={cat.icon} size={24} color={isActive ? "white" : COLORS.textSecondary} />
                      </LinearGradient>
                      <Text style={[styles.categoryName, isActive && { color: COLORS.primary, fontWeight: 'bold' }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Filtered Products */}
            <View style={styles.sectionContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>{activeCategory === 'All' ? 'Trending Now' : `${activeCategory} Products`}</Text>
                {activeCategory === 'All' && <Text style={styles.seeAllText}>See All →</Text>}
              </View>
              <View style={styles.productsGrid}>
                {filteredProducts.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.productCard} onPress={() => handleProductPress(item)}>
                    <View style={styles.imageWrapper}>
                      <Image source={{ uri: item.image }} style={styles.productImage} />
                      {item.discount > 0 && (<View style={styles.discountBadge}><Text style={styles.discountText}>{item.discount}% OFF</Text></View>)}
                      <TouchableOpacity style={styles.wishlistButton}><Ionicons name="heart-outline" size={16} color={COLORS.primary} /></TouchableOpacity>
                    </View>
                    <View style={styles.productContent}>
                      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                        <Ionicons name="star" size={12} color={COLORS.rating} /><Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
                      </View>
                      <Text style={styles.productPrice}>₹{item.price.toLocaleString()}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {filteredProducts.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.textSecondary }}>No products found in this category.</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setScreen('HOME')}>
            <Ionicons name="home" size={24} color={screen === 'HOME' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.navText, { color: screen === 'HOME' ? COLORS.primary : COLORS.textSecondary, fontWeight: screen === 'HOME' ? 'bold' : 'normal' }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setScreen('CART')}>
            <View>
              <Ionicons name="cart-outline" size={24} color={screen === 'CART' ? COLORS.primary : COLORS.textSecondary} />
              {cart.length > 0 && <View style={styles.navBadge} />}
            </View>
            <Text style={[styles.navText, { color: screen === 'CART' ? COLORS.primary : COLORS.textSecondary, fontWeight: screen === 'CART' ? 'bold' : 'normal' }]}>Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setScreen('ACCOUNT')}>
            <Ionicons name="person-outline" size={24} color={screen === 'ACCOUNT' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.navText, { color: screen === 'ACCOUNT' ? COLORS.primary : COLORS.textSecondary, fontWeight: screen === 'ACCOUNT' ? 'bold' : 'normal' }]}>Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <StripeProvider>
        <Content />
      </StripeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.accent },
  // ... (previous styles) ...
  // New styles for Profile Screen
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 16, elevation: 2 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', padding: 16, borderRadius: 16, marginTop: 24, marginBottom: 40 },
  signOutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

  headerGradient: { paddingHorizontal: SPACING, paddingTop: Platform.OS === 'android' ? 40 : SPACING * 3, paddingBottom: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.danger, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  notificationDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: COLORS.danger, borderRadius: 4, borderWidth: 1, borderColor: 'white' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 4, elevation: 4 },
  searchInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, fontSize: 16, color: COLORS.text },
  searchButton: { backgroundColor: COLORS.primary, padding: 8, borderRadius: 12 },
  flashDealsContainer: { padding: 16, borderRadius: 16, marginBottom: 24, elevation: 4 },
  flashTitle: { color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 8 },
  timerBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  timerText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  flashCard: { backgroundColor: 'white', borderRadius: 12, padding: 8, marginRight: 12, width: 140 },
  flashImage: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8, resizeMode: 'cover' },
  flashName: { fontSize: 12, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  flashPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  flashOriginal: { fontSize: 10, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  stockBar: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  stockFill: { height: '100%', backgroundColor: COLORS.danger },
  stockText: { fontSize: 10, color: COLORS.danger, marginTop: 2, fontWeight: '600' },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },

  // Categories
  categoryCard: { alignItems: 'center', marginRight: 16 },
  categoryIconContainer: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }, // Removed elevation here, added conditionally
  categoryName: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },

  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  seeAllText: { color: COLORS.primary, fontWeight: '600' },
  productCard: { width: (width - SPACING * 3) / 2, backgroundColor: 'white', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2 },
  imageWrapper: { height: 140, position: 'relative', backgroundColor: 'gray' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  wishlistButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'white', padding: 6, borderRadius: 16, elevation: 2 },
  productContent: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4, height: 36 },
  ratingText: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },

  // Login
  loginContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  loginCard: { backgroundColor: 'white', borderRadius: 24, padding: 32, alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  loginIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  brandName: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  loginSubtitle: { fontSize: 14, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 24, textTransform: 'uppercase' },
  loginInstruction: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24, textAlign: 'center' },
  loginInput: { width: '100%', backgroundColor: COLORS.accent, borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: COLORS.border },
  loginButton: { width: '100%', backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  loginFooter: { color: COLORS.textSecondary },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border, elevation: 16 },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, marginTop: 4, color: COLORS.textSecondary },
  navBadge: { position: 'absolute', top: 0, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger },
  backButton: { position: 'absolute', top: 40, left: 16, backgroundColor: 'white', padding: 8, borderRadius: 20, elevation: 6 },
  detailCard: { backgroundColor: 'white', marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  detailPrice: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  ratingBadge: { flexDirection: 'row', backgroundColor: COLORS.danger, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignItems: 'center' },
  descriptionText: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24, marginBottom: 24 },
  mainActionButton: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 16 },
  mainActionText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  simpleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 40, backgroundColor: 'white' },
  cartItem: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  cartImage: { width: 60, height: 60, borderRadius: 8 },
  cartTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cartPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  checkoutFooter: { padding: 24, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 16, color: COLORS.textSecondary },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  checkoutButton: { backgroundColor: COLORS.success, padding: 16, borderRadius: 16, alignItems: 'center' },
  checkoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  paymentSummaryCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 2, marginBottom: 24 },
  paymentTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  paymentMethodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, elevation: 2, borderWidth: 1, borderColor: COLORS.border },
  paymentMethodText: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text, marginLeft: 12 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  stockBar: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  stockFill: { height: '100%', backgroundColor: COLORS.danger },
  stockText: { fontSize: 10, color: COLORS.danger, marginTop: 2, fontWeight: '600' },
});
