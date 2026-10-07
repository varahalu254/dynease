import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/restaurant/categories');
      setCategories(res.data.data?.categories || res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await apiClient.get('/restaurant/categories');
      setCategories(res.data.data?.categories || res.data.data || []);
    } catch (err) {
      console.error('Failed to refresh categories:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Category name is required');
      return;
    }
    try {
      if (editingId) {
        await apiClient.put(`/restaurant/categories/${editingId}`, { name, description, isActive: true });
      } else {
        await apiClient.post('/restaurant/categories', { name, description, isActive: true });
      }
      setShowModal(false);
      setEditingId(null);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/restaurant/categories/${id}`);
          fetchCategories();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete');
        }
      }}
    ]);
  };

  const renderCategory = ({ item }: { item: any }) => (
    <View style={styles.categoryCard}>
      <View style={styles.catInfo}>
        <Text style={styles.catName}>{item.name}</Text>
        {item.description ? <Text style={styles.catDesc}>{item.description}</Text> : null}
      </View>
      <View style={styles.catActions}>
        <Text style={[styles.statusText, item.isActive ? styles.statusActive : styles.statusInactive]}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
        <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => {
          setEditingId(item._id);
          setName(item.name);
          setDescription(item.description || '');
          setShowModal(true);
        }}>
          <Ionicons name="pencil-outline" size={20} color="#f97316" />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setEditingId(null);
          setName('');
          setDescription('');
          setShowModal(true);
        }}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>New Category</Text>
        </TouchableOpacity>
      </View>

      {loading && categories.length === 0 ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No categories found.</Text>}
        />
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Category' : 'Add Category'}</Text>
            
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Starters" />
            
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Optional" />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowModal(false); setEditingId(null); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  addButton: { flexDirection: 'row', backgroundColor: '#f97316', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  
  categoryCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  catInfo: { flex: 1 },
  catName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  catDesc: { fontSize: 14, color: '#64748b', marginTop: 4 },
  
  catActions: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  statusActive: { backgroundColor: '#dcfce7', color: '#166534' },
  statusInactive: { backgroundColor: '#f1f5f9', color: '#475569' },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 50, fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: 'bold' },
  saveBtn: { flex: 1, padding: 12, backgroundColor: '#f97316', borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});
