import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChartIcon, 
  BoxIcon, 
  PersonIcon, 
  Pencil1Icon, 
  ClipboardIcon, 
  GearIcon, 
  ActivityLogIcon 
} from '@radix-ui/react-icons';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChartIcon, adminOnly: true },
    { name: 'Car Management', href: '/cars', icon: BoxIcon, adminOnly: true },
    { name: 'User Management', href: '/users', icon: PersonIcon, adminOnly: true },
    { name: 'Book Car', href: '/booking', icon: Pencil1Icon, adminOnly: false },
    { name: 'Booking History', href: '/bookings', icon: ClipboardIcon, adminOnly: false },
    { name: 'Car Repairs', href: '/repairs', icon: GearIcon, adminOnly: true },
    { name: 'Reports', href: '/reports', icon: ActivityLogIcon, adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4">
          <Link to="/dashboard" className="flex items-center">
            <img 
              src="/city-rental-car-logo.svg" 
              alt="City Rental Car Logo" 
              className="w-12 h-12 rounded-full"
            />
            <span className="ml-2 text-xl font-bold text-gray-800">CITY RENTAL CAR</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`${
                  location.pathname === item.href
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium border-l-4 rounded-r-md transition-colors duration-200`}
              >
                <item.icon className="mr-3 w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className={`text-xs ${isAdmin ? 'text-red-600' : 'text-blue-600'}`}>
                {user?.role?.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header for both mobile and desktop */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Title - visible on mobile */}
            <h1 className="text-lg font-semibold text-gray-900 lg:hidden">CITY RENTAL CAR</h1>
            
            {/* Desktop spacer */}
            <div className="hidden lg:block" />
            
            {/* User info and logout - always visible on top right */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className={`text-xs ${isAdmin ? 'text-red-600' : 'text-blue-600'}`}>
                      {user?.role?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                © 2024 CITY RENTAL CAR. All rights reserved.
              </div>
              <div className="text-sm text-gray-500 text-center sm:text-right">
                Dhabarka dambe ee Maqaayada Fatxi, KM4, Muqdisho | Phone: 061110093
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
