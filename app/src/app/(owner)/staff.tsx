import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function StaffScreen() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('WAITER');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/restaurant/staff');
      setStaff(res.data?.data?.staff || res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await apiClient.get('/restaurant/staff');
      setStaff(res.data?.data?.staff || res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Remove Staff', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/restaurant/staff/${id}`);
          fetchStaff();
        } catch (err) {
          Alert.alert('Error', 'Failed to remove staff');
        }
      }}
    ]);
  };

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Please fill name and phone number');
      return;
    }
    try {
      if (editingId) {
        await apiClient.put(`/restaurant/staff/${editingId}`, { name, phone, role });
      } else {
        await apiClient.post('/restaurant/staff', { name, phone, role });
      }
      setShowModal(false);
      setEditingId(null);
      setName('');
      setPhone('');
      fetchStaff();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save staff');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => {
          setEditingId(item._id);
          setName(item.name);
          setPhone(item.phone);
          setRole(item.role || 'WAITER');
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
        <Text style={styles.title}>Staff Members</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setEditingId(null);
          setName('');
          setPhone('');
          setRole('WAITER');
          setShowModal(true);
        }}>
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Staff</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No staff members found.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
          }
        />
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Staff' : 'Add New Staff'}</Text>
            
            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" />
            
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            
            <Text style={styles.label}>Role *</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity style={[styles.roleBtn, role === 'WAITER' && styles.roleActive]} onPress={() => setRole('WAITER')}>
                <Text style={[styles.roleBtnText, role === 'WAITER' && styles.roleActiveText]}>Waiter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleBtn, role === 'KITCHEN' && styles.roleActive]} onPress={() => setRole('KITCHEN')}>
                <Text style={[styles.roleBtnText, role === 'KITCHEN' && styles.roleActiveText]}>Kitchen</Text>
              </TouchableOpacity>
            </View>
            
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
  
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#4338ca' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  phone: { fontSize: 14, color: '#64748b', marginTop: 2, marginBottom: 4 },
  roleBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  roleText: { color: '#1d4ed8', fontSize: 12, fontWeight: 'bold' },
  cardActions: { flexDirection: 'row' },
  actionBtn: { padding: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  
  roleContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  roleActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  roleBtnText: { color: '#475569', fontWeight: 'bold' },
  roleActiveText: { color: '#fff' },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: 'bold' },
  saveBtn: { flex: 1, padding: 12, backgroundColor: '#f97316', borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});
