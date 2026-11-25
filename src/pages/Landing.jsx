import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, CircleDollarSign, Compass, LineChart, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Wallet, title: 'Know where it goes', text: 'See your spending clearly, without the spreadsheets or the guesswork.' },
  { icon: Compass, title: 'Make room for what matters', text: 'Set thoughtful budgets and find a little more breathing room each month.' },
  { icon: LineChart, title: 'Watch your progress grow', text: 'Follow your trends and celebrate the small wins that add up.' },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <nav className="landing-nav container">
        <Link className="brand-lockup" to="/"><span className="brand-symbol"><CircleDollarSign size={20} /></span><span>smart<span>spend</span></span></Link>
        <div className="d-flex align-items-center gap-3"><a className="landing-nav-link" href="#how-it-works">How it works</a><Link className="landing-login-link" to="/login">User login</Link><Link className="btn btn-primary" to="/admin/login">Admin login <ArrowRight size={16} /></Link></div>
      </nav>
      <section className="hero-section container">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="kicker-dot" /> A calmer way to handle money</div>
          <h1>Make your money feel a little more <em>like yours.</em></h1>
          <p>SmartSpend brings your everyday spending, saving, and plans into one thoughtful place — so you can focus on what matters next.</p>
          <div className="d-flex flex-wrap gap-3 align-items-center"><Link to="/register" className="btn btn-primary btn-lg">Create your account <ArrowRight size={18} /></Link><span className="hero-note"><ShieldCheck size={16} /> Private by design · stored on your device</span></div>
          <div className="hero-proof"><div className="proof-avatars"><span>A</span><span>M</span><span>J</span><span>+</span></div><span>A clearer picture, one day at a time</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-top"><span>YOUR MONTH, IN VIEW</span><span className="hero-card-dot">•••</span></div>
            <div className="hero-balance-label">Available balance</div><div className="hero-balance">$4,280.50</div>
            <div className="hero-chart"><div className="chart-gridline" /><div className="chart-gridline" /><svg viewBox="0 0 480 150" preserveAspectRatio="none" aria-label="Illustrative spending trend"><path d="M0 110 C34 95 45 122 83 92 S130 104 165 65 S218 96 252 56 S306 72 340 38 S390 76 420 24 S455 42 480 10" fill="none" stroke="#89968A" strokeWidth="4" strokeLinecap="round" /><path d="M0 110 C34 95 45 122 83 92 S130 104 165 65 S218 96 252 56 S306 72 340 38 S390 76 420 24 S455 42 480 10 V150 H0Z" fill="url(#chartFill)" opacity=".16" /><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#89968A" /><stop offset="1" stopColor="#89968A" stopOpacity="0" /></linearGradient></defs></svg><div className="chart-labels"><span>WEEK 1</span><span>WEEK 2</span><span>WEEK 3</span><span>WEEK 4</span></div></div>
            <div className="hero-mini-stats"><div><span><ArrowUpRight size={14} /> INCOME</span><strong>$4,800</strong></div><div><span><ArrowDownRight size={14} /> SPENDING</span><strong>$1,920</strong></div></div>
          </div>
          <div className="floating-note"><span className="floating-icon"><Sparkles size={17} /></span><div><strong>Nice work this month</strong><small>You're building a good habit.</small></div><Check size={17} className="floating-check" /></div>
          <div className="hero-decoration decor-one" /><div className="hero-decoration decor-two" />
        </div>
      </section>
      <section className="landing-features">
        <div className="container"><div className="section-intro text-center"><div className="eyebrow">A FINANCIAL TOOL THAT FEELS HUMAN</div><h2>Less financial noise.<br /><em>More peace of mind.</em></h2></div>
          <div className="row g-4">{features.map(({ icon: Icon, title, text }, index) => <div className="col-md-4" key={title}><article className="feature-card"><div className={`feature-icon feature-icon-${index}`}><Icon size={20} /></div><h3>{title}</h3><p>{text}</p></article></div>)}</div>
        </div>
      </section>
      <section className="how-section container" id="how-it-works"><div className="how-copy"><div className="eyebrow">SIMPLE BY DESIGN</div><h2>A good plan starts<br />with <em>a clearer picture.</em></h2><p>Start where you are. Add the things you spend and earn. SmartSpend helps turn the details into an easier next step.</p><Link className="text-link" to="/register">Take a look around <ArrowRight size={17} /></Link></div><div className="how-steps">{['Add your everyday transactions', 'Set budgets that fit real life', 'Build toward something you care about'].map((step, index) => <div className="how-step" key={step}><span>0{index + 1}</span><div><h3>{step}</h3><p>{['Bring your income and spending into one simple view.', 'Choose a few categories and keep an eye on how they feel.', 'Set a goal, make progress at your pace, and see it add up.'][index]}</p></div></div>)}</div></section>
      <footer className="landing-footer"><div className="container d-flex justify-content-between align-items-center gap-3 flex-wrap"><Link className="brand-lockup" to="/"><span className="brand-symbol"><CircleDollarSign size={19} /></span><span>smart<span>spend</span></span></Link><span>Thoughtful money management, right at home.</span><Link to="/login" className="footer-link">User sign in <ArrowRight size={15} /></Link></div></footer>
    </div>
  );
}
