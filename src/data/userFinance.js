import { seedData } from './seed.js';
import { getThemeId } from '../theme.js';

export const userFinanceStorageKey = (userId) => `smartspend-user-data-v1:${userId}`;

export function createInitialFinanceData(user = {}) {
  return {
    ...seedData,
    transactions: [],
    budgets: [],
    categories: [...seedData.categories],
    profile: { name: user?.name || '', email: user?.email || '' },
  };
}

export function readUserFinanceData(user) {
  const initial = createInitialFinanceData(user);
  if (!user?.id) return initial;
  try {
    const stored = localStorage.getItem(userFinanceStorageKey(user.id));
    if (!stored) return initial;
    const parsed = JSON.parse(stored);
    return {
      ...initial,
      ...parsed,
      theme: getThemeId(parsed.theme),
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : [...seedData.categories],
      profile: { ...initial.profile, ...(parsed.profile || {}) },
    };
  } catch (error) {
    console.error('Unable to load this SmartSpend user workspace.', error);
    return initial;
  }
}
