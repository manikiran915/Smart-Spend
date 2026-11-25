import { useState } from 'react';
import { Check, Palette, Plus, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ConfirmAction, Modal, PageTitle } from '../components/UI.jsx';
import { getThemeId, themePalettes } from '../theme.js';

export default function Settings() {
  const { profile, currency, theme, categories, transactions, budgets, update, reset, clearData, notify } = useFinance();
  const selectedTheme = getThemeId(theme);
  const { updateAccountProfile } = useAuth();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [categoryName, setCategoryName] = useState('');
  const [dataDialog, setDataDialog] = useState(null);
  const [error, setError] = useState('');
  const saveProfile = (event) => {
    event.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter your name and a valid email address.');
      return;
    }
    if (!updateAccountProfile({ name, email })) {
      setError('That email address is already in use or the account could not be updated.');
      return;
    }
    update('profile', { name: name.trim(), email: email.trim() });
    setError('');
    notify('Your profile has been updated.');
  };
  const addCategory = (event) => {
    event.preventDefault();
    const category = categoryName.trim();
    if (!category || category.length > 30 || categories.some((item) => item.toLowerCase() === category.toLowerCase())) {
      setError('Add a unique category name with no more than 30 characters.');
      return;
    }
    update('categories', (rows) => [...rows, category]);
    setCategoryName('');
    setError('');
    notify('Category added.');
  };
  const removeCategory = (category) => {
    update('categories', (rows) => rows.filter((item) => item !== category));
    notify('Category removed.');
  };
  const categoryInUse = (category) => transactions.some((item) => item.category === category) || budgets.some((item) => item.category === category);
  const runDataAction = () => {
    if (dataDialog === 'reset') reset();
    if (dataDialog === 'clear') clearData();
    setDataDialog(null);
  };

  return <div>
    <PageTitle eyebrow="MAKE IT YOURS" title="Settings" description="A few small preferences to make SmartSpend feel like home." />
    <div className="settings-layout">
      <div className="settings-main">
        <section className="panel-card settings-card"><div className="settings-section-head"><div className="settings-section-icon"><span className="avatar settings-avatar">{(name || 'Y').slice(0, 1).toUpperCase()}</span></div><div><h2>Your profile</h2><p>Just the basics. This stays on your device.</p></div></div><form onSubmit={saveProfile}><div className="row g-3"><div className="col-md-6"><label className="form-label">Name</label><input className="form-control" value={name} onChange={(e) => setName(e.target.value)} maxLength="70" required /></div><div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></div>{error && <div className="alert alert-danger py-2 mt-3">{error}</div>}<div className="settings-save"><button className="btn btn-primary btn-sm"><Check size={15} /> Save profile</button></div></form></section>
        <section className="panel-card settings-card"><div className="settings-section-head"><div className="settings-section-icon settings-currency-icon">$</div><div><h2>Currency</h2><p>Choose how amounts are displayed across the app.</p></div></div><div className="currency-choice"><label className="form-label" htmlFor="currency-select">Display currency</label><select id="currency-select" className="form-select" value={currency} onChange={(e) => { update('currency', e.target.value); notify('Currency preference updated.'); }}><option value="USD">USD — US Dollar ($)</option><option value="CAD">CAD — Canadian Dollar ($)</option><option value="EUR">EUR — Euro (€)</option><option value="GBP">GBP — British Pound (£)</option><option value="INR">INR — Indian Rupee (₹)</option><option value="AUD">AUD — Australian Dollar ($)</option><option value="JPY">JPY — Japanese Yen (¥)</option></select></div></section>
        <section className="panel-card settings-card"><div className="settings-section-head"><div className="settings-section-icon theme-icon"><Palette size={18} /></div><div><h2>Color theme</h2><p>Choose a palette for your workspace. Your choice is saved on this device.</p></div></div><div className="theme-choices">{themePalettes.map((palette) => <button type="button" key={palette.id} className={`theme-option ${selectedTheme === palette.id ? 'selected' : ''}`} aria-pressed={selectedTheme === palette.id} onClick={() => update('theme', palette.id)}><span className="theme-swatches" aria-hidden="true">{palette.preview.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span><span className="theme-option-copy"><strong>{palette.name}</strong><small>{palette.description}</small></span>{selectedTheme === palette.id && <Check className="theme-option-check" size={17} aria-hidden="true" />}</button>)}</div></section>
        <section className="panel-card settings-card"><div className="settings-section-head"><div className="settings-section-icon category-settings-icon">#</div><div><h2>Your categories</h2><p>Keep your spending labels meaningful to you.</p></div></div><form className="add-category-form" onSubmit={addCategory}><input className="form-control" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Pet care" maxLength="30" aria-label="New category name" /><button className="btn btn-outline-secondary" type="submit"><Plus size={16} /> Add</button></form>{error && <div className="alert alert-danger py-2 mt-2">{error}</div>}<div className="category-manage-list">{categories.map((category) => <div className="category-manage-chip" key={category}><span>{category}</span><ConfirmAction className={`icon-button ${categoryInUse(category) ? 'disabled-icon' : 'danger-hover'}`} disabled={categoryInUse(category)} message={`Remove the “${category}” category?`} onConfirm={() => removeCategory(category)}><Trash2 size={14} /></ConfirmAction></div>)}</div><small className="settings-help">Categories used by a transaction or budget are kept to protect your records.</small></section>
      </div>
      <aside className="settings-aside">
        <section className="privacy-card"><div className="privacy-icon"><ShieldCheck size={20} /></div><h2>Your data stays yours.</h2><p>SmartSpend saves your information in this browser only. No account, server, or external service is involved.</p><div className="privacy-rule" /><span><i /> Stored locally on this device</span><span><i /> No external connections</span></section>
        <section className="panel-card data-actions-card"><h2>Data & storage</h2><p>Restore the sample or clear your saved workspace.</p><button className="btn btn-outline-secondary w-100" onClick={() => setDataDialog('reset')}><RotateCcw size={15} /> Restore demo data</button><button className="btn btn-outline-danger w-100 mt-2" onClick={() => setDataDialog('clear')}><Trash2 size={15} /> Clear saved data</button></section>
      </aside>
    </div>
    {dataDialog && <Modal title={dataDialog === 'reset' ? 'Restore demo data?' : 'Clear saved data?'} onClose={() => setDataDialog(null)}><p className="text-secondary">{dataDialog === 'reset' ? 'This replaces your current workspace with the original SmartSpend sample transactions and budgets.' : 'This removes your transactions, budgets, and profile from this browser. You can start fresh afterward.'}</p><div className="modal-actions"><button className="btn btn-outline-secondary" onClick={() => setDataDialog(null)}>Keep my data</button><button className={`btn ${dataDialog === 'clear' ? 'btn-danger' : 'btn-primary'}`} onClick={runDataAction}>{dataDialog === 'reset' ? 'Restore demo data' : 'Clear my data'}</button></div></Modal>}
  </div>;
}
