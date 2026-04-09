import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetEvent } from '@/hooks/useEvent';
import { useGetTicketTypes, useGetTicketListings } from '@/hooks/useTicket';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TicketListingStatus, EventStatus } from '@/utils/enum';
import { TicketListing } from '@/types/ticket';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#ee8c2b';
const TEXT_DARK = '#1a1f36';
const TEXT_GRAY = '#888';

const parseCoordinate = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const formatPrice = (value: number | null | undefined): string => {
  if (value == null) return 'Liên hệ';
  if (value === 0) return 'Miễn phí';
  return `${value.toLocaleString('vi-VN')}đ`;
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: eventRes, isLoading: eventLoading } = useGetEvent(id || '', { hasTicketTypes: true, hasLocations: true });
  const { data: ticketTypesRes, isLoading: ticketsLoading } = useGetTicketTypes({ eventId: id }, { enabled: !!id });

  const event = eventRes?.data;
  const ticketTypes = ticketTypesRes?.data?.items || [];
  const eventStatus = event?.status ?? (event as any)?.Status;
  const isSaleOpen = eventStatus === EventStatus.OPENED;

  // Animation for arrows >>>
  const arrowTranslateX = useSharedValue(0);
  useEffect(() => {
    arrowTranslateX.value = withRepeat(
      withTiming(15, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowTranslateX.value }],
    opacity: interpolate(arrowTranslateX.value, [0, 7, 15], [0.3, 1, 0.3])
  }));

  // Slider Logic
  const SLIDER_WIDTH = SCREEN_WIDTH - 40;
  const CIRCLE_SIZE = 54;
  const SWIPE_RANGE = SLIDER_WIDTH - CIRCLE_SIZE - 16;

  const translateX = useSharedValue(0);
  const isFinished = useSharedValue(false);

  // Reset slider on focus (e.g., when coming back from booking screen)
  useFocusEffect(
    useCallback(() => {
      translateX.value = 0;
      isFinished.value = false;
    }, [])
  );

  // Shimmer animation for text
  const shimmerValue = useSharedValue(0);
  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const onConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({ pathname: '/(main)/booking', params: { eventId: event?.id } } as any);
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!isFinished.value) {
        translateX.value = Math.max(0, Math.min(e.translationX, SWIPE_RANGE));
      }
    })
    .onEnd(() => {
      if (translateX.value >= SWIPE_RANGE * 0.8 && isSaleOpen) {
        translateX.value = withSpring(SWIPE_RANGE);
        isFinished.value = true;
        runOnJS(onConfirm)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const animatedTextStyle = useAnimatedStyle(() => {
    // iPhone style shimmering: text opacity waves
    const opacity = interpolate(
      shimmerValue.value,
      [0, 0.5, 1],
      [0.3, 1, 0.3]
    );

    return {
      opacity: translateX.value > 10 ? interpolate(translateX.value, [0, SWIPE_RANGE / 2], [1, 0]) : opacity,
    };
  });

  if (eventLoading || ticketsLoading) return <LoadingSpinner />;
  if (!event) return <View style={styles.center}><Text>Không tìm thấy sự kiện</Text></View>;

  const mainLocation = event.locations?.[0];
  const latitude = parseCoordinate((mainLocation as any)?.latitude ?? (mainLocation as any)?.Latitude);
  const longitude = parseCoordinate((mainLocation as any)?.longitude ?? (mainLocation as any)?.Longitude);
  const hasCoordinates = latitude !== null && longitude !== null;
  const locationParts = [mainLocation?.address, mainLocation?.district, mainLocation?.province].filter(Boolean);
  const locationLabel = locationParts.join(', ');
  const mapQuery = hasCoordinates ? `${latitude},${longitude}` : locationLabel;
  const hasMapLocation = Boolean(mapQuery);
  const minPrice = ticketTypes.map(t => t.price).filter(p => p != null);
  const minPriceLabel = minPrice.length > 0 ? formatPrice(Math.min(...minPrice)) : 'Liên hệ';
  const eventDayLabel = new Date(event.startTime).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
  const eventTimeLabel = `${new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  const organizerLogo = (event.organizer as any)?.logoUrl ?? (event.organizer as any)?.LogoUrl;
  const organizerInitial = event.organizer?.name?.trim()?.charAt(0)?.toUpperCase() || 'O';

  const openGoogleMaps = async () => {
    if (!hasMapLocation) return;
    const url = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`;
    await Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{event.name}</Text>
          <View style={{ width: 45 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Card */}
          <View style={styles.heroCardContainer}>
            <Image
              source={{ uri: event.bannerUrl || event.thumbnailUrl }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>{event.subtitle || event.name}</Text>
              <Text style={styles.heroMeta}>{eventDayLabel}</Text>
            </View>
          </View>

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            {event.category && (
              <View style={styles.badge}>
                <Ionicons name="apps-outline" size={14} color={PRIMARY_COLOR} />
                <Text style={styles.badgeText}>{event.category.name}</Text>
              </View>
            )}
            <View style={styles.badge}>
              <Ionicons name="alert-circle-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.badgeText}>{event.ageRestriction}+</Text>
            </View>
            {event.tags?.map((tag, idx) => (
              <View key={idx} style={[styles.badge, { backgroundColor: '#f0f9ff' }]}>
                <Text style={[styles.badgeText, { color: '#0369a1' }]}>#{tag.tagName}</Text>
              </View>
            ))}
          </View>

          {/* Organizer Section */}
          <TouchableOpacity
            style={styles.organizerRow}
            onPress={() => router.push({ pathname: '/organizer/[id]', params: { id: event.organizer?.id } } as any)}
          >
            {organizerLogo ? (
              <Image
                source={{ uri: organizerLogo }}
                style={styles.organizerAvatar}
              />
            ) : (
              <View style={styles.organizerFallbackAvatar}>
                <Text style={styles.organizerFallbackText}>{organizerInitial}</Text>
              </View>
            )}
            <View style={styles.organizerInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.organizerName}>{event.organizer?.name || 'Organizer'}</Text>
                {event.organizer?.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#3b82f6" style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.organizerLoc}>
                {locationLabel || 'Địa điểm sẽ được cập nhật sớm'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_GRAY} />
          </TouchableOpacity>

          {/* Google Map Location Section */}
          <View style={styles.mapLinkSection}>
            <View style={styles.mapLinkHeader}>
              <Ionicons name="navigate-circle-outline" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.mapLinkTitle}>Vị trí trên Google Maps</Text>
            </View>

            <View style={styles.mapInfoRow}>
              <View style={styles.mapInfoIcon}>
                <Ionicons name="location-outline" size={18} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.mapInfoTextWrap}>
                <Text style={styles.mapInfoLabel}>Địa điểm</Text>
                <Text style={styles.mapInfoAddress} numberOfLines={2}>
                  {locationLabel || 'Ban tổ chức sẽ cập nhật địa chỉ cụ thể sau.'}
                </Text>
              </View>
            </View>

            {hasMapLocation ? (
              <>
                <TouchableOpacity style={styles.mapLinkButton} onPress={openGoogleMaps}>
                  <Ionicons name="open-outline" size={16} color="#fff" />
                  <Text style={styles.mapLinkButtonText}>Xem đường đi trên Google Maps</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.mapLinkMissingText}>
                Chưa có thông tin vị trí cho sự kiện này.
              </Text>
            )}
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoRow}>
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Ionicons name="ticket-outline" size={20} color={PRIMARY_COLOR} />
              </View>
              <View>
                <Text style={styles.infoCardLabel}>Giá vé</Text>
                <Text style={styles.infoCardValue}>{minPriceLabel}</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Ionicons name="time-outline" size={20} color={PRIMARY_COLOR} />
              </View>
              <View>
                <Text style={styles.infoCardLabel}>{eventDayLabel}</Text>
                <Text style={styles.infoCardValue}>{eventTimeLabel}</Text>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Giới thiệu sự kiện</Text>
            <Text style={styles.description}>{event.description || 'Ban tổ chức chưa cập nhật mô tả cho sự kiện này.'}</Text>
          </View>

          {/* Ticket Types List */}
          {event.ticketTypes && event.ticketTypes.length > 0 && (
            <View style={styles.ticketSection}>
              <Text style={styles.sectionTitle}>Loại vé từ Ban tổ chức</Text>
              {event.ticketTypes.map((tt) => (
                <View key={tt.id} style={styles.ticketCard}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketName}>{tt.name}</Text>
                    <Text style={styles.ticketPrice}>{formatPrice(tt.price)}</Text>
                  </View>
                  <Text style={styles.ticketDesc} numberOfLines={2}>{tt.description || 'Chưa có mô tả'}</Text>
                  <View style={styles.ticketFooter}>
                    <View style={[styles.statusBadge, tt.availableQuantity > 0 ? styles.statusSuccess : styles.statusDanger]}>
                      <Text style={tt.availableQuantity > 0 ? styles.statusSuccessText : styles.statusDangerText}>
                        {tt.availableQuantity > 0 ? `Còn lại: ${tt.availableQuantity}` : 'Hết vé'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Resale Listings Section - only when sale is open */}
          {isSaleOpen && <ResaleListingsSection eventId={id || ''} />}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating Action Slider (iPhone Style) - only when sale is open */}
        {isSaleOpen ? (
          <View style={styles.floatingFooter}>
            <View style={styles.sliderBackground}>
              <View style={styles.sliderTextContainer}>
                <Animated.Text style={[styles.pillButtonText, animatedTextStyle]}>
                  Vuốt để mua vé
                </Animated.Text>
              </View>

              <View style={styles.arrowContainer}>
                <Animated.View style={[styles.pillArrowStack, animatedArrowStyle]}>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: -8 }} />
                  <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: -8 }} />
                </Animated.View>
              </View>

              <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.pillIconCircle, animatedCircleStyle]}>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </Animated.View>
              </GestureDetector>
            </View>
          </View>
        ) : (
          <View style={[styles.floatingFooter, styles.saleClosedBanner]}>
            <View style={styles.saleClosedContent}>
              <Ionicons name="lock-closed-outline" size={24} color={TEXT_GRAY} />
              <Text style={styles.saleClosedText}>Chưa mở bán vé</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function ResaleListingsSection({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data: listingsRes, isLoading } = useGetTicketListings({
    eventId,
    status: TicketListingStatus.ACTIVE,
    pageSize: 10,
    isDeleted: false
  });

  const listings = listingsRes?.data?.items || [];

  if (isLoading) return <LoadingSpinner />;
  if (listings.length === 0) return null;

  return (
    <View style={styles.ticketSection}>
      <Text style={styles.sectionTitle}>Vé từ người bán lại</Text>
      {listings.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.ticketCard, { borderColor: PRIMARY_COLOR + '40', backgroundColor: '#fffcf9' }]}
          onPress={() => router.push({ pathname: '/(main)/resale/confirm/[listingId]', params: { listingId: item.id } } as any)}
        >
          <View style={styles.ticketHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: item.sellerUser?.avatarUrl || 'https://i.pravatar.cc/150?u=' + item.sellerUserId }}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
              />
              <Text style={styles.ticketName}>{item.sellerUser?.fullName}</Text>
            </View>
            <Text style={styles.ticketPrice}>{formatPrice(item.askingPrice)}</Text>
          </View>
          <Text style={styles.ticketDesc} numberOfLines={2}>
            {item.description || `Vé ${item.ticket?.zone || 'GA'} - Giao dịch an toàn qua TicketResell`}
          </Text>
          <View style={styles.ticketFooter}>
            <View style={[styles.statusBadge, styles.statusSuccess]}>
              <Text style={styles.statusSuccessText}>Đang bán</Text>
            </View>
            <Text style={{ fontSize: 12, color: TEXT_GRAY, marginLeft: 'auto' }}>
              {item.ticket?.zone || 'Hàng GA'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
    marginTop: 4,
    backgroundColor: '#f8fafc'
  },
  headerBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  subtitle: { fontSize: 14, color: TEXT_GRAY, textAlign: 'center', marginBottom: 15, marginTop: -5 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  heroCardContainer: {
    width: '100%',
    height: 280,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#000',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20
  },
  heroImage: { width: '100%', height: '100%', opacity: 0.88 },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 22,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 6, lineHeight: 34 },
  heroMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffedd5'
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: PRIMARY_COLOR, marginLeft: 4 },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 14,
  },
  organizerAvatar: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 1, borderColor: '#eee' },
  organizerFallbackAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#fde6cf',
    borderWidth: 1,
    borderColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerFallbackText: {
    fontSize: 20,
    fontWeight: '800',
    color: PRIMARY_COLOR,
  },
  organizerInfo: { flex: 1, marginLeft: 15 },
  organizerName: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  organizerLoc: { fontSize: 14, color: TEXT_GRAY, marginTop: 4, lineHeight: 20 },
  mapLinkSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 14,
    marginBottom: 16,
  },
  mapLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapLinkTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  mapInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapInfoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fde6cf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapInfoTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  mapInfoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  mapInfoAddress: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '600',
    lineHeight: 20,
  },
  mapLinkButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mapLinkButtonText: {
    marginLeft: 6,
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  mapLinkMissingText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  heartBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  quickInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  infoCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  infoCardLabel: { fontSize: 12, color: TEXT_GRAY, fontWeight: '500' },
  infoCardValue: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, marginTop: 2 },
  aboutSection: {
    marginBottom: 26,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, marginBottom: 15 },
  description: { fontSize: 15, color: '#64748b', lineHeight: 23 },
  ticketSection: { marginBottom: 20 },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketName: { fontSize: 17, fontWeight: '700', color: TEXT_DARK },
  ticketPrice: { fontSize: 16, fontWeight: '800', color: PRIMARY_COLOR },
  ticketDesc: { fontSize: 13, color: TEXT_GRAY, lineHeight: 18, marginBottom: 12 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'flex-start' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusSuccess: { backgroundColor: '#f0fdf4' },
  statusDanger: { backgroundColor: '#fef2f2' },
  statusSuccessText: { color: '#16a34a', fontSize: 12, fontWeight: '600' },
  statusDangerText: { color: '#ef4444', fontSize: 12, fontWeight: '600' },
  floatingFooter: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  sliderBackground: {
    backgroundColor: '#1a1f36',
    width: '100%',
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  pillIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 8,
    zIndex: 10
  },
  sliderTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pillButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  arrowContainer: { position: 'absolute', right: 20, height: '100%', justifyContent: 'center' },
  pillArrowStack: { flexDirection: 'row', alignItems: 'center' },
  saleClosedBanner: { justifyContent: 'center' },
  saleClosedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saleClosedText: { fontSize: 15, fontWeight: '600', color: TEXT_GRAY },
});
