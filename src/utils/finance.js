export const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export function currencySymbol(currency = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 })
    .formatToParts(0).find((part) => part.type === 'currency')?.value || currency;
}

export function getTotals(transactions, month = currentMonth()) {
  const monthly = transactions.filter((item) => item.date.startsWith(month));
  const income = monthly.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = monthly.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
  const allIncome = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
  const allExpenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
  return { income, expenses, savings: income - expenses, balance: allIncome - allExpenses };
}

export function formatMoney(value, currency = 'USD', compact = false) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function monthLabel(date) {
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);
}

export function monthlyChartData(transactions) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const rows = transactions.filter((item) => item.date.startsWith(key));
    return {
      month: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date),
      Income: rows.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0),
      Expenses: rows.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0),
      Savings: rows.reduce((sum, item) => sum + (item.type === 'income' ? Number(item.amount) : -Number(item.amount)), 0),
    };
  });
}

export function categoryTotals(transactions) {
  const totals = transactions.filter((item) => item.type === 'expense').reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});
  return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function saveCsv(transactions) {
  const columns = ['date', 'type', 'category', 'description', 'amount', 'notes'];
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [columns.join(','), ...transactions.map((row) => columns.map((key) => escape(row[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `smartspend-transactions-${currentMonth()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
