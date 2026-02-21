"use client";

import React, { useState } from "react";
import Link from 'next/link';
import { FaBars, FaTimes, FaBell, FaUserCircle, FaSearch } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";

const NavbarIndividual = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasNotifications, setHasNotifications] = useState(true);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { name: "Dashboard", href: "/individual" },
        { name: "My Scans", href: "/individual/history" },
        { name: "Find Care", href: "/individual/search" },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Area */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <MdHealthAndSafety size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-800">
                            Cavista<span className="text-indigo-600">Health</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-500 hover:text-indigo-600 font-medium transition-colors text-sm uppercase tracking-wide"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Search Icon */}
                        <Link href="/individual/search" className="text-gray-400 hover:text-indigo-600 transition-colors p-2 hover:bg-gray-50 rounded-full">
                            <FaSearch size={20} />
                        </Link>
                        
                        {/* Notification Bell */}
                        <button className="relative text-gray-400 hover:text-indigo-500 transition-colors">
                            <FaBell size={20} />
                            {hasNotifications && (
                                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                            )}
                        </button>

                        {/* Settings */}
                        <button className="text-gray-400 hover:text-indigo-500 transition-colors">
                            <IoSettingsOutline size={22} />
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
                             <div className="text-right hidden lg:block">
                                <p className="text-sm font-semibold text-gray-700">Alex Johnson</p>
                                <p className="text-xs text-gray-500">Premium Member</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer">
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                     {/* Placeholder for avatar, or use FaUserCircle */}
                                    <FaUserCircle className="text-gray-300 w-full h-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <Link href="/individual/search" className="text-gray-500 hover:text-indigo-600 p-2">
                             <FaSearch size={20} />
                        </Link>
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                        >
                            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-fade-in-down">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="border-t border-gray-100 my-2"></div>
                         <Link
                                href="/profile"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Profile & Settings
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

export default NavbarIndividual;