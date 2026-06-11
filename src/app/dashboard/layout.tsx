'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Menu,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Calendar,
  User,
  LogOut,
  Building2,
  UserCircle,
  Package,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

  // Example admin profile
  const adminName = "Alexis";

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

          {/* Main Menu */}
          <div className="px-4">
            {sidebarOpen && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Menu</p>}
            <nav className="flex flex-col gap-1">
              <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" isOpen={sidebarOpen} />

              <NavItem
                icon={<Building2 size={18} />}
                label="Corporate"
                isOpen={sidebarOpen}
                subItems={[
                  { label: "Explore Companies", href: "/dashboard/corporate/companies" },
                  { label: "Virtual Accounts", href: "/dashboard/corporate/virtual-accounts" },
                  { label: "Transactions", href: "/dashboard/corporate/transactions" },
                  { label: "Compliance", href: "/dashboard/corporate/compliance" },
                ]}
              />

              <NavItem
                icon={<UserCircle size={18} />}
                label="Retail"
                isOpen={sidebarOpen}
                subItems={[
                  { label: "Users", href: "/dashboard/retail/users" },
                  { label: "Transactions", href: "/dashboard/retail/transactions" },
                  { label: "Compliance", href: "/dashboard/retail/compliance" },
                ]}
              />

              <NavItem
                icon={<Briefcase size={18} />}
                label="Operations"
                isOpen={sidebarOpen}
                subItems={[
                  { label: "Products", href: "/dashboard/operations/products" },
                  { label: "Investments & Loans", href: "/dashboard/investments" },
                  { label: "Transactions", href: "/dashboard/transactions" },
                  { label: "Compliance & KYC", href: "/dashboard/compliance" },
                  { label: "Financial Records", href: "/dashboard/reports" }
                ]}
              />

              <NavItem href="/dashboard/messages" icon={<MessageSquare size={18} />} label="Message" isOpen={sidebarOpen} hasDot />

              <NavItem
                icon={<Users size={18} />}
                label="Employee"
                isOpen={sidebarOpen}
                subItems={[
                  { label: "All Employees", href: "/dashboard/users" },
                  { label: "Roles", href: "/dashboard/roles" }
                ]}
              />

              <NavItem href="/dashboard/schedule" icon={<Calendar size={18} />} label="Schedule" isOpen={sidebarOpen} />
              <NavItem href="/dashboard/profile" icon={<User size={18} />} label="Profile" isOpen={sidebarOpen} />
            </nav>
          </div>

          <div className="mt-auto px-4 pb-6">
            <nav className="flex flex-col gap-1">
              <NavItem href="/dashboard/help" icon={<HelpCircle size={18} />} label="Help Center" isOpen={sidebarOpen} />
              <NavItem href="/dashboard/settings" icon={<Settings size={18} />} label="Settings" isOpen={sidebarOpen} />
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
            <div className="relative cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#961A1C] rounded-full border border-[#fff7f7] dark:border-gray-900"></span>
            </div>

            <div className="flex items-center gap-3 cursor-pointer">
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{adminName}</p>
                <p className="text-xs text-gray-500 font-medium">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#961A1C] to-[#4d0000] flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white dark:border-gray-800">
                AL
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
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  router.push('/');
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
  onClick
}: {
  icon: React.ReactNode,
  label: string,
  href?: string,
  isOpen: boolean,
  subItems?: { label: string, href: string }[],
  hasDot?: boolean,
  onClick?: (e: React.MouseEvent) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const hasSubItems = subItems && subItems.length > 0;

  // Check if current path matches href or any subItem href
  const isDirectActive = href ? pathname === href : false;
  const isSubActive = subItems?.some(item => pathname === item.href);
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
            const isSubItemActive = pathname === sub.href;
            return (
              <Link
                key={idx}
                href={sub.href}
                className={`py-2 text-sm transition-colors relative flex items-center ${isSubItemActive ? 'text-[#961A1C] font-medium' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {/* Connector line for the active or hovered item */}
                {isSubItemActive && (
                  <span className="absolute -left-[17px] w-3 h-[1px] bg-[#961A1C]"></span>
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
