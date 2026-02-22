"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaHospital, FaGoogle, FaApple, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";

export default function RegisterPage() {
    const [userType, setUserType] = useState<'individual' | 'hospital'>('individual');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Individual fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Hospital fields
    const [hospitalName, setHospitalName] = useState('');
    const [regNumber, setRegNumber] = useState('');
    
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const role = userType === 'individual' ? 'INDIVIDUAL' : 'HOSPITAL_ADMIN';
            const profileData = userType === 'individual' 
                ? { firstName, lastName, phone: '' }
                : { hospitalName, regNumber, phone: '' };

            await register(email, password, role, profileData);
            
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={`h-screen w-screen overflow-hidden transition-colors duration-700 flex items-center justify-center p-4 lg:p-8 ${userType === 'individual' ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' : 'bg-gradient-to-br from-teal-50 via-white to-emerald-50'}`}>
            
            <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full lg:h-auto">
                
                {/* Left Side: Register Form */}
                <div className="order-1 bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-white/20 backdrop-blur-xl relative flex flex-col justify-center max-h-full overflow-y-auto max-w-sm mx-auto w-full">
                    
                    {/* User Type Switcher */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-3 relative shrink-0">
                        <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out left-1 ${userType === 'hospital' ? 'translate-x-[100%]' : 'translate-x-0'}`}
                        ></div>
                        
                        <button 
                            onClick={() => setUserType('individual')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold relative z-10 transition-colors ${userType === 'individual' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FaUser /> Individual
                        </button>
                        <button 
                            onClick={() => setUserType('hospital')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold relative z-10 transition-colors ${userType === 'hospital' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FaHospital /> Hospital
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                            <p className="text-sm text-gray-500 mt-1">Join Cavista today.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2">
                            {error && (
                                <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                                    {error}
                                </div>
                            )}

                            {userType === 'individual' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">First Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="John" 
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 focus:border-indigo-500 focus:shadow-indigo-50" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">Last Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="Doe" 
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                required
                                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 focus:border-indigo-500 focus:shadow-indigo-50" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">Email Address</label>
                                        <input 
                                            type="email" 
                                            placeholder="john@example.com" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 focus:border-indigo-500 focus:shadow-indigo-50" 
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">Hospital Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="General Hospital" 
                                            value={hospitalName}
                                            onChange={(e) => setHospitalName(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 focus:border-teal-500 focus:shadow-teal-50" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">Reg. Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="Hv-12345" 
                                            value={regNumber}
                                            onChange={(e) => setRegNumber(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 focus:border-teal-500 focus:shadow-teal-50" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">Email Address</label>
                                        <input 
                                            type="email" 
                                            placeholder="admin@hospital.com" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 focus:border-teal-500 focus:shadow-teal-50" 
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700 ml-1 uppercase">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={`w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:bg-white outline-none transition-all duration-300 ${userType === 'individual' ? 'focus:border-indigo-500 focus:shadow-indigo-50' : 'focus:border-teal-500 focus:shadow-teal-50'}`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2.5 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${userType === 'individual' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-teal-600 shadow-teal-200'}`}
                            >
                                <span className="uppercase tracking-wide text-xs">{loading ? 'Creating...' : 'Create Account'}</span> {!loading && <FaArrowRight className="text-xs" />}
                            </button>
                        </form>

                        <div className="relative text-center my-3">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50 transition-all">
                                <FaGoogle className="text-red-500" /> Google
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50 transition-all">
                                <FaApple className="text-black" /> Apple
                            </button>
                        </div>

                        <p className="text-center text-gray-500 text-xs mt-4">
                            Have an account?{" "}
                            <Link href="/auth/login" className={`font-bold hover:underline ${userType === 'individual' ? 'text-indigo-600' : 'text-teal-600'}`}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right Side: Creative Context - Hidden on mobile */}
                <div className="hidden lg:block order-2 space-y-8 relative text-right lg:text-left lg:pl-10">
                    {/* Decorative Blobs */}
                    <div className={`absolute top-20 right-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob ${userType === 'individual' ? 'bg-indigo-300' : 'bg-teal-300'}`}></div>
                    <div className={`absolute bottom-0 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 ${userType === 'individual' ? 'bg-purple-300' : 'bg-emerald-300'}`}></div>

                    <div className="relative">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-6 transition-colors duration-300 ${userType === 'individual' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                            {userType === 'individual' ? 'New Patient' : 'New Provider'}
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                            {userType === 'individual' ? (
                                <>Scan health metrics & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">book instantly.</span></>
                            ) : (
                                <>AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Clinical Workflow.</span></>
                            )}
                        </h1>
                        
                        <p className="text-lg text-gray-600 leading-relaxed max-w-sm ml-auto lg:ml-0">
                            {userType === 'individual' 
                                ? "Experience the future of healthcare. Scan to check vitals and book appointments in seconds." 
                                : "Join thousands of providers using AI Voice-Recorders to generate instant patient reports and manage bookings."}
                        </p>
                    </div>

                    <div className="space-y-3">
                         {userType === 'individual' ? (
                            ['Instant Health Scanning', 'Smart Appointments', 'Personalized AI Reports'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 justify-end lg:justify-start">
                                    <span className="text-gray-700 font-semibold text-sm">{item}</span>
                                    <FaCheckCircle className="text-indigo-500 text-lg" />
                                </div>
                            ))
                        ) : (
                            ['Voice-to-Text Reporting', 'Automated Patient Management', 'Clinical Decision Support'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 justify-end lg:justify-start">
                                    <span className="text-gray-700 font-semibold text-sm">{item}</span>
                                    <FaCheckCircle className="text-teal-500 text-lg" />
                                </div>
                            ))
                        )}
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
