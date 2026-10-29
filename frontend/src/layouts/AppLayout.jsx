import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "../components/navigation/AppSidebar";
import TopNav from "../components/navigation/TopNav";
import { NotificationProvider } from "../context/NotificationContext";
import NotificationDrawer from "../components/notification/NotificationDrawer";
import "./AppLayout.css";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <NotificationProvider>
      <div className="app-shell-layout">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="app-content-wrapper">
          <TopNav onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

          <main className="app-main-content">
            <Outlet />
          </main>

          <footer className="app-footer">
            <div className="app-footer-content">
              <span>
                FlowLedger &bull; Enterprise Financial Ledger &amp; Budget Governance
              </span>
              <span>&copy; {currentYear} All rights reserved.</span>
            </div>
          </footer>
        </div>

        <NotificationDrawer />
      </div>
    </NotificationProvider>
  );
}

export default AppLayout;
