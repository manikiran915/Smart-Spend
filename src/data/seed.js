const localDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateString(date);
};

const currentMonthDate = (day) => {
  const date = new Date();
  date.setDate(day);
  return localDateString(date);
};

export const seedData = {
  transactions: [
    { id: 't1', type: 'income', amount: 4200, category: 'Salary', description: 'Monthly salary', date: currentMonthDate(1), notes: 'Northstar Studio' },
    { id: 't2', type: 'expense', amount: 1280, category: 'Housing', description: 'Apartment rent', date: currentMonthDate(2), notes: '' },
    { id: 't3', type: 'expense', amount: 86.4, category: 'Groceries', description: 'Weekend groceries', date: currentMonthDate(5), notes: '' },
    { id: 't4', type: 'expense', amount: 42, category: 'Dining', description: 'Lunch with Maya', date: currentMonthDate(8), notes: '' },
    { id: 't5', type: 'income', amount: 180, category: 'Freelance', description: 'Brand illustration', date: currentMonthDate(11), notes: '' },
    { id: 't6', type: 'expense', amount: 64, category: 'Transport', description: 'Transit pass', date: currentMonthDate(13), notes: '' },
    { id: 't7', type: 'expense', amount: 32.5, category: 'Wellness', description: 'Pilates class', date: currentMonthDate(16), notes: '' },
    { id: 't8', type: 'expense', amount: 118, category: 'Shopping', description: 'Everyday essentials', date: currentMonthDate(18), notes: '' },
    { id: 't9', type: 'expense', amount: 24, category: 'Subscriptions', description: 'Streaming & music', date: currentMonthDate(20), notes: '' },
    { id: 't10', type: 'expense', amount: 57, category: 'Dining', description: 'Dinner out', date: currentMonthDate(22), notes: '' },
  ],
  budgets: [
    { id: 'b1', category: 'Groceries', limit: 450 },
    { id: 'b2', category: 'Dining', limit: 220 },
    { id: 'b3', category: 'Transport', limit: 160 },
    { id: 'b4', category: 'Shopping', limit: 250 },
    { id: 'b5', category: 'Wellness', limit: 120 },
  ],
  goals: [
    { id: 'g1', name: 'A little room to roam', target: 5000, saved: 2150, monthlySavings: 350, dueDate: '' },
    { id: 'g2', name: 'Rainy day fund', target: 8000, saved: 4800, monthlySavings: 500, dueDate: '' },
  ],
  recurring: [
    { id: 'r1', name: 'Apartment rent', amount: 1280, category: 'Housing', frequency: 'Monthly', nextDate: dateOffset(5) },
    { id: 'r2', name: 'Music subscription', amount: 11, category: 'Subscriptions', frequency: 'Monthly', nextDate: dateOffset(9) },
    { id: 'r3', name: 'Internet', amount: 55, category: 'Utilities', frequency: 'Monthly', nextDate: dateOffset(14) },
  ],
  categories: ['Housing', 'Groceries', 'Dining', 'Transport', 'Shopping', 'Wellness', 'Subscriptions', 'Utilities', 'Entertainment', 'Salary', 'Freelance', 'Other'],
  profile: { name: 'Alex Morgan', email: 'alex.morgan@example.com' },
  currency: 'USD',
  theme: 'light',
};
