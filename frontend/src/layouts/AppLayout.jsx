import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function AppLayout() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer-content">
          <span>FlowLedger &bull; Enterprise Financial Ledger &amp; Budget Governance</span>
          <span>&copy; {currentYear} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;