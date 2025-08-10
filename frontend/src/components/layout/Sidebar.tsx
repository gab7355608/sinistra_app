'use client';

import type React from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronLeft,
    FileText,
    LogOut,
    MessageCircle,
    Ticket,
    User,
    Users,
    Car,
    Zap
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { Role } from '@shared/enums';

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    onClick?: () => void;
}

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Menus différents selon le rôle de l'utilisateur connecté
    const getUserMenuItems = (): SidebarItem[] => {
        if (!user?.roles) return [];

        // Parse roles from JSON string to array
        let userRoles: string[] = [];

        console.log(user.roles);
        try {
            if (typeof user.roles === 'string') {
                userRoles = JSON.parse(user.roles);
            } else if (Array.isArray(user.roles)) {
                userRoles = user.roles;
            }
        } catch (error) {
            console.error('Error parsing user roles:', error);
            return [];
        }

        // Si l'utilisateur est admin, montrer les menus admin
        if (userRoles.includes(Role.ADMIN)) {
            return [
                { 
                    icon: <Ticket size={20} />, 
                    label: 'Tickets', 
                    href: '/tickets' 
                },
                { 
                    icon: <Users size={20} />, 
                    label: 'Utilisateurs', 
                    href: '/users' 
                },
                { 
                    icon: <User size={20} />, 
                    label: 'Mon profil', 
                    href: '/customer/profile' 
                }
            ];
        }

        // Si l'utilisateur est consultant, montrer les menus consultant
        if (userRoles.includes(Role.CONSULTANT)) {
            return [
                { 
                    icon: <Ticket size={20} />, 
                    label: 'Tickets', 
                    href: '/tickets' 
                },
                { 
                    icon: <User size={20} />, 
                    label: 'Mon profil', 
                    href: '/customer/profile' 
                }
            ];
        }

        // Si l'utilisateur est user simple, montrer les menus user
        if (userRoles.includes(Role.USER)) {
            return [
                { 
                    icon: <FileText size={20} />, 
                    label: 'Mes sinistres', 
                    href: '/customer/claims' 
                },
                { 
                    icon: <MessageCircle size={20} />, 
                    label: 'Nouvelle déclaration', 
                    href: '/customer/new-claim' 
                },
                { 
                    icon: <Car size={20} />, 
                    label: 'Accident automobile', 
                    href: '/customer/car-accident' 
                },
                { 
                    icon: <User size={20} />, 
                    label: 'Mon profil', 
                    href: '/customer/profile' 
                }
            ];
        }

        return [];
    };

    const menuItems = getUserMenuItems();


    // Parse roles for isCustomerRole check
    const getUserRoles = (): string[] => {
        if (!user?.roles) return [];
        try {
            if (typeof user.roles === 'string') {
                return JSON.parse(user.roles);
            } else if (Array.isArray(user.roles)) {
                return user.roles;
            }
        } catch (error) {
            console.error('Error parsing user roles:', error);
        }
        return [];
    };

    const isCustomerRole = getUserRoles().includes(Role.USER);

    return (
        <motion.div
            animate={{ width: isExpanded ? '250px' : '70px' }}
            transition={{ duration: 0.3 }}
            className="relative flex h-screen flex-col bg-white border-r border-gray-100 shadow-sm"
        >
            {/* Header avec logo moderne */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center space-x-3"
                        >
                            {/* Logo moderne avec gradient */}
                            <div className="relative">
                                <div className="w-8 h-8 bg-gradient-purple rounded-xl flex items-center justify-center shadow-lg">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-accent rounded-full animate-pulse"></div>
                            </div>
                            
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                                    Sinistra
                                </span>
                                <span className="text-xs text-gray-500">
                                    {isCustomerRole ? 'Espace Client' : 'Admin Panel'}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <motion.div
                        animate={{ rotate: isExpanded ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronLeft size={18} />
                    </motion.div>
                </button>
            </div>

            {/* Greeting Section pour les clients */}
            {isCustomerRole && (
                <div className="p-6 border-b border-gray-100">
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-1"
                            >
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Bonjour, {user?.firstName} 👋
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Comment puis-je vous aider aujourd'hui ?
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    
                    return (
                        <motion.button
                            key={item.href}
                            onClick={() => {
                                if (item.onClick) {
                                    item.onClick();
                                } else {
                                    navigate(item.href);
                                }
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`
                                relative flex w-full items-center space-x-3 rounded-lg p-2 text-left transition-all duration-200
                                ${isActive 
                                    ? 'bg-gradient-purple text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }
                            `}
                        >
                            <div className="flex items-center space-x-3">
                                <span className={`
                                    ${isActive ? 'text-white' : 'text-gray-500'}
                                `}>
                                    {item.icon}
                                </span>
                                
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="whitespace-nowrap font-medium text-sm"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.button>
                    );
                })}
            </nav>

            {/* Footer avec déconnexion */}
            <div className="p-4 border-t border-gray-100">
                {/* Logout Button */}
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="relative flex w-full items-center space-x-3 rounded-lg p-2 text-left transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 mb-4"
                >
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-500">
                            <LogOut size={20} />
                        </span>
                        
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={handleLogout}
                                    className="whitespace-nowrap font-medium text-sm"
                                >
                                    Déconnexion
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.button>

            </div>
        </motion.div>
    );
}
