import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export function ManagerDashboardScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState('menu'); // 'menu' | 'orders' | 'reservations'
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'menu') {
        const data = await apiClient('/api/menu');
        setMenu(data);
      } else if (tab === 'orders') {
        const data = await apiClient('/api/orders');
        setOrders(data);
      } else if (tab === 'reservations') {
        const data = await apiClient('/api/reservations');
        setReservations(data);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  // Manager: Price ya availability update karna
  const handleUpdatePrice = async (item, newPrice) => {
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Invalid Price', 'Price must be a positive number');
      return;
    }

    try {
      await apiClient(`/api/menu/${item._id}`, {
        method: 'PUT',
        body: { price: priceNum },
      });
      loadData();
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      await apiClient(`/api/menu/${item._id}`, {
        method: 'PUT',
        body: { isAvailable: !item.isAvailable },
      });
      loadData();
    } catch (err) {
      Alert.alert('Update Failed', err.message);
    }
  };

  // Manager: Order status progression (Pending -> Preparing -> Ready -> Served)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiClient(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      loadData();
    } catch (err) {
      Alert.alert('Status Error', err.message);
    }
  };

  // Manager: Reservation Accept/Decline
  const handleReservationAction = async (resId, newStatus) => {
    try {
      await apiClient(`/api/reservations/${resId}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      loadData();
    } catch (err) {
      Alert.alert('Action Failed', err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {['menu', 'orders', 'reservations'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tabBtn,
              { borderBottomColor: tab === t ? theme.primary : 'transparent' },
            ]}
          >
            <Text
              style={{
                color: tab === t ? theme.primary : theme.textSecondary,
                fontWeight: 'bold',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : tab === 'menu' ? (
        <FlatList
          data={menu}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bold, { color: theme.text }]}>{item.name}</Text>
                <Text style={{ color: theme.primary }}>Current: ${item.price.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleToggleAvailable(item)}
                style={[
                  styles.smallBtn,
                  { backgroundColor: item.isAvailable ? '#27ae60' : '#e74c3c' },
                ]}
              >
                <Text style={styles.btnText}>
                  {item.isAvailable ? 'Available' : 'Sold Out'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.prompt('Update Price', 'Enter new price:', [
                    { text: 'Cancel' },
                    { text: 'Save', onPress: (val) => handleUpdatePrice(item, val) },
                  ]);
                }}
                style={[styles.smallBtn, { backgroundColor: theme.primary, marginLeft: 6 }]}
              >
                <Text style={styles.btnText}>Price</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : tab === 'orders' ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const nextStatus = {
              Pending: 'Preparing',
              Preparing: 'Ready',
              Ready: 'Served',
            }[item.status];

            return (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bold, { color: theme.text }]}>
                    Order #{item._id.slice(-6).toUpperCase()}
                  </Text>
                  <Text style={{ color: theme.textSecondary }}>By: {item.user?.name || 'Customer'}</Text>
                  <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                    Status: {item.status}
                  </Text>
                </View>

                {nextStatus && (
                  <TouchableOpacity
                    onPress={() => handleUpdateOrderStatus(item._id, nextStatus)}
                    style={[styles.smallBtn, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.btnText}>Mark {nextStatus}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bold, { color: theme.text }]}>
                  Table #{item.table?.tableNumber} ({item.guests} guests)
                </Text>
                <Text style={{ color: theme.textSecondary }}>
                  {item.date} @ {item.time} - {item.user?.name}
                </Text>
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                  Status: {item.status.toUpperCase()}
                </Text>
              </View>

              {item.status === 'pending' && (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => handleReservationAction(item._id, 'confirmed')}
                    style={[styles.smallBtn, { backgroundColor: '#2ecc71' }]}
                  >
                    <Text style={styles.btnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReservationAction(item._id, 'declined')}
                    style={[styles.smallBtn, { backgroundColor: '#e74c3c' }]}
                  >
                    <Text style={styles.btnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabBtn: { paddingVertical: 10, borderBottomWidth: 3 },
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  bold: { fontSize: 16, fontWeight: 'bold' },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});