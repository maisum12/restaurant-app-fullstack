import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../api/client';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export function OrderSummaryScreen({ navigation }) {
  const { state, dispatch } = useCart();
  const { theme } = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (state.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first.');
      return;
    }

    setSubmitting(true);
    try {
      // Backend ko order bhejna
      await apiClient('/api/orders', {
        method: 'POST',
        body: {
          items: state.items.map((item) => ({
            menuItem: item._id,
            quantity: item.quantity,
          })),
        },
      });

      // Cart clear karein aur Tracking tab par bhej dein
      dispatch({ type: 'CLEAR_CART' });
      Alert.alert('Order Placed!', 'Your order has been sent to the kitchen.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Tracking'),
        },
      ]);
    } catch (error) {
      Alert.alert('Order Failed', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Order Summary</Text>
      
      {state.items.map((item) => (
        <View key={item._id} style={styles.row}>
          <Text style={{ color: theme.text }}>
            {item.name} x {item.quantity}
          </Text>
          <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
        <Text style={[styles.totalAmount, { color: theme.primary }]}>
          ${total.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        disabled={submitting}
        style={[styles.btn, { backgroundColor: theme.primary }]}
        onPress={handlePlaceOrder}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Confirm & Place Order</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  divider: { height: 1, marginVertical: 14 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalAmount: { fontSize: 20, fontWeight: 'bold' },
  btn: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});