import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { handleErrorApi } from '@/lib/errors';

const PRIMARY_COLOR = '#ee8c2b';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { Email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword.mutateAsync(data);
      router.push({ pathname: '/(auth)/reset-password', params: { Email: data.Email } } as any);
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="cover" />
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>Nhập email để nhận mã khôi phục tài khoản</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="Email"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.Email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email của bạn"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.Email && <Text style={styles.errorText}>{errors.Email.message}</Text>}

            <TouchableOpacity
              style={[styles.btn, forgotPassword.isPending && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={forgotPassword.isPending}
            >
              <Text style={styles.btnText}>{forgotPassword.isPending ? 'Đang gửi...' : 'Gửi mã khôi phục'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  backBtn: { marginTop: 10, marginBottom: 10, width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', overflow: 'hidden',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
  },
  logo: { width: '100%', height: '100%' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb',
    borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 4,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  inputError: { borderColor: '#fca5a5' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  errorText: { fontSize: 12, color: '#dc2626', marginBottom: 12, marginLeft: 4 },
  btn: {
    height: 56, backgroundColor: PRIMARY_COLOR, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
    elevation: 4, shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
