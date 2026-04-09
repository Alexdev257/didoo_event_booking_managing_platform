import React, { useMemo } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetTicketListings } from '@/hooks/useTicket';
import { useGetEventsByIds } from '@/hooks/useEvent';
import { useSessionStore } from '@/stores/sesionStore';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { TicketListingStatus } from '@/utils/enum';
import { TicketListing } from '@/types/ticket';
import { Event } from '@/types/event';

const LOCAL_PRIMARY = '#ee8c2b';

// Helper to format date
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
  });
};

// Helper to get status info
const getStatusInfo = (status: number) => {
  switch (status) {
    case TicketListingStatus.ACTIVE:
      return { label: 'Đang bán', color: '#10b981', bgColor: '#d1fae5' };
    case TicketListingStatus.PENDING:
      return { label: 'Chờ duyệt', color: '#f59e0b', bgColor: '#fef3c7' };
    case TicketListingStatus.SOLD:
      return { label: 'Đã bán', color: '#6b7280', bgColor: '#f3f4f6' };
    case TicketListingStatus.CANCELLED:
      return { label: 'Đã hủy', color: '#ef4444', bgColor: '#fee2e2' };
    default:
      return { label: 'Không xác định', color: '#6b7280', bgColor: '#f3f4f6' };
  }
};

export default function ResellScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const [activeTab, setActiveTab] = React.useState(0);

  // Fetch listings where the current user is the seller
  const userId = (user as any)?.userId || (user as any)?.UserId;
  const { data: listingsRes, isLoading } = useGetTicketListings({
    sellerUserId: userId,
    pageSize: 50,
    isDeleted: false
  }, { enabled: !!userId });

  const listings = listingsRes?.data?.items || [];

  // Extract unique event IDs and fetch full event data
  const eventIds = useMemo(() => {
    const ids = listings.map((l: TicketListing) => l.eventId).filter((id): id is string => Boolean(id));
    return [...new Set(ids)];
  }, [listings]);

  const { data: eventsData, isLoading: eventsLoading } = useGetEventsByIds(eventIds, { hasLocations: true });

  // Create a map of event data for quick lookup
  const eventsMap = useMemo(() => {
    const map = new Map<string, Event>();
    eventsData?.forEach((event: Event) => {
      if (event?.id) map.set(event.id, event);
    });
    return map;
  }, [eventsData]);

  // Merge event data into listings
  const listingsWithEvents = useMemo(() => {
    return listings.map((listing: TicketListing) => ({
      ...listing,
      event: listing.eventId && eventsMap.has(listing.eventId)
        ? eventsMap.get(listing.eventId)
        : listing.event
    }));
  }, [listings, eventsMap]);

  const isLoadingFinal = isLoading || eventsLoading;

  // Filter based on status
  const filteredListings = activeTab === 0
    ? listingsWithEvents.filter(
        (l: TicketListing) =>
          l.status === TicketListingStatus.ACTIVE ||
          l.status === TicketListingStatus.PENDING
      )
    : listingsWithEvents.filter((l: TicketListing) => l.status === TicketListingStatus.SOLD);

  const renderListingItem = ({ item }: { item: TicketListing }) => {
    const mainTicket = item.ticket;
    const ticketCount = item.ticketIds?.length || 1;
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity style={styles.listingCard} activeOpacity={0.7}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>

        {/* Event Name */}
        <Text style={styles.eventName} numberOfLines={2}>
          {item.event?.name || (item.event as any)?.Name || 'Sự kiện'}
        </Text>

        {/* Ticket Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.ticketInfo}>
            <Ionicons name="ticket-outline" size={14} color="#6b7280" />
            <Text style={styles.ticketText}>
              {ticketCount > 1 ? `${ticketCount} vé` : mainTicket?.zone || (mainTicket as any)?.Zone || 'Hàng GA'}
            </Text>
          </View>

          {(item.event?.startTime || (item.event as any)?.StartTime) && (
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text style={styles.dateText}>{formatDate(item.event?.startTime || (item.event as any)?.StartTime)}</Text>
            </View>
          )}
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Giá bán</Text>
          <Text style={styles.priceText}>
            {item.askingPrice == null ? 'Liên hệ' : item.askingPrice === 0 ? 'Miễn phí' : `${item.askingPrice.toLocaleString('vi-VN')}đ`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <RequireAuth title="Bán lại vé" message="Đăng nhập để xem và quản lý các vé bạn đang bán lại.">
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bán lại vé</Text>
        <Text style={styles.subtitle}>
          {filteredListings.length} tin đăng
        </Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>Đang bán</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Đã bán</Text>
        </TouchableOpacity>
      </View>

      {isLoadingFinal ? (
        <View style={styles.center}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          renderItem={renderListingItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="Trống"
              message={activeTab === 0 ? "Bạn không có vé nào đang bán" : "Bạn chưa bán thành công vé nào"}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/resale/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#fff7ed',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: LOCAL_PRIMARY,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ticketText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  priceLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: LOCAL_PRIMARY,
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LOCAL_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: LOCAL_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
