import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import RequireAuth from '@/components/RequireAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetTicket } from '@/hooks/useTicket';
import { useGetEvent } from '@/hooks/useEvent';
import { useGetMe } from '@/hooks';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BG_COLOR = '#F4F7FA';
const CARD_BG = '#ffffff';
const TEXT_DARK = '#1a1f36';
const TEXT_GRAY = '#6b7280';
const BORDER_COLOR = '#e5e7eb';

const getLocationDisplay = (event: any) => {
  const locations = event?.locations || event?.Locations;
  if (locations?.length) {
    const loc = locations[0];
    return loc.name || loc.Name || loc.address || loc.Address || 'Đang cập nhật';
  }
  return event?.location || event?.Location || 'Đang cập nhật';
};

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: ticketRes, isLoading: ticketLoading } = useGetTicket(id || '');
  const { data: profileRes, isLoading: profileLoading } = useGetMe();

  const ticket = ticketRes?.data;
  const profile = profileRes?.data;

  const eventId = ticket?.eventId || (ticket as any)?.EventId;
  const { data: eventRes, isLoading: eventLoading } = useGetEvent(eventId || '', { hasLocations: true });

  const fullEvent = eventRes?.data?.data ?? eventRes?.data;
  const event = fullEvent || ticket?.event || (ticket as any)?.Event;

  if (ticketLoading || profileLoading) return <View style={[styles.container, styles.center]}><LoadingSpinner /></View>;
  if (!ticket) return <View style={[styles.container, styles.center]}><Text style={{ color: TEXT_DARK }}>Không tìm thấy vé</Text></View>;

  const startTimeStr = event?.startTime || (event as any)?.StartTime;
  const startTime = startTimeStr ? new Date(startTimeStr) : null;
  const thumbnailUrl = event?.thumbnailUrl || (event as any)?.ThumbnailUrl;
  const bannerUrl = event?.bannerUrl || (event as any)?.BannerUrl;

  return (
    <RequireAuth title="Chi tiết vé" message="Đăng nhập để xem thông tin vé của bạn.">
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vé của tôi</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="share-outline" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.ticketWrapper}>
            <View style={styles.ticketCard}>
              {/* Top Hero Section */}
              <View style={styles.heroSection}>
                <Image
                  source={{ uri: bannerUrl || thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80' }}
                  style={styles.heroImage}
                  contentFit="cover"
                />
                <View style={styles.heroOverlay}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{event?.name || (event as any)?.Name || 'Sự kiện'}</Text>
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    <Ionicons name="location-sharp" size={14} color="#fff" opacity={0.8} /> {getLocationDisplay(event)}
                  </Text>
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoValue} numberOfLines={1}>{profile?.fullName || (profile as any)?.FullName || 'Guest User'}</Text>
                    <Text style={styles.infoLabel}>Họ tên</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoValue}>
                      {startTime ? startTime.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa xác định'}
                    </Text>
                    <Text style={styles.infoLabel}>Ngày</Text>
                  </View>
                </View>

                <View style={[styles.infoRow, { marginTop: 25 }]}>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoValue}>{ticket.zone || (ticket as any)?.Zone || 'GA'}</Text>
                    <Text style={styles.infoLabel}>Khu vực</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoValue}>
                      {startTime ? startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}
                    </Text>
                    <Text style={styles.infoLabel}>Giờ</Text>
                  </View>
                </View>
              </View>

              {/* Dòng gạch đứt ngăn cách (đã xóa lõm 2 bên) */}
              <View style={styles.perforationWrapper}>
                <View style={styles.dashedLine} />
              </View>

              {/* Bottom Barcode Section */}
              <View style={styles.barcodeSection}>
                <Text style={styles.barcodeLabel}>Mã Barcode Đặt Vé</Text>
                <View style={styles.barcodeContainer}>
                  <Image
                    source={{ uri: `https://bwipjs-api.metafloor.com/?bcid=code128&text=${ticket.id}&includetext&guardwhitespace` }}
                    style={styles.barcodeImage}
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.bookingId}>{ticket.id.toUpperCase()}</Text>
              </View>

              {/* Đã xóa hoàn toàn Zig-zag ở đáy */}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: TEXT_DARK, fontSize: 20, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
  ticketWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },
  ticketCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20, // Bo góc cho thẻ vé
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  heroSection: { height: 200 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  eventTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  eventLocation: { color: '#fff', fontSize: 13, opacity: 0.9 },
  infoSection: { padding: 25, paddingBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  infoValue: { color: TEXT_DARK, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  infoLabel: { color: TEXT_GRAY, fontSize: 11, fontWeight: '500', textTransform: 'uppercase' },

  perforationWrapper: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    flex: 1,
    height: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginHorizontal: 25,
  },

  barcodeSection: {
    padding: 25,
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 35 // Chỉnh lại padding đáy sau khi bỏ zig-zag
  },
  barcodeLabel: { color: TEXT_GRAY, fontSize: 12, fontWeight: '500', marginBottom: 15, textTransform: 'uppercase' },
  barcodeContainer: { width: '100%', height: 70, justifyContent: 'center', alignItems: 'center' },
  barcodeImage: { width: '100%', height: '100%' },
  bookingId: { color: TEXT_DARK, fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: 8, opacity: 0.7 },
});