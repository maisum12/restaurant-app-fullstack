import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export function ReservationScreen() {
  const { theme } = useTheme();
  const [tables, setTables] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [tablesData, resData] = await Promise.all([
        apiClient('/api/reservations/tables'),
        apiClient('/api/reservations/my'),
      ]);
      setTables(tablesData);
      setMyReservations(resData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReserve = async () => {
    if (!selectedTable) {
      Alert.alert('Select Table', 'Please tap on a table to reserve.');
      return;
    }

    setSubmitting(true);
    try {
      // Backend conflict check karega (agar booked hui toh 409 aayega)
      await apiClient('/api/reservations', {
        method: 'POST',
        body: {
          tableId: selectedTable._id,
          date,
          time,
          guests: parseInt(guests) || 1,
        },
      });

      Alert.alert('Reserved!', 'Your booking request is pending manager review.');
      setSelectedTable(null);
      loadData();
    } catch (err) {
      Alert.alert('Booking Conflict', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Book a Table</Text>

      {/* Select Table Pills */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Available Tables:</Text>
      <View style={styles.tableRow}>
        {tables.map((t) => (
          <TouchableOpacity
            key={t._id}
            onPress={() => setSelectedTable(t)}
            style={[
              styles.tablePill,
              {
                backgroundColor: selectedTable?._id === t._id ? theme.primary : theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={{ color: selectedTable?._id === t._id ? '#fff' : theme.text }}>
              Table #{t.tableNumber} ({t.capacity} seats)
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor={theme.textSecondary}
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder="Time (e.g. 19:00)"
        placeholderTextColor={theme.textSecondary}
        value={time}
        onChangeText={setTime}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder="Number of Guests"
        keyboardType="numeric"
        placeholderTextColor={theme.textSecondary}
        value={guests}
        onChangeText={setGuests}
      />

      <TouchableOpacity
        disabled={submitting}
        style={[styles.btn, { backgroundColor: theme.primary }]}
        onPress={handleReserve}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Submit Reservation</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.subHeader, { color: theme.text }]}>My Bookings</Text>
      <FlatList
        data={myReservations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.bold, { color: theme.text }]}>
              Table #{item.table?.tableNumber} - {item.date} @ {item.time}
            </Text>
            <Text style={{ color: theme.textSecondary }}>Guests: {item.guests}</Text>
            <Text style={{ color: theme.primary, fontWeight: 'bold', marginTop: 4 }}>
              Status: {item.status.toUpperCase()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 18, marginBottom: 8 },
  label: { fontSize: 14, marginBottom: 6 },
  tableRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tablePill: { padding: 8, borderRadius: 8, borderWidth: 1 },
  input: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  btn: { padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  bold: { fontWeight: 'bold' },
});