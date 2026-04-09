import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/contexts/authContext';

const PRIMARY = '#ee8c2b';

interface RequireAuthProps {
  children: React.ReactNode;
  title?: string;
  message?: string;
}

export default function RequireAuth({ children, title, message }: RequireAuthProps) {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={36} color={PRIMARY} />
        </View>
        <View style={styles.iconBadge}>
          <Ionicons name="ticket" size={16} color="#fff" />
        </View>
      </View>

      {/* Text */}
      <Text style={styles.title}>{title ?? 'Đăng nhập để tiếp tục'}</Text>
      <Text style={styles.message}>
        {message ?? 'Bạn cần đăng nhập để xem nội dung này.\nChỉ mất vài giây thôi!'}
      </Text>

      {/* Login button */}
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => router.push('/(auth)/login')}
        activeOpacity={0.85}
      >
        <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.loginBtnText}>Đăng nhập</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 28,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fed7aa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  iconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
});
