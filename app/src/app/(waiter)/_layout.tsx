import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function WaiterLayout() {
  const router = useRouter();

  return (
    <Drawer 
      screenOptions={{ headerShown: true, drawerActiveTintColor: '#10b981' }}
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
          drawerLabel: 'Live Orders',
          title: 'Live Orders',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="past-orders"
        options={{
          drawerLabel: 'Past Orders',
          title: 'Past Orders',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'My Profile',
          title: 'My Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
