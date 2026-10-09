import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

export default function SettingsScreen() {
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        const user = res.data?.data?.user || res.data?.user;
        if (user?.restaurantId) {
          const rest = user.restaurantId;
          setProfile({
            name: rest.name || '',
            phone: rest.phone || rest.ownerPhone || '',
            email: rest.email || rest.ownerEmail || '',
            address: rest.address || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put('/restaurant/profile', profile);
      
      // Update the local SecureStore so the dashboard reflects the new name instantly
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync('restaurantName', profile.name);
      
      Alert.alert('Success', 'Profile settings saved successfully');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Restaurant Settings</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Text style={styles.label}>Restaurant Name</Text>
        <TextInput style={styles.input} value={profile.name} onChangeText={t => setProfile({...profile, name: t})} />
        
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={profile.phone} onChangeText={t => setProfile({...profile, phone: t})} keyboardType="phone-pad" />
        
        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} value={profile.email} onChangeText={t => setProfile({...profile, email: t})} keyboardType="email-address" />
        
        <Text style={styles.label}>Address</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={profile.address} onChangeText={t => setProfile({...profile, address: t})} multiline />
        
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={[styles.card, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Text style={styles.label}>Need help or have questions?</Text>
        <Text style={[styles.input, { color: '#ea580c', fontWeight: 'bold', borderWidth: 0, padding: 0 }]}>
          contact@dynease.in
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  saveBtn: { backgroundColor: '#ea580c', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
