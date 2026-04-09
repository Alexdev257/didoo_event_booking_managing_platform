import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetOrganizer, useGetEvents } from '@/hooks/useEvent';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventStatus } from '@/utils/enum';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#ee8c2b';
const TEXT_DARK = '#1a1f36';
const TEXT_GRAY = '#888';

export default function OrganizerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: organizerRes, isLoading: organizerLoading } = useGetOrganizer(id || '');
  const { data: eventsRes, isLoading: eventsLoading } = useGetEvents({ organizerId: id || '', pageSize: 20, hasTicketTypes: true, hasLocations: true });

  const organizer = organizerRes?.data;
  const events = eventsRes?.data?.items || [];
  const getEventStatus = (event: any) => event?.status ?? event?.Status;

  const upcomingEvents = events.filter((event) => getEventStatus(event) === EventStatus.PUBLISHED);
  const openedEvents = events.filter((event) => getEventStatus(event) === EventStatus.OPENED);
  const closedEvents = events.filter((event) => getEventStatus(event) === EventStatus.CLOSED);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(EventStatus.OPENED);

  const handleOpenLink = (url?: string) => {
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl).catch(err => console.error("Couldn't load page", err));
    }
  };

  if (organizerLoading) return <LoadingSpinner />;
  if (!organizer) return <View style={styles.center}><Text>Không tìm thấy nhà tổ chức</Text></View>;

  const renderEventCard = (item: any) => {
    const prices = item.ticketTypes?.map((t: any) => t.price).filter((p: number | null | undefined) => p != null) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const priceLabel = minPrice == null ? 'Liên hệ' : minPrice === 0 ? 'Miễn phí' : `Từ ${minPrice.toLocaleString('vi-VN')}đ`;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.eventCard}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } } as any)}
      >
        <Image
          source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80' }}
          style={styles.eventThumb}
          contentFit="cover"
        />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.eventDate}>
            {item.startTime ? new Date(item.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
          </Text>
          <Text style={styles.eventPrice}>{priceLabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={TEXT_GRAY} />
      </TouchableOpacity>
    );
  };

  const statusOptions = [
    { key: EventStatus.PUBLISHED, label: 'Sắp diễn ra', count: upcomingEvents.length },
    { key: EventStatus.OPENED, label: 'Đang diễn ra', count: openedEvents.length },
    { key: EventStatus.CLOSED, label: 'Đã qua', count: closedEvents.length },
  ];

  const filteredEvents =
    selectedStatus === EventStatus.PUBLISHED
      ? upcomingEvents
      : selectedStatus === EventStatus.OPENED
        ? openedEvents
        : closedEvents;

  const emptyMessage =
    selectedStatus === EventStatus.PUBLISHED
      ? 'Chưa có sự kiện sắp diễn ra.'
      : selectedStatus === EventStatus.OPENED
        ? 'Hiện không có sự kiện nào đang diễn ra.'
        : 'Chưa có sự kiện nào đã kết thúc.';

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{organizer.name}</Text>
          <View style={{ width: 45 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Banner & Profile */}
          <View style={styles.profileSection}>
            <View style={styles.bannerContainer}>
              <Image
                source={{ uri: organizer.bannerUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80' }}
                style={styles.bannerImg}
                contentFit="cover"
                cachePolicy="disk"
              />
            </View>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: organizer.logoUrl || 'https://i.pravatar.cc/150?u=org' }}
                style={styles.logoImg}
                contentFit="cover"
                cachePolicy="disk"
              />
            </View>
            <View style={styles.nameSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.orgName}>{organizer.name}</Text>
                {organizer.isVerified && (
                  <Ionicons name="checkmark-circle" size={20} color="#3b82f6" style={{ marginLeft: 6 }} />
                )}
              </View>
              {organizer.email && <Text style={styles.orgEmail}>{organizer.email}</Text>}

              <View style={styles.joinedBadge}>
                <Ionicons name="calendar-outline" size={14} color={TEXT_GRAY} />
                <Text style={styles.joinedText}>
                  Tham gia từ {organizer.createdAt ? new Date(organizer.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : '---'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Bar */}
          {/* <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{events.length}</Text>
              <Text style={styles.statLabel}>Sự kiện</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{organizer.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}</Text>
              <Text style={styles.statLabel}>Trạng thái</Text>
            </View>
          </View> */}

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu</Text>
            <Text style={styles.description}>{organizer.description || 'Chưa có thông tin giới thiệu cho nhà tổ chức này.'}</Text>
          </View>

          {/* Social Links */}
          <View style={styles.socialRow}>
            {organizer.facebookUrl && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleOpenLink(organizer.facebookUrl)}>
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
            )}
            {organizer.instagramUrl && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleOpenLink(organizer.instagramUrl)}>
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              </TouchableOpacity>
            )}
            {organizer.tiktokUrl && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleOpenLink(organizer.tiktokUrl)}>
                <Ionicons name="logo-tiktok" size={24} color="#000000" />
              </TouchableOpacity>
            )}
            {organizer.websiteUrl && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => handleOpenLink(organizer.websiteUrl)}>
                <Ionicons name="globe-outline" size={24} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            )}
          </View>

          {/* Contact & Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoText}>{organizer.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginTop: 12 }]}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location-outline" size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.infoText}>{organizer.address || 'Đang cập nhật địa chỉ...'}</Text>
              </View>
            </View>
            {organizer.email && (
              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="mail-outline" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoText}>{organizer.email}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Events List */}
          <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sự kiện của nhà tổ chức</Text>
              <Text style={styles.eventCount}>{events.length} sự kiện</Text>
            </View>

            {eventsLoading ? (
              <LoadingSpinner />
            ) : events.length > 0 ? (
              <>
                <View style={styles.statusTabsRow}>
                  {statusOptions.map((option) => {
                    const isActive = selectedStatus === option.key;
                    return (
                      <TouchableOpacity
                        key={String(option.key)}
                        style={[styles.statusTab, isActive && styles.statusTabActive]}
                        onPress={() => setSelectedStatus(option.key)}
                      >
                        <Text style={[styles.statusTabText, isActive && styles.statusTabTextActive]}>
                          {option.label} ({option.count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {filteredEvents.length > 0 ? (
                  filteredEvents.map((item) => renderEventCard(item))
                ) : (
                  <Text style={styles.groupEmpty}>{emptyMessage}</Text>
                )}
              </>
            ) : (
              <EmptyState title="Trống" message="Chưa có sự kiện nào được đăng tải." />
            )}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
    marginTop: Platform.OS === 'android' ? 10 : 0
  },
  headerBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  scrollContent: { paddingTop: 0 },
  profileSection: { width: '100%', alignItems: 'center', marginBottom: 20 },
  bannerContainer: { width: SCREEN_WIDTH, height: 200, backgroundColor: '#f0f0f0', overflow: 'hidden' },
  bannerImg: { width: '100%', height: '100%' },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 5,
    borderColor: '#fff',
    marginTop: -55,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    overflow: 'hidden'
  },
  logoImg: { width: '100%', height: '100%' },
  nameSection: { alignItems: 'center', marginTop: 15, paddingHorizontal: 20 },
  orgName: { fontSize: 24, fontWeight: '800', color: TEXT_DARK },
  orgEmail: { fontSize: 14, color: TEXT_GRAY, marginTop: 4 },
  joinedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  joinedText: { fontSize: 12, color: TEXT_GRAY, marginLeft: 6, fontWeight: '500' },
  statsBar: { flexDirection: 'row', paddingVertical: 20, marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 24, marginTop: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  statLabel: { fontSize: 12, color: TEXT_GRAY, marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, height: '60%', backgroundColor: '#e2e8f0', alignSelf: 'center' },
  section: { paddingHorizontal: 20, marginTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: TEXT_DARK },
  statusTabsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statusTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  statusTabActive: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  statusTabTextActive: {
    color: PRIMARY_COLOR,
  },
  groupEmpty: { fontSize: 14, color: '#94a3b8', marginBottom: 8 },
  eventCount: { fontSize: 13, color: TEXT_GRAY, fontWeight: '600' },
  description: { fontSize: 15, color: '#475569', lineHeight: 24 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 25 },
  socialBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  infoIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 15, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3 },
  infoLabel: { fontSize: 12, color: TEXT_GRAY, fontWeight: '600' },
  infoText: { fontSize: 15, color: TEXT_DARK, marginTop: 2, fontWeight: '700' },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8
  },
  eventThumb: { width: 75, height: 75, borderRadius: 18 },
  eventInfo: { flex: 1, marginLeft: 15 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 5 },
  eventDate: { fontSize: 13, color: PRIMARY_COLOR, fontWeight: '600', marginBottom: 2 },
  eventPrice: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
});
