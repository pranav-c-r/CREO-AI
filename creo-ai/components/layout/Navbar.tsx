'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Sparkles,
  ChevronDown,
  Moon,
  Sun,
  MessageCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: 'New feature available',
      description: 'Indic language support is now live!',
      time: '2 hours ago',
      read: false,
      icon: <Sparkles className="w-4 h-4" />,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Content generated',
      description: 'Your LinkedIn post is ready',
      time: '5 hours ago',
      read: true,
      icon: <Zap className="w-4 h-4" />,
      color: 'purple'
    },
    {
      id: 3,
      title: 'New message',
      description: 'Team member invited you to collaborate',
      time: '1 day ago',
      read: true,
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'green'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          scrolled 
            ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50" 
            : "bg-white/70 backdrop-blur-md border-b border-gray-200/30"
        )}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="lg:hidden relative overflow-hidden group"
              >
                <Menu className="h-5 w-5" />
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
                whileHover={{ rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white font-bold text-lg">C</span>
              </motion.div>
              <motion.span 
                className="font-bold text-xl text-gray-900 hidden sm:block"
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
                CREO<span className="text-blue-600">-AI</span>
              </motion.span>
            </motion.div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <motion.div 
              className="relative"
              animate={isSearchFocused ? { scale: 1.02 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content, analytics, settings..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 
                         focus:bg-white transition-all placeholder:text-gray-400"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <motion.div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"
                animate={isSearchFocused ? { opacity: 1 } : { opacity: 0 }}
              />
              
              {/* Quick search shortcut */}
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </motion.div>
          </div>

          {/* Mobile search button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              size="sm"
              className="relative overflow-hidden group"
            >
              <Search className="h-5 w-5" />
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative overflow-hidden group hidden sm:flex"
              >
                <motion.div
                  animate={{ rotate: isDarkMode ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-gray-600" />
                  )}
                </motion.div>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>

            {/* Notifications */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative overflow-hidden group"
                >
                  <Bell className="h-5 w-5" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full text-[10px] text-white font-medium flex items-center justify-center shadow-lg shadow-red-500/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </motion.div>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <motion.div 
                      className="p-5 border-b border-gray-100/50 bg-gradient-to-r from-gray-50 to-white"
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </motion.div>
                    
                    <div className="max-h-96 overflow-y-auto p-2">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          className={cn(
                            "p-4 rounded-xl mb-2 transition-all cursor-pointer",
                            !notification.read 
                              ? `bg-${notification.color}-50/80 border border-${notification.color}-200/50` 
                              : "hover:bg-gray-50"
                          )}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-3">
                            <motion.div 
                              className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center",
                                `bg-${notification.color}-100 text-${notification.color}-600`
                              )}
                              whileHover={{ rotate: 5 }}
                            >
                              {notification.icon}
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                {!notification.read && (
                                  <motion.span 
                                    className={`w-2 h-2 bg-${notification.color}-500 rounded-full`}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
                              <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div 
                      className="p-4 border-t border-gray-100/50 bg-gray-50/50"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                    >
                      <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
                        View all notifications
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 pr-3 rounded-full hover:bg-gray-100/80 transition-all group"
                >
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-white font-medium text-sm">JD</span>
                  </motion.div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">Pro Plan</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block group-hover:text-gray-600 transition-colors" />
                </Button>
              </motion.div>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <motion.div 
                      className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-b border-gray-200/50"
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                          whileHover={{ rotate: 5 }}
                        >
                          <span className="text-white font-bold text-lg">JD</span>
                        </motion.div>
                        <div>
                          <p className="font-semibold text-gray-900">John Doe</p>
                          <p className="text-xs text-gray-500 mt-0.5">john@example.com</p>
                        </div>
                      </div>
                      <motion.div 
                        className="mt-3 p-2 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Credits</span>
                          <span className="font-semibold text-gray-900">2,450</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                    
                    <div className="p-2">
                      {[
                        { icon: User, label: 'Profile', href: '/profile', color: 'blue' },
                        { icon: Settings, label: 'Settings', href: '/settings', color: 'gray' },
                        { icon: LogOut, label: 'Sign out', href: '#', color: 'red' }
                      ].map((item, index) => (
                        <motion.button
                          key={item.label}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all group",
                            item.color === 'red' 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <item.icon className={cn(
                            "h-4 w-4",
                            item.color === 'red' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'
                          )} />
                          <span>{item.label}</span>
                          {item.label === 'Pro Plan' && (
                            <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                              Upgrade
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile search expandable */}
        <AnimatePresence>
          {isSearchFocused && (
            <motion.div
              className="md:hidden px-4 pb-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Quick action floating button (mobile) */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Zap className="w-6 h-6 text-white" />
      </motion.button>
    </>
  );
}