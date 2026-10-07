import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function KitchenLayout() {
  const router = useRouter();

  return (
    <Drawer 
      screenOptions={{ headerShown: true, drawerActiveTintColor: '#f59e0b' }}
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
          drawerLabel: 'KDS Board',
          title: 'Kitchen Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="flame-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
