import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/schemas/auth';
import { z } from 'zod';

type RegisterForm = z.input<typeof registerSchema>;
import { useAuth } from '@/hooks/useAuth';
import { handleErrorApi } from '@/lib/errors';

const PRIMARY_COLOR = '#ee8c2b';

export default function SignupScreen() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      FullName: '',
      Email: '',
      Phone: '',
      Password: '',
      ConfirmPassword: '',
      AvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      Gender: 0,
      Address: '',
      DateOfBirth: undefined,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerAuth.mutateAsync(data as any);
      router.push({ pathname: '/(auth)/verify-otp', params: { Email: data.Email } } as any);
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="cover" />
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Điền thông tin để bắt đầu trải nghiệm</Text>
          </View>

          <View style={styles.form}>
            {/* Họ và tên */}
            <Controller
              control={control}
              name="FullName"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.FullName && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Họ và tên" placeholderTextColor="#9ca3af" value={value} onChangeText={onChange} />
                </View>
              )}
            />
            {errors.FullName && <Text style={styles.errorText}>{errors.FullName.message}</Text>}

            {/* Email */}
            <Controller
              control={control}
              name="Email"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.Email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} />
                </View>
              )}
            />
            {errors.Email && <Text style={styles.errorText}>{errors.Email.message}</Text>}

            {/* Số điện thoại */}
            <Controller
              control={control}
              name="Phone"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.Phone && styles.inputError]}>
                  <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Số điện thoại" placeholderTextColor="#9ca3af" keyboardType="phone-pad" value={value} onChangeText={onChange} />
                </View>
              )}
            />
            {errors.Phone && <Text style={styles.errorText}>{errors.Phone.message}</Text>}

            {/* Mật khẩu */}
            <Controller
              control={control}
              name="Password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.Password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword} value={value} onChangeText={onChange} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.Password && <Text style={styles.errorText}>{errors.Password.message}</Text>}

            {/* Xác nhận mật khẩu */}
            <Controller
              control={control}
              name="ConfirmPassword"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.ConfirmPassword && styles.inputError]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Xác nhận mật khẩu" placeholderTextColor="#9ca3af" secureTextEntry={!showConfirm} value={value} onChangeText={onChange} />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.ConfirmPassword && <Text style={styles.errorText}>{errors.ConfirmPassword.message}</Text>}

            <TouchableOpacity
              style={[styles.signupBtn, registerAuth.isPending && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={registerAuth.isPending}
            >
              <Text style={styles.signupBtnText}>{registerAuth.isPending ? 'Đang xử lý...' : 'Đăng ký'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => router.push('/login' as any)}>
              <Text style={styles.loginText}> Đăng nhập</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  topBar: { paddingTop: 10, marginBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  logo: { width: '100%', height: '100%' },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
  form: { marginBottom: 24 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb',
    borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 4,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  inputError: { borderColor: '#fca5a5' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  errorText: { fontSize: 12, color: '#dc2626', marginBottom: 10, marginLeft: 4 },
  signupBtn: {
    height: 56, backgroundColor: PRIMARY_COLOR, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
    elevation: 4, shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#6b7280', fontSize: 15 },
  loginText: { color: PRIMARY_COLOR, fontWeight: '700', fontSize: 15 },
});
