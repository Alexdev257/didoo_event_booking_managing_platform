import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileContent from '@/components/ProfileContent';
import RequireAuth from '@/components/RequireAuth';

export default function ProfileScreen() {
  return (
    <RequireAuth title="Hồ sơ của tôi" message="Đăng nhập để xem và chỉnh sửa thông tin cá nhân của bạn.">
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProfileContent />
      </SafeAreaView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ee8c2b', // Use primary orange color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  moreBtn: {
    padding: 5,
  },
});
