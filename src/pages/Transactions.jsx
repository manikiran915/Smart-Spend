import { useMemo, useState } from 'react';
import { ArrowDownUp, Download, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { formatMoney, saveCsv } from '../utils/finance.js';
import { ConfirmAction, EmptyState, PageTitle } from '../components/UI.jsx';
import { TransactionDialog } from '../components/TransactionDialog.jsx';

export default function Transactions() {
  const { transactions, categories, currency, update, notify } = useFinance();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('date-desc');
  const [dialog, setDialog] = useState(null);
  const filtered = useMemo(() => transactions.filter((item) => {
    const text = `${item.description} ${item.category} ${item.notes || ''}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (type === 'all' || item.type === type) && (category === 'all' || item.category === category);
  }).sort((a, b) => sort === 'amount-desc' ? b.amount - a.amount : sort === 'amount-asc' ? a.amount - b.amount : sort === 'date-asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)), [transactions, query, type, category, sort]);

  const remove = (id) => {
    update('transactions', (rows) => rows.filter((item) => item.id !== id));
    notify('Transaction deleted.');
  };

  return (
    <div>
      <PageTitle eyebrow="YOUR MONEY, IN THE DETAILS" title="Transactions" description="Every little money moment, all in one place." action={<button className="btn btn-primary" onClick={() => setDialog({})}><Plus size={17} /> Add transaction</button>} />
      <section className="panel-card transactions-panel">
        <div className="filter-bar">
          <div className="search-field"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transactions..." aria-label="Search transactions" /></div>
          <div className="filter-select"><SlidersHorizontal size={15} /><select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by transaction type"><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select></div>
          <select className="form-select category-filter" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category"><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="form-select sort-filter" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort transactions"><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="amount-desc">Amount: high to low</option><option value="amount-asc">Amount: low to high</option></select>
          <button className="btn btn-outline-secondary export-btn" onClick={() => { saveCsv(filtered); notify('Your CSV export is ready.'); }} disabled={!filtered.length}><Download size={16} /><span>Export CSV</span></button>
        </div>
        <div className="transaction-table-wrap">
          {filtered.length ? <table className="table transaction-table align-middle mb-0"><thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>TYPE</th><th className="text-end">AMOUNT</th><th aria-label="Actions" /></tr></thead><tbody>
            {filtered.map((item) => <tr key={item.id} onClick={() => setDialog(item)} className="clickable-row"><td><div className="table-main-cell"><div className={`transaction-avatar ${item.type}`}>{item.category.slice(0, 1)}</div><div><strong>{item.description}</strong>{item.notes && <small>{item.notes}</small>}</div></div></td><td><span className="table-category">{item.category}</span></td><td>{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td><td><span className={`type-pill ${item.type}`}>{item.type}</span></td><td className={`text-end amount-cell ${item.type}`}>{item.type === 'income' ? '+' : '−'}{formatMoney(item.amount, currency)}</td><td className="row-actions" onClick={(event) => event.stopPropagation()}><ConfirmAction className="icon-button danger-hover" message={`Delete “${item.description}”? This cannot be undone.`} onConfirm={() => remove(item.id)}><Trash2 size={16} /></ConfirmAction></td></tr>)}
          </tbody></table> : <EmptyState title={transactions.length ? 'No matching transactions' : 'Nothing here just yet'} description={transactions.length ? 'Try adjusting your search or filters.' : 'Add an income or expense to start keeping track.'} action={!transactions.length && <button className="btn btn-primary" onClick={() => setDialog({})}><Plus size={16} /> Add transaction</button>} />}
        </div>
        {filtered.length > 0 && <div className="table-summary"><span>Showing {filtered.length} of {transactions.length} transactions</span><span><ArrowDownUp size={14} /> Click a row to edit</span></div>}
      </section>
      {dialog && <TransactionDialog transaction={dialog.id ? dialog : undefined} onClose={() => setDialog(null)} />}
    </div>
  );
}
