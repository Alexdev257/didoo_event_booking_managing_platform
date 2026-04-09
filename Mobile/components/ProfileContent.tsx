import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import React, { useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGetMe, useAuth } from "@/hooks";
import { useSessionStore } from "@/stores/sesionStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const { width, height } = Dimensions.get('window');
const PRIMARY_COLOR = '#ee8c2b';
const LOGOUT_BLUE = '#5b5cf1'; // Màu tím/xanh giống trong ảnh của bạn

export default function ProfileContent() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { data: profileRes, isLoading: profileLoading } = useGetMe();
  const { logout } = useAuth();
  const user = useSessionStore((s) => s.user);

  const profileData = profileRes?.data;
  const displayProfile = {
    fullName: (profileData as any)?.fullName || (profileData as any)?.FullName || (user as any)?.fullName || (user as any)?.FullName || (user as any)?.unique_name || "Người dùng",
    email: (profileData as any)?.email || (profileData as any)?.Email || (user as any)?.email || (user as any)?.Email || "",
    avatarUrl: (profileData as any)?.avatarUrl || (profileData as any)?.AvatarUrl,
  };

  if (profileLoading) return <LoadingSpinner />;

  // Hàm thực hiện đăng xuất thật sự
  const confirmLogout = async () => {
    setShowLogoutModal(false);
    const userId = (user as any)?.userId || (user as any)?.UserId;
    if (userId) {
      await logout.mutateAsync({ UserId: userId });
    } else {
      // Fallback if no userId in state (e.g. stale session)
      logout.mutate({ UserId: '' }); 
    }
  };

  const menuItems = [
    { icon: 'ticket-outline', label: 'Đơn hàng của tôi', route: '/(main)/(tabs)/tickets?tab=orders' },
    { icon: 'swap-horizontal-outline', label: 'Quản lý bán lại', route: '/(main)/(tabs)/resell' },
    { icon: 'person-outline', label: 'Thông tin cá nhân', route: '/profile/edit' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topSpacer} />

        {/* Khối Profile */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {displayProfile.avatarUrl ? (
              <Image source={{ uri: displayProfile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {displayProfile.fullName[0].toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{displayProfile.fullName}</Text>
          <Text style={styles.email}>{displayProfile.email}</Text>
        </View>

        {/* Danh sách Menu */}
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={20} color="#4b5563" />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          {/* Nút Đăng xuất - Chỉ hiện Modal khi nhấn */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- MODAL XÁC NHẬN ĐĂNG XUẤT --- */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="slide" // Đẩy từ dưới lên
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalContent}>
            {/* Thanh bar nhỏ phía trên modal giống ảnh */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Đăng xuất</Text>

            <View style={styles.modalDivider} />

            <Text style={styles.modalMessage}>Bạn có chắc chắn muốn đăng xuất?</Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmBtnText}>
                  {logout.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topSpacer: { height: 40 },
  profileHeader: { alignItems: 'center', paddingBottom: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, fontWeight: '700', color: '#4b5563' },
  editBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: PRIMARY_COLOR, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  menuList: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuItemText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 15 },
  logoutButton: { width: '100%', paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  footer: { alignItems: 'center', marginVertical: 20 },
  versionText: { fontSize: 12, color: '#9ca3af' },

  /* Styles cho Modal xác nhận */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Làm mờ nền sau
    justifyContent: 'flex-end', // Đẩy nội dung xuống dưới cùng
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 15,
    alignItems: 'center',
    width: '100%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444', // Màu đỏ giống "Logout" trong ảnh
    marginBottom: 15,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 25,
  },
  modalMessage: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 30,
    textAlign: 'center',
  },
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#f1f2ff', // Màu xanh nhạt cho nút Cancel
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: LOGOUT_BLUE,
  },
  confirmBtn: {
    flex: 1,
    height: 55,
    borderRadius: 28,
    backgroundColor: LOGOUT_BLUE, // Màu tím/xanh cho nút Yes
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});