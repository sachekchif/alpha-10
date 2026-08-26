'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  Search,
  Bell,
  Menu,
  ChevronDown,
  ChevronUp,
  LogOut,
  Building2,
  Store,
  ClipboardList,
  FileText,
  Activity,
  Plug,
  Megaphone,
  Files,
  History,
  Clock,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/auth/hooks/useReduxHooks';
import { clearAuth } from '@/auth/store/authSlice';
import { useLogoutMutation } from '@/auth/services/authApi';
import { isSuperAdmin, isControl, getRoleLabel } from '@/auth/types/auth.types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted =
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) +
        ' • ' +
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      setCurrentTime(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);
  const [logoutApi] = useLogoutMutation();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated && !token) {
      router.push('/auth/login?expired=true');
    }
  }, [isAuthenticated, token, router]);

  const userRole = user?.role;
  const userIsSuperAdmin = isSuperAdmin(userRole);
  const userIsControl = isControl(userRole);
  const roleLabel = getRoleLabel(userRole);

  // Admin name: use real name from Redux, fallback gracefully
  const adminName = user?.name || user?.email?.split('@')[0] || 'Admin';
  // Initials from name
  const initials = adminName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-[#f7f4f4] dark:bg-gray-900 overflow-hidden font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">

      {/* Sidebar */}
      <aside
        className={`bg-black border-r border-gray-800 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'
          } shrink-0 relative z-20`}
      >
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3 h-full">
            <img src="/assets/images/logo.png" alt="Alpha10 Logo" className={`h-8 w-auto object-contain transition-all duration-200 ${!sidebarOpen && 'pl-1'}`} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Search inside Sidebar */}
          {sidebarOpen && (
            <div className="px-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-full bg-[#1a1a2e] text-white border-none py-2.5 pl-9 pr-8 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C] transition-all font-medium placeholder-gray-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-bold">⌘/</span>
              </div>
            </div>
          )}

          {/* ── RETAIL BANKING — visible to Control only ──────────────────────── */}
          {userIsControl && (
            <div className="px-4">
              {sidebarOpen && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Retail Banking</p>}
              <nav className="flex flex-col gap-1">
                <NavItem
                  icon={<Store size={18} />}
                  label="Retail Banking"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "Portfolio Settings", href: "/dashboard/retail/portfolio" },
                    { label: "Settings", href: "/dashboard/retail/settings" },
                  ]}
                />
              </nav>
            </div>
          )}

          {/* ── GENERAL — visible to SuperAdmin only ──────────────────────── */}
          {userIsSuperAdmin && (
            <div className="px-4">
              {sidebarOpen && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">General</p>}
              <nav className="flex flex-col gap-1">
                <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" isOpen={sidebarOpen} exact />

                <NavItem
                  icon={<Store size={18} />}
                  label="Retail Banking"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "Dashboard", href: "/dashboard/retail", exact: true },
                    { label: "Customers", href: "/dashboard/retail/customers" },
                    { label: "KYC", href: "/dashboard/retail/kyc" },
                    { label: "Wallets", href: "/dashboard/retail/wallets" },
                    { label: "Investments", href: "/dashboard/retail/investments" },
                    { label: "Transactions", href: "/dashboard/retail/transactions" },
                    { label: "Support", href: "/dashboard/retail/support" },
                    { label: "Products", href: "/dashboard/retail/products" },
                    { label: "Analytics", href: "/dashboard/retail/analytics" },
                    { label: "Portfolio Settings", href: "/dashboard/retail/portfolio" },
                    { label: "Settings", href: "/dashboard/retail/settings" },
                  ]}
                />

                <NavItem
                  icon={<Building2 size={18} />}
                  label="Corporate Banking"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "Dashboard", href: "/dashboard/corporate" },
                    { label: "Organizations", href: "/dashboard/corporate/organizations" },
                    { label: "Corporate Users", href: "/dashboard/corporate/users" },
                    { label: "KYC & Business Verification", href: "/dashboard/corporate/kyc" },
                    { label: "Corporate Wallets", href: "/dashboard/corporate/wallets" },
                    { label: "Treasury", href: "/dashboard/corporate/treasury" },
                    { label: "Investments", href: "/dashboard/corporate/investments" },
                    { label: "Transactions", href: "/dashboard/corporate/transactions" },
                    { label: "Approval Center", href: "/dashboard/corporate/approvals" },
                    { label: "Support", href: "/dashboard/corporate/support" },
                    { label: "Analytics", href: "/dashboard/corporate/analytics" },
                  ]}
                />

                {sidebarOpen ? <hr className="border-gray-800 my-2 mx-2" /> : <div className="h-px bg-gray-800 my-2 mx-2"></div>}

                <NavItem href="/dashboard/pending" icon={<ClipboardList size={18} />} label="Pending On Me" isOpen={sidebarOpen} hasDot />

                <NavItem
                  icon={<FileText size={18} />}
                  label="Reports"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "Customer Reports", href: "/dashboard/reports/customers" },
                    { label: "Financial Reports", href: "/dashboard/reports/financial" },
                    { label: "Transaction Reports", href: "/dashboard/reports/transactions" },
                    { label: "Investment Reports", href: "/dashboard/reports/investments" },
                    { label: "Compliance Reports", href: "/dashboard/reports/compliance" },
                    { label: "Audit Reports", href: "/dashboard/reports/audit" },
                    { label: "Revenue Reports", href: "/dashboard/reports/revenue" },
                  ]}
                />

                <NavItem
                  icon={<Activity size={18} />}
                  label="System Monitoring"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "API Health", href: "/dashboard/monitoring/api" },
                    { label: "Integration Status", href: "/dashboard/monitoring/integrations" },
                    { label: "Failed Jobs", href: "/dashboard/monitoring/failed-jobs" },
                    { label: "Queue Monitor", href: "/dashboard/monitoring/queues" },
                    { label: "Background Jobs", href: "/dashboard/monitoring/jobs" },
                    { label: "Sync Logs", href: "/dashboard/monitoring/sync" },
                  ]}
                />

                <NavItem
                  icon={<Plug size={18} />}
                  label="Integrations"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "Paystack", href: "/dashboard/integrations/paystack" },
                    { label: "Flutterwave", href: "/dashboard/integrations/flutterwave" },
                    { label: "Interswitch", href: "/dashboard/integrations/interswitch" },
                    { label: "NIBSS", href: "/dashboard/integrations/nibss" },
                    { label: "Smile Identity", href: "/dashboard/integrations/smile" },
                    { label: "VerifyMe", href: "/dashboard/integrations/verifyme" },
                    { label: "Bloomberg", href: "/dashboard/integrations/bloomberg" },
                    { label: "Firebase", href: "/dashboard/integrations/firebase" },
                    { label: "Email", href: "/dashboard/integrations/email" },
                    { label: "SMS", href: "/dashboard/integrations/sms" },
                  ]}
                />

                <NavItem
                  icon={<Megaphone size={18} />}
                  label="Notifications"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "Push notifications", href: "/dashboard/notifications/push" },
                    { label: "Email templates", href: "/dashboard/notifications/email" },
                    { label: "SMS templates", href: "/dashboard/notifications/sms" },
                    { label: "Broadcast messages", href: "/dashboard/notifications/broadcast" },
                  ]}
                />

                <NavItem
                  icon={<Files size={18} />}
                  label="Content Management"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "Terms", href: "/dashboard/cms/terms" },
                    { label: "Privacy", href: "/dashboard/cms/privacy" },
                    { label: "Articles", href: "/dashboard/cms/articles" },
                    { label: "Research", href: "/dashboard/cms/research" },
                    { label: "Announcements", href: "/dashboard/cms/announcements" },
                  ]}
                />

                {sidebarOpen ? <hr className="border-gray-800 my-2 mx-2" /> : <div className="h-px bg-gray-800 my-2 mx-2"></div>}

                <NavItem href="/dashboard/admins" icon={<Users size={18} />} label="Admin Management" isOpen={sidebarOpen} />
                <NavItem href="/dashboard/activity-logs" icon={<History size={18} />} label="Activity Logs" isOpen={sidebarOpen} />

                <NavItem
                  icon={<Settings size={18} />}
                  label="Settings"
                  isOpen={sidebarOpen}
                  subItems={[
                    { label: "Personal Settings", href: "/dashboard/settings/personal" },
                    { label: "Platform Settings", href: "/dashboard/settings/platform" },
                    { label: "Security", href: "/dashboard/settings/security" },
                    { label: "Roles & Permissions", href: "/dashboard/settings/roles" },
                    { label: "Feature Flags", href: "/dashboard/settings/features" },
                  ]}
                />
              </nav>
            </div>
          )}

          <div className="mt-auto px-4 pb-6">
            <nav className="flex flex-col gap-1">
              <NavItem
                icon={<LogOut size={18} />}
                label="Log Out"
                isOpen={sidebarOpen}
                onClick={() => setIsLogoutModalOpen(true)}
              />
            </nav>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 flex items-center justify-between px-6 shrink-0 relative z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Clock */}
            {currentTime && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-xs">
                <Clock size={14} className="text-[#961A1C] animate-pulse" />
                <span>{currentTime}</span>
              </div>
            )}

            <div className="relative cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#961A1C] rounded-full border border-[#fff7f7] dark:border-gray-900"></span>
            </div>

            <div className="flex items-center gap-3 cursor-pointer">
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{adminName}</p>
                <p className="text-xs text-gray-500 font-medium">{roleLabel}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#961A1C] to-[#4d0000] flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white dark:border-gray-800">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto relative scroll-smooth group">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            {children}
          </div>
        </div>

      </main>

      {/* Mobile Sidebar Overlay */}
      {!sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(true)} />
      )}

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500">
                <LogOut size={24} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Log Out</h3>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsLogoutModalOpen(false);
                  try {
                    await logoutApi().unwrap();
                  } catch {
                    // Ignore logout network errors
                  }
                  dispatch(clearAuth());
                  router.push('/auth/login');
                }}
                className="flex-1 py-2.5 px-4 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function NavItem({
  icon,
  label,
  href,
  isOpen,
  subItems,
  hasDot,
  onClick,
  exact,
}: {
  icon: React.ReactNode,
  label: string,
  href?: string,
  isOpen: boolean,
  subItems?: { label: string, href: string, exact?: boolean }[],
  hasDot?: boolean,
  onClick?: (e: React.MouseEvent) => void,
  /** When true, only highlights if pathname matches href exactly (not prefix). */
  exact?: boolean,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const hasSubItems = subItems && subItems.length > 0;

  // exact=true  → only match pathname === href (e.g. Overview /dashboard)
  // exact=false → also match any sub-path (default behaviour)
  const isDirectActive = href
    ? exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/')
    : false;
  const isSubActive = subItems?.some((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
  );
  const isActive = isDirectActive || isSubActive;

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  const itemContent = (
    <>
      <div className={`${(isExpanded || isActive) && !hasSubItems ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
        {icon}
      </div>
      {isOpen && (
        <span className="whitespace-nowrap flex-1 text-sm">{label}</span>
      )}
      {isOpen && hasDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#961A1C] ml-auto"></span>
      )}
      {isOpen && hasSubItems && (
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col">
      {onClick ? (
        <button
          onClick={onClick}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-sm transition-all duration-200 group w-full text-left text-gray-400 hover:bg-[#1a1a2e] hover:text-white font-medium`}
          title={isOpen ? "" : label}
        >
          {itemContent}
        </button>
      ) : href && !hasSubItems ? (
        <Link
          href={href}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-sm transition-all duration-200 group ${isActive
            ? 'bg-gradient-to-r from-[#4d0000] to-[#961A1C] text-white font-medium shadow-sm'
            : 'text-gray-400 hover:bg-[#1a1a2e] hover:text-white font-medium'
            }`}
          title={isOpen ? "" : label}
        >
          {itemContent}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-sm transition-all duration-200 group w-full text-left ${isExpanded || isActive
            ? 'bg-gradient-to-r from-[#4d0000] to-[#961A1C] text-white font-medium shadow-sm'
            : 'text-gray-400 hover:bg-[#1a1a2e] hover:text-white font-medium'
            }`}
          title={isOpen ? "" : label}
        >
          {itemContent}
        </button>
      )}

      {/* Sub Items */}
      {hasSubItems && isExpanded && isOpen && (
        <div className="flex flex-col mt-2 ml-6 pl-4 border-l border-gray-700">
          {subItems.map((sub, idx) => {
            const isSubItemActive = sub.exact
              ? pathname === sub.href
              : pathname === sub.href || pathname.startsWith(sub.href + '/');
            return (
              <Link
                key={idx}
                href={sub.href}
                className={`py-2 text-sm transition-colors relative flex items-center ${isSubItemActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {/* Connector line for the active or hovered item */}
                {isSubItemActive && (
                  <span className="absolute -left-[17px] w-3 h-[1px] bg-white"></span>
                )}
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
