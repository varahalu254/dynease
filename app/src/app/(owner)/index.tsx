import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../api/client';

export default function OwnerDashboard() {
  const [restaurantName, setRestaurantName] = useState('...');
  const [stats, setStats] = useState({ todaysOrders: 0, revenue: 0, activeTables: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchName = async () => {
    const name = await SecureStore.getItemAsync('restaurantName');
    if (name) setRestaurantName(name);
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/restaurant/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  useEffect(() => {
    fetchName();
    fetchStats();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchName();
    await fetchStats();
    setRefreshing(false);
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
      }
    >
      <Text style={styles.title}>Welcome to </Text>
      <Text style={{fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 20}}>{restaurantName.toUpperCase()}</Text>
      
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Orders</Text>
          <Text style={[styles.cardValue, { color: '#ea580c' }]}>{stats.todaysOrders}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue</Text>
          <Text style={[styles.cardValue, { color: '#16a34a' }]}>₹{stats.revenue}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Tables</Text>
          <Text style={[styles.cardValue, { color: '#ea580c' }]}>{stats.activeTables}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  cardContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  }
});
