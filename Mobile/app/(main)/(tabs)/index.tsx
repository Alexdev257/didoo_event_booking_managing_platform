import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Dimensions, Platform } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetEvents, useGetCategories } from '@/hooks/useEvent';
import { useGetMe } from '@/hooks';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Event } from '@/types/event';
import { useRouter } from 'expo-router';
import { EventStatus } from '@/utils/enum';
import { EventPrice } from '@/components/event/EventPrice';

const { width } = Dimensions.get('window');
const BACKGROUND_COLOR = '#fff';
const PRIMARY_COLOR = '#ee8c2b';
const TEXT_DARK = '#1a1f36';
const TEXT_GRAY = '#888';

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const { data: profileRes } = useGetMe();

  const { data: openedRes, isLoading: openedLoading } = useGetEvents({
    pageSize: 10,
    name: debouncedSearch || undefined,
    categoryId: selectedCategoryId,
    status: EventStatus.OPENED,
    hasTicketTypes: true,
    hasLocations: true
  });

  const { data: publishedRes, isLoading: publishedLoading } = useGetEvents({
    pageSize: 5,
    name: debouncedSearch || undefined,
    categoryId: selectedCategoryId,
    status: EventStatus.PUBLISHED,
    hasTicketTypes: true,
    hasLocations: true
  });

  const { data: categoriesRes, isLoading: categoriesLoading } = useGetCategories({ pageSize: 20 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const openedEvents = openedRes?.data?.items || [];
  const publishedEvents = publishedRes?.data?.items || [];
  const categories = categoriesRes?.data?.items || [];
  const profile = profileRes?.data;

  // Debug logging
  console.log('[Home] Opened events:', openedEvents.length);
  if (openedEvents.length > 0) {
    console.log('[Home] First event prices:', openedEvents[0].ticketTypes?.map(t => t.price));
  }

  const renderEventCard = ({ item }: { item: Event }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } } as any)}
      >
        <Image
          source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80' }}
          style={styles.cardBg}
        />
        <View style={styles.cardOverlay}>
          <View style={styles.cardTop}>
             <View style={styles.statusBadge}>
               <Text style={styles.statusText}>Đang diễn ra</Text>
             </View>
          </View>

          <View style={styles.cardBottom}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitleCard}>{item.name}</Text>
              <Text style={styles.eventDateCard}>
                {item.startTime ? new Date(item.startTime).toLocaleDateString('vi-VN', { weekday: 'short', month: '2-digit', day: '2-digit' }) : 'Sat 01/11'}
              </Text>
              <EventPrice eventId={item.id} style={styles.eventPriceCard} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPublishedItem = (item: Event) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.publishedRow}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } } as any)}
      >
        <Image
          source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80' }}
          style={styles.publishedThumb}
        />
        <View style={styles.publishedInfo}>
          <Text style={styles.publishedTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.publishedDate}>
            {item.startTime ? new Date(item.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
          </Text>
          <EventPrice eventId={item.id} style={styles.publishedPrice} prefix="Từ " />
        </View>
        <Ionicons name="chevron-forward" size={20} color={TEXT_GRAY} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Header Row: Greeting and Profile */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.greeting}>Hi {profile?.fullName?.split(' ')[0] || 'Friend'} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push('/profile' as any)}
            >
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.profileImg} />
              ) : (
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.profileImg}
                  contentFit="contain"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Main Heading Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.mainHeading}>Sẵn sàng cùng bạn {"\n"}khám phá mọi Sự Kiện.</Text>
          </View>

          {/* Search Row */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={TEXT_GRAY} />
              <TextInput
                placeholder="Tìm kiếm sự kiện"
                placeholderTextColor={TEXT_GRAY}
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            <TouchableOpacity
              style={[styles.filterBtn, !selectedCategoryId && styles.filterBtnActive]}
              onPress={() => setSelectedCategoryId(undefined)}
            >
              <Text style={[styles.filterText, !selectedCategoryId && styles.filterTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterBtn, selectedCategoryId === cat.id && styles.filterBtnActive]}
                onPress={() => setSelectedCategoryId(selectedCategoryId === cat.id ? undefined : cat.id)}
              >
                <Text style={[styles.filterText, selectedCategoryId === cat.id && styles.filterTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Opened Events Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự kiện đang diễn ra</Text>
          </View>
          
          <View style={styles.carouselContainer}>
            {openedLoading ? (
              <LoadingSpinner />
            ) : openedEvents.length > 0 ? (
              <FlatList
                data={openedEvents}
                renderItem={renderEventCard}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={width * 0.85 + 20}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />
            ) : (
              <EmptyState title="Trống" message="Không có sự kiện nào đang diễn ra" />
            )}
          </View>

          {/* Published Events Section */}
          <View style={[styles.sectionHeader, { marginTop: 30 }]}>
            <Text style={styles.sectionTitle}>Sự kiện sắp tới</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/events' as any)}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.publishedList}>
            {publishedLoading ? (
              <LoadingSpinner />
            ) : publishedEvents.length > 0 ? (
              publishedEvents.map(item => renderPublishedItem(item))
            ) : (
              <EmptyState title="Trống" message="Không có sự kiện nào sắp diễn ra" />
            )}
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  scrollContent: { paddingTop: 0 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Greeting left, Profile right
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    height: 60
  },
  profileBtn: {
    width: 50, // Slightly smaller to match greeting height better
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 }
    })
  },
  profileImg: { width: '100%', height: '100%' },
  welcomeSection: { paddingHorizontal: 20, marginBottom: 25 },
  greeting: { color: TEXT_DARK, fontSize: 18, fontWeight: '700' },
  mainHeading: { color: TEXT_DARK, fontSize: 30, fontWeight: '800', marginTop: 0, lineHeight: 38 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 25, alignItems: 'center' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', height: 60, borderRadius: 30, paddingHorizontal: 20 },
  searchInput: { flex: 1, marginLeft: 10, color: TEXT_DARK, fontSize: 16, fontWeight: '500' },
  filterList: { paddingHorizontal: 20, marginBottom: 30 },
  filterBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 25, backgroundColor: '#f5f5f5', marginRight: 12, borderWidth: 1, borderColor: '#eee' },
  filterBtnActive: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  filterText: { color: TEXT_DARK, fontWeight: '600', fontSize: 14 },
  filterTextActive: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  carouselContainer: { marginBottom: 15 },
  seeAllText: { fontSize: 14, color: PRIMARY_COLOR, fontWeight: '600' },
  statusBadge: { backgroundColor: 'rgba(238, 140, 43, 0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  publishedList: { paddingHorizontal: 20, marginBottom: 20 },
  publishedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  publishedThumb: { width: 70, height: 70, borderRadius: 15 },
  publishedInfo: { flex: 1, marginLeft: 15 },
  publishedTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 4 },
  publishedDate: { fontSize: 13, color: PRIMARY_COLOR, fontWeight: '600', marginBottom: 2 },
  publishedPrice: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  card: {
    width: width * 0.85,
    height: 300,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 20,
    backgroundColor: '#f8fafc',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12
  },
  cardBg: { width: '100%', height: '100%', position: 'absolute' },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
    justifyContent: 'space-between'
  },
  cardTop: { width: '100%' },
  cardBottom: { width: '100%', flexDirection: 'row', alignItems: 'flex-end' },
  eventTitleCard: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 5 },
  eventDateCard: { color: '#eee', fontSize: 14, fontWeight: '600', marginBottom: 5 },
  eventPriceCard: { color: '#fff', fontSize: 18, fontWeight: '900' },
});