import { GoogleSignin, User } from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID = '428240789533-0sjpo0blqot3fi0cdnsnrb1v5avg6p7k.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true, // if you need server-side auth
});

export async function signInWithGoogleNative() {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response.type === 'success') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return null;
  }
}


export async function signOutGoogleNative() {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
}


