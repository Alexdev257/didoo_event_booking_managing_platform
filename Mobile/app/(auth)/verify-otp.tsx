import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyRegisterSchema, VerifyRegisterInput } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { handleErrorApi } from '@/lib/errors';

const PRIMARY_COLOR = '#ee8c2b';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { Email } = useLocalSearchParams<{ Email: string }>();
  const { verifyRegister } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<VerifyRegisterInput>({
    resolver: zodResolver(verifyRegisterSchema),
    defaultValues: { Email: Email || '', Otp: '' },
  });

  const otp = watch('Otp');

  const onSubmit = async (data: VerifyRegisterInput) => {
    try {
      await verifyRegister.mutateAsync(data);
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
            <Text style={styles.title}>Xác thực OTP</Text>
            <Text style={styles.subtitle}>
              Nhập mã 6 số gửi đến:{' '}
              <Text style={{ fontWeight: '700', color: '#111827' }}>{Email}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="Otp"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.otpWrapper, errors.Otp && styles.inputError]}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="000000"
                    placeholderTextColor="#e5e7eb"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={value}
                    onChangeText={onChange}
                    autoFocus
                  />
                </View>
              )}
            />
            {errors.Otp && <Text style={styles.errorText}>{errors.Otp.message}</Text>}

            <TouchableOpacity
              style={[styles.btn, (verifyRegister.isPending || otp.length < 6) && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={otp.length < 6 || verifyRegister.isPending}
            >
              <Text style={styles.btnText}>{verifyRegister.isPending ? 'Đang xác thực...' : 'Xác nhận'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendBtn}>
              <Text style={styles.resendText}>Gửi lại mã</Text>
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
  otpWrapper: {
    backgroundColor: '#f9fafb', borderRadius: 16, height: 80,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  inputError: { borderColor: '#fca5a5' },
  otpInput: {
    fontSize: 36, fontWeight: '800', color: PRIMARY_COLOR,
    letterSpacing: 10, textAlign: 'center', width: '100%',
  },
  errorText: { fontSize: 12, color: '#dc2626', marginBottom: 20, marginLeft: 4, textAlign: 'center' },
  btn: {
    height: 56, backgroundColor: PRIMARY_COLOR, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendBtn: { marginTop: 24, alignItems: 'center' },
  resendText: { color: PRIMARY_COLOR, fontWeight: '600', fontSize: 15 },
});
