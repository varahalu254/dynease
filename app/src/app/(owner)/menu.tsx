import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function MenuScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', description: '', dietaryPreference: 'VEG' });

  const fetchMenuAndCategories = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        apiClient.get('/restaurant/menu'),
        apiClient.get('/restaurant/categories')
      ]);
      setItems(menuRes.data?.data?.menuItems || menuRes.data?.data || []);
      setCategories(catRes.data?.data?.categories || catRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        apiClient.get('/restaurant/menu'),
        apiClient.get('/restaurant/categories')
      ]);
      setItems(menuRes.data?.data?.menuItems || menuRes.data?.data || []);
      setCategories(catRes.data?.data?.categories || catRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  const handleToggle = async (item: any) => {
    try {
      await apiClient.patch(`/restaurant/menu/${item._id}/status`, { isAvailable: !item.isAvailable });
      fetchMenuAndCategories();
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/restaurant/menu/${id}`);
          fetchMenuAndCategories();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete');
        }
      }}
    ]);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    try {
      if (editingId) {
        await apiClient.put(`/restaurant/menu/${editingId}`, formData);
      } else {
        await apiClient.post('/restaurant/menu', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', price: '', category: '', description: '', dietaryPreference: 'VEG' });
      fetchMenuAndCategories();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category} • ₹{item.price}</Text>
        {item.description ? <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text> : null}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleToggle(item)} style={styles.actionBtn}>
          <Ionicons name={item.isAvailable ? 'toggle' : 'toggle-outline'} size={32} color={item.isAvailable ? '#f97316' : '#94a3b8'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setEditingId(item._id);
          setFormData({
            name: item.name,
            price: item.price.toString(),
            category: item.category,
            description: item.description || '',
            dietaryPreference: item.dietaryPreference || 'VEG'
          });
          setShowModal(true);
        }} style={styles.actionBtn}>
          <Ionicons name="pencil-outline" size={24} color="#f97316" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setEditingId(null);
          setFormData({ name: '', price: '', category: '', description: '', dietaryPreference: 'VEG' });
          setShowModal(true);
        }}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Dish</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ea580c" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No menu items found.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea580c']} />
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Dish' : 'Add New Dish'}</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); setEditingId(null); }}><Ionicons name="close" size={28} color="#64748b" /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalForm}>
            <Text style={styles.label}>Dish Name *</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
            
            <Text style={styles.label}>Price (₹) *</Text>
            <TextInput style={styles.input} value={formData.price} keyboardType="numeric" onChangeText={t => setFormData({...formData, price: t})} />
            
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryList}>
              {categories.map(c => (
                <TouchableOpacity 
                  key={c._id} 
                  style={[styles.catBadge, formData.category === c.name && styles.catBadgeActive]}
                  onPress={() => setFormData({...formData, category: c.name})}
                >
                  <Text style={[styles.catBadgeText, formData.category === c.name && styles.catBadgeTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80 }]} multiline value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />
            
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Dish</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  addButton: { flexDirection: 'row', backgroundColor: '#ea580c', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, flexDirection: 'row', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  cardInfo: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  itemCategory: { fontSize: 14, color: '#ea580c', fontWeight: '600', marginTop: 4 },
  itemDesc: { fontSize: 13, color: '#64748b', marginTop: 4 },
  cardActions: { justifyContent: 'space-between', alignItems: 'center' },
  actionBtn: { padding: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b' },

  modalContainer: { flex: 1, backgroundColor: '#f8fafc' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalForm: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 15 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, fontSize: 16 },
  
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBadge: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e2e8f0', borderRadius: 20 },
  catBadgeActive: { backgroundColor: '#ea580c' },
  catBadgeText: { color: '#475569', fontWeight: '600' },
  catBadgeTextActive: { color: '#fff' },

  saveBtn: { backgroundColor: '#ea580c', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
