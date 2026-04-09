import React, { useState, useEffect, useMemo } from 'react';
import RequireAuth from '@/components/RequireAuth';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userUpdateSchema, UserUpdateBody } from '@/schemas/auth';
import { useGetMe, useUser } from '@/hooks';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { handleErrorApi } from '@/lib/errors';

const PRIMARY_COLOR = '#ee8c2b';
const TEXT_DARK = '#1f2937';
const TEXT_GRAY = '#6b7280';
const BORDER_COLOR = '#e5e7eb';

interface DatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onClose: () => void;
  onSelect: (date: string) => void;
}

function DatePickerModal({ visible, value, onClose, onSelect }: DatePickerModalProps) {
  const [tempDate, setTempDate] = useState({
    day: 1,
    month: 1,
    year: 1990
  });

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setTempDate({
          year: parseInt(parts[0]),
          month: parseInt(parts[1]),
          day: parseInt(parts[2])
        });
      }
    }
  }, [value, visible]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let i = currentYear; i >= 1950; i--) arr.push(i);
    return arr;
  }, []);

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const days = useMemo(() => {
    const count = getDaysInMonth(tempDate.month, tempDate.year);
    const arr = [];
    for (let i = 1; i <= count; i++) arr.push(i);
    return arr;
  }, [tempDate.month, tempDate.year]);

  const handleConfirm = () => {
    const formattedDate = `${tempDate.year}-${String(tempDate.month).padStart(2, '0')}-${String(tempDate.day).padStart(2, '0')}`;
    onSelect(formattedDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
          
          <View style={styles.pickerRow}>
            {/* Day */}
            <View style={styles.pickerCol}>
              <Text style={styles.colLabel}>Ngày</Text>
              <FlatList
                data={days}
                keyExtractor={(item) => `d-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.colItem, tempDate.day === item && styles.colItemActive]}
                    onPress={() => setTempDate(prev => ({ ...prev, day: item }))}
                  >
                    <Text style={[styles.colItemText, tempDate.day === item && styles.colItemTextActive]}>{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
            
            {/* Month */}
            <View style={styles.pickerCol}>
              <Text style={styles.colLabel}>Tháng</Text>
              <FlatList
                data={months}
                keyExtractor={(item) => `m-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.colItem, tempDate.month === item && styles.colItemActive]}
                    onPress={() => setTempDate(prev => ({ ...prev, month: item }))}
                  >
                    <Text style={[styles.colItemText, tempDate.month === item && styles.colItemTextActive]}>{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
            
            {/* Year */}
            <View style={styles.pickerCol}>
              <Text style={styles.colLabel}>Năm</Text>
              <FlatList
                data={years}
                keyExtractor={(item) => `y-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.colItem, tempDate.year === item && styles.colItemActive]}
                    onPress={() => setTempDate(prev => ({ ...prev, year: item }))}
                  >
                    <Text style={[styles.colItemText, tempDate.year === item && styles.colItemTextActive]}>{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirm}>
              <Text style={styles.modalConfirmText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getRoleCode = (roleName?: string) => {
  const normalized = (roleName || '').toLowerCase();
  if (normalized === 'admin') return 1;
  if (normalized === 'user') return 2;
  if (normalized === 'organizer') return 3;
  return 4;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profileRes, isLoading: profileLoading } = useGetMe();
  const { update } = useUser();
  const profile = profileRes?.data;
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<UserUpdateBody>({
    resolver: zodResolver(userUpdateSchema) as any,
    defaultValues: { FullName: '', DateOfBirth: '' },
  });

  const dateOfBirth = watch('DateOfBirth');

  useEffect(() => {
    if (profile) {
      setValue('FullName', profile.fullName || '');
      setValue('DateOfBirth', profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
        : '');
    }
  }, [profile]);

  const onSubmit = async (data: UserUpdateBody) => {
    if (!profile?.id) return;
    try {
      await update.mutateAsync({
        id: profile.id,
        body: {
          ...data,
          DateOfBirth: data.DateOfBirth || undefined,
          Phone: profile.phone || '',
          Gender: profile.gender ?? 0,
          Address: profile.address || undefined,
          AvatarUrl: profile.avatarUrl || undefined,
          Status: profile.status,
          RoleName: getRoleCode(profile.role?.name),
          OrganizerId: profile.organizerId || undefined,
        },
      });
      router.back();
    } catch (error) {
      handleErrorApi({ error, setError });
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.center}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <RequireAuth title="Chỉnh sửa hồ sơ" message="Đăng nhập để chỉnh sửa thông tin cá nhân của bạn.">
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Họ và tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <Controller
              control={control}
              name="FullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.FullName && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#9ca3af"
                />
              )}
            />
            {errors.FullName && <Text style={styles.errorText}>{errors.FullName.message}</Text>}
          </View>

          {/* Ngày sinh */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={[styles.input, errors.DateOfBirth && styles.inputError]}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateDisplay}>
                <Text style={[styles.dateText, !dateOfBirth && { color: '#9ca3af' }]}>
                  {dateOfBirth ? String(dateOfBirth) : 'Chọn ngày sinh'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={TEXT_GRAY} />
              </View>
            </TouchableOpacity>
            {errors.DateOfBirth && <Text style={styles.errorText}>{String(errors.DateOfBirth.message)}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, update.isPending && styles.saveBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={update.isPending}
          >
            <Text style={styles.saveBtnText}>{update.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={datePickerVisible}
        value={String(dateOfBirth || '')}
        onClose={() => setDatePickerVisible(false)}
        onSelect={(date) => setValue('DateOfBirth', date)}
      />
    </SafeAreaView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#fca5a5' },
  errorText: { fontSize: 12, color: '#dc2626', marginTop: 4, marginLeft: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: TEXT_DARK,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: TEXT_DARK,
  },
  saveBtn: {
    marginTop: 20,
    height: 56,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 250,
  },
  pickerCol: {
    flex: 1,
    alignItems: 'center',
  },
  colLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_GRAY,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  colItem: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
  },
  colItemActive: {
    backgroundColor: '#fff7ed',
  },
  colItemText: {
    fontSize: 16,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  colItemTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: 20,
  },
  modalCancel: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: TEXT_GRAY,
    fontWeight: '600',
  },
  modalConfirm: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
