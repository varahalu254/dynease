import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [meRes, tablesRes] = await Promise.all([
          apiClient.get('/auth/me'),
          apiClient.get('/restaurant/tables')
        ]);
        
        if (meRes.data?.success && meRes.data.data.user) {
          const userData = meRes.data.data.user;
          if (tablesRes.data?.success && tablesRes.data.data.tables) {
            const allTables = tablesRes.data.data.tables;
            userData.assignedTables = (userData.assignedTables || []).map((t: any) => {
              const tableId = typeof t === 'string' ? t : t._id;
              return allTables.find((tbl: any) => tbl._id === tableId) || t;
            });
          }
          setUser(userData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load profile.</Text>
      </View>
    );
  }

  const assignedTables = user.assignedTables || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>View your personal info and assigned tables</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#f97316" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role?.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={20} color="#64748b" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="call" size={20} color="#64748b" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{user.phone || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tablesContainer}>
          <View style={styles.tablesHeader}>
            <Ionicons name="grid" size={20} color="#f97316" />
            <Text style={styles.tablesTitle}>Assigned Tables</Text>
          </View>
          
          {assignedTables.length === 0 ? (
            <Text style={styles.noTablesText}>No tables currently assigned to you.</Text>
          ) : (
            <View style={styles.tablesGrid}>
              {assignedTables.map((table: any) => (
                <View key={table._id} style={styles.tableBadge}>
                  <Text style={styles.tableBadgeText}>
                    Table {table.tableNumber} {table.tableName ? `(${table.tableName})` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <View style={[styles.card, { padding: 24, marginTop: -15 }]}>
        <View style={styles.tablesHeader}>
          <Ionicons name="help-buoy" size={20} color="#f97316" />
          <Text style={styles.tablesTitle}>Support</Text>
        </View>
        <Text style={{ color: '#64748b', marginBottom: 5 }}>Need help or have questions?</Text>
        <Text style={{ color: '#f97316', fontWeight: 'bold' }}>contact@dynease.in</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  header: {
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
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 30,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  roleBadge: {
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  roleText: {
    color: '#ea580c',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  tablesContainer: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tablesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tablesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 8,
  },
  noTablesText: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tableBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  tableBadgeText: {
    color: '#334155',
    fontWeight: '600',
  }
});
