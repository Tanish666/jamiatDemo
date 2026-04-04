"use client";
import React from 'react';
import { Playfair_Display } from "next/font/google";
import { Heart, Activity, Image as ImageIcon, Info, Share2, AlertCircle, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "700"],
});

const EmergencyDonation = () => {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emergency-fund`);
                if (!response.ok) throw new Error('Network response was not ok');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching emergency fund data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const formatTime = (timestamp: string) => {
        if (!timestamp) return "Just now";
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        } catch (e) {
            return timestamp;
        }
    };

    // Mapping API data to UI structure
    const content = {
        title: data?.title || "Emergency Relief Fund",
        description: data?.description || "Help us provide immediate assistance, food, and medical supplies to those affected by the recent crisis. Your support can save lives today.",
        aboutDescription: data?.aboutContent || "In light of recent tragic events, thousands of families have been displaced and are in urgent need of basic necessities. This emergency donation drive is organized to gather immediate relief funds that will be deployed directly on the ground. We are working closely with local partners to provide shelter, clean drinking water, hot meals, and medical attention.",
        gallery: data?.media || [
            { type: 'image', url: 'https://images.unsplash.com/photo-1593113565694-c6e09f5db184?q=80&w=600&auto=format&fit=crop', caption: 'Relief distribution center' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=600&auto=format&fit=crop', caption: 'Medical camp setup' },
            { type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Ground report video overview' },
        ],
        updates: data?.liveUpdates?.map((u: any) => ({
            title: u.title,
            time: formatTime(u.timestamp),
            description: u.content,
            status: u.status || 'Live'
        })) || [
                { title: "Food Trucks Arrived", time: "10 mins ago", description: "Two trucks carrying non-perishable food items have reached the southern camp. Distribution will start shortly. Thanks to our volunteers on the ground!", status: "Live" },
                { title: "Initial Goal Met!", time: "2 hours ago", description: "Thanks to your incredible generosity, we've crossed our first milestone of ₹5,00,000! We are scaling up our medial camp setup.", status: "Past" }
            ],
        linkedProjects: data?.linkedProjects?.map((project: any) => ({
            _id: project._id,
            title: project.title,
            category: project.category,
            totalRequired: project.totalRequired,
            collected: project.collected,
            beneficiaries: project.beneficiaries,
            status: project.status,
            slug: project.slug,
            mainImage: project.mainImage
        })) || [
                {
                    _id: "651a2b3c4d5e6f7g8h9i0j1k",
                    title: "Medical Supply Distribution",
                    category: ["Health", "Emergency"],
                    totalRequired: 1500000,
                    collected: 650000,
                    beneficiaries: 5000,
                    status: "Active",
                    slug: "medical-supply-distribution",
                    mainImage: "/uploads/medical-supplies.jpg"
                },
                {
                    _id: "651a2b3c4d5e6f7g8h9i0j9z",
                    title: "Temporary Shelters Build",
                    category: ["Infrastructure"],
                    totalRequired: 2000000,
                    collected: 1800000,
                    beneficiaries: 1000,
                    status: "Active",
                    slug: "temporary-shelters-build",
                    mainImage: "/uploads/shelter.jpg"
                }
            ],
        stats: {
            raised: data?.raisedAmount || 1245000,
            goal: data?.goalAmount || 2500000,
            donors: data?.donorsCount || 1240
        },
        recentDonors: data?.recentDonors?.map((d: any) => ({
            _id: d._id,
            name: d.name || "Anonymous",
            amount: d.amount,
            dedicatedTo: d.dedicatedTo || null,
            message: d.message || null,
            time: formatTime(d.createdAt),
            initials: d.name ? d.name.split(' ').map((n: string) => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) : "A"
        })) || [
                {
                    _id: "example-1",
                    name: "Ahmed H.",
                    amount: 5000,
                    dedicatedTo: "In memory of Grandfather",
                    message: "Stay strong!",
                    time: formatTime("2023-11-06T14:30:00Z"),
                    initials: "AH"
                },
                {
                    _id: "example-2",
                    name: "Sarah M.",
                    amount: 10000,
                    dedicatedTo: null,
                    message: "Sending prayers.",
                    time: "15 mins ago",
                    initials: "SM"
                }
            ]
    };

    const raisedFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(content.stats.raised);
    const goalFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(content.stats.goal);
    const progress = Math.min(Math.round((content.stats.raised / content.stats.goal) * 100), 100);

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Hero / Header Section */}
            <section className="bg-[#ECFDF5] py-16 pt-20 lg:py-32 flex flex-col items-center px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-emerald-100/50 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-emerald-50/50 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-4xl w-full text-center space-y-6">
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full shadow-sm mb-2">
                        <AlertCircle className="w-4 h-4 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Urgent Appeal</span>
                    </div>
                    <h1 className={`${playfair.className} text-4xl md:text-6xl font-bold text-[#1a2e35] leading-tight tracking-tight px-2`}>
                        {content.title}
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        {content.description}
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 relative z-20 mt-8 flex flex-col lg:flex-row gap-8">

                {/* Left Content Area */}
                <div className="flex-1 space-y-12">

                    {/* About the Event */}
                    <div className="bg-white p-8 lg:p-12 rounded-[32px] border border-gray-100 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.08)]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <Info className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h2 className={`${playfair.className} text-3xl font-bold text-[#1a2e35]`}>About the Event</h2>
                        </div>
                        <div className="prose max-w-none text-gray-600 leading-relaxed text-lg">
                            <p>
                                {content.aboutDescription}
                            </p>
                        </div>
                    </div>

                    {/* Photos & Videos */}
                    <div className="bg-white p-8 lg:p-12 rounded-[32px] border border-gray-100 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.08)]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h2 className={`${playfair.className} text-3xl font-bold text-[#1a2e35]`}>Photos & Videos</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {content.gallery.filter((item: any) => item.type === 'image').slice(0, 2).map((item: any, index: number) => (
                                <div key={index} className="bg-gray-200 rounded-2xl aspect-square w-full overflow-hidden relative group cursor-pointer bg-cover bg-center" style={{ backgroundImage: `url('${item.url}')` }}>
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-white font-medium text-sm">{item.caption || 'Relief Activity'}</p>
                                    </div>
                                </div>
                            ))}
                            {content.gallery.find((item: any) => item.type === 'video') && (() => {
                                const videoItem = content.gallery.find((item: any) => item.type === 'video');
                                const isYouTube = videoItem.url?.includes('youtube.com') || videoItem.url?.includes('youtu.be');

                                // Convert standard YouTube watch URLs to embed URLs if needed
                                let embedUrl = videoItem.url;
                                if (isYouTube && !embedUrl.includes('embed/')) {
                                    const videoId = embedUrl.split('v=')[1]?.split('&')[0] || embedUrl.split('youtu.be/')[1]?.split('?')[0];
                                    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                                }

                                return (
                                    <div className="sm:col-span-2 bg-gray-200 rounded-3xl h-80 md:h-96 w-full overflow-hidden relative group">
                                        <iframe
                                            className="w-full h-full object-cover"
                                            src={embedUrl}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                        {videoItem.caption && (
                                            <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10">
                                                <p className="text-white font-medium text-sm">{videoItem.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Live Updates */}
                    <div className="bg-[#F8FAFC] p-8 lg:p-12 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-[80px]" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <Activity className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h2 className={`${playfair.className} text-3xl font-bold text-[#1a2e35]`}>Live Updates</h2>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 tracking-wider uppercase">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Live
                                </span>
                            </div>

                            <div className="space-y-8 relative pl-6 border-l-2 border-emerald-100">
                                {content.updates.map((update, index) => (
                                    <div key={index} className="relative">
                                        <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white ${update.status === 'Live' ? 'bg-emerald-500' : 'bg-gray-300'} shadow-sm`}></div>
                                        <div className="bg-white p-6 rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-50 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                <h3 className="font-bold text-gray-900 text-lg">{update.title}</h3>
                                                <time className={`text-xs font-bold ${update.status === 'Live' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 bg-gray-50'} px-3 py-1 rounded-full w-fit`}>{update.time}</time>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">{update.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Linked Projects */}
                <div className="lg:w-[400px] flex-shrink-0 space-y-6">
                    {content.linkedProjects && content.linkedProjects.length > 0 ? (
                        content.linkedProjects.map((project: any) => {
                            const projectRaised = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(project.collected || 0);
                            const projectGoal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(project.totalRequired || 1);
                            const projectProgress = Math.min(Math.round(((project.collected || 0) / (project.totalRequired || 1)) * 100), 100);

                            return (
                                <div key={project._id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.08)] flex flex-col items-center">
                                    <div className="w-full text-center mb-6">
                                        {project.category && project.category.length > 0 && (
                                            <div className="flex justify-center gap-2 mb-3 flex-wrap">
                                                {project.category.map((cat: string) => (
                                                    <span key={cat} className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{cat}</span>
                                                ))}
                                            </div>
                                        )}
                                        <h3 className={`${playfair.className} text-2xl font-bold text-gray-900 mb-2 leading-tight`}>{project.title}</h3>
                                        {project.beneficiaries && (
                                            <p className="text-gray-500 text-sm font-medium">{project.beneficiaries.toLocaleString('en-IN')} Beneficiaries</p>
                                        )}
                                    </div>

                                    <div className="w-full text-center mb-6">
                                        <p className="text-emerald-700 font-bold text-xs tracking-[0.1em] uppercase mb-2">Fundraising Status</p>
                                        <h4 className={`${playfair.className} text-4xl font-bold text-gray-900 mb-1`}>{projectRaised}</h4>
                                        <p className="text-gray-500 text-sm font-medium">raised of {projectGoal}</p>
                                    </div>

                                    <div className="w-full mb-8">
                                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-emerald-50 mb-3">
                                            <div className="h-full bg-emerald-600 rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${projectProgress}%` }}>
                                                <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-[#1a2e35]">{projectProgress}% Funded</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${project.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>{project.status}</span>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-3">
                                        <button className="w-full bg-emerald-600 text-white py-4 rounded-full font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                            <Heart className="w-5 h-5 fill-current" />
                                            Donate Now
                                        </button>
                                        <button className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-full font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                            <Share2 className="w-5 h-5" />
                                            Share Appeal
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.08)] text-center">
                            <p className="text-gray-500 font-medium">No active linked projects found.</p>
                        </div>
                    )}

                    {/* Recent Donors Section */}
                    {content.recentDonors && content.recentDonors.length > 0 && (
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.08)]">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-emerald-500" />
                                Recent Donors
                            </h4>
                            <div className="flex flex-col gap-6">
                                {content.recentDonors.map((donor: any, index: number) => (
                                    <div key={donor._id || index} className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full ${donor.initials === 'A' ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} flex items-center justify-center flex-shrink-0 font-bold shadow-sm`}>
                                            {donor.initials || <Heart className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="font-bold text-sm text-gray-900">{donor.name}</p>
                                                <p className="text-emerald-600 font-bold text-sm">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(donor.amount)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-2">{donor.time}</p>

                                            {donor.dedicatedTo && (
                                                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg mb-2 inline-block shadow-sm">
                                                    Dedicated: {donor.dedicatedTo}
                                                </p>
                                            )}

                                            {donor.message && (
                                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-b-xl rounded-tr-xl border border-gray-100 mt-1 relative">
                                                    <span className="text-gray-300 absolute -top-2 -left-2 text-2xl font-serif leading-none">"</span>
                                                    <p className="relative z-10 italic pl-1">{donor.message}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EmergencyDonation;