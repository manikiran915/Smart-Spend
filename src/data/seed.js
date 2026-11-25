const localDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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
  categories: ['Housing', 'Groceries', 'Dining', 'Transport', 'Shopping', 'Wellness', 'Subscriptions', 'Utilities', 'Entertainment', 'Salary', 'Freelance', 'Other'],
  profile: { name: 'Alex Morgan', email: 'alex.morgan@example.com' },
  currency: 'USD',
  theme: 'forest',
};
