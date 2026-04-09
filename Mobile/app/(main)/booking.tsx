import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import RequireAuth from '@/components/RequireAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetEvent } from '@/hooks/useEvent';
import { useBooking, useGetPaymentMethods } from '@/hooks/useBooking';
import { EventStatus } from '@/utils/enum';
import { useGetTickets, useGetTicketTypes } from '@/hooks/useTicket';
import { useSessionStore } from '@/stores/sesionStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useTicketHub } from '@/hooks/useTicketHub';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TicketType } from '@/types/ticket';
import { toast } from '@/lib/toast';
import { handleErrorApi } from '@/lib/errors';

const PRIMARY_COLOR = '#ee8c2b';
const TEXT_DARK = '#1a1f36';
const EMPTY_OBJ = {};

// Helper to format date
const formatDate = (dateStr: string) => {
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
const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper to get location address
const getLocationAddress = (event: any) => {
  if (event?.locations && event.locations.length > 0) {
    const loc = event.locations[0];
    return  loc.address || 'Đang cập nhật';
  }
  return event?.location || 'Đang cập nhật';
};

const formatMoney = (value: number | null | undefined) => {
  if (value == null) return 'Liên hệ';
  if (value === 0) return 'Miễn phí';
  return `${value.toLocaleString('vi-VN')}đ`;
};

export default function BookingScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const { data: eventRes, isLoading: eventLoading } = useGetEvent(eventId || '', { hasTicketTypes: true, hasLocations: true });
  const { create } = useBooking();
  const { data: paymentMethodsRes } = useGetPaymentMethods();
  const { data: ticketTypesRes } = useGetTicketTypes({ eventId: eventId }, { enabled: !!eventId });
  
  // Real-time updates
  const { selectTicket } = useTicketHub(eventId || '');
  const realTimeAvailability: Record<string, number> = useTicketStore((s) => s.availability[eventId || ''] || EMPTY_OBJ);

  // Get user's existing tickets for this event to check maxTicketsPerUser limit
  const ownerId = (user as any)?.userId || (user as any)?.UserId;
  const { data: userTicketsRes } = useGetTickets({ 
    ownerId,
    eventId: eventId,
    pageSize: 100,
    hasType: true, // Required to filter by ticketType.id
  }, { enabled: !!ownerId && !!eventId });

  const [step, setStep] = useState(0);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({
    fullname: (user as any)?.fullName || (user as any)?.FullName || '',
    email: (user as any)?.email || (user as any)?.Email || '',
    phone: '',
  });
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  useEffect(() => {
    if (user && !personalInfo.fullname && !personalInfo.email) {
      setPersonalInfo({
        fullname: (user as any)?.fullName || (user as any)?.FullName || '',
        email: (user as any)?.email || (user as any)?.Email || '',
        phone: '',
      });
    }
  }, [user]);

  const eventDetail = eventRes?.data;
  const paymentMethods = paymentMethodsRes?.data?.items || [];
  const userTickets = userTicketsRes?.data?.items || [];
  const ticketTypes = (ticketTypesRes?.data?.items || []).map(tt => {
    const purchased = userTickets.filter((t: any) => 
      (t.ticketType?.id === tt.id) || ((t as any).ticketTypeId === tt.id)
    ).length;
    const maxPerUser = tt.maxTicketsPerUser ?? 4;
    return {
      ...tt,
      availableQuantity: realTimeAvailability[tt.id] ?? tt.availableQuantity,
      purchasedCount: purchased,
      isMaxed: purchased >= maxPerUser,
      maxAllowed: Math.max(0, maxPerUser - purchased)
    };
  });

  const purchasedCount = selectedTicketType ? (ticketTypes.find(tt => tt.id === selectedTicketType.id)?.purchasedCount || 0) : 0;
  const maxAllowed = selectedTicketType ? (ticketTypes.find(tt => tt.id === selectedTicketType.id)?.maxAllowed ?? 4) : 4;
  const isAtLimit = selectedTicketType && maxAllowed === 0;

  const handleQuantityChange = async (newQty: number) => {
    if (!selectedTicketType) return;
    
    const diff = newQty - quantity;
    setQuantity(newQty);
    
    // Notify hub about selection change
    await selectTicket(selectedTicketType.id, diff);
  };

  const isLoading = eventLoading || !ticketTypesRes;
  const eventStatus = eventDetail?.status ?? (eventDetail as any)?.Status;
  const isSaleOpen = eventStatus === EventStatus.OPENED;

  if (isLoading) return <LoadingSpinner />;
  if (!eventDetail) return <View style={styles.center}><Text>Không tìm thấy sự kiện</Text></View>;
  if (!isSaleOpen) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="lock-closed-outline" size={64} color="#94a3b8" />
        <Text style={styles.blockedTitle}>Chưa mở bán vé</Text>
        <Text style={styles.blockedMessage}>Sự kiện này chưa mở bán vé. Vui lòng quay lại sau.</Text>
        <TouchableOpacity style={styles.backBtnBlocked} onPress={() => router.back()}>
          <Text style={styles.backBtnBlockedText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleNext = () => {
    if (step === 0) {
      if (!selectedTicketType) {
        toast.error('Vui lòng chọn loại vé');
        return;
      }
      if (maxAllowed === 0) {
        toast.error(`Bạn đã mua tối đa số lượng vé cho loại ${selectedTicketType.name}`);
        return;
      }
      if (quantity > maxAllowed) {
        toast.error(`Bạn chỉ có thể mua thêm tối đa ${maxAllowed} vé loại này.`);
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!personalInfo.fullname || !personalInfo.email) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTicketType || !user) return;

    try {
      const result = await create.mutateAsync({
        eventId: eventDetail.id,
        ticketTypeId: selectedTicketType.id,
        quantity: quantity,
        userId: (user as any)?.userId || (user as any)?.UserId,
        fullname: personalInfo.fullname,
        email: personalInfo.email,
        phone: personalInfo.phone,
      });

      // If payment URL is provided, we must redirect to it to complete the order
      const paymentUrl = (result as any)?.PaymentUrl || (result as any)?.paymentUrl;
      if (paymentUrl) {
        setIsPaymentPending(true);
        toast.success('Đang chuyển hướng đến trang thanh toán...');
        setTimeout(() => {
          Linking.openURL(paymentUrl).catch(() => {
            toast.error('Không thể mở trang thanh toán. Vui lòng thử lại.');
          });
        }, 1000);
      }
      
      setStep(3);
    } catch (error) {
      handleErrorApi({ error });
      setStep(4);
    }
  };

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.eventMiniCard}>
        <Image
          source={{ uri: eventDetail?.bannerUrl || eventDetail?.thumbnailUrl || 'https://via.placeholder.com/400x200' }}
          style={styles.eventMiniImage}
          contentFit="cover"
        />
        <View style={styles.eventMiniContent}>
          <Text style={styles.eventCategory}>Sự kiện</Text>
          <Text style={styles.eventTitleMini} numberOfLines={2}>{eventDetail.name}</Text>
          <View style={styles.eventMiniInfoRow}>
            <Ionicons name="calendar-outline" size={12} color={PRIMARY_COLOR} />
            <Text style={styles.eventMiniInfoText}>
              {formatDate(eventDetail?.startTime)} • {formatTime(eventDetail?.startTime)}
            </Text>
          </View>
          <View style={styles.eventLocRow}>
            <Ionicons name="location-outline" size={12} color={PRIMARY_COLOR} />
            <Text style={styles.eventLocMini} numberOfLines={1}>{getLocationAddress(eventDetail)}</Text>
          </View>
        </View>
      </View>

      {eventDetail?.ticketMapUrl && (
        <View style={styles.ticketMapContainer}>
          <Text style={styles.sectionTitle}>Sơ đồ chỗ ngồi</Text>
          <Image
            source={{ uri: eventDetail.ticketMapUrl }}
            style={styles.ticketMapImage}
            contentFit="contain"
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>Chọn loại vé</Text>
      {ticketTypes.map((tt: any) => {
        const isSelected = selectedTicketType?.id === tt.id;
        const ttMaxAllowed = tt.maxAllowed ?? 4;
        return (
          <TouchableOpacity
            key={tt.id}
            style={[
              styles.ticketTypeItem,
              isSelected && styles.ticketTypeItemSelected,
              tt.isMaxed && styles.ticketTypeItemDisabled
            ]}
            onPress={() => {
              if (tt.isMaxed) {
                toast.error(`Bạn đã mua tối đa số lượng vé cho loại ${tt.name}`);
                return;
              }
              setSelectedTicketType(tt);
              if (!isSelected) setQuantity(1);
            }}
            disabled={tt.isMaxed && !isSelected}
          >
            <View style={styles.ttMain}>
              <View style={{ flex: 1 }}>
                <View style={styles.ttHeaderRow}>
                  <Text style={styles.ttName}>{tt.name}</Text>
                  {tt.isMaxed && (
                    <View style={styles.limitBadge}>
                      <Text style={styles.limitBadgeText}>Đã hết lượt mua</Text>
                    </View>
                  )}
                </View>
                {tt.description && <Text style={styles.ttDescText}>{tt.description}</Text>}
                <Text style={styles.ttStatus}>{tt.availableQuantity} vé còn lại</Text>
                {tt.purchasedCount > 0 && (
                  <Text style={styles.purchasedText}>Bạn đã sở hữu {tt.purchasedCount} vé loại này</Text>
                )}
              </View>
              <View style={styles.ttRightCol}>
                <Text style={styles.ttPrice}>{formatMoney(tt.price)}</Text>
                <Text style={styles.ttMaxText}>Tối đa: {tt.maxTicketsPerUser || 4} vé</Text>
                {isSelected && (
                  <View style={styles.qtyInline}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, (quantity <= 1) && styles.qtyBtnDisabled]}
                      onPress={() => handleQuantityChange(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Text style={[styles.qtyBtnText, (quantity <= 1) && styles.qtyBtnTextDisabled]}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{quantity}</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, (quantity >= ttMaxAllowed) && styles.qtyBtnDisabled]}
                      onPress={() => handleQuantityChange(Math.min(ttMaxAllowed, quantity + 1))}
                      disabled={quantity >= ttMaxAllowed}
                    >
                      <Text style={[styles.qtyBtnText, (quantity >= ttMaxAllowed) && styles.qtyBtnTextDisabled]}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {isAtLimit && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#b45309" />
          <Text style={styles.warningBannerText}>
            Bạn đã đạt giới hạn tối đa {selectedTicketType?.maxTicketsPerUser || 4} vé cho loại "{selectedTicketType?.name}". Không thể mua thêm.
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.fullname}
          onChangeText={(t) => setPersonalInfo({ ...personalInfo, fullname: t })}
          placeholder="Họ và tên"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.email}
          onChangeText={(t) => setPersonalInfo({ ...personalInfo, email: t })}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={personalInfo.phone}
          onChangeText={(t) => setPersonalInfo({ ...personalInfo, phone: t })}
          placeholder="09xx xxx xxx"
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.noteBox}>
        <Ionicons name="shield-checkmark" size={20} color="#10b981" />
        <Text style={styles.noteText}>Thông tin này được dùng để nhận vé điện tử qua Email.</Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      {/* Event Info Card */}
      <View style={styles.eventInfoCard}>
        <Image
          source={{ uri: eventDetail?.bannerUrl || eventDetail?.thumbnailUrl || 'https://via.placeholder.com/400x200' }}
          style={styles.eventImage}
          contentFit="cover"
        />
        <View style={styles.eventInfoContent}>
          <View style={styles.ttHeaderRow}>
            <Text style={styles.eventName} numberOfLines={2}>{eventDetail?.name}</Text>
          </View>
          
          <View style={styles.eventInfoRow}>
            <Ionicons name="calendar-outline" size={14} color={PRIMARY_COLOR} />
            <Text style={styles.eventInfoText}>
              {formatDate(eventDetail?.startTime)} • {formatTime(eventDetail?.startTime)}
            </Text>
          </View>

          <View style={styles.eventInfoRow}>
            <Ionicons name="location-outline" size={14} color={PRIMARY_COLOR} />
            <Text style={styles.eventInfoText} numberOfLines={1}>
              {getLocationAddress(eventDetail)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.userConfirmRow}>
        <View style={styles.userConfirmBadge}>
          <Ionicons name="person" size={14} color="#fff" />
          <Text style={styles.userConfirmText}>{personalInfo.fullname}</Text>
        </View>
        <View style={[styles.userConfirmBadge, { backgroundColor: '#f3f4f6' }]}>
          <Ionicons name="ticket" size={14} color={PRIMARY_COLOR} />
          <Text style={[styles.userConfirmText, { color: TEXT_DARK }]}>{quantity} vé {selectedTicketType?.name}</Text>
        </View>
      </View>

      {/* Booking Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tóm tắt đặt vé</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Loại vé</Text>
          <Text style={styles.summaryValue}>{selectedTicketType?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Số lượng</Text>
          <Text style={styles.summaryValue}>{quantity} vé</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Đơn giá</Text>
          <Text style={styles.summaryValue}>{formatMoney(selectedTicketType?.price)}</Text>
        </View>
        <View style={styles.dash} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
          <Text style={styles.totalValue}>
            {formatMoney((selectedTicketType?.price || 0) * quantity)}
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={[styles.summaryCard, { marginTop: 15 }]}>
        <Text style={styles.summaryTitle}>Thông tin người mua</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Họ tên</Text>
          <Text style={styles.summaryValue}>{personalInfo.fullname}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Email</Text>
          <Text style={styles.summaryValue}>{personalInfo.email}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Số điện thoại</Text>
          <Text style={styles.summaryValue}>{personalInfo.phone || 'Chưa cập nhật'}</Text>
        </View>
      </View>

      {/* Payment Methods */}
      {selectedTicketType?.price && selectedTicketType.price > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={{ gap: 12 }}>
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

            {paymentMethods.length === 0 && (
              <View style={[styles.summaryCard, styles.paymentMethod]}>
                <View style={styles.momoIcon}>
                  <Text style={styles.momoText}>MoMo</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.paymentName}>Ví điện tử MoMo</Text>
                  <Text style={styles.paymentDesc}>Thanh toán nhanh chóng & an toàn</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={PRIMARY_COLOR} />
              </View>
            )}
          </View>
        </>
      ) : null}
    </View>
  );

  const renderStep3 = () => (
    <View style={[styles.stepContainer, { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }]}>
      <View style={styles.successIcon}>
        <Ionicons name={isPaymentPending ? "time" : "checkmark"} size={60} color="#fff" />
      </View>
      <Text style={styles.successTitle}>
        {isPaymentPending ? 'Đang chờ thanh toán' : 'Đặt vé thành công!'}
      </Text>
      <Text style={styles.successDesc}>
        {isPaymentPending 
          ? 'Vui lòng hoàn tất thanh toán trên trình duyệt. Vé sẽ xuất hiện trong lịch sử sau khi giao dịch thành công.'
          : 'Chúc mừng bạn đã đặt vé thành công. Vui lòng kiểm tra email để nhận mã vé điện tử.'}
      </Text>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => router.replace('/(main)/(tabs)/tickets' as any)}
      >
        <Text style={styles.doneBtnText}>Xem vé của tôi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.replace('/(main)/(tabs)' as any)}
      >
        <Text style={styles.homeBtnText}>Quay lại trang chủ</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={[styles.stepContainer, { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }]}>
      <View style={[styles.successIcon, { backgroundColor: '#ef4444' }]}>
        <Ionicons name="close" size={60} color="#fff" />
      </View>
      <Text style={styles.successTitle}>Đặt vé thất bại!</Text>
      <Text style={styles.successDesc}>
        Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý giao dịch của bạn. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.
      </Text>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => setStep(2)}
      >
        <Text style={styles.doneBtnText}>Thử lại</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.replace('/(main)/(tabs)' as any)}
      >
        <Text style={styles.homeBtnText}>Quay lại trang chủ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <RequireAuth title="Đặt vé" message="Đăng nhập để tiến hành đặt vé cho sự kiện.">
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          {step < 3 && (
            <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{step === 3 ? 'Hoàn tất' : step === 4 ? 'Thất bại' : 'Đặt vé'}</Text>
          <View style={{ width: 24 }} />
        </View>

        {step < 3 && (
          <View style={styles.progressRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  step >= i ? styles.dotActive : styles.dotInactive,
                  i < 2 && { flex: 1 }
                ]}
              />
            ))}
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        {step < 3 && (
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>Tổng cộng</Text>
              <Text style={styles.footerPrice}>
                {formatMoney((selectedTicketType?.price || 0) * quantity)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, isAtLimit && styles.nextBtnDisabled]}
              onPress={step === 2 ? handleConfirm : handleNext}
              disabled={create.isPending || isAtLimit || false}
            >
              <Text style={styles.nextBtnText}>
                {create.isPending ? 'Đang xử lý...' : isAtLimit ? 'Đã đạt giới hạn mua vé' : step === 2 ? (selectedTicketType?.price && selectedTicketType.price > 0 ? 'Thanh toán' : 'Xác nhận đặt vé') : 'Tiếp tục'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  progressRow: { flexDirection: 'row', paddingHorizontal: 40, marginTop: 10, alignItems: 'center' },
  dot: { height: 4, borderRadius: 2 },
  dotActive: { backgroundColor: PRIMARY_COLOR },
  dotInactive: { backgroundColor: '#e5e7eb' },
  scrollContent: { padding: 20 },
  stepContainer: { flex: 1 },
  eventMiniCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  eventMiniImage: { width: '100%', height: 100 },
  eventMiniContent: { padding: 14 },
  eventInfoCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  eventImage: { width: '100%', height: 160 },
  eventInfoContent: { padding: 16 },
  eventName: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, marginBottom: 10 },
  userConfirmRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  userConfirmBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_COLOR, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  userConfirmText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  eventMiniInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  eventMiniInfoText: { fontSize: 12, color: '#6b7280', marginLeft: 6 },
  eventCategory: { fontSize: 13, color: PRIMARY_COLOR, fontWeight: '700', marginBottom: 4 },
  eventTitleMini: { fontSize: 18, fontWeight: '800', color: '#1f2937', marginBottom: 8 },
  eventLocRow: { flexDirection: 'row', alignItems: 'center' },
  eventLocMini: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', marginBottom: 20 },
  ticketMapContainer: { marginBottom: 28 },
  ticketMapImage: { width: '100%', height: 220, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  ticketTypeItem: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  ticketTypeItemSelected: { borderColor: PRIMARY_COLOR, backgroundColor: '#fff7ed' },
  ttMain: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ttName: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 2 },
  ttDescText: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  ttStatus: { fontSize: 12, color: PRIMARY_COLOR, fontWeight: '600' },
  purchasedText: { fontSize: 12, color: PRIMARY_COLOR, fontWeight: '600', marginTop: 4 },
  ticketTypeItemDisabled: { opacity: 0.7, backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  ttHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  limitBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
  limitBadgeText: { color: '#ef4444', fontSize: 10, fontWeight: '700' },
  ttRightCol: { alignItems: 'flex-end' },
  ttPrice: { fontSize: 16, fontWeight: '800', color: PRIMARY_COLOR },
  ttMaxText: { fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: '600' },
  qtyInline: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  qtyBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
  qtyBtnDisabled: { borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  qtyBtnText: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  qtyBtnTextDisabled: { color: '#d1d5db' },
  qtyValue: { fontSize: 18, fontWeight: '700', paddingHorizontal: 20, color: '#1f2937' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { height: 52, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#111827' },
  noteBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', padding: 12, borderRadius: 12 },
  noteText: { fontSize: 13, color: '#065f46', marginLeft: 8, flex: 1 },
  summaryCard: { backgroundColor: '#f9fafb', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK, marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  summaryLabel: { color: '#6b7280', fontSize: 14 },
  summaryValue: { color: '#1f2937', fontWeight: '700', fontSize: 14, flex: 1, textAlign: 'right', marginLeft: 20 },
  dash: { height: 1, borderTopWidth: 1, borderTopColor: '#e5e7eb', borderStyle: 'dashed', marginVertical: 15 },
  eventInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  eventInfoText: { fontSize: 14, color: '#6b7280', marginLeft: 8, flex: 1 },
  paymentMethodItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, marginBottom: 12 },
  paymentMethodSelected: { borderColor: PRIMARY_COLOR, backgroundColor: '#fff7ed' },
  paymentIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  paymentIconText: { fontSize: 14, fontWeight: '800', color: '#4b5563' },
  paymentName: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  paymentDesc: { fontSize: 12, color: '#6b7280' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  footerPrice: { fontSize: 18, fontWeight: '800', color: '#1f2937' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  totalValue: { fontSize: 22, fontWeight: '800', color: PRIMARY_COLOR },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', marginTop: -5 },
  momoIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#a50064', justifyContent: 'center', alignItems: 'center' },
  momoText: { color: '#fff', fontWeight: '800', fontSize: 10 },
  nextBtn: { backgroundColor: '#1f2937', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12, minWidth: 150, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#9ca3af', opacity: 0.8 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 12, padding: 14, marginTop: 16 },
  warningBannerText: { flex: 1, fontSize: 13, color: '#b45309', fontWeight: '600', marginLeft: 10 },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 15 },
  successDesc: { textAlign: 'center', color: '#6b7280', lineHeight: 22, paddingHorizontal: 20, marginBottom: 40 },
  doneBtn: { backgroundColor: PRIMARY_COLOR, width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 15 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtn: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  homeBtnText: { color: '#4b5563', fontSize: 16, fontWeight: '600' },
  safetyBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 12 },
  safetyText: { fontSize: 13, color: '#4b5563', marginLeft: 8, fontWeight: '500' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blockedTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', marginTop: 16, marginBottom: 8 },
  blockedMessage: { fontSize: 15, color: '#6b7280', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
  backBtnBlocked: { backgroundColor: PRIMARY_COLOR, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  backBtnBlockedText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
