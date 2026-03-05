'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PenTool,
  Settings,
  BarChart3,
  Users,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Star,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  highlight?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    label: 'Create',
    href: '/create',
    icon: <PenTool className="h-5 w-5" />,
    highlight: true
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    label: 'Content',
    href: '/content',
    icon: <FileText className="h-5 w-5" />,
    badge: 'New'
  },
  {
    label: 'Team',
    href: '/team',
    icon: <Users className="h-5 w-5" />
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />
  }
];

const bottomItems: SidebarItem[] = [
  {
    label: 'Help & Support',
    href: '/help',
    icon: <HelpCircle className="h-5 w-5" />
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const sidebarVariants = {
    open: {
      width: '280px',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    closed: {
      width: '80px',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const logoVariants = {
    open: { scale: 1, opacity: 1 },
    closed: { scale: 0.8, opacity: 0.8 }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 }
    },
    closed: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      {/* Mobile backdrop with blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={cn(
          'fixed left-0 top-0 h-screen bg-white/90 backdrop-blur-xl border-r border-gray-200/50 z-50 flex flex-col shadow-2xl shadow-gray-200/50',
          'lg:relative lg:z-auto',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        initial={false}
      >
        {/* Header with animated gradient */}
        <motion.div 
          className="relative flex items-center justify-between p-5 border-b border-gray-200/50 overflow-hidden"
          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          
          <motion.div
            className="relative flex items-center gap-3 cursor-pointer"
            variants={logoVariants}
            animate={isOpen ? 'open' : 'closed'}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30"
              whileHover={{ rotate: 10, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-lg">C</span>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <motion.span 
                    className="font-bold text-xl text-gray-900 block"
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
                  </motion.span>
                  <motion.span className="text-xs text-gray-500 block">
                    AI Studio
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.button
            onClick={onToggle}
            className="relative p-2 rounded-xl hover:bg-gray-100/80 transition-colors lg:hidden group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
          </motion.button>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto overflow-x-hidden">
          {/* Main navigation */}
          <div className="space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300',
                      'cursor-pointer group overflow-hidden',
                      isActive && 'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
                      !isActive && 'hover:bg-gray-100/80'
                    )}
                    onHoverStart={() => setHoveredItem(item.href)}
                    onHoverEnd={() => setHoveredItem(null)}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Hover shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={isHovered ? { x: ['-100%', '200%'] } : {}}
                      transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                    />

                    {/* Icon with glow */}
                    <div className="relative">
                      <motion.div
                        className={cn(
                          'flex-shrink-0 transition-all duration-300 relative z-10',
                          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        )}
                        animate={isHovered ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                      >
                        {item.icon}
                      </motion.div>
                      
                      {/* Icon glow */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                    
                    {/* Label and badge */}
                    <AnimatePresence mode="wait">
                      {isOpen && (
                        <motion.div
                          className="flex-1 flex items-center justify-between"
                          variants={itemVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                        >
                          <motion.span
                            className={cn(
                              'font-medium text-sm',
                              isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'
                            )}
                          >
                            {item.label}
                          </motion.span>
                          
                          {item.badge && (
                            <motion.span
                              className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg shadow-blue-500/30"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                            >
                              {item.badge}
                            </motion.span>
                          )}

                          {item.highlight && (
                            <motion.div
                              className="w-2 h-2 bg-green-500 rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Right arrow on hover */}
                    {isOpen && isHovered && !isActive && (
                      <motion.div
                        className="absolute right-3 text-gray-400"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 10, opacity: 0 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Bottom items */}
          <div className="space-y-1.5 pt-6 border-t border-gray-200/50">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300',
                      'cursor-pointer group overflow-hidden',
                      isActive && 'bg-gradient-to-r from-gray-500/10 to-gray-600/10',
                      !isActive && 'hover:bg-gray-100/80'
                    )}
                    onHoverStart={() => setHoveredItem(item.href)}
                    onHoverEnd={() => setHoveredItem(null)}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={isHovered ? { x: ['-100%', '200%'] } : {}}
                      transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                    />

                    <div className="relative">
                      <motion.div
                        className={cn(
                          'flex-shrink-0 transition-all duration-300',
                          isActive ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600'
                        )}
                        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                      >
                        {item.icon}
                      </motion.div>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {isOpen && (
                        <motion.span
                          className={cn(
                            'font-medium text-sm',
                            isActive ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-700'
                          )}
                          variants={itemVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile section */}
        <motion.div 
          className="relative p-4 border-t border-gray-200/50 overflow-hidden group"
          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <motion.div
            className="relative flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
                <span className="text-white font-bold text-sm">JD</span>
              </div>
              <motion.div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  className="flex-1"
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">John Doe</div>
                      <div className="text-xs text-gray-500">Pro Plan</div>
                    </div>
                    <motion.div
                      className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Star className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>

                  {/* Usage meter */}
                  <motion.div 
                    className="mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Credits</span>
                      <span className="font-semibold text-gray-900">2,450 / 5,000</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: '49%' }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isOpen && (
              <motion.div
                className="absolute -right-1 -top-1 w-2 h-2 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Quick actions tooltip on hover (collapsed mode) */}
          {!isOpen && (
            <motion.div
              className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
              initial={{ x: -10 }}
              animate={{ x: 0 }}
            >
              John Doe (Pro Plan)
            </motion.div>
          )}
        </motion.div>

        {/* Version tag */}
        {isOpen && (
          <motion.div
            className="px-5 pb-4 text-xs text-gray-400"
            variants={itemVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              v2.0.1 • AI Powered
            </span>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}