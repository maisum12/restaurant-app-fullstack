import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export function OrderTrackingScreen() {
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMyOrders = async () => {
      try {
        const data = await apiClient('/api/orders/my');
        if (isMounted) {
          setOrders(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Tracking polling error:', err.message);
        if (isMounted) setLoading(false);
      }
    };

    // Pehli baar foran data layein
    fetchMyOrders();

    // Har 10 second baad polling interval chalayein
    const intervalId = setInterval(fetchMyOrders, 10000);

    // Cleanup function interval ko clear karega
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>My Orders</Text>

      {orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.textSecondary }}>No active orders placed yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const statusColors = {
              Pending: '#f39c12',
              Preparing: '#3498db',
              Ready: '#2ecc71',
              Served: '#9b59b6',
              Cancelled: '#e74c3c',
            };

            return (
              <View
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.row}>
                  <Text style={[styles.orderId, { color: theme.text }]}>
                    Order #{item._id.slice(-6).toUpperCase()}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors[item.status] || '#777' },
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                {item.items.map((line, idx) => (
                  <Text key={idx} style={{ color: theme.textSecondary, marginTop: 2 }}>
                    • {line.name} (x{line.quantity})
                  </Text>
                ))}

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.row}>
                  <Text style={{ color: theme.textSecondary }}>
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={[styles.amount, { color: theme.primary }]}>
                    Total: ${item.totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, marginVertical: 10 },
  amount: { fontSize: 16, fontWeight: 'bold' },
});