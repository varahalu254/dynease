import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { loginApi } from '../api/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<'owner' | 'staff'>('owner');

  useFocusEffect(
    useCallback(() => {
      const checkLogin = async () => {
        const token = await SecureStore.getItemAsync('token');
        const role = await SecureStore.getItemAsync('role');
        if (token && role) {
          if (role === 'RESTAURANT_OWNER') router.replace('/(owner)');
          else if (role === 'RESTAURANT_STAFF') router.replace('/(waiter)');
          else if (role === 'KITCHEN_STAFF') router.replace('/(kitchen)');
          else router.replace('/(owner)');
        } else {
          // Reset state when logged out
          setEmail('');
          setPassword('');
          setLoading(false);
        }
      };
      checkLogin();
    }, [])
  );

  const handleLogin = async (targetSubdomain?: string) => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi(email, password, targetSubdomain);
      const token = response.token;
      
      if (token) {
        await SecureStore.setItemAsync('token', token);
      }
      if (targetSubdomain) {
        await SecureStore.setItemAsync('subdomain', targetSubdomain);
      }
      
      const restName = response.data?.user?.restaurantId?.name;
      if (restName) {
        await SecureStore.setItemAsync('restaurantName', restName);
      }

      const role = response.data?.user?.role;
      if (role) {
        await SecureStore.setItemAsync('role', role);
      }
      
      if (role === 'RESTAURANT_OWNER') {
        router.replace('/(owner)');
      } else if (role === 'RESTAURANT_STAFF') {
        router.replace('/(waiter)');
      } else if (role === 'KITCHEN_STAFF') {
        router.replace('/(kitchen)');
      } else {
        router.replace('/(owner)');
      }
    } catch (error: any) {
      if (error.subdomain) {
        // The backend knows this owner belongs to a subdomain but requires tenant db login.
        // We auto-retry seamlessly for them!
        handleLogin(error.subdomain);
      } else {
        setLoading(false);
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dynease</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      {/* Role Selector */}
      <View style={styles.roleSelector}>
        <TouchableOpacity 
          style={[styles.roleButton, loginRole === 'owner' && styles.roleButtonActive]} 
          onPress={() => setLoginRole('owner')}
        >
          <Text style={[styles.roleText, loginRole === 'owner' && styles.roleTextActive]}>Owner</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleButton, loginRole === 'staff' && styles.roleButtonActive]} 
          onPress={() => setLoginRole('staff')}
        >
          <Text style={[styles.roleText, loginRole === 'staff' && styles.roleTextActive]}>Staff</Text>
        </TouchableOpacity>
      </View>


      <TextInput
        style={styles.input}
        placeholder="Email or Phone"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin()} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', marginBottom: 20 },
  
  roleSelector: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 8, padding: 4, marginBottom: 20, width: '100%' },
  roleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  roleButtonActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 2 },
  roleText: { color: '#64748b', fontWeight: '600', fontSize: 16 },
  roleTextActive: { color: '#0f172a', fontWeight: 'bold' },

  input: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 16 },
  passwordContainer: { width: '100%', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  passwordInput: { flex: 1, padding: 15, fontSize: 16 },
  eyeIcon: { padding: 15 },
  loginButton: { width: '100%', backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
