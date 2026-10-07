import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function KitchenDashboard() {
  const router = useRouter();

  const orders = [
    { id: '101', table: 'Table 3', items: ['2x Burger', '1x Fries'], status: 'Pending' },
    { id: '102', table: 'Table 5', items: ['1x Pasta', '1x Salad'], status: 'In Progress' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kitchen Display System</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={async () => {
          await SecureStore.deleteItemAsync('token');
          router.replace('/');
        }}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal style={styles.board}>
        {/* Pending Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Pending</Text>
          {orders.filter(o => o.status === 'Pending').map(order => (
            <View key={order.id} style={styles.ticket}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketId}>#{order.id}</Text>
                <Text style={styles.ticketTable}>{order.table}</Text>
              </View>
              <View style={styles.ticketItems}>
                {order.items.map((item, i) => (
                  <Text key={i} style={styles.itemText}>- {item}</Text>
                ))}
              </View>
              <TouchableOpacity style={[styles.actionButton, styles.progressBtn]}>
                <Text style={styles.actionText}>Start Cooking</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* In Progress Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>In Progress</Text>
          {orders.filter(o => o.status === 'In Progress').map(order => (
            <View key={order.id} style={styles.ticket}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketId}>#{order.id}</Text>
                <Text style={styles.ticketTable}>{order.table}</Text>
              </View>
              <View style={styles.ticketItems}>
                {order.items.map((item, i) => (
                  <Text key={i} style={styles.itemText}>- {item}</Text>
                ))}
              </View>
              <TouchableOpacity style={[styles.actionButton, styles.readyBtn]}>
                <Text style={styles.actionText}>Mark Ready</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark theme for kitchen
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  board: {
    flex: 1,
    padding: 20,
  },
  column: {
    width: 300,
    marginRight: 20,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: 15,
  },
  ticket: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  ticketId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  ticketTable: {
    color: '#64748b',
    fontWeight: '600',
  },
  ticketItems: {
    marginBottom: 15,
  },
  itemText: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 4,
  },
  actionButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  progressBtn: {
    backgroundColor: '#f59e0b',
  },
  readyBtn: {
    backgroundColor: '#f97316',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
