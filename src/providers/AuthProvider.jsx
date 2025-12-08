import { useEffect, useState } from 'react';
import { onIdTokenChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '../firebase/firebase.config';
import apiClient, { setAuthToken } from '../utils/apiClient';
import toast from 'react-hot-toast';
import AuthContext from '../contexts/AuthContext';

const provider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
        setAuthToken(idToken);
      } else {
        setToken(null);
        setAuthToken(null);
        queryClient.removeQueries({ queryKey: ['userProfile'] });
      }
      setAuthLoading(false);
      setAuthInitialized(true);
    });
    return unsubscribe;
  }, [queryClient]);

  const profileQuery = useQuery({
    queryKey: ['userProfile'],
    enabled: !!token && !!firebaseUser?.email,
    queryFn: async () => {
      const res = await apiClient.get('/users/me');
      return res.data.user;
    },
    retry: 1,
  });

  const upsertUser = async (payload) => {
    await apiClient.post('/users', payload);
    await profileQuery.refetch();
  };

  const register = async ({ name, email, password, photoURL }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (photoURL || name) {
      await updateProfile(cred.user, {
        displayName: name,
        photoURL: photoURL || undefined,
      });
    }
    const idToken = await cred.user.getIdToken();
    setAuthToken(idToken);
    setToken(idToken);
    await upsertUser({ email: email.toLowerCase(), name, photoURL });
    toast.success('Account created');
    return cred.user;
  };

  const login = async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    setAuthToken(idToken);
    setToken(idToken);
    await upsertUser({ email: email.toLowerCase(), name: cred.user.displayName, photoURL: cred.user.photoURL });
    toast.success('Signed in');
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, provider);
    const idToken = await cred.user.getIdToken();
    setAuthToken(idToken);
    setToken(idToken);
    await upsertUser({
      email: cred.user.email?.toLowerCase(),
      name: cred.user.displayName,
      photoURL: cred.user.photoURL,
    });
    toast.success('Signed in with Google');
    return cred.user;
  };

  const logout = async () => {
    await signOut(auth);
    setAuthToken(null);
    setToken(null);
    queryClient.removeQueries({ queryKey: ['userProfile'] });
  };

  const updateProfileInfo = async ({ name, photoURL }) => {
    if (!firebaseUser) {
      throw new Error('Not authenticated');
    }

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (photoURL !== undefined) payload.photoURL = photoURL;

    if (name || photoURL) {
      await updateProfile(firebaseUser, {
        displayName: name || firebaseUser.displayName || '',
        photoURL: photoURL || null,
      });
      setFirebaseUser({ ...auth.currentUser });
    }

    const res = await apiClient.patch('/users/me', payload);
    await profileQuery.refetch();
    return res.data?.user;
  };

  const value = {
    firebaseUser,
    token,
    authLoading,
    authInitialized,
    userProfile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
    profileRefetch: profileQuery.refetch,
    updateProfileInfo,
    register,
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthProvider;
