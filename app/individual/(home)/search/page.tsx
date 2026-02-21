"use client";

import React, { useState, useEffect } from 'react';
import SearchSkeleton from '@/app/components/skeletons/SearchSkeleton';
import Link from 'next/link';
import { 
    FaSearch, FaMapMarkerAlt, FaFilter, FaStar, FaPhoneAlt, FaDirections, 
    FaClock, FaStethoscope, FaUserMd, FaHospital, FaChevronDown, FaChevronUp,
    FaRegCommentDots, FaLocationArrow
} from 'react-icons/fa';
import { MdLocalHospital, MdMedicalServices, MdVerified, MdMyLocation } from 'react-icons/md';

// --- Mock Data ---

const SPECIALTIES = ["All", "Emergency", "Cardiology", "Dentistry", "Pediatrics", "Neurology", "General Practice", "Orthopedics"];

const MOCK_REVIEWS = [
    { id: 101, user: "Sarah J.", rating: 5, date: "2 days ago", comment: "Excellent care and very clean facility. Dr. Smith was amazing." },
    { id: 102, user: "Mike T.", rating: 4, date: "1 week ago", comment: "Wait time was a bit long, but the service was top notch." },
    { id: 103, user: "Emily R.", rating: 5, date: "3 weeks ago", comment: "Saved my life. grateful for the emergency team here." },
];

const HOSPITALS = [
    {
        id: 1,
        name: "City General Hospital",
        type: "Hospital",
        distance: 0.8,
        rating: 4.8,
        reviewCount: 124,
        isOpen: true,
        hours: "Open 24/7",
        specialties: ["Cardiology", "Emergency", "Neurology"],
        address: "123 Medical Drive, Downtown, NY 10001",
        phone: "(555) 123-4567",
        image: "bg-blue-100",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        description: "City General is a premier medical facility offering comprehensive care with state-of-the-art technology. specialized in trauma and cardiac care.",
        services: ["24/7 Emergency", "ICU", "Laboratory", "Pharmacy", "Radiology"],
        doctors: [
            { name: "Dr. Emily Chen", role: "Cardiologist", available: true },
            { name: "Dr. James Wilson", role: "Neurologist", available: false },
        ],
        reviews: [MOCK_REVIEWS[0], MOCK_REVIEWS[1]]
    },
    {
        id: 2,
        name: "Lakeside Medical Center",
        type: "Medical Center",
        distance: 1.2,
        rating: 4.5,
        reviewCount: 89,
        isOpen: true,
        hours: "Open 24/7",
        specialties: ["Pediatrics", "Oncology", "General Practice"],
        address: "456 Lakeview Ave, Westside, NY 10002",
        phone: "(555) 987-6543",
        image: "bg-green-100",
        coordinates: { lat: 40.7328, lng: -74.0260 },
        description: "Known for compassionate care and family-friendly pediatric ward. A calm environment for healing.",
        services: ["Pediatrics Wing", "Chemotherapy", "Vaccination Center", "Counseling"],
        doctors: [
            { name: "Dr. Sarah Johnson", role: "Pediatrician", available: true },
        ],
        reviews: [MOCK_REVIEWS[2]]
    },
    {
        id: 3,
        name: "North Hills Clinic",
        type: "Clinic",
        distance: 2.5,
        rating: 4.2,
        reviewCount: 45,
        isOpen: false,
        hours: "8:00 AM - 8:00 PM",
        specialties: ["General Practice", "Dermatology", "Dentistry"],
        address: "789 Hilltop Rd, North Hills, NY 10003",
        phone: "(555) 456-7890",
        image: "bg-indigo-100",
        coordinates: { lat: 40.7528, lng: -73.9860 },
        description: "A community clinic focused on accessible primary care and specialized skin treatments.",
        services: ["General Checkup", "Dental Cleaning", "Skin Biopsy", "Blood work"],
        doctors: [
            { name: "Dr. Michael Ross", role: "Dermatologist", available: true },
            { name: "Dr. Linda Gray", role: "GP", available: true },
        ],
        reviews: []
    },
    {
        id: 4,
        name: "Saint Mary's Urgent Care",
        type: "Urgent Care",
        distance: 3.1,
        rating: 4.6,
        reviewCount: 210,
        isOpen: true,
        hours: "Open 24/7",
        specialties: ["Urgent Care", "Orthopedics", "Sports Medicine"],
        address: "321 Saint Mary St, Eastside, NY 10004",
        phone: "(555) 789-0123",
        image: "bg-red-50",
        coordinates: { lat: 40.7028, lng: -73.9560 },
        description: "Top-rated urgent care center for injuries and rapid response treatments. Walk-ins welcome.",
        services: ["X-Ray", "Fracture Clinic", "Physiotherapy", "Minor Surgery"],
        doctors: [
             { name: "Dr. Robert Brown", role: "Orthopedic Surgeon", available: true }
        ],
        reviews: [MOCK_REVIEWS[1], MOCK_REVIEWS[0]] 
    }
];

const SearchPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [expandedId, setExpandedId] = useState<number | null>(null); // For accordion view
    const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationStatus('success');
            },
            (error) => {
                console.error("Error getting location: ", error);
                setLocationStatus('error');
            }
        );
    };

    // Filter Logic
    const filteredHospitals = HOSPITALS.filter(hospital => {
        const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              hospital.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || hospital.specialties.includes(selectedCategory);
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (sortBy === 'distance') return a.distance - b.distance;
        return b.rating - a.rating;
    });

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getGoogleMapsLink = (address: string) => {
        if (userLocation) {
             return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(address)}`;
        }
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    };

    if (isLoading) {
        return <SearchSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-20">
            <div className="w-full max-w-7xl mx-auto space-y-6">
                
                {/* --- Search Header --- */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                    
                    <div className="relative z-10">
                        <Link href="/individual" className="inline-flex items-center text-sm text-gray-400 hover:text-indigo-600 mb-4 transition-colors">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Medical Care</h1>
                        <p className="text-gray-500 mb-6 max-w-xl">
                            Search for nearby hospitals, clinics, and specialists. 
                        </p>
                        
                        {/* New: Location Action */}
                        <div className="flex items-center gap-2 mb-8">
                             <button 
                                onClick={getUserLocation}
                                disabled={locationStatus === 'loading' || locationStatus === 'success'}
                                className={`text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                    locationStatus === 'success' 
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : locationStatus === 'loading'
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                                }`}
                             >
                                {locationStatus === 'loading' ? (
                                    <>Accessing GPS...</>
                                ) : locationStatus === 'success' ? (
                                    <><MdMyLocation /> Location Active</>
                                ) : (
                                    <><FaLocationArrow className="transform -rotate-45" /> Use My Location</>
                                )}
                             </button>
                             {locationStatus === 'error' && (
                                 <span className="text-sm text-red-500">Could not access location.</span>
                             )}
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search details (e.g. 'Cardiology', 'City General')..." 
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                     <select 
                                        className="appearance-none h-full pl-4 pr-10 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:border-indigo-500"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
                                     >
                                         <option value="distance">Nearest</option>
                                         <option value="rating">Top Rated</option>
                                     </select>
                                     <FaFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
                                </div>
                                <button className="px-6 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 whitespace-nowrap">
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                            {SPECIALTIES.map((cat) => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                                        selectedCategory === cat 
                                        ? "bg-gray-900 text-white border-gray-900" 
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Main Content Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Results Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-bold text-gray-800">
                                {filteredHospitals.length} Facilities Found
                            </h2>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Sorted by {sortBy === 'distance' ? 'Distance' : 'Rating'}
                            </span>
                        </div>

                        {filteredHospitals.length === 0 ? (
                             <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                                 <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                     <FaSearch size={24} />
                                 </div>
                                 <h3 className="text-gray-900 font-bold mb-1">No results found</h3>
                                 <p className="text-gray-500 text-sm">Try adjusting your filters or search term.</p>
                             </div>
                        ) : (
                            filteredHospitals.map((hospital) => (
                                <div key={hospital.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === hospital.id ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
                                    {/* Card Header (Clickable) */}
                                    <div className="p-5 cursor-pointer" onClick={() => toggleExpand(hospital.id)}>
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            {/* Image/Icon Placeholder */}
                                            <div className={`w-full sm:w-24 h-24 ${hospital.image} rounded-xl flex items-center justify-center shrink-0`}>
                                                <MdLocalHospital className={`text-4xl ${hospital.isOpen ? 'text-indigo-500' : 'text-gray-400'}`} />
                                            </div>
                                            
                                            {/* Header Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-bold text-gray-900 truncate">{hospital.name}</h3>
                                                            {hospital.type === 'Hospital' && <MdVerified className="text-blue-500" title="Verified Facility" />}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">{hospital.type}</span>
                                                            <span className="flex items-center gap-1"><FaStar className="text-yellow-400" /> {hospital.rating} ({hospital.reviewCount})</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-indigo-600 font-medium">{hospital.distance} miles</span>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-indigo-600 transition-colors mt-1">
                                                        {expandedId === hospital.id ? <FaChevronUp /> : <FaChevronDown />}
                                                    </button>
                                                </div>
                                                
                                                <p className="text-sm text-gray-500 flex items-start gap-1.5 line-clamp-1 mb-3">
                                                    <FaMapMarkerAlt className="text-gray-400 mt-0.5 shrink-0" />
                                                    {hospital.address}
                                                </p>

                                                <div className="flex items-center gap-3">
                                                    <a 
                                                        href={getGoogleMapsLink(hospital.address)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <FaDirections /> Get Directions
                                                    </a>
                                                    <button 
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${hospital.phone}`; }}
                                                    >
                                                        <FaPhoneAlt size={12} /> Call
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedId === hospital.id && (
                                        <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-6 animate-fade-in">
                                            {/* Description & Hours */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                        <FaHospital className="text-gray-400"/> About Facility
                                                    </h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                                        {hospital.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 w-fit">
                                                        <FaClock className={hospital.isOpen ? "text-green-500" : "text-red-500"} />
                                                        <span className="font-medium">{hospital.isOpen ? "Open Now" : "Closed"}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span>{hospital.hours}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Services & Doctors */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                        <MdMedicalServices className="text-gray-400"/> Services & Staff
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {hospital.services.map((service, idx) => (
                                                            <span key={idx} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600">
                                                                {service}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {hospital.doctors.map((doc, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white rounded border border-gray-100">
                                                                <div className="flex items-center gap-2">
                                                                    <FaUserMd className="text-indigo-400" />
                                                                    <span className="font-medium text-gray-800">{doc.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-gray-500">{doc.role}</span>
                                                                    {doc.available && (
                                                                        <Link 
                                                                            href={`/individual/appointments/book?doctor=${doc.name.toLowerCase().replace(/ /g, '-').replace(/\./g, '')}`}
                                                                            className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors"
                                                                        >
                                                                            Book
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reviews Section */}
                                            <div>
                                                 <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <FaRegCommentDots className="text-gray-400"/> Recent Reviews
                                                </h4>
                                                {hospital.reviews.length > 0 ? (
                                                    <div className="grid gap-3">
                                                        {hospital.reviews.map((review, idx) => (
                                                            <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="font-bold text-sm text-gray-800">{review.user}</span>
                                                                    <span className="text-xs text-gray-400">{review.date}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 mb-2">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <FaStar key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                                                                    ))}
                                                                </div>
                                                                <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No reviews yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* --- Sidebar Area --- */}
                    <div className="hidden lg:block space-y-6">
                        {/* Map Placeholder Card (Click leads to Google Maps Search for area) */}
                        <div 
                            className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm h-72 relative overflow-hidden group cursor-pointer"
                            onClick={() => {
                                const lat = userLocation ? userLocation.lat : HOSPITALS[0].coordinates.lat;
                                const lng = userLocation ? userLocation.lng : HOSPITALS[0].coordinates.lng;
                                window.open(`https://www.google.com/maps/search/hospitals+near+me/@${lat},${lng},13z`, '_blank');
                            }}
                        >
                            {/* Stylized Map Background (CSS Grid/Mock) */}
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full opacity-20 transform rotate-12 scale-150">
                                    {[...Array(16)].map((_, i) => (
                                        <div key={i} className="bg-gray-300 rounded"></div>
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                     <div className="bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transform group-hover:scale-110 transition-transform">
                                        <FaMapMarkerAlt className="text-indigo-600" />
                                        <span className="font-bold text-gray-800">View on Map</span>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Promo */}
                        <div className="bg-indigo-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-xl shadow-indigo-900/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600 rounded-full blur-3xl -ml-10 -mb-10 opacity-30"></div>
                            
                            <h3 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">
                                <FaPhoneAlt className="text-red-400"/> Emergency?
                            </h3>
                            <p className="text-indigo-200 text-sm mb-6 relative z-10">
                                If you are experiencing chest pain, trouble breathing, or major trauma, do not wait.
                            </p>
                            <a href="tel:911" className="block w-full text-center py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-900/30 relative z-10">
                                Call 911 Immediately
                            </a>
                        </div>
                    </div>

                </div>
            </div>
            
            <style jsx global>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default SearchPage;
