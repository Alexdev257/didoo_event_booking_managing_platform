import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetTickets } from '@/hooks/useTicket';
import { useSessionStore } from '@/stores/sesionStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticket } from '@/types/ticket';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#ee8c2b';
const BACKGROUND_COLOR = '#F8FAFC';
const TEXT_DARK = '#1A1F36';
const TEXT_GRAY = '#6B7280';

export default function TicketsHistoryScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  
  // Resilient userId lookup
  const userId = (user as any)?.userId || (user as any)?.UserId;

  const { data: ticketsRes, isLoading } = useGetTickets({
    ownerId: userId,
    pageSize: 50,
    hasEvent: true,
    hasType: true
  }, { enabled: !!userId });

  const tickets = ticketsRes?.data?.items || [];

  const renderTicketItem = ({ item }: { item: Ticket }) => {
    const event = item.event;
    const ticketType = item.ticketType;
    const startTime = event?.startTime ? new Date(event.startTime) : null;

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => router.push({ pathname: '/ticket/[id]', params: { id: item.id } } as any)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: event?.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80' }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.eventLabel} numberOfLines={1}>
              {ticketType?.name || 'Vé phổ thông'}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Đã thanh toán</Text>
            </View>
          </View>
          
          <Text style={styles.eventTitle} numberOfLines={2}>{event?.name || 'Sự kiện không tên'}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.infoText}>
                {startTime ? startTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '--/--'}
              </Text>
            </View>
            <View style={[styles.infoItem, { marginLeft: 12 }]}>
              <Ionicons name="time-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.infoText}>
                {startTime ? startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={TEXT_GRAY} />
            <Text style={styles.locationText} numberOfLines={1}>
              {event?.locations?.[0]?.name || 'Địa điểm chưa cập nhật'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.title}>Vé của tôi</Text>
        <View style={{ width: 44 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="Chưa có vé"
              message="Bạn chưa mua vé nào. Hãy khám phá các sự kiện hấp dẫn ngay!"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardImage: {
    width: 120,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 10,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: TEXT_GRAY,
    marginLeft: 4,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
