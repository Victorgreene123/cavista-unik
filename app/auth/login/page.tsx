"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaHospital, FaGoogle, FaApple, FaArrowRight } from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";

export default function LoginPage() {
    const [userType, setUserType] = useState<'individual' | 'hospital'>('individual');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const role = userType === 'individual' ? 'INDIVIDUAL' : 'HOSPITAL_ADMIN';
            await login(email, password, role);
            
            // Redirect based on role
            if (userType === 'individual') {
                router.push('/individual');
            } else {
                router.push('/hospital/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`h-screen w-screen overflow-hidden transition-colors duration-700 flex items-center justify-center p-4 lg:p-8 ${userType === 'individual' ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' : 'bg-gradient-to-br from-teal-50 via-white to-emerald-50'}`}>
            
            <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                
                {/* Left Side: Creative Context - Hidden on mobile to ensure 100vh fit */}
                <div className="hidden lg:block order-2 lg:order-1 space-y-6 relative">
                    {/* Decorative Blobs */}
                    <div className={`absolute -top-20 -left-20 w-48 h-48 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob ${userType === 'individual' ? 'bg-indigo-200' : 'bg-teal-200'}`}></div>
                    <div className={`absolute -bottom-20 -right-20 w-48 h-48 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 ${userType === 'individual' ? 'bg-purple-200' : 'bg-emerald-200'}`}></div>

                    <div className="relative">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-4 transition-colors duration-300 ${userType === 'individual' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                            {userType === 'individual' ? 'Patient Portal' : 'Provider Access'}
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                            {userType === 'individual' ? (
                                <>Scan for health & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">book visits.</span></>
                            ) : (
                                <>AI Voice Reports & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Management.</span></>
                            )}
                        </h1>
                        
                        <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                            {userType === 'individual' 
                                ? "Scan to get instant health metrics, schedule doctor visits, and access AI-analyzed medical results." 
                                : "Generate clinical reports instantly from voice notes and manage hospital appointments with ease."}
                        </p>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-2.5 relative">
                        {userType === 'individual' ? (
                            <>
                                {['Health Scanning', 'Smart Booking', 'AI Analysis'].map((tag) => (
                                    <span key={tag} className="px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-lg text-indigo-700 text-xs font-semibold shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </>
                        ) : (
                            <>
                                {['Voice-to-Text AI', 'Report Generation', 'Patient Dashboard'].map((tag) => (
                                    <span key={tag} className="px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-teal-100 rounded-lg text-teal-700 text-xs font-semibold shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-3 relative">
                        {userType === 'individual' ? (
                            <>
                                {['AI Pre-Consults', 'Smart Booking', 'Health Records'].map((tag) => (
                                    <span key={tag} className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-xl text-indigo-700 text-sm font-medium shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </>
                        ) : (
                            <>
                                {['Patient Triage', 'Resource Management', 'Analytics'].map((tag) => (
                                    <span key={tag} className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-teal-100 rounded-xl text-teal-700 text-sm font-medium shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="order-1 lg:order-2 bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 border border-white/20 backdrop-blur-xl relative max-w-sm mx-auto w-full">
                    
                    {/* User Type Switcher */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-6 relative">
                        <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out left-1 ${userType === 'hospital' ? 'translate-x-[100%]' : 'translate-x-0'}`}
                        ></div>
                        
                        <button 
                            onClick={() => setUserType('individual')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold relative z-10 transition-colors ${userType === 'individual' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FaUser /> Individual
                        </button>
                        <button 
                            onClick={() => setUserType('hospital')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold relative z-10 transition-colors ${userType === 'hospital' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FaHospital /> Hospital
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                            <p className="text-sm text-gray-500 mt-1">Sign in to continue.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 ml-1">Email</label>
                                <input
                                    type="email"
                                    placeholder={userType === 'individual' ? "you@example.com" : "admin@hospital.com"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 ${userType === 'individual' ? 'focus:border-indigo-500 focus:shadow-indigo-50' : 'focus:border-teal-500 focus:shadow-teal-50'}`}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 ${userType === 'individual' ? 'focus:border-indigo-500 focus:shadow-indigo-50' : 'focus:border-teal-500 focus:shadow-teal-50'}`}
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    Remember me
                                </label>
                                <a href="#" className={`font-semibold hover:underline ${userType === 'individual' ? 'text-indigo-600' : 'text-teal-600'}`}>Forgot?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${userType === 'individual' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-teal-600 shadow-teal-200'}`}
                            >
                                {loading ? 'Signing in...' : 'Sign In'} {!loading && <FaArrowRight className="text-xs" />}
                            </button>
                        </form>

                        <div className="relative text-center my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50 transition-all">
                                <FaGoogle className="text-red-500" /> Google
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50 transition-all">
                                <FaApple className="text-black" /> Apple
                            </button>
                        </div>

                        <p className="text-center text-gray-500 text-xs mt-6">
                            New here?{" "}
                            <Link href="/auth/register" className={`font-bold hover:underline ${userType === 'individual' ? 'text-indigo-600' : 'text-teal-600'}`}>
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
}
