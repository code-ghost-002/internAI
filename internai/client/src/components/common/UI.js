import styles from './UI.module.css';

export const Card = ({ children, className = '', style = {} }) => (
  <div className={`${styles.card} ${className}`} style={style}>{children}</div>
);

export const Badge = ({ children, color = 'accent', style = {} }) => (
  <span className={styles.badge} data-color={color} style={style}>{children}</span>
);

export const MatchBadge = ({ score }) => {
  const color = score >= 90 ? 'green' : score >= 75 ? 'accent' : 'amber';
  return (
    <span className={styles.matchBadge} data-color={color}>
      <span className={styles.dot} />
      {score}% match
    </span>
  );
};

export const Button = ({ children, variant = 'primary', size = 'md', loading = false, disabled = false, onClick, type = 'button', style = {}, className = '' }) => (
  <button
    type={type} onClick={onClick}
    disabled={disabled || loading}
    style={style}
    className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className} ${disabled || loading ? styles.disabled : ''}`}>
    {loading ? <span className="spinner" style={{ width: 16, height: 16, marginRight: 6 }} /> : null}
    {children}
  </button>
);

export const Input = ({ label, error, ...props }) => (
  <div className={styles.fieldWrap}>
    {label && <label className={styles.label}>{label}</label>}
    <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
);

export const Textarea = ({ label, error, ...props }) => (
  <div className={styles.fieldWrap}>
    {label && <label className={styles.label}>{label}</label>}
    <textarea className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''}`} {...props} />
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
);

export const Select = ({ label, error, children, ...props }) => (
  <div className={styles.fieldWrap}>
    {label && <label className={styles.label}>{label}</label>}
    <select className={`${styles.input} ${styles.select} ${error ? styles.inputError : ''}`} {...props}>
      {children}
    </select>
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
);

export const Spinner = ({ size = 40 }) => (
  <div style={{ display:'flex', justifyContent:'center', padding: 48 }}>
    <div className="spinner" style={{ width: size, height: size }} />
  </div>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <div className={styles.pageHeader}>
    <div>
      <h1 className={styles.pageTitle}>{title}</h1>
      {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const EmptyState = ({ icon = '◎', title, message }) => (
  <div className={styles.empty}>
    <div className={styles.emptyIcon}>{icon}</div>
    <div className={styles.emptyTitle}>{title}</div>
    {message && <div className={styles.emptyMsg}>{message}</div>}
  </div>
);

export const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  return <div className={`${styles.alert} ${styles[`alert_${type}`]}`}>{message}</div>;
};

export const StatCard = ({ label, value, sub, color = 'text' }) => (
  <div className={styles.statCard}>
    <div className={styles.statLabel}>{label}</div>
    <div className={styles.statValue} style={{ color: `var(--${color})` }}>{value}</div>
    {sub && <div className={styles.statSub}>{sub}</div>}
  </div>
);
