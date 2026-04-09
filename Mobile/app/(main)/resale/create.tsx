import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import RequireAuth from '@/components/RequireAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useGetTickets, useTicketListing, useGetTicketListings } from '@/hooks/useTicket';
import { useGetEvents } from '@/hooks/useEvent';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/stores/sesionStore';
import { EventStatus, TicketListingStatus } from '@/utils/enum';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticket } from '@/types/ticket';
import { toast } from '@/lib/toast';
import { handleErrorApi } from '@/lib/errors';

const PRIMARY_COLOR = '#ee8c2b';
const TEXT_DARK = '#1a1f36';
const TEXT_GRAY = '#6b7280';
const BORDER_COLOR = '#e5e7eb';

function isReadyTicket(status: string | number | undefined) {
  const raw = String(status ?? "").toLowerCase();
  return raw === "1" || raw.includes("ready") || raw.includes("available");
}

const isFreeTicket = (price: number | undefined) => Number(price ?? 0) === 0;

export default function CreateResaleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userStore = useSessionStore((s) => s.user);
  const userId = (userStore as any)?.userId || (userStore as any)?.UserId;

  // State khớp với Logic Web
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [askingPrice, setAskingPrice] = useState<string>('');
  const [description, setDescription] = useState('');

  // 1. Lấy danh sách Sự kiện (Chỉ lấy OPENED theo yêu cầu)
  const { data: eventsRes, isLoading: isEventsLoading } = useGetEvents({
    pageNumber: 1,
    pageSize: 100,
    hasLocations: true,
    isDescending: true,
    status: EventStatus.OPENED,
  }, !!userId);

  // 2. Lấy danh sách Vé của tôi
  const { data: ticketsRes, isLoading: isTicketsLoading } = useGetTickets({
    ownerId: userId,
    pageNumber: 1,
    pageSize: 300,
    isDescending: true,
    hasEvent: true,
    hasType: true,
  }, { enabled: !!userId });

  // 3. Lấy danh sách Tin đăng (để lọc vé đang bán)
  const { data: listingsRes, isLoading: isListingsLoading } = useGetTicketListings(
    { sellerUserId: userId, pageNumber: 1, pageSize: 300, isDescending: true },
    { enabled: !!userId }
  );

  const { create: createListing } = useTicketListing();

  // Logic: Tìm các vé đang nằm trong tin đăng ACTIVE (để loại ra)
  const activeListingTicketIds = useMemo(() => {
    const listings = (listingsRes as any)?.data?.items || (listingsRes as any)?.items || [];
    const set = new Set<string>();
    for (const listing of listings) {
      const status = Number(listing.status ?? 0);
      // Web Logic: status !== PENDING(2) && status !== SOLD(3) -> Có nghĩa là ACTIVE(1) hoặc CANCELLED(4)? 
      // Để flow mượt, ta dùng logic chuẩn: Chặn vé trong tin ACTIVE(1) và PENDING(2)
      if (status === 1 || status === 2) {
        const tIds = (listing.ticketIds || []).concat(
            Array.isArray(listing.ticket) ? listing.ticket.map((t: any) => t.id) : [listing.ticket?.id]
        ).filter(Boolean);
        tIds.forEach((id: string) => set.add(id));
        if (listing.ticketId) set.add(listing.ticketId);
      }
    }
    return set;
  }, [listingsRes]);

  // Logic: Danh sách vé đủ điều kiện resale
  const candidateTickets = useMemo(() => {
    const tickets = ticketsRes?.data?.items || [];
    return tickets.filter((t: Ticket) => {
      const ready = isReadyTicket(t.status || (t as any).Status);
      const notInListing = !activeListingTicketIds.has(t.id);
      
      const eventName = t.event?.name || (t as any)?.Event?.name || 'Unknown';
      console.log(`Checking Ticket ${t.id.substring(0,4)} (${eventName}): Ready=${ready}, NotListed=${notInListing}`);
      
      return ready && notInListing;
    });
  }, [ticketsRes, activeListingTicketIds]);

  // Logic: Đếm số vé theo từng sự kiện
  const ownedCountByEvent = useMemo(() => {
    const map = new Map<string, number>();
    for (const ticket of candidateTickets) {
      const eId = ticket.eventId || (ticket as any)?.EventId || ticket.event?.id;
      if (!eId) continue;
      map.set(eId, (map.get(eId) || 0) + 1);
    }
    return map;
  }, [candidateTickets]);

  // Logic: Chỉ hiện các sự kiện mà mình có vé
  const currentEvents = useMemo(() => {
    const allEvents = eventsRes?.data?.items || [];
    return allEvents.filter((e) => (ownedCountByEvent.get(e.id) || 0) > 0);
  }, [eventsRes, ownedCountByEvent]);

  const ticketsOfSelectedEvent = useMemo(() => {
    if (!selectedEventId) return [];
    return candidateTickets.filter(
      (t) => (t.eventId || (t as any)?.EventId || t.event?.id) === selectedEventId
    );
  }, [candidateTickets, selectedEventId]);

  // Logic: Nhóm vé theo Free/Paid và Type (Khớp Web)
  const ticketsByTypeInEvent = useMemo(() => {
    const free: any[] = [];
    const paid: any[] = [];
    const seenFree = new Map();
    const seenPaid = new Map();

    for (const t of ticketsOfSelectedEvent) {
      const typeId = t.ticketType?.id || (t as any)?.ticketTypeId || "";
      const name = t.ticketType?.name || "N/A";
      const price = Number(t.ticketType?.price ?? 0);

      if (isFreeTicket(price)) {
        let idx = seenFree.get(typeId);
        if (idx === undefined) {
          idx = free.length;
          free.push({ typeId, name, tickets: [] });
          seenFree.set(typeId, idx);
        }
        free[idx].tickets.push(t);
      } else {
        let idx = seenPaid.get(typeId);
        if (idx === undefined) {
          idx = paid.length;
          paid.push({ typeId, name, price, tickets: [] });
          seenPaid.set(typeId, idx);
        }
        paid[idx].tickets.push(t);
      }
    }
    return { free, paid };
  }, [ticketsOfSelectedEvent]);

  // --- Handlers (Flow Web) ---

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setTicketIds([]); // Reset vé khi đổi sự kiện
    setAskingPrice('');
  };

  const toggleTicket = (id: string) => {
    const exists = ticketIds.includes(id);
    if (exists) {
        setTicketIds(ticketIds.filter(i => i !== id));
        return;
    }

    const ticket = ticketsOfSelectedEvent.find(t => t.id === id);
    if (!ticket) return;

    // Ràng buộc Web: Chỉ chọn vé cùng loại
    if (ticketIds.length > 0) {
        const first = ticketsOfSelectedEvent.find(t => t.id === ticketIds[0]);
        const firstTypeId = first?.ticketType?.id || (first as any)?.ticketTypeId;
        const currentTypeId = ticket.ticketType?.id || (ticket as any)?.ticketTypeId;
        if (firstTypeId !== currentTypeId) {
            toast.error("Chỉ được chọn vé cùng loại. Vui lòng bỏ chọn vé trước.");
            return;
        }
    }

    setTicketIds([...ticketIds, id]);
    
    // Nếu chọn vé mới, kiểm tra xem nó là free hay không để set giá
    const isFree = isFreeTicket(ticket.ticketType?.price);
    if (isFree) setAskingPrice('0');
  };

  const handleChooseMany = (typeId: string) => {
    const group = [...ticketsByTypeInEvent.free, ...ticketsByTypeInEvent.paid].find(g => g.typeId === typeId);
    if (group) {
        setTicketIds(group.tickets.map((t: any) => t.id));
        if (isFreeTicket((group as any).price)) setAskingPrice('0');
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (ticketIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một vé.");
      return;
    }

    const firstTicket = ticketsOfSelectedEvent.find(t => t.id === ticketIds[0]);
    const isFree = isFreeTicket(firstTicket?.ticketType?.price);
    const finalPrice = isFree ? 0 : Number(askingPrice);

    if (!isFree && (!askingPrice || isNaN(finalPrice))) {
        toast.error("Vui lòng nhập giá bán hợp lệ.");
        return;
    }

    try {
      await createListing.mutateAsync({
        ticketIds,
        sellerUserId: userId,
        askingPrice: finalPrice,
        description: description?.trim() || undefined,
      });
      toast.success("Đăng vé bán lại thành công.");
      router.back();
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  if (isEventsLoading || isTicketsLoading || isListingsLoading) {
    return <SafeAreaView style={styles.center}><LoadingSpinner /></SafeAreaView>;
  }

  return (
    <RequireAuth title="Đăng bán vé" message="Đăng nhập để tạo tin đăng bán lại vé của bạn.">
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng vé bán lại</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Step 1: Chọn sự kiện (Luôn hiện để đổi) */}
          <Text style={styles.sectionTitle}>1. Chọn sự kiện</Text>
          {currentEvents.length === 0 ? (
            <EmptyState title="Chưa có vé" message="Bạn không có vé nào đủ điều kiện để bán lại." />
          ) : (
            <View style={styles.eventRow}>
              {currentEvents.map(ev => (
                <TouchableOpacity 
                  key={ev.id} 
                  style={[styles.eventCard, selectedEventId === ev.id && styles.eventCardActive]}
                  onPress={() => handleSelectEvent(ev.id)}
                >
                  <Image source={{ uri: ev.thumbnailUrl || ev.bannerUrl }} style={styles.eventImg} />
                  <Text style={styles.eventName} numberOfLines={2}>{ev.name}</Text>
                  <Text style={styles.eventBadge}>{ownedCountByEvent.get(ev.id)} vé sẵn sàng</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedEventId && (
            <>
              {/* Step 2: Chọn vé (Phân nhóm Free/Paid như Web) */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>2. Chọn vé</Text>
                {ticketIds.length > 0 && (
                  <TouchableOpacity onPress={() => setTicketIds([])}>
                    <Text style={styles.clearText}>Xóa tất cả ({ticketIds.length})</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Nhóm vé Miễn phí */}
              {ticketsByTypeInEvent.free.length > 0 && (
                <View style={styles.groupContainer}>
                  <Text style={styles.groupLabel}>VÉ MIỄN PHÍ</Text>
                  {ticketsByTypeInEvent.free.map((g: any) => (
                    <View key={g.typeId}>
                        <View style={styles.typeHeader}>
                            <Text style={styles.typeName}>{g.name}</Text>
                            <TouchableOpacity onPress={() => handleChooseMany(g.typeId)}><Text style={styles.actionText}>Chọn tất cả</Text></TouchableOpacity>
                        </View>
                        {g.tickets.map((t: any) => (
                            <TouchableOpacity 
                                key={t.id} 
                                style={[styles.ticketItem, ticketIds.includes(t.id) && styles.ticketItemActive]}
                                onPress={() => toggleTicket(t.id)}
                            >
                                <Ionicons name={ticketIds.includes(t.id) ? "checkbox" : "square-outline"} size={22} color={ticketIds.includes(t.id) ? PRIMARY_COLOR : TEXT_GRAY} />
                                <Text style={styles.ticketCode}>#{t.id.substring(0,8).toUpperCase()}</Text>
                                <View style={styles.badgeFree}><Text style={styles.badgeText}>FREE</Text></View>
                            </TouchableOpacity>
                        ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Nhóm vé Trả phí */}
              {ticketsByTypeInEvent.paid.length > 0 && (
                <View style={styles.groupContainer}>
                  <Text style={styles.groupLabel}>VÉ TRẢ PHÍ</Text>
                  {ticketsByTypeInEvent.paid.map((g: any) => (
                    <View key={g.typeId}>
                        <View style={styles.typeHeader}>
                            <Text style={styles.typeName}>{g.name} · {g.price.toLocaleString()}đ</Text>
                            <TouchableOpacity onPress={() => handleChooseMany(g.typeId)}><Text style={styles.actionText}>Chọn tất cả</Text></TouchableOpacity>
                        </View>
                        {g.tickets.map((t: any) => (
                            <TouchableOpacity 
                                key={t.id} 
                                style={[styles.ticketItem, ticketIds.includes(t.id) && styles.ticketItemActive]}
                                onPress={() => toggleTicket(t.id)}
                            >
                                <Ionicons name={ticketIds.includes(t.id) ? "checkbox" : "square-outline"} size={22} color={ticketIds.includes(t.id) ? PRIMARY_COLOR : TEXT_GRAY} />
                                <Text style={styles.ticketCode}>#{t.id.substring(0,8).toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Step 3: Thông tin giá & mô tả */}
              <Text style={styles.sectionTitle}>3. Thông tin bán lại</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giá bán mong muốn (VNĐ)</Text>
                <TextInput
                  style={[styles.input, (ticketIds.length > 0 && isFreeTicket(ticketsOfSelectedEvent.find(t=>t.id===ticketIds[0])?.ticketType?.price)) && styles.inputDisabled]}
                  value={askingPrice}
                  onChangeText={setAskingPrice}
                  placeholder="0"
                  keyboardType="numeric"
                  editable={!(ticketIds.length > 0 && isFreeTicket(ticketsOfSelectedEvent.find(t=>t.id===ticketIds[0])?.ticketType?.price))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả thêm</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ghi chú cho người mua..."
                  multiline
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, (createListing.isPending || ticketIds.length === 0) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={createListing.isPending || ticketIds.length === 0}
              >
                {createListing.isPending ? <LoadingSpinner color="#fff" size="small" /> : <Text style={styles.submitBtnText}>Đăng bán ngay</Text>}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </RequireAuth>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2; // Chia 2 cột trừ đi padding

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 15, marginTop: 10 },
  eventRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  eventCard: { width: CARD_WIDTH, marginBottom: 12, marginRight: 12, borderRadius: 16, borderWidth: 1, borderColor: BORDER_COLOR, padding: 10, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  eventCardActive: { borderColor: PRIMARY_COLOR, backgroundColor: '#fff7ed', borderWidth: 2 },
  eventImg: { width: '100%', height: 100, borderRadius: 12, marginBottom: 10 },
  eventName: { fontSize: 14, fontWeight: '800', color: TEXT_DARK, lineHeight: 18 },
  eventBadge: { fontSize: 11, color: PRIMARY_COLOR, fontWeight: '600', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearText: { color: TEXT_GRAY, fontSize: 13 },
  groupContainer: { marginBottom: 20, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: TEXT_GRAY, marginBottom: 10, letterSpacing: 1 },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 4 },
  typeName: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  actionText: { fontSize: 12, color: PRIMARY_COLOR, fontWeight: '600' },
  ticketItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: BORDER_COLOR },
  ticketItemActive: { borderColor: PRIMARY_COLOR, backgroundColor: '#fff7ed' },
  ticketCode: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: TEXT_DARK, flex: 1 },
  badgeFree: { backgroundColor: '#10b981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 12, padding: 12, fontSize: 15 },
  inputDisabled: { backgroundColor: '#f1f5f9', color: TEXT_GRAY },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: PRIMARY_COLOR, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnDisabled: { backgroundColor: '#cbd5e1' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
