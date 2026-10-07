import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function PastOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [assignedTableIds, setAssignedTableIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const [meRes, ordersRes] = await Promise.all([
        apiClient.get('/auth/me'),
        apiClient.get('/restaurant/orders')
      ]);

      if (meRes.data?.success && meRes.data.data.user) {
        const assignedTables = meRes.data.data.user.assignedTables || [];
        setAssignedTableIds(assignedTables.map((t: any) => t._id));
      }

      if (ordersRes.data?.success) {
        const pastOrdersList = ordersRes.data.data.orders.filter((o: any) => 
          ['COMPLETED', 'CANCELLED', 'PAID'].includes(o.status)
        );
        setOrders(pastOrdersList.map((o: any) => ({ ...o, id: o._id })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  const filteredOrders = assignedTableIds.length > 0
    ? orders.filter(o => assignedTableIds.includes(o.tableId))
    : orders;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.tableName}>Table {item.tableNumber || item.table}</Text>
          <Text style={styles.orderId}>{item.orderNumber || item.id?.substring(0,8)}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'CANCELLED' ? styles.statusBadgeCancelled : styles.statusBadgeCompleted]}>
          <Text style={[styles.statusText, item.status === 'CANCELLED' ? styles.statusTextCancelled : styles.statusTextCompleted]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.itemsList}>
        {item.items?.map((orderItem: any, i: number) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemText}>{orderItem.quantity || orderItem.qty}x {orderItem.itemName || orderItem.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Past Orders</Text>
          <Text style={styles.subtitle}>Completed and cancelled orders</Text>
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#94a3b8" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#94a3b8']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No past orders found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#94a3b8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  orderId: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeCompleted: {
    backgroundColor: '#f0fdf4',
  },
  statusBadgeCancelled: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextCompleted: {
    color: '#16a34a',
  },
  statusTextCancelled: {
    color: '#dc2626',
  },
  itemsList: {
    maxHeight: 120,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    marginTop: 20,
  },
  emptyText: {
    marginTop: 12,
    color: '#64748b',
    textAlign: 'center',
    fontSize: 16,
  }
});
