import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { makeId } from '../utils/finance.js';

const STORAGE_KEY = 'smartspend-auth-v1';
const AuthContext = createContext(null);

function readAuthState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { users: [], session: null };
    const parsed = JSON.parse(stored);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      session: parsed.session && typeof parsed.session === 'object' ? parsed.session : null,
    };
  } catch (error) {
    console.error('Unable to load saved SmartSpend accounts.', error);
    return { users: [], session: null };
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readAuthState);
  const [storageError, setStorageError] = useState('');
  const { users, session } = authState;
  useEffect(() => {
    const syncAuthState = (event) => {
      if (event.key === STORAGE_KEY) setAuthState(readAuthState());
    };
    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, []);

  const currentUser = session?.role === 'user'
    ? users.find((user) => user.id === session.userId) || null
    : null;

  const commit = useCallback((nextState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      setAuthState(nextState);
      setStorageError('');
      return true;
    } catch (error) {
      console.error('Unable to save SmartSpend account changes.', error);
      setStorageError('Your browser could not save this account update. Check local storage availability and try again.');
      return false;
    }
  }, []);

  const register = useCallback(({ name, email, password }) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || password.length < 8) {
      return { success: false, error: 'Enter a name, a valid email address, and a password with at least 8 characters.' };
    }
    if (users.some((user) => user.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with that email address already exists.' };
    }
    const user = {
      id: makeId(),
      name: cleanName,
      email: cleanEmail,
      password,
      createdAt: new Date().toISOString(),
    };
    const nextState = { users: [...users, user], session: { role: 'user', userId: user.id } };
    return commit(nextState)
      ? { success: true, user }
      : { success: false, error: 'Your browser could not save this account. Check local storage availability and try again.' };
  }, [users, commit]);

  const loginUser = useCallback(({ email, password }) => {
    const user = users.find((account) => account.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      return { success: false, error: 'The email or password is incorrect.' };
    }
    const nextState = { users, session: { role: 'user', userId: user.id } };
    return commit(nextState)
      ? { success: true }
      : { success: false, error: 'Your browser could not save the sign-in session. Check local storage availability and try again.' };
  }, [users, commit]);

  const logout = useCallback(() => commit({ users, session: null }), [users, commit]);

  const updateAccountProfile = useCallback(({ name, email }) => {
    if (!currentUser) return false;
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((user) => user.id !== currentUser.id && user.email.toLowerCase() === cleanEmail)) {
      return false;
    }
    const nextUsers = users.map((user) => user.id === currentUser.id
      ? { ...user, name: name.trim(), email: cleanEmail }
      : user);
    return commit({ users: nextUsers, session });
  }, [currentUser, users, session, commit]);

  const value = useMemo(() => ({
    currentUser,
    storageError,
    register,
    loginUser,
    logout,
    updateAccountProfile,
  }), [currentUser, storageError, register, loginUser, logout, updateAccountProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
