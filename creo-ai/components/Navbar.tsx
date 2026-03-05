'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PenTool,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Bell,
  Plus
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('creo_token');
    setIsLoggedIn(!!token);
    
    // Get user data if available
    const userData = localStorage.getItem('creo_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser({ name: 'User', email: 'user@example.com' });
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  if (pathname === '/login' || pathname === '/signup') return null;

  const handleLogout = () => {
    localStorage.removeItem('creo_token');
    localStorage.removeItem('creo_user');
    router.push('/login');
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/create', label: 'Create', icon: PenTool },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
            : 'bg-white/70 backdrop-blur-md border-b border-gray-200/30'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo with animation */}
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="relative group">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                  whileHover={{ rotate: 5 }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-white font-bold text-lg">C</span>
                </motion.div>
                <motion.span 
                  className="text-xl font-bold"
                  animate={{ 
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{
                    background: 'linear-gradient(90deg, #1e293b, #3b82f6, #1e293b)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  CREO
                  <span className="text-blue-600">-AI</span>
                </motion.span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            {isLoggedIn && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  
                  return (
                    <Link key={link.href} href={link.href}>
                      <motion.div
                        className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isActive 
                            ? 'text-blue-600' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"
                            layoutId="activeNav"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <span className="relative flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {link.label}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {isLoggedIn ? (
                <>
                  {/* Notifications (optional) */}
                  <motion.button
                    className="relative w-10 h-10 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-[10px] text-white font-medium flex items-center justify-center shadow-lg">
                      3
                    </span>
                  </motion.button>

                  {/* Create Post Button */}
                  <Link href="/create">
                    <motion.div
                      className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Post</span>
                      <Sparkles className="w-3 h-3 opacity-70" />
                    </motion.div>
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100/80 transition-colors group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div 
                        className="w-9 h-9 bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30"
                        whileHover={{ rotate: 5 }}
                      >
                        <span className="text-white font-medium text-sm">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </motion.div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isProfileOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-200/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <Link href="/profile">
                              <motion.button
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                whileHover={{ x: 5 }}
                              >
                                <User className="w-4 h-4 text-gray-400" />
                                Profile
                              </motion.button>
                            </Link>
                            
                            <Link href="/settings">
                              <motion.button
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                whileHover={{ x: 5 }}
                              >
                                <Settings className="w-4 h-4 text-gray-400" />
                                Settings
                              </motion.button>
                            </Link>

                            <div className="my-2 h-px bg-gray-200/50" />

                            <motion.button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              whileHover={{ x: 5 }}
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mobile menu button */}
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden w-10 h-10 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Menu className="w-5 h-5 text-gray-600" />
                    )}
                  </motion.button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <motion.button
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign In
                    </motion.button>
                  </Link>
                  
                  <Link href="/signup">
                    <motion.button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && isLoggedIn && (
            <motion.div
              className="md:hidden border-t border-gray-200/50 bg-white/90 backdrop-blur-xl"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  
                  return (
                    <Link key={link.href} href={link.href}>
                      <motion.div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-100/80'
                        }`}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                        {isActive && (
                          <motion.div
                            className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}

                <div className="my-2 h-px bg-gray-200/50" />

                <Link href="/create">
                  <motion.div
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">New Post</span>
                    <Sparkles className="w-4 h-4 ml-auto" />
                  </motion.div>
                </Link>

                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16 lg:h-20" />

      {/* Floating action button for mobile */}
      {isLoggedIn && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 md:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <Link href="/create">
            <motion.button
              className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                boxShadow: [
                  '0 20px 40px -10px rgba(59,130,246,0.5)',
                  '0 20px 60px -10px rgba(139,92,246,0.6)',
                  '0 20px 40px -10px rgba(59,130,246,0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.button>
          </Link>
        </motion.div>
      )}
    </>
  );
}