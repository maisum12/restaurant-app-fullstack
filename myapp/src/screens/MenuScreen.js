import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';

export function MenuScreen() {
  const { theme } = useTheme();
  const { dispatch } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  // useApi hook se live MongoDB data fetch karna
  const queryUrl = `/api/menu?category=${selectedCategory}&search=${search}`;
  const { data: menu, loading, error, refetch } = useApi(queryUrl);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity
          onPress={refetch}
          style={[styles.btn, { backgroundColor: theme.primary }]}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Input */}
      <TextInput
        style={[
          styles.searchInput,
          { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
        ]}
        placeholder="Search dishes..."
        placeholderTextColor={theme.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* Category Filter Pills */}
      <View style={styles.categoriesRow}>
        {categories.map((cat) => {
          const isSelected = (cat === 'All' && selectedCategory === '') || selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat === 'All' ? '' : cat)}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ color: isSelected ? '#fff' : theme.text, fontWeight: '600' }}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Menu List */}
      <FlatList
        data={menu || []}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.title, { color: theme.text }]}>{item.name}</Text>
              <Text style={{ color: theme.textSecondary, marginVertical: 4 }}>
                {item.description}
              </Text>
              <Text style={[styles.price, { color: theme.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              disabled={!item.isAvailable}
              style={[
                styles.addBtn,
                { backgroundColor: item.isAvailable ? theme.primary : '#888' },
              ]}
              onPress={() => dispatch({ type: 'ADD_ITEM', payload: item })}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {item.isAvailable ? 'Add' : 'Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchInput: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  card: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  price: { fontWeight: 'bold', fontSize: 15 },
  addBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});