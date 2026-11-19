import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { useAppStore } from '@/store/useAppStore';
import { DriverCategoryCode } from '@/core/types';

export function useAuthController() {
  const navigate = useNavigate();
  const { loginWithEmail, registerUser, loginWithGoogle } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCats, setSelectedCats] = useState<DriverCategoryCode[]>(['B']);
  const [loading, setLoading] = useState(false);

  const toggleCat = (cat: DriverCategoryCode) => {
    setSelectedCats((prev) =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter((c) => c !== cat)
          : prev
        : [...prev, cat]
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Заповніть поле електронної пошти');
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, email.trim());
      }
      toast.success(
        `Інструкції для відновлення пароля надіслано на ${email.trim()}`
      );
      setMode('login');
    } catch (err: any) {
      toast.error(err?.message || 'Помилка відправки листа');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Заповніть поле електронної пошти');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Пароль має містити щонайменше 6 символів');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        if (isFirebaseConfigured && auth) {
          const cred = await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );
          loginWithEmail(
            cred.user.email || email.trim(),
            cred.user.displayName || undefined,
            cred.user.uid
          );
        } else {
          loginWithEmail(email.trim());
        }
        toast.success('Вітаємо в системі ПДР України AI!');
        navigate('/');
      } else {
        if (!displayName.trim()) {
          toast.error("Вкажіть ваше ім'я або нікнейм");
          setLoading(false);
          return;
        }
        let createdUid: string | undefined = undefined;
        if (isFirebaseConfigured && auth) {
          const cred = await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );
          await updateProfile(cred.user, { displayName: displayName.trim() });
          createdUid = cred.user.uid;
        }
        registerUser(
          email.trim(),
          displayName.trim(),
          selectedCats,
          createdUid
        );
        toast.success(
          `Реєстрація успішна! Обрано категорії: ${selectedCats.join(', ')}`
        );
        navigate('/');
      }
    } catch (err: any) {
      toast.error(
        err?.message || 'Помилка авторизації. Перевірте введені дані.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const res = await signInWithPopup(auth, googleProvider);
        loginWithGoogle(
          res.user.email || 'user@gmail.com',
          res.user.displayName || 'Користувач Google',
          res.user.photoURL || undefined,
          res.user.uid
        );
      } else {
        loginWithGoogle('student@pdr.ua', 'Учень ПДР');
      }
      toast.success('Успішний вхід через обліковий запис Google!');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Не вдалося увійти через Google');
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    email,
    password,
    displayName,
    showPassword,
    selectedCats,
    loading,
    setMode,
    setEmail,
    setPassword,
    setDisplayName,
    setShowPassword,
    toggleCat,
    handleResetPassword,
    handleAuthSubmit,
    handleGoogleSignIn,
  };
}
