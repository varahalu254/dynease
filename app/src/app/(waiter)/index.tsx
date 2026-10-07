import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function WaiterDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [assignedTableIds, setAssignedTableIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(true);

  const fetchOrders = async (fetchUser = false) => {
    try {
      let currentAssignedTables = assignedTableIds;
      
      if (fetchUser || assignedTableIds.length === 0) {
        const meRes = await apiClient.get('/auth/me');
        if (meRes.data?.success && meRes.data.data.user) {
          const assignedTablesData = meRes.data.data.user.assignedTables || [];
          currentAssignedTables = assignedTablesData.map((t: any) => t._id);
          setAssignedTableIds(currentAssignedTables);
        }
      }

      const ordersRes = await apiClient.get('/restaurant/orders');

      if (ordersRes.data?.success) {
        const activeOrders = ordersRes.data.data.orders.filter((o: any) => 
          !['COMPLETED', 'CANCELLED', 'PAID'].includes(o.status)
        );
        const newOrdersList = activeOrders.map((o: any) => ({ ...o, id: o._id }));
        
        setOrders(prevOrders => {
          if (prevOrders.length > 0 && currentAssignedTables.length > 0) {
            const prevIds = new Set(prevOrders.map(o => o.id));
            const freshlyPlaced = newOrdersList.filter((o: any) => 
              !prevIds.has(o.id) && currentAssignedTables.includes(o.tableId)
            );
            
            if (freshlyPlaced.length > 0) {
              const latestOrder = freshlyPlaced[0];
              const itemSummary = latestOrder.items?.map((i: any) => `${i.quantity || i.qty}x ${i.itemName || i.name}`).join('\n');
              
              Alert.alert(
                '🔔 New Order Placed!',
                `Table ${latestOrder.tableNumber || latestOrder.table}\n\n${itemSummary}`,
                [{ text: 'Got it' }]
              );
            }
          }
          return newOrdersList;
        });
      }
      setConnected(true);
    } catch (err) {
      console.error(err);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000); // poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders(true);
    setRefreshing(false);
  }, []);

  const filteredOrders = assignedTableIds.length > 0
    ? orders.filter(o => assignedTableIds.includes(o.tableId))
    : orders;

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await apiClient.patch(`/restaurant/orders/${orderId}/status`, { status });
      if (res.data?.success) {
        // Optimistically update the UI by removing the completed order
        setOrders(prev => prev.filter(o => o.id !== orderId));
        Alert.alert('Success', `Order marked as ${status}`);
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to update order status');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'An error occurred');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.tableName}>Table {item.tableNumber || item.table}</Text>
          <Text style={styles.orderId}>{item.orderNumber || item.id?.substring(0,8)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.itemsList}>
        {item.items?.map((orderItem: any, i: number) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemText}>{orderItem.quantity || orderItem.qty}x {orderItem.itemName || orderItem.name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.completeButton}
        onPress={() => {
          Alert.alert(
            'Complete Order',
            'Are you sure you want to mark this order as completed?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Complete', style: 'default', onPress: () => updateOrderStatus(item.id, 'COMPLETED') }
            ]
          );
        }}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={styles.completeButtonText}>Mark as Completed</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Orders</Text>
          <Text style={styles.subtitle}>Active orders for your assigned tables</Text>
        </View>
        <View style={[styles.connectionBadge, { backgroundColor: connected ? '#dcfce7' : '#fee2e2' }]}>
          <View style={[styles.dot, { backgroundColor: connected ? '#22c55e' : '#ef4444' }]} />
          <Text style={[styles.connectionText, { color: connected ? '#16a34a' : '#dc2626' }]}>
            {connected ? 'Live' : 'Disconnected'}
          </Text>
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No active orders yet for your assigned tables.</Text>
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
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
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
    borderLeftColor: '#f97316',
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
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#ea580c',
    fontSize: 12,
    fontWeight: 'bold',
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
  },
  completeButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  }
});
