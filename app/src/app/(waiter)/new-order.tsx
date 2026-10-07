import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const MENU_ITEMS = [
  { id: '1', name: 'Margherita Pizza', price: 12.99, category: 'Mains' },
  { id: '2', name: 'Pepperoni Pizza', price: 14.99, category: 'Mains' },
  { id: '3', name: 'Caesar Salad', price: 8.99, category: 'Starters' },
  { id: '4', name: 'Garlic Bread', price: 4.99, category: 'Starters' },
  { id: '5', name: 'Coca Cola', price: 2.99, category: 'Drinks' },
  { id: '6', name: 'Lemonade', price: 3.49, category: 'Drinks' },
];

export default function NewOrderScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<{id: string, name: string, price: number, quantity: number}[]>([]);
  const [activeCategory, setActiveCategory] = useState('Mains');

  const categories = ['Starters', 'Mains', 'Drinks'];
  const filteredMenu = MENU_ITEMS.filter(item => item.category === activeCategory);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Order (Table 2)</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        {/* Menu Section */}
        <View style={styles.menuSection}>
          <View style={styles.categoryTabs}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.tab, activeCategory === cat && styles.activeTab]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.tabText, activeCategory === cat && styles.activeTabText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <FlatList 
            data={filteredMenu}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.menuItem} onPress={() => addToCart(item)}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                <View style={styles.addButton}><Text style={styles.addText}>+</Text></View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Cart Section */}
        <View style={styles.cartSection}>
          <Text style={styles.cartTitle}>Current Order</Text>
          <ScrollView style={styles.cartList}>
            {cart.length === 0 ? (
              <Text style={styles.emptyCart}>No items added yet</Text>
            ) : (
              cart.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.checkoutFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.submitButton, cart.length === 0 && styles.disabledButton]}
              disabled={cart.length === 0}
              onPress={() => {
                alert('Order Sent to Kitchen!');
                router.back();
              }}
            >
              <Text style={styles.submitButtonText}>Send to Kitchen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' 
  },
  backButton: { padding: 8 },
  backButtonText: { color: '#f97316', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  content: { flex: 1, flexDirection: 'row' },
  
  menuSection: { flex: 2, padding: 15, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  categoryTabs: { flexDirection: 'row', marginBottom: 15 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 10 },
  activeTab: { backgroundColor: '#f97316' },
  tabText: { color: '#64748b', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  
  menuItem: { 
    flex: 1, margin: 5, backgroundColor: '#fff', padding: 15, borderRadius: 12, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 
  },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
  itemPrice: { fontSize: 14, color: '#f97316', fontWeight: '600' },
  addButton: { position: 'absolute', bottom: 10, right: 10, backgroundColor: '#f97316', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  addText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  cartSection: { flex: 1, backgroundColor: '#fff', flexDirection: 'column' },
  cartTitle: { fontSize: 18, fontWeight: 'bold', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  cartList: { flex: 1, padding: 15 },
  emptyCart: { textAlign: 'center', color: '#94a3b8', marginTop: 20 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  cartItemPrice: { fontSize: 14, color: '#64748b', marginTop: 4 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8 },
  qtyBtn: { padding: 8, paddingHorizontal: 12 },
  qtyBtnText: { fontSize: 18, color: '#f97316', fontWeight: 'bold' },
  qtyText: { fontSize: 16, fontWeight: '600', paddingHorizontal: 8 },
  
  checkoutFooter: { padding: 20, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#64748b' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  submitButton: { backgroundColor: '#f97316', padding: 16, borderRadius: 12, alignItems: 'center' },
  disabledButton: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
