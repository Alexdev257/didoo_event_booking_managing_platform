import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Dimensions, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetEvents, useGetCategories } from '@/hooks/useEvent';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Event, Category } from '@/types/event';
import { useRouter } from 'expo-router';
import { EventPrice } from '@/components/event/EventPrice';
import { EventStatus } from '@/utils/enum';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_COLOR = '#ee8c2b';

const STATUS_FILTERS = [
  { label: 'Tất cả', value: null as number | null },
  { label: 'Sắp mở', value: EventStatus.PUBLISHED },
  { label: 'Đang mở', value: EventStatus.OPENED },
];

export default function EventsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [isDescending, setIsDescending] = useState(true);
  
  const [isDateModalVisible, setDateModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isStatusModalVisible, setStatusModalVisible] = useState(false);

  const [viewDate, setViewDate] = useState(new Date());

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories for "Type" filter
  const { data: categoriesRes } = useGetCategories({ pageSize: 100 });
  const categories = categoriesRes?.data?.items || [];

  // Map filters to API params
  const queryParams = useMemo(() => {
    const params: any = {
      name: debouncedSearch,
      pageSize: 50,
      isDescending,
      categoryId: selectedCategoryId || undefined,
      status: selectedStatus ?? undefined,
      hasTicketTypes: true,
      hasLocations: true
    };

    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      params.startTime = startOfDay.toISOString();
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      params.endTime = endOfDay.toISOString();
    }

    return params;
  }, [debouncedSearch, selectedDate, selectedCategoryId, selectedStatus, isDescending]);

  const { data: eventsRes, isLoading } = useGetEvents(queryParams);
  const events = eventsRes?.data?.items || [];

  const toggleSort = () => setIsDescending(!isDescending);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(nextDate);
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const mainLocation = item.locations?.[0];
    const prices = item.ticketTypes?.map(t => t.price).filter(p => p != null) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    return (
      <TouchableOpacity 
        style={styles.eventRow}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } } as any)}
      >
        <Image 
          source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80' }} 
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.eventDetails}>
          <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.eventDate}>
            {new Date(item.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color="#6b7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {mainLocation?.name || mainLocation?.address || 'Vietnam'}
            </Text>
          </View>
          <EventPrice eventId={item.id} style={styles.priceText} prefix="Từ " />
        </View>
      </TouchableOpacity>
    );
  };

  // Simplified Calendar Component
  const renderCalendar = () => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    // Padding for first week
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={28} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.calendarTitle}>Tháng {currentMonth + 1}</Text>
            <Text style={styles.calendarYear}>{currentYear}</Text>
          </View>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={28} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
        <View style={styles.daysGrid}>
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
          {days.map((day, index) => {
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
            const isSelected = selectedDate && day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear();
            
            return (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.dayCell, 
                  isToday && { backgroundColor: '#fff7ed', borderColor: PRIMARY_COLOR, borderWidth: 1 },
                  isSelected && styles.dayCellActive
                ]}
                onPress={() => {
                  if (day) {
                    const date = new Date(currentYear, currentMonth, day);
                    setSelectedDate(date);
                    setDateModalVisible(false);
                  }
                }}
              >
                {day && <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{day}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.footerBtn} 
            onPress={() => { 
              setSelectedDate(new Date()); 
              setDateModalVisible(false); 
            }}
          >
            <Text style={styles.todayText}>Hôm nay</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.footerBtn} 
            onPress={() => {
              setSelectedDate(null);
              setDateModalVisible(false);
            }}
          >
            <Text style={styles.exitText}>Thoát</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Khám phá</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterContainer}>
          {/* Date Selector */}
          <TouchableOpacity 
            style={[styles.filterChip, selectedDate && styles.filterChipActive]}
            onPress={() => setDateModalVisible(true)}
          >
            <Text style={[styles.filterText, selectedDate && styles.filterTextActive]}>
              {selectedDate ? selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'Ngày'}
            </Text>
            <Ionicons name="calendar-outline" size={14} color={selectedDate ? "#fff" : "#6b7280"} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Type/Category Selector */}
          <TouchableOpacity 
            style={[styles.filterChip, selectedCategoryId && styles.filterChipActive]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={[styles.filterText, selectedCategoryId && styles.filterTextActive]}>
              {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : 'Loại'}
            </Text>
            <Ionicons name="options-outline" size={14} color={selectedCategoryId ? "#fff" : "#6b7280"} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Status Filter */}
          <TouchableOpacity 
            style={[styles.filterChip, selectedStatus != null && styles.filterChipActive]}
            onPress={() => setStatusModalVisible(true)}
          >
            <Text style={[styles.filterText, selectedStatus != null && styles.filterTextActive]}>
              {selectedStatus === EventStatus.PUBLISHED ? 'Sắp mở' : selectedStatus === EventStatus.OPENED ? 'Đang mở' : 'Tất cả'}
            </Text>
            <Ionicons name="flag-outline" size={14} color={selectedStatus != null ? "#fff" : "#6b7280"} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Sort Toggle */}
          <TouchableOpacity 
            style={[styles.filterChip, styles.filterChipActive]}
            onPress={toggleSort}
          >
            <Text style={[styles.filterText, styles.filterTextActive]}>
              {isDescending ? 'Mới nhất' : 'Cũ nhất'}
            </Text>
            <Ionicons 
              name={isDescending ? "arrow-down" : "arrow-up"} 
              size={14} 
              color="#fff" 
              style={{ marginLeft: 4 }} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState title="Trống" message="Không tìm thấy kết quả nào" />}
        />
      )}

      {/* Date Modal */}
      <Modal visible={isDateModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setDateModalVisible(false)}>
          <View style={styles.modalContent}>
            {renderCalendar()}
          </View>
        </Pressable>
      </Modal>

      {/* Category Modal (Dropdown style) */}
      <Modal visible={isCategoryModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setCategoryModalVisible(false)}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <Text style={styles.modalTitle}>Chọn loại sự kiện</Text>
            <ScrollView>
              <TouchableOpacity 
                style={styles.categoryItem} 
                onPress={() => { setSelectedCategoryId(null); setCategoryModalVisible(false); }}
              >
                <Text style={[styles.categoryText, !selectedCategoryId && { color: PRIMARY_COLOR, fontWeight: '700' }]}>Tất cả loại</Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.categoryItem}
                  onPress={() => { setSelectedCategoryId(cat.id); setCategoryModalVisible(false); }}
                >
                  <Text style={[styles.categoryText, selectedCategoryId === cat.id && { color: PRIMARY_COLOR, fontWeight: '700' }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Status Modal */}
      <Modal visible={isStatusModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
          <View style={[styles.modalContent, { maxHeight: '40%' }]}>
            <Text style={styles.modalTitle}>Trạng thái sự kiện</Text>
            <ScrollView>
              {STATUS_FILTERS.map(({ label, value }) => (
                <TouchableOpacity 
                  key={label}
                  style={styles.categoryItem} 
                  onPress={() => { setSelectedStatus(value); setStatusModalVisible(false); }}
                >
                  <Text style={[styles.categoryText, selectedStatus === value && { color: PRIMARY_COLOR, fontWeight: '700' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 15, height: 48 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1f2937' },
  filterContainer: { marginTop: 15, flexDirection: 'row' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  filterChipActive: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  filterText: { fontSize: 13, color: '#4b5563', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  listContent: { padding: 20, paddingBottom: 120 },
  eventRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 10, alignItems: 'center' },
  thumbnail: { width: 90, height: 90, borderRadius: 8 },
  eventDetails: { flex: 1, marginLeft: 15 },
  eventName: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  eventDate: { fontSize: 12, color: PRIMARY_COLOR, fontWeight: '500', marginBottom: 2 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locationText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
  priceText: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#1f2937' },
  categoryItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  categoryText: { fontSize: 16, color: '#4b5563' },
  
  // Calendar Styles
  calendarContainer: { width: '100%' },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  navBtn: { padding: 5 },
  calendarTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  calendarYear: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayLabel: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#9ca3af', marginBottom: 10, fontWeight: '600' },
  dayCell: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 5, borderRadius: 20 },
  dayCellActive: { backgroundColor: PRIMARY_COLOR },
  dayText: { fontSize: 14, color: '#1f2937' },
  dayTextActive: { color: '#fff', fontWeight: '700' },
  modalFooter: { 
    marginTop: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 15,
  },
  footerBtn: { flex: 1, alignItems: 'center', padding: 10 },
  todayText: { color: PRIMARY_COLOR, fontWeight: '700', fontSize: 15 },
  exitText: { color: '#6b7280', fontWeight: '600', fontSize: 15 },
});
