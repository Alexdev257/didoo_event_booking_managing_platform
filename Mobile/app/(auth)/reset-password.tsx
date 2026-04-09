import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyForgotPasswordSchema, VerifyForgotPasswordInput } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { handleErrorApi } from '@/lib/errors';

const PRIMARY_COLOR = '#ee8c2b';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { Email } = useLocalSearchParams<{ Email: string }>();
  const { verifyForgotPassword } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyForgotPasswordInput>({
    resolver: zodResolver(verifyForgotPasswordSchema),
    defaultValues: { Key: '', Password: '', ConfirmPassword: '' },
  });

  const onSubmit = async (data: VerifyForgotPasswordInput) => {
    try {
      await verifyForgotPassword.mutateAsync(data);
      router.replace('/(auth)/login' as any);
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
            <Text style={styles.title}>Mật khẩu mới</Text>
            <Text style={styles.subtitle}>Thiết lập mật khẩu mới cho {Email}</Text>
          </View>

          <View style={styles.form}>
            {/* OTP Key */}
            <Controller
              control={control}
              name="Key"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.Key && styles.inputError]}>
                  <Ionicons name="key-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mã khôi phục (OTP)"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.Key && <Text style={styles.errorText}>{errors.Key.message}</Text>}

            {/* Mật khẩu mới */}
            <Controller
              control={control}
              name="Password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.Password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu mới"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPass}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
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
                  <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPass}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.ConfirmPassword && <Text style={styles.errorText}>{errors.ConfirmPassword.message}</Text>}

            <TouchableOpacity
              style={[styles.btn, verifyForgotPassword.isPending && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={verifyForgotPassword.isPending}
            >
              <Text style={styles.btnText}>{verifyForgotPassword.isPending ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</Text>
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
