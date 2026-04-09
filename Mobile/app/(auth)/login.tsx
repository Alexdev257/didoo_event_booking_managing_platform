import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { useLocationContext } from '@/contexts/locationContext';
import { signInWithGoogleNative } from '@/lib/googleAuth';
import { handleErrorApi } from '@/lib/errors';
import { toast } from '@/lib/toast';

const PRIMARY_COLOR = '#ee8c2b';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginGoogle } = useAuth();
  const { getLocationForAuth } = useLocationContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      Email: '',
      Password: '',
      Location: { Latitude: 0, Longitude: 0, Address: '' },
    },
  });

  useEffect(() => {
    const loc = getLocationForAuth();
    setValue('Location', { Latitude: loc.latitude, Longitude: loc.longitude, Address: loc.address });
  }, []);

  const onSubmit = async (data: LoginInput) => {
    try {
      await login.mutateAsync(data);
    } catch (err) {
      handleErrorApi({ error: err, setError });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      console.log('[GoogleLogin] Starting...');
      const userInfo = await signInWithGoogleNative();
      console.log('[GoogleLogin] userInfo:', JSON.stringify(userInfo));
      if (userInfo?.idToken) {
        console.log('[GoogleLogin] Token received, calling API...');
        const loc = getLocationForAuth();
        await loginGoogle.mutateAsync({
          GoogleToken: userInfo.idToken,
          Location: { Latitude: loc.latitude, Longitude: loc.longitude, Address: loc.address },
        });
        console.log('[GoogleLogin] API success!');
      } else {
        console.log('[GoogleLogin] No idToken returned');
        toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.log('[GoogleLogin] Error:', JSON.stringify(err));
      handleErrorApi({ error: err, setError });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="cover" />
            </View>
          </View>

          <Text style={styles.headerTitle}>Đăng nhập tài khoản</Text>

          <View style={styles.form}>
            {/* Email */}
            <Controller
              control={control}
              name="Email"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.Email && styles.inputError]}>
                  <Ionicons name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
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

            {/* Password */}
            <Controller
              control={control}
              name="Password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.Password && styles.inputError]}>
                  <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.Password && <Text style={styles.errorText}>{errors.Password.message}</Text>}

            <View style={styles.optionsRow}>
              <View />
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, login.isPending && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={login.isPending}
            >
              <Text style={styles.loginBtnText}>{login.isPending ? 'Đang xử lý...' : 'Đăng nhập'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Hoặc tiếp tục</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.googleBtn, isGoogleLoading && { opacity: 0.7 }]}
              onPress={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={styles.googleIcon} />
              <Text style={styles.googleBtnText}>{isGoogleLoading ? 'Đang xử lý...' : 'Tiếp tục với Google'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/signup' as any)}>
              <Text style={styles.signupText}>Đăng ký ngay</Text>
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
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  logo: { width: '100%', height: '100%' },
  headerTitle: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 32, color: '#111827' },
  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb',
    borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 4,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  inputError: { borderColor: '#fca5a5' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  errorText: { fontSize: 12, color: '#dc2626', marginBottom: 10, marginLeft: 4 },
  optionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 24, paddingHorizontal: 4 },
  forgotText: { color: PRIMARY_COLOR, fontWeight: '600', fontSize: 14 },
  loginBtn: {
    height: 56, backgroundColor: PRIMARY_COLOR, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', elevation: 4,
    shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  line: { flex: 1, height: 1, backgroundColor: '#f3f4f6' },
  dividerText: { marginHorizontal: 16, color: '#9ca3af', fontSize: 14 },
  socialContainer: { alignItems: 'center' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: '100%', height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  googleIcon: { width: 24, height: 24, marginRight: 12 },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#6b7280', fontSize: 15 },
  signupText: { color: PRIMARY_COLOR, fontWeight: '700', fontSize: 15 },
});
