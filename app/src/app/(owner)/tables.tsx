import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl, Switch } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function TablesScreen() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/restaurant/tables');
      setTables(res.data?.data?.tables || res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await apiClient.get('/restaurant/tables');
      setTables(res.data?.data?.tables || res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Table', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/restaurant/tables/${id}`);
          fetchTables();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete table');
        }
      }}
    ]);
  };

  const handleSave = async () => {
    if (!tableNumber || !capacity) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      if (editingId) {
        await apiClient.put(`/restaurant/tables/${editingId}`, { tableNumber, capacity: parseInt(capacity) });
      } else {
        await apiClient.post('/restaurant/tables', { tableNumber, capacity: parseInt(capacity) });
      }
      setShowModal(false);
      setEditingId(null);
      setTableNumber('');
      fetchTables();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    }
  };

  const handleToggleStatus = async (table: any) => {
    const newStatus = table.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.put(`/restaurant/tables/${table._id}`, { status: newStatus });
      setTables(tables.map(t => t._id === table._id ? { ...t, status: newStatus } : t));
    } catch (err) {
      Alert.alert('Error', 'Failed to update table status');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.tableIcon}>
          <Ionicons name="restaurant" size={24} color="#3b82f6" />
        </View>
        <View>
          <Text style={styles.tableName}>Table {item.tableNumber}</Text>
          <Text style={styles.tableCapacity}>Seats: {item.capacity}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Switch
              value={item.status === 'ACTIVE'}
              onValueChange={() => handleToggleStatus(item)}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={item.status === 'ACTIVE' ? '#16a34a' : '#f8fafc'}
            />
            <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '600', color: item.status === 'ACTIVE' ? '#16a34a' : '#64748b' }}>
              {item.status || 'ACTIVE'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => {
          setEditingId(item._id);
          setTableNumber(item.tableNumber.toString());
          setCapacity(item.capacity.toString());
          setShowModal(true);
        }} style={styles.actionBtn}>
          <Ionicons name="pencil-outline" size={24} color="#3b82f6" />
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
        <Text style={styles.title}>Tables</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setEditingId(null);
          setTableNumber('');
          setCapacity('4');
          setShowModal(true);
        }}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Table</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No tables found.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
          }
        />
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Table' : 'Add New Table'}</Text>
            
            <Text style={styles.label}>Table Number *</Text>
            <TextInput style={styles.input} value={tableNumber} onChangeText={setTableNumber} placeholder="e.g. 1" keyboardType="numeric" />
            
            <Text style={styles.label}>Capacity (Seats) *</Text>
            <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
            
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
  addButton: { flexDirection: 'row', backgroundColor: '#3b82f6', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  tableIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  tableName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  tableCapacity: { fontSize: 14, color: '#64748b', marginTop: 2 },
  cardActions: { flexDirection: 'row' },
  actionBtn: { padding: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: 'bold' },
  saveBtn: { flex: 1, padding: 12, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 10, fontWeight: 'bold', overflow: 'hidden', alignSelf: 'flex-start', borderWidth: 1 },
  statusActive: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' },
  statusInactive: { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' }
});
