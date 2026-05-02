import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AppLayout.module.css';

const studentNav = [
  { to: '/student/dashboard',    icon: '⬡', label: 'Dashboard' },
  { to: '/student/internships',  icon: '◈', label: 'Internships' },
  { to: '/student/jobs',         icon: '◇', label: 'Full-time Jobs' },
  { to: '/student/applications', icon: '◎', label: 'Applications' },
  { to: '/student/ai-resume',    icon: '✦', label: 'AI Resume' },
  { to: '/student/profile',      icon: '◉', label: 'Profile' },
];

const recruiterNav = [
  { to: '/recruiter/dashboard',  icon: '⬡', label: 'Dashboard' },
  { to: '/recruiter/post-job',   icon: '+', label: 'Post Listing' },
  { to: '/recruiter/my-jobs',    icon: '◈', label: 'My Listings' },
  { to: '/recruiter/applicants', icon: '◎', label: 'Applicants' },
  { to: '/recruiter/profile',    icon: '◉', label: 'Profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === 'student' ? studentNav : recruiterNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>I</div>
          <div>
            <div className={styles.brandName}>InternAI</div>
            <div className={styles.roleTag}>{user?.role}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {nav.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
