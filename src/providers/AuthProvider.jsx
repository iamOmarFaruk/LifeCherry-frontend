import { useEffect, useState } from 'react';
import { onIdTokenChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '../firebase/firebase.config';
import apiClient, { setAuthToken } from '../utils/apiClient';
import toast from 'react-hot-toast';
import AuthContext from '../contexts/AuthContext';
import AccountDisabledModal from '../components/modals/AccountDisabledModal';

const provider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'user'); // 'user' or 'admin'

  // State for archived account modal
  const [archivedAccountData, setArchivedAccountData] = useState(null);
  const [showDisabledModal, setShowDisabledModal] = useState(false);

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

  // Derived state for convenience in consumers
  const isLoggedIn = !!firebaseUser;

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
    try {
      await apiClient.post('/users', payload);
      await profileQuery.refetch();
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.isArchived) {
        const data = error.response.data;
        await signOut(auth);
        setAuthToken(null);
        setToken(null);

        // Set archived account data to show modal
        setArchivedAccountData({
          archiveReason: data.archiveReason,
          archivedAt: data.archivedAt,
          hasRequestedReactivation: data.hasRequestedReactivation,
          reactivationRequestDate: data.reactivationRequestDate,
          userEmail: data.userEmail,
          userName: data.userName,
        });
        setShowDisabledModal(true);

        throw new Error(data.message);
      }
      throw error;
    }
  };

  const handleCloseDisabledModal = () => {
    setShowDisabledModal(false);
    setArchivedAccountData(null);
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

  const updateProfileInfo = async ({ name, photoURL, bio }) => {
    if (!firebaseUser) {
      throw new Error('Not authenticated');
    }

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (photoURL !== undefined) payload.photoURL = photoURL;
    if (bio !== undefined) payload.bio = bio;

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

  const toggleViewMode = () => {
    setViewMode(prev => {
      const newMode = prev === 'admin' ? 'user' : 'admin';
      localStorage.setItem('viewMode', newMode);
      return newMode;
    });
  };

  // Ensure admins always have premium access
  const effectiveUserProfile = profileQuery.data ? {
    ...profileQuery.data,
    isPremium: profileQuery.data.isPremium || profileQuery.data.role === 'admin'
  } : null;

  // Set initial view mode based on role and persistence
  useEffect(() => {
    if (profileQuery.data) {
      if (profileQuery.data.role === 'admin') {
        // If admin, respect saved preference or default to admin
        const saved = localStorage.getItem('viewMode');
        if (!saved) {
          setViewMode('admin');
          localStorage.setItem('viewMode', 'admin');
        } else {
          setViewMode(saved);
        }
      } else {
        // If not admin, force user mode
        if (viewMode !== 'user') {
          setViewMode('user');
          localStorage.removeItem('viewMode');
        }
      }
    }
  }, [profileQuery.data?.role]);

  const value = {
    firebaseUser,
    isLoggedIn,
    token,
    authLoading,
    authInitialized,
    userProfile: effectiveUserProfile,
    profileLoading: profileQuery.isLoading,
    profileRefetch: profileQuery.refetch,
    updateProfileInfo,
    register,
    login,
    loginWithGoogle,
    logout,
    viewMode,
    toggleViewMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Account Disabled Modal */}
      {archivedAccountData && (
        <AccountDisabledModal
          isOpen={showDisabledModal}
          onClose={handleCloseDisabledModal}
          archiveReason={archivedAccountData.archiveReason}
          archivedAt={archivedAccountData.archivedAt}
          hasRequestedReactivation={archivedAccountData.hasRequestedReactivation}
          reactivationRequestDate={archivedAccountData.reactivationRequestDate}
          userEmail={archivedAccountData.userEmail}
          userName={archivedAccountData.userName}
        />
      )}
    </AuthContext.Provider>
  );
};
export default AuthProvider;

