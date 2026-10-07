import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../api/client';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from 'expo-router/drawer';
import { useRouter } from 'expo-router';

export default function OwnerLayout() {
  const [restaurantName, setRestaurantName] = useState('Owner Dashboard');
  const router = useRouter();

  useEffect(() => {
    const fetchName = async () => {
      let name = await SecureStore.getItemAsync('restaurantName');
      if (name) {
        setRestaurantName(name);
      } else {
        try {
          const res = await apiClient.get('/auth/me');
          name = res.data?.user?.restaurantId?.name;
          if (name) {
            setRestaurantName(name);
            await SecureStore.setItemAsync('restaurantName', name);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchName();
  }, []);

  return (
    <Drawer 
      screenOptions={{ headerShown: true, drawerActiveTintColor: '#3b82f6' }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
          <DrawerItem
            label="Log Out"
            icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color="#ef4444" />}
            labelStyle={{ color: '#ef4444' }}
            onPress={async () => {
              await SecureStore.deleteItemAsync('token');
              await SecureStore.deleteItemAsync('subdomain');
              await SecureStore.deleteItemAsync('restaurantName');
              await SecureStore.deleteItemAsync('role');
              
              if (router.canDismiss()) {
                router.dismissAll();
              }
              setTimeout(() => {
                router.replace('/');
              }, 100);
            }}
          />
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Owner Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="menu"
        options={{
          drawerLabel: 'Menu',
          title: 'Menu',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="fast-food-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="categories"
        options={{
          drawerLabel: 'Categories',
          title: 'Categories',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="tables"
        options={{
          drawerLabel: 'Tables & QR',
          title: 'Tables & QR',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="staff"
        options={{
          drawerLabel: 'Staff',
          title: 'Staff',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
