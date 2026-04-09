import React, { useMemo } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetTickets } from '@/hooks/useTicket';
import { useGetBookings } from '@/hooks/useBooking';
import { useGetEventsByIds } from '@/hooks/useEvent';
import { useSessionStore } from '@/stores/sesionStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticket } from '@/types/ticket';
import { Booking } from '@/types/booking';
import { Event } from '@/types/event';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { BookingTypeStatus } from '@/utils/enum';

const PRIMARY_COLOR = '#ee8c2b';

// Helper to format date
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return 'Chưa xác định';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
};

// Helper to format time
const formatTime = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper to get location address
const getLocationAddress = (event: any) => {
  const locations = event?.locations || event?.Locations;
  if (locations && locations.length > 0) {
    return locations[0].name || locations[0].Name || locations[0].address || locations[0].Address || '';
  }
  return event?.location || event?.Location || 'Đang cập nhật';
};

// Helper to get ticket status label
const getTicketStatusLabel = (status: number) => {
  switch (status) {
    case 1: return 'Còn hiệu lực';
    case 2: return 'Đã sử dụng';
    case 3: return 'Hết hạn';
    case 4: return 'Bị khóa';
    default: return 'Không xác định';
  }
};

// Helper to get ticket status color
const getTicketStatusColor = (status: number) => {
  switch (status) {
    case 1: return '#10b981'; // green
    case 2: return '#6b7280'; // gray
    case 3: return '#ef4444'; // red
    case 4: return '#f59e0b'; // amber
    default: return '#6b7280';
  }
};

export default function TicketsHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const user = useSessionStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders'>(
    params.tab === 'orders' ? 'orders' : 'tickets'
  );

  const userId = (user as any)?.userId || (user as any)?.UserId;
  const {
    data: ticketsRes,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
  } = useGetTickets(
    {
      ownerId: userId,
      pageSize: 50,
      hasEvent: true,
      hasType: true,
    },
    { enabled: !!userId }
  );
  const {
    data: bookingsRes,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useGetBookings(
    {
      userId,
      bookingType: BookingTypeStatus.NORMAL,
      pageSize: 50,
      isDescending: true,
    },
    { enabled: !!userId }
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTickets(), refetchBookings()]);
    setRefreshing(false);
  }, [refetchBookings, refetchTickets]);

  useFocusEffect(
    useCallback(() => {
      refetchTickets();
      refetchBookings();
    }, [refetchBookings, refetchTickets])
  );

  const tickets = ticketsRes?.data?.items || [];
  const orders = bookingsRes?.data?.items || [];

  // Extract unique event IDs and fetch full event data
  const eventIds = useMemo(() => {
    const ticketEventIds = tickets
      .map((t: Ticket) => t.eventId)
      .filter((id): id is string => Boolean(id));
    const bookingEventIds = orders
      .map((b: Booking) => ((b as any)?.eventId || b.EventId) as string | undefined)
      .filter((id): id is string => Boolean(id));
    const ids = [...ticketEventIds, ...bookingEventIds];
    return [...new Set(ids)];
  }, [orders, tickets]);

  const { data: eventsData, isLoading: eventsLoading } = useGetEventsByIds(eventIds, { hasLocations: true });

  // Create a map of event data for quick lookup
  const eventsMap = useMemo(() => {
    const map = new Map<string, Event>();
    eventsData?.forEach((event: Event) => {
      if (event?.id) map.set(event.id, event);
    });
    return map;
  }, [eventsData]);

  // Merge event data into tickets
  const ticketsWithEvents = useMemo(() => {
    return tickets.map((ticket: Ticket) => ({
      ...ticket,
      event: ticket.eventId && eventsMap.has(ticket.eventId)
        ? eventsMap.get(ticket.eventId)
        : ticket.event
    }));
  }, [tickets, eventsMap]);

  const isLoadingFinal = ticketsLoading || bookingsLoading || eventsLoading;

  const renderTicketItem = ({ item }: { item: Ticket }) => {
    const event = item.event || (item as any).Event;
    const ticketType = item.ticketType || (item as any).TicketType;
    const statusColor = getTicketStatusColor(item.status);

    const eventName = event?.name || (event as any)?.Name || 'Sự kiện';
    const ticketTypeName = ticketType?.name || (ticketType as any)?.Name || 'Vé';
    const zoneName = item.zone || (item as any).Zone || 'Hàng GA';
    const startTime = event?.startTime || (event as any)?.StartTime;
    const thumbnailUrl = event?.thumbnailUrl || (event as any)?.ThumbnailUrl;
    const bannerUrl = event?.bannerUrl || (event as any)?.BannerUrl;

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => router.push({ pathname: '/ticket/[id]', params: { id: item.id } } as any)}
        activeOpacity={0.8}
      >
        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: thumbnailUrl || bannerUrl || 'https://via.placeholder.com/300x150' }}
            style={styles.eventImage}
            contentFit="cover"
            transition={200}
          />
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getTicketStatusLabel(item.status)}</Text>
          </View>
        </View>

        {/* Ticket Info */}
        <View style={styles.ticketContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>{eventName}</Text>

          <View style={styles.ticketTypeRow}>
            <View style={styles.ticketTypeBadge}>
              <Text style={styles.ticketTypeText}>{ticketTypeName}</Text>
            </View>
            <Text style={styles.zoneText}>{zoneName}</Text>
          </View>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={PRIMARY_COLOR} />
            <Text style={styles.infoText}>
              {formatDate(startTime)} • {formatTime(startTime)}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={PRIMARY_COLOR} />
            <Text style={styles.infoText} numberOfLines={1}>
              {getLocationAddress(event)}
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </View>
      </TouchableOpacity>
    );
  };

  const getBookingStatusLabel = (status: unknown) => {
    const raw = String(status ?? '').toLowerCase();
    if (raw === '1' || raw.includes('pending')) return 'Đang chờ thanh toán';
    if (raw === '2' || raw.includes('paid')) return 'Đã thanh toán';
    if (raw === '3' || raw.includes('cancel')) return 'Đã hủy';
    return 'Không xác định';
  };

  const getBookingStatusColor = (status: unknown) => {
    const raw = String(status ?? '').toLowerCase();
    if (raw === '1' || raw.includes('pending')) return { bg: '#fef3c7', text: '#b45309' };
    if (raw === '2' || raw.includes('paid')) return { bg: '#dcfce7', text: '#166534' };
    if (raw === '3' || raw.includes('cancel')) return { bg: '#fee2e2', text: '#b91c1c' };
    return { bg: '#f3f4f6', text: '#4b5563' };
  };

  const renderOrderItem = ({ item }: { item: Booking }) => {
    const bookingId = (item as any)?.id || item.Id;
    const eventId = (item as any)?.eventId || item.EventId;
    const event = eventId ? eventsMap.get(eventId) : undefined;
    const eventName = event?.name || (event as any)?.Name || 'Sự kiện';
    const totalPrice = Number((item as any)?.totalPrice ?? item.TotalPrice ?? 0);
    const amount = Number((item as any)?.amount ?? item.Amount ?? 0);
    const createdAt = (item as any)?.createdAt || item.CreatedAt;
    const status = (item as any)?.status || item.Status;
    const statusStyle = getBookingStatusColor(status);

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderCode} numberOfLines={1}>
            #{String(bookingId).slice(0, 8).toUpperCase()}
          </Text>
          <View style={[styles.orderStatusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.orderStatusText, { color: statusStyle.text }]}>
              {getBookingStatusLabel(status)}
            </Text>
          </View>
        </View>

        <Text style={styles.orderEventName} numberOfLines={2}>{eventName}</Text>

        <View style={styles.orderMetaRow}>
          <View style={styles.orderMetaItem}>
            <Ionicons name="ticket-outline" size={14} color="#6b7280" />
            <Text style={styles.orderMetaText}>{amount} vé</Text>
          </View>
          <View style={styles.orderMetaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.orderMetaText}>
              {createdAt ? formatDate(createdAt) : 'Chưa xác định'}
            </Text>
          </View>
        </View>

        <View style={styles.orderTotalRow}>
          <Text style={styles.orderTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.orderTotalValue}>{totalPrice === 0 ? 'Miễn phí' : `${totalPrice.toLocaleString('vi-VN')}đ`}</Text>
        </View>
      </View>
    );
  };

  return (
    <RequireAuth title="Vé của tôi" message="Đăng nhập để xem vé và lịch sử đơn hàng của bạn.">
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Vé của tôi</Text>
        <Text style={styles.subtitle}>
          {activeTab === 'tickets' ? `${tickets.length} vé` : `${orders.length} đơn hàng`}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tickets' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tickets')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'tickets' && styles.tabBtnTextActive]}>
            Vé của tôi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'orders' && styles.tabBtnTextActive]}>
            Đơn hàng
          </Text>
        </TouchableOpacity>
      </View>

      {isLoadingFinal ? (
        <View style={styles.center}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={(activeTab === 'tickets' ? ticketsWithEvents : orders) as any[]}
          keyExtractor={(item: any) =>
            activeTab === 'tickets'
              ? item.id
              : (item?.id || item?.Id || '')
          }
          renderItem={activeTab === 'tickets' ? (renderTicketItem as any) : (renderOrderItem as any)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <EmptyState
              title={activeTab === 'tickets' ? 'Chưa có vé' : 'Chưa có đơn hàng'}
              message={
                activeTab === 'tickets'
                  ? 'Bạn chưa mua vé nào. Hãy khám phá các sự kiện hấp dẫn ngay!'
                  : 'Hiện chưa có đơn hàng mua vé thường nào.'
              }
            />
          }
        />
      )}
    </SafeAreaView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 8,
  },
  tabBtnActive: {
    backgroundColor: '#fff7ed',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabBtnTextActive: {
    color: PRIMARY_COLOR,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  ticketContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    lineHeight: 22,
  },
  ticketTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTypeBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  ticketTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  zoneText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  chevronContainer: {
    position: 'absolute',
    right: 12,
    top: 140,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  orderCode: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderEventName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderMetaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  orderTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderTotalLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
