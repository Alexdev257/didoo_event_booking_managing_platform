import React, { useState, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetTicketListing, useGetTickets, useGetTicketTypes } from '@/hooks/useTicket';
import { useGetEvent } from '@/hooks/useEvent';
import { useGetMe } from '@/hooks';
import { useTradeBooking, useGetPaymentMethods } from '@/hooks/useBooking';
import { EventStatus } from '@/utils/enum';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from '@/lib/toast';
import { handleErrorApi } from '@/lib/errors';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#ee8c2b';
const TEXT_DARK = '#1a1f36';
const TEXT_GRAY = '#6b7280';
const BORDER_COLOR = '#e5e7eb';

const formatMoney = (value: number | null | undefined) => {
  if (value == null) return 'Liên hệ';
  if (value === 0) return 'Miễn phí';
  return `${value.toLocaleString('vi-VN')}đ`;
};

export default function ResaleConfirmScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { data: listingRes, isLoading: listingLoading } = useGetTicketListing(listingId || '');
  const { data: profileRes, isLoading: profileLoading } = useGetMe();
  const { data: paymentMethodsRes } = useGetPaymentMethods();
  const ownerId =
    (profileRes?.data as any)?.id ||
    (profileRes?.data as any)?.Id ||
    (profileRes?.data as any)?.userId ||
    (profileRes?.data as any)?.UserId;
  const { data: userTicketsRes } = useGetTickets({
    ownerId,
    eventId: listingRes?.data?.eventId,
    pageSize: 100,
    hasType: true,
  }, { enabled: !!ownerId && !!listingRes?.data?.eventId });
  const { data: ticketTypesRes } = useGetTicketTypes(
    { eventId: listingRes?.data?.eventId },
    { enabled: !!listingRes?.data?.eventId }
  );
  const { create: createTrade } = useTradeBooking();

  const listing = listingRes?.data;
  const profile = profileRes?.data;
  const paymentMethods = paymentMethodsRes?.data?.items || [];
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);

  const { data: eventRes, isLoading: eventLoading } = useGetEvent(listing?.eventId || '');
  const fullEvent = (eventRes as any)?.data ?? eventRes;
  const eventStatus = fullEvent?.status ?? listing?.event?.status ?? (listing?.event as any)?.Status;
  const isEventSaleOpen = eventStatus === EventStatus.OPENED;
  const isEventPublished = eventStatus === EventStatus.PUBLISHED;

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0]);
    }
  }, [paymentMethods]);

  const handleConfirm = async () => {
    if (!listing || !profile) return;
    if (isAtResaleLimit) {
      toast.error('Bạn đã vượt quá giới hạn số vé của loại vé này.');
      return;
    }

    try {
      const body = {
        listingId: listing.id,
        buyerUserId: profile.id,
        fullname: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      };

      const result = await createTrade.mutateAsync(body as any);
      const paymentUrl = (result as any)?.PaymentUrl || (result as any)?.paymentUrl;

      if (paymentUrl) {
         toast.success('Đang chuyển hướng đến trang thanh toán...');
         setTimeout(() => {
           Linking.openURL(paymentUrl).catch(err => {
             console.error("Failed to open payment URL:", err);
             Alert.alert('Lỗi', 'Không thể mở trang thanh toán. Vui lòng thử lại.');
           });
         }, 1000);
      } else {
         toast.success('Mua vé thành công!');
         router.replace('/(main)/(tabs)/tickets' as any);
      }
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  if (listingLoading || profileLoading) return <View style={styles.center}><LoadingSpinner /></View>;
  if (!listing) return <View style={styles.center}><Text>Không tìm thấy tin đăng</Text></View>;
  if (listing.eventId && eventLoading) return <View style={styles.center}><LoadingSpinner /></View>;
  if (isEventPublished) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="lock-closed-outline" size={64} color="#94a3b8" />
        <Text style={styles.blockedTitle}>Chưa mở bán vé</Text>
        <Text style={styles.blockedMessage}>Sự kiện này chưa mở bán vé. Không thể mua vé resale.</Text>
        <TouchableOpacity style={styles.backBtnBlocked} onPress={() => router.back()}>
          <Text style={styles.backBtnBlockedText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const event = fullEvent || listing.event;
  const ticketTypeId =
    listing.ticket?.ticketTypeId ||
    (listing.ticket as any)?.ticketType?.id ||
    (listing.ticket as any)?.TicketTypeId ||
    (listing.ticket as any)?.TicketType?.Id;
  const ticketTypes = ticketTypesRes?.data?.items || [];
  const userTickets = userTicketsRes?.data?.items || [];
  const ticketType = ticketTypes.find((tt: any) => tt.id === ticketTypeId);
  const maxPerUser =
    ticketType?.maxTicketsPerUser ??
    (ticketType as any)?.MaxTicketsPerUser ??
    (ticketType as any)?.maxTicketTypePer ??
    (ticketType as any)?.MaxTicketTypePer ??
    4;
  const ownedCount = userTickets.filter((t: any) =>
    (t.ticketType?.id === ticketTypeId) ||
    ((t as any).ticketTypeId === ticketTypeId) ||
    ((t as any).TicketTypeId === ticketTypeId) ||
    ((t as any).ticketType?.Id === ticketTypeId) ||
    ((t as any).TicketType?.Id === ticketTypeId)
  ).length;
  const isAtResaleLimit = ownedCount >= maxPerUser;

  return (
    <RequireAuth title="Mua vé lại" message="Đăng nhập để xác nhận mua vé lại từ người bán.">
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.title}>Xác nhận mua vé</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Event Info Card */}
        <View style={styles.eventInfoCard}>
          <Image
            source={{ uri: event?.bannerUrl || event?.thumbnailUrl || 'https://via.placeholder.com/400x200' }}
            style={styles.eventImage}
            contentFit="cover"
          />
          <View style={styles.eventInfoContent}>
            <Text style={styles.eventName} numberOfLines={2}>{event?.name}</Text>
            
            <View style={styles.eventInfoRow}>
              <Ionicons name="calendar-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.eventInfoText}>
                 {event?.startTime ? new Date(event.startTime).toLocaleDateString('vi-VN') : 'Sắp diễn ra'}
              </Text>
            </View>

            <View style={styles.eventInfoRow}>
              <Ionicons name="location-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.eventInfoText} numberOfLines={1}>
                Vietnam
              </Text>
            </View>
          </View>
        </View>

        {isAtResaleLimit && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#b45309" />
            <Text style={styles.warningBannerText}>
              Bạn đã sở hữu {ownedCount}/{maxPerUser} vé loại này cho sự kiện. Không thể mua thêm vé resale.
            </Text>
          </View>
        )}

        <View style={styles.userConfirmRow}>
          <View style={styles.userConfirmBadge}>
            <Ionicons name="person" size={14} color="#fff" />
            <Text style={styles.userConfirmText}>{profile?.fullName}</Text>
          </View>
          <View style={[styles.userConfirmBadge, { backgroundColor: '#f3f4f6' }]}>
            <Ionicons name="ticket" size={14} color={PRIMARY_COLOR} />
            <Text style={[styles.userConfirmText, { color: TEXT_DARK }]}>1 vé resale</Text>
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tóm tắt giao dịch</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Người bán</Text>
            <Text style={styles.summaryValue}>{listing.sellerUser?.fullName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Loại vé</Text>
            <Text style={styles.summaryValue}>{listing.ticket?.zone || 'Hàng GA'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số lượng</Text>
            <Text style={styles.summaryValue}>1 vé</Text>
          </View>
          <View style={styles.dash} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalValue}>
              {formatMoney(listing.askingPrice)}
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.summaryCard, { marginTop: 15 }]}>
          <Text style={styles.summaryTitle}>Thông tin người mua</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Họ tên</Text>
            <Text style={styles.summaryValue}>{profile?.fullName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Email</Text>
            <Text style={styles.summaryValue}>{profile?.email}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số điện thoại</Text>
            <Text style={styles.summaryValue}>{profile?.phone || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <View style={{ gap: 12, marginBottom: 30 }}>
            {paymentMethods.map((pm: any) => (
            <TouchableOpacity
                key={pm.Id}
                style={[
                styles.paymentMethodItem,
                selectedPaymentMethod?.Id === pm.Id && styles.paymentMethodSelected
                ]}
                onPress={() => setSelectedPaymentMethod(pm)}
            >
                <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>{pm.Name?.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.paymentName}>{pm.Name}</Text>
                {pm.Description && <Text style={styles.paymentDesc}>{pm.Description}</Text>}
                </View>
                {selectedPaymentMethod?.Id === pm.Id && (
                <Ionicons name="checkmark-circle" size={24} color={PRIMARY_COLOR} />
                )}
            </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.confirmBtn, (createTrade.isPending || isAtResaleLimit) && styles.btnDisabled]} 
            onPress={handleConfirm}
            disabled={createTrade.isPending || isAtResaleLimit}
        >
          <Text style={styles.confirmBtnText}>
            {createTrade.isPending ? 'Đang xử lý...' : isAtResaleLimit ? 'Đã đạt giới hạn mua vé' : 'Xác nhận & Thanh toán'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22, backgroundColor: '#f8fafc' },
  title: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  scrollContent: { padding: 20, paddingBottom: 100 },
  eventInfoCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  eventImage: { width: '100%', height: 160 },
  eventInfoContent: { padding: 16 },
  eventName: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, marginBottom: 10 },
  eventInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  eventInfoText: { fontSize: 14, color: TEXT_GRAY, marginLeft: 8 },
  userConfirmRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  userConfirmBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_COLOR, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  userConfirmText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  summaryCard: { backgroundColor: '#f9fafb', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK, marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  summaryLabel: { color: TEXT_GRAY, fontSize: 14 },
  summaryValue: { color: TEXT_DARK, fontWeight: '700', fontSize: 14, textAlign: 'right', flex: 1, marginLeft: 10 },
  dash: { height: 1, borderTopWidth: 1, borderTopColor: BORDER_COLOR, borderStyle: 'dashed', marginVertical: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  totalValue: { fontSize: 20, fontWeight: '800', color: PRIMARY_COLOR },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK, marginTop: 10, marginBottom: 15 },
  paymentMethodItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#f1f5f9', backgroundColor: '#fff' },
  paymentMethodSelected: { borderColor: PRIMARY_COLOR, backgroundColor: '#fff7ed' },
  paymentIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  paymentIconText: { fontSize: 12, fontWeight: '800', color: TEXT_GRAY },
  paymentName: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  paymentDesc: { fontSize: 12, color: TEXT_GRAY, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: BORDER_COLOR },
  confirmBtn: { height: 56, backgroundColor: PRIMARY_COLOR, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6, backgroundColor: '#9ca3af' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 12, padding: 14, marginBottom: 16 },
  warningBannerText: { flex: 1, fontSize: 13, color: '#b45309', fontWeight: '600', marginLeft: 10 },
  blockedTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', marginTop: 16, marginBottom: 8 },
  blockedMessage: { fontSize: 15, color: '#6b7280', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
  backBtnBlocked: { backgroundColor: PRIMARY_COLOR, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  backBtnBlockedText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
