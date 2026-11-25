import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { seedData } from '../data/seed.js';
import { createInitialFinanceData, readUserFinanceData, userFinanceStorageKey } from '../data/userFinance.js';
import { useAuth } from './AuthContext.jsx';

const FinanceContext = createContext(null);

function FinanceWorkspace({ user, children }) {
  const [data, setData] = useState(() => readUserFinanceData(user));
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    try {
      localStorage.setItem(userFinanceStorageKey(user.id), JSON.stringify(data));
    } catch (error) {
      console.error('Unable to save this SmartSpend user workspace.', error);
      setNotice({ message: 'Your browser could not save this update locally.', kind: 'error' });
    }
  }, [data, user]);

  const update = useCallback((key, value) => {
    setData((previous) => ({ ...previous, [key]: typeof value === 'function' ? value(previous[key]) : value }));
  }, []);

  const notify = useCallback((message, kind = 'success') => {
    const id = Date.now();
    setNotice({ message, kind, id });
    window.setTimeout(() => setNotice((current) => current?.id === id ? null : current), 3200);
  }, []);

  const reset = useCallback(() => {
    setData({
      ...seedData,
      profile: { name: user?.name || '', email: user?.email || '' },
    });
    notify('Your demo data has been restored.');
  }, [notify, user]);

  const clearData = useCallback(() => {
    setData({
      ...createInitialFinanceData(user),
      currency: data.currency,
      theme: data.theme,
    });
    notify('Your locally saved data has been cleared.');
  }, [data.currency, data.theme, notify, user]);

  const value = useMemo(() => ({
    ...data,
    update,
    reset,
    clearData,
    notify,
    notice,
    dismissNotice: () => setNotice(null),
  }), [data, update, reset, clearData, notify, notice]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function FinanceProvider({ children }) {
  const { currentUser } = useAuth();
  return (
    <FinanceWorkspace key={currentUser?.id || 'signed-out'} user={currentUser}>
      {children}
    </FinanceWorkspace>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider.');
  return context;
}
