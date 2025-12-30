import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabaseClient";
import { Camera, Calendar, User, Upload, X, Menu, Loader2, Sparkles, Instagram, Mail, CheckCircle, LayoutTemplate, Trash2, Database, Copy, Check, MessageCircle } from "lucide-react";

// --- Configuration & Initialization ---

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Types (Mapped to Supabase DB Columns)
interface Photo {
  id: string;
  image_url: string;
  caption: string;
  category: string;
  is_highlight?: boolean;
  is_package_cover?: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  type: string;
  message: string;
  status: 'pending' | 'confirmed' | 'archived';
  created_at: string;
}

// --- Components ---

const Navigation = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Portfolio' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'book', label: 'Book Session' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setActiveTab('home')}
        >
          <Camera className="w-6 h-6 text-yellow-600" />
          <span className="text-xl font-serif tracking-widest font-bold text-white">LOST x ROTIMI</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-sm tracking-widest uppercase transition-colors hover:text-yellow-500 ${
                activeTab === item.id ? 'text-yellow-500 font-semibold' : 'text-gray-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-neutral-900 border-b border-white/10 p-6 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMenuOpen(false);
              }}
              className={`text-left text-lg tracking-widest uppercase ${
                activeTab === item.id ? 'text-yellow-500' : 'text-gray-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onBookClick, heroImages }: { onBookClick: () => void, heroImages: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out empty strings just in case
  const images = heroImages.filter(img => img);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Slideshow Backgrounds */}
      {images.length > 0 ? (
        images.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-60' : 'opacity-0'
            }`}
            style={{ 
              backgroundImage: `url('${img}')`,
              backgroundPosition: 'center 25%' // Anchors image to the "sweet spot" for portraits
            }}
          />
        ))
      ) : (
        /* Fallback if no images */
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#0a0a0a] to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-40" />
        </>
      )}
      
      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#050505] z-0" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h2 className="text-yellow-600 tracking-[0.2em] uppercase text-sm mb-4">Professional Photography</h2>
        <h1 className="text-5xl md:text-7xl font-serif italic font-bold text-white mb-8 leading-tight">
          Capturing Moments <br /> <span className="not-italic font-light">Defining Style</span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
          Specializing in editorial, portrait, and lifestyle photography. 
          Creating timeless imagery for those who dare to stand out.
        </p>
        <button 
          onClick={onBookClick}
          className="px-8 py-4 bg-yellow-700 hover:bg-yellow-600 text-white uppercase tracking-widest text-sm transition-all duration-300 border border-yellow-800"
        >
          Book an Appointment
        </button>
      </div>
    </div>
  );
};

const Highlights = ({ photos, onViewGallery }: { photos: Photo[], onViewGallery: () => void }) => {
  if (photos.length === 0) return null;

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto border-b border-white/5">
      <div className="flex flex-col items-center mb-16 text-center">
        <h2 className="text-4xl font-serif text-white mb-4">Highlights</h2>
        <div className="w-12 h-1 bg-yellow-700 mb-6"></div>
        <p className="text-gray-400 max-w-2xl font-light">
          A curated selection of recent masterpieces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-[3/4] overflow-hidden bg-neutral-900 shadow-xl cursor-pointer">
            <img 
              src={photo.image_url} 
              alt={photo.caption} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
            />
            {/* Elegant overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-center">
                    <p className="text-yellow-500 text-xs uppercase tracking-widest mb-2">{photo.category}</p>
                    <p className="text-white font-serif text-xl italic">{photo.caption}</p>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <button 
            onClick={onViewGallery}
            className="px-8 py-3 border border-white/20 hover:border-yellow-600 text-white hover:text-yellow-500 tracking-widest text-sm uppercase transition-all duration-300"
        >
            View Full Gallery
        </button>
      </div>
    </div>
  );
};

const Packages = ({ photos, onBookClick }: { photos: Photo[], onBookClick: (service: string) => void }) => {
  const packages = [
    {
      title: "PORTRAITS",
      category: "Portrait",
      price: "$15,000 JMD",
      details: ["1 Hour Session", "Includes 15 Selected Edited Photos", "$5000 Every Additional Hour"]
    },
    {
      title: "COUPLES",
      category: "Couples",
      price: "$20,000 JMD",
      details: ["1 Hour Session", "Includes 15 Selected Edited Photos", "$5000 Every Additional Hour"]
    },
    {
      title: "WEDDINGS",
      category: "Wedding",
      price: "Contact Me",
      details: ["Whole Day Session", "Includes 50 Edited Photos", "Travel Expenses included"]
    }
  ];

  const getCoverImage = (cat: string) => {
    // 1. Try to find specific package cover
    const cover = photos.find(p => p.category === cat && p.is_package_cover);
    if (cover) return cover.image_url;

    // 2. Fallback to most recent in category
    // Photos are already sorted by created_at desc in App.tsx fetchData
    const recent = photos.find(p => p.category === cat);
    return recent ? recent.image_url : null;
  };

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto border-b border-white/5">
       <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-white mb-4">Packages</h2>
          <div className="w-12 h-1 bg-yellow-700 mx-auto mb-6"></div>
          <p className="text-gray-400">Transparent pricing for every occasion.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, idx) => {
             const bgImage = getCoverImage(pkg.category);

             return (
               <div key={idx} className="group relative h-[600px] overflow-hidden bg-neutral-900 cursor-pointer shadow-2xl">
                  {/* Background Image */}
                  {bgImage ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 group-hover:brightness-[0.3] brightness-75"
                      style={{ backgroundImage: `url('${bgImage}')` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                        <Camera className="text-neutral-700 w-16 h-16" />
                    </div>
                  )}

                  {/* Initial State (Center) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all duration-500 group-hover:-translate-y-4 group-hover:opacity-0">
                     <h3 className="text-3xl font-serif text-white tracking-[0.2em] uppercase mb-4 drop-shadow-lg">{pkg.title}</h3>
                     <p className="text-yellow-500 text-xl font-light tracking-widest bg-black/40 px-4 py-1 backdrop-blur-sm border border-white/10">{pkg.price}</p>
                  </div>

                  {/* Hover State (Slide Up Details) */}
                  <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center p-8 translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0 bg-black/60 backdrop-blur-[2px]">
                      <h3 className="text-2xl font-serif text-white tracking-[0.2em] uppercase mb-2">{pkg.title}</h3>
                      <p className="text-yellow-500 text-xl font-light mb-8">{pkg.price}</p>
                      
                      <div className="space-y-4 text-center mb-8 w-full max-w-xs">
                        {pkg.details.map((detail, i) => (
                           <div key={i} className="text-gray-200 text-sm tracking-wide border-b border-white/10 pb-2 last:border-0 flex items-center justify-center gap-2">
                             <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                             {detail}
                           </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); onBookClick(pkg.category); }}
                        className="px-6 py-3 border border-yellow-600/50 text-yellow-500 hover:bg-yellow-600 hover:text-white uppercase text-xs tracking-widest transition-all duration-300 backdrop-blur-sm"
                      >
                        Book This Session
                      </button>
                  </div>
               </div>
             )
          })}
       </div>
    </div>
  )
}

const Gallery = ({ photos, isLoading, title = "Selected Works" }: { photos: Photo[], isLoading: boolean, title?: string }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(photos.map(p => p.category || 'Other'))).sort()];

  // Filter photos
  const filteredPhotos = activeCategory === 'All' 
    ? photos 
    : photos.filter(p => (p.category || 'Other') === activeCategory);

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif text-white mb-4">{title}</h2>
        <div className="w-16 h-1 bg-yellow-700 mx-auto mb-10"></div>
        
        {/* Category Tabs */}
        {!isLoading && photos.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm uppercase tracking-[0.15em] transition-all duration-300 relative pb-2 ${
                  activeCategory === cat 
                    ? 'text-yellow-500' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-yellow-500 transform origin-left transition-transform duration-300" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-sm bg-white/5">
           <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
           <p className="text-xl font-serif text-gray-400 italic">No photos found.</p>
           {activeCategory !== 'All' && <p className="text-sm text-gray-600 mt-2">Try switching categories.</p>}
        </div>
      ) : (
        <div className="masonry-grid">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className="break-inside-avoid mb-8 group relative cursor-zoom-in overflow-hidden shadow-lg bg-[#0a0a0a]"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* Photo */}
              <img 
                src={photo.image_url} 
                alt={photo.caption} 
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="inline-block px-2 py-1 bg-yellow-900/40 border border-yellow-700/30 text-yellow-500 text-[10px] uppercase tracking-widest mb-3 backdrop-blur-sm">
                    {photo.category}
                  </span>
                  <p className="text-white font-serif text-lg md:text-xl italic leading-tight text-shadow-sm">
                    {photo.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white hover:rotate-90 transition-all duration-300">
            <X size={32} />
          </button>
          
          <div className="max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
             <img 
               src={selectedPhoto.image_url} 
               alt={selectedPhoto.caption}
               className="max-h-[85vh] w-auto object-contain shadow-2xl" 
             />
             <div className="mt-4 text-center">
               <p className="text-yellow-500 text-xs uppercase tracking-widest mb-1">{selectedPhoto.category}</p>
               <p className="text-white/80 font-serif text-lg">{selectedPhoto.caption}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingForm = ({ onBook, initialService = 'Portrait' }: { onBook: (booking: any) => Promise<boolean>, initialService?: string }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    type: initialService,
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    setFormData(prev => ({ ...prev, type: initialService }));
  }, [initialService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const success = await onBook(formData);
    if (success) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-900/30 flex items-center justify-center mb-6 text-green-500">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-serif text-white mb-4">Request Received</h2>
        <p className="text-gray-400 max-w-md">
          Thank you for reaching out. I will review your request and get back to you shortly to confirm the details.
        </p>
        <button 
          onClick={() => {
            setStatus('idle');
            setFormData({ name: '', email: '', date: '', type: initialService, message: '' });
          }}
          className="mt-8 text-yellow-600 hover:text-yellow-500 underline underline-offset-4"
        >
          Book another session
        </button>
      </div>
    );
  }

  return (
    <div className="py-24 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif text-white mb-4">Book a Session</h2>
        <p className="text-gray-400">Let's create something memorable together.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 md:p-12 border border-white/10 rounded-sm">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-600 transition-colors"
              placeholder="Your full name"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Email</label>
            <input 
              required
              type="email" 
              className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-600 transition-colors"
              placeholder="email@address.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Preferred Date</label>
            <input 
              required
              type="date" 
              className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-600 transition-colors [color-scheme:dark]"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Session Type</label>
            <select 
              className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-600 transition-colors"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option>Portrait</option>
              <option>Couples</option>
              <option>Editorial / Fashion</option>
              <option>Event</option>
              <option>Wedding</option>
              <option>Product</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Message</label>
          <textarea 
            rows={4}
            className="w-full bg-black/50 border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-600 transition-colors"
            placeholder="Tell me about your vision..."
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-4 bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 text-white uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2"
        >
          {status === 'submitting' ? <Loader2 className="animate-spin" /> : 'Submit Request'}
        </button>
        {status === 'error' && <p className="text-red-500 text-center text-sm">Something went wrong. Please try again.</p>}
      </form>
    </div>
  );
};

const DatabaseSetup = () => {
  const sql = `
-- 1. Create Photos Table (Updated with package cover support)
create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  caption text,
  category text,
  is_highlight boolean default false,
  is_package_cover boolean default false, -- New column
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Bookings Table
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  date date,
  type text,
  message text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Storage Bucket (if it doesn't exist)
insert into storage.buckets (id, name, public) 
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

-- 4. Enable RLS
alter table public.photos enable row level security;
alter table public.bookings enable row level security;

-- 5. Create Policies (SIMPLIFIED FOR DEMO - Allows Public Read/Write)
-- WARNING: In production, restrict Write access to authenticated users.
create policy "Public Photos Read" on public.photos for select using (true);
create policy "Public Photos Insert" on public.photos for insert using (true);
create policy "Public Photos Delete" on public.photos for delete using (true);
create policy "Public Photos Update" on public.photos for update using (true); -- Added for package cover logic

create policy "Public Bookings Insert" on public.bookings for insert using (true);
create policy "Admin Bookings Read" on public.bookings for select using (true);

create policy "Public Storage Read" on storage.objects for select using ( bucket_id = 'portfolio-images' );
create policy "Public Storage Upload" on storage.objects for insert using ( bucket_id = 'portfolio-images' );
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql);
    alert("SQL copied to clipboard!");
  };

  return (
    <div className="bg-blue-900/20 border border-blue-700/50 p-6 rounded-sm mb-12">
      <div className="flex items-start gap-4">
        <Database className="w-8 h-8 text-blue-400 shrink-0" />
        <div className="flex-1">
          <h3 className="text-xl font-serif text-blue-100 mb-2">Database Setup Required</h3>
          <p className="text-blue-300 text-sm mb-4">
            The connection to Supabase is successful, but the required tables do not exist yet. 
            Run the SQL below in your Supabase SQL Editor to fix the "Could not find table" error.
          </p>
          <div className="relative">
            <pre className="bg-black/80 p-4 rounded text-xs text-gray-400 overflow-x-auto h-48 border border-white/10">
              <code>{sql}</code>
            </pre>
            <button 
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 text-xs"
            >
              <Copy size={14} /> Copy SQL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ 
  photos, 
  bookings, 
  heroImages,
  onUploadSuccess, 
  onDeletePhoto,
  onUpdateHeroImages,
  dbSetupNeeded
}: { 
  photos: Photo[], 
  bookings: Booking[], 
  heroImages: string[],
  onUploadSuccess: () => void,
  onDeletePhoto: (id: string, fileName: string) => void,
  onUpdateHeroImages: (urls: string[]) => void,
  dbSetupNeeded: boolean
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Portrait');
  const [isHighlight, setIsHighlight] = useState(false);
  const [isPackageCover, setIsPackageCover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'uploads' | 'bookings' | 'site'>('uploads');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  // Convert blob url to base64 for AI analysis
  const getBase64FromUrl = async (url: string): Promise<string> => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      }
    });
  }

  // REVERTED TO CAPTION ONLY TO FIX JSON ERROR
  const generateAICaption = async () => {
    if (!previewUrl) return;
    setIsGenerating(true);
    
    try {
      const fullBase64 = await getBase64FromUrl(previewUrl);
      const base64Data = fullBase64.split(',')[1];
      const mimeType = fullBase64.substring(fullBase64.indexOf(':') + 1, fullBase64.indexOf(';'));
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: "Write a short, artistic, sophisticated one-sentence caption for this photography portfolio image. Do not include quotes." }
          ]
        },
        // REMOVED config: { responseMimeType: 'application/json' } causing the error
      });
      
      if (response.text) {
        setCaption(response.text);
      }
    } catch (error: any) {
      console.error("AI Generation Error", error);
      // Improved error message to avoid [object Object]
      alert(`Could not generate caption. Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file!');
    
    if (dbSetupNeeded) {
        alert("Demo Mode: Cannot upload to real database because tables are missing. Please run the Setup SQL.");
        setCaption('');
        setFile(null);
        setPreviewUrl('');
        return;
    }

    setUploading(true);

    try {
      // 1. Transactional Logic: If this is a package cover, uncheck others in same category first
      if (isPackageCover) {
         const { error: updateError } = await supabase
            .from('photos')
            .update({ is_package_cover: false })
            .eq('category', category);
         
         if (updateError) console.warn("Could not unset previous covers:", updateError);
      }

      // 2. Upload image to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // Create unique name
      const { data, error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      // 4. Save details to Database
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{ 
            image_url: publicUrl, 
            caption, 
            category, 
            is_highlight: isHighlight,
            is_package_cover: isPackageCover
        }]);

      if (dbError) throw dbError;

      onUploadSuccess(); // Trigger parent refresh

      alert('Photo uploaded successfully!');
      setCaption('');
      setFile(null);
      setPreviewUrl('');
      setIsHighlight(false);
      setIsPackageCover(false);
      
    } catch (error: any) {
      console.error('Error:', error);
      // Improved error display
      alert('Error uploading photo: ' + (error.message || JSON.stringify(error)));
    } finally {
      setUploading(false);
    }
  };

  const handleHeroSlotChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newUrl = reader.result as string;
          const updatedImages = [...heroImages];
          // Ensure array is at least index + 1 length filled with empty strings if needed
          while(updatedImages.length <= index) updatedImages.push('');
          
          updatedImages[index] = newUrl;
          onUpdateHeroImages(updatedImages);
        };
        reader.readAsDataURL(file);
     }
  }

  const handleHeroSlotDelete = (index: number) => {
    const updatedImages = [...heroImages];
    if (index < updatedImages.length) {
       updatedImages[index] = '';
       // Clean up trailing empty strings if you want, or just keep slots. 
       // For simplicity, we keep slots to allow re-uploading to slot 2 specifically.
       onUpdateHeroImages(updatedImages);
    }
  }

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <h2 className="text-3xl font-serif text-white">Admin Dashboard</h2>
        <div className="flex bg-white/5 rounded-lg p-1">
          <button 
            onClick={() => setActiveAdminTab('uploads')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeAdminTab === 'uploads' ? 'bg-yellow-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Uploads
          </button>
          <button 
            onClick={() => setActiveAdminTab('bookings')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeAdminTab === 'bookings' ? 'bg-yellow-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Bookings
          </button>
           <button 
            onClick={() => setActiveAdminTab('site')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${activeAdminTab === 'site' ? 'bg-yellow-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Site
          </button>
        </div>
      </div>

      {dbSetupNeeded && <DatabaseSetup />}

      {activeAdminTab === 'uploads' && (
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Upload Form */}
          <div className="bg-white/5 p-8 border border-white/10 rounded-sm h-fit">
            <h3 className="text-xl font-serif text-white mb-6">Upload New Work</h3>
            
            <form onSubmit={handleUpload} className="space-y-6">
              
              {/* Image Preview / Input */}
              <div 
                className={`aspect-video w-full border-2 border-dashed border-white/20 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600/50 transition-colors overflow-hidden relative ${!previewUrl ? 'bg-black/30' : ''}`}
                onClick={() => !previewUrl && fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreviewUrl('');
                      }}
                      className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded-full hover:bg-red-900"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Click to select file to upload</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {/* Caption & AI */}
              <div className="space-y-2">
                <label className="text-xs uppercase text-gray-500">Caption</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 p-3 text-white"
                    placeholder="Enter description..."
                  />
                  <button 
                    type="button"
                    disabled={!previewUrl || isGenerating}
                    onClick={generateAICaption}
                    className="px-4 bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 disabled:opacity-50 flex items-center gap-2"
                    title="Generate with Gemini AI"
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span className="hidden md:inline">AI Caption</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase text-gray-500 block mb-2">Category</label>
                    <select 
                      className="w-full bg-black/50 border border-white/10 p-3 text-white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Portrait</option>
                      <option>Couples</option>
                      <option>Fashion</option>
                      <option>Wedding</option>
                      <option>Event</option>
                      <option>Commercial</option>
                      <option>Editorial</option>
                      <option>Landscape</option>
                    </select>
                  </div>
                  <div>
                     <label className="text-xs uppercase text-gray-500 block mb-2">Options</label>
                     <div className="flex flex-col gap-2">
                        <div 
                            onClick={() => setIsHighlight(!isHighlight)}
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm cursor-pointer transition-colors select-none"
                        >
                            <div className={`w-5 h-5 rounded border border-white/30 flex items-center justify-center transition-colors ${isHighlight ? 'bg-yellow-600 border-yellow-600' : ''}`}>
                                {isHighlight && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-xs text-gray-300">Highlight on Home?</span>
                        </div>

                        <div 
                            onClick={() => setIsPackageCover(!isPackageCover)}
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm cursor-pointer transition-colors select-none"
                        >
                            <div className={`w-5 h-5 rounded border border-white/30 flex items-center justify-center transition-colors ${isPackageCover ? 'bg-purple-600 border-purple-600' : ''}`}>
                                {isPackageCover && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-xs text-gray-300">Set as Package Background?</span>
                        </div>
                     </div>
                  </div>
              </div>

              <button 
                type="submit" 
                disabled={!file || uploading}
                className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-800 disabled:text-gray-500 text-white uppercase tracking-widest text-sm flex justify-center items-center gap-2"
              >
                {uploading && <Loader2 className="animate-spin w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload to Gallery'}
              </button>
            </form>
          </div>

          {/* Manage Existing */}
          <div className="space-y-4">
             <h3 className="text-xl font-serif text-white mb-6">Gallery Management</h3>
             {photos.length === 0 ? (
               <p className="text-gray-500 italic text-sm">No photos in database. Use the form to add your client's work.</p>
             ) : (
               <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                 {photos.map(p => (
                   <div key={p.id} className="relative group aspect-square">
                     <img src={p.image_url} className="w-full h-full object-cover rounded-sm border border-white/5" />
                     {p.is_highlight && (
                        <div className="absolute top-2 left-2 bg-yellow-600 text-white text-[10px] px-2 py-0.5 rounded shadow-sm z-10">
                            HIGHLIGHT
                        </div>
                     )}
                     {p.is_package_cover && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded shadow-sm z-10">
                            COVER
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                       <p className="text-white text-xs mb-2 line-clamp-2">{p.caption}</p>
                       <p className="text-yellow-500 text-[10px] uppercase mb-2">{p.category}</p>
                       <button 
                         onClick={() => {
                           // Extract filename from URL for deletion (simple version)
                           const fileName = p.image_url.split('/').pop();
                           if(fileName) onDeletePhoto(p.id, fileName);
                         }}
                         className="px-3 py-1 bg-red-900/80 text-red-200 text-xs rounded hover:bg-red-800 flex items-center gap-1"
                       >
                         <Trash2 size={12} /> Delete
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      )}

      {activeAdminTab === 'bookings' && (
        <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No booking requests found in database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Requested For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-white/5">
                      <td className="p-4 whitespace-nowrap">{new Date(b.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{b.name}</div>
                        <div className="text-gray-500 text-xs">{b.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-yellow-900/30 text-yellow-500 px-2 py-1 rounded text-xs border border-yellow-700/30">
                          {b.type}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate">{b.message}</td>
                      <td className="p-4 text-white font-medium">{new Date(b.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeAdminTab === 'site' && (
         <div className="bg-white/5 p-8 border border-white/10 rounded-sm max-w-4xl">
           <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
             <LayoutTemplate className="w-5 h-5" />
             Homepage Customization
           </h3>
           
           <div className="space-y-6">
             <div>
               <label className="block text-xs uppercase tracking-wider text-gray-500 mb-3">Hero Background Slideshow (Max 3)</label>
               <p className="text-sm text-gray-400 mb-4">
                 Upload up to 3 high-quality landscape images. They will automatically cycle on the homepage.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[0, 1, 2].map((index) => (
                    <div key={index}>
                       <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">Slide {index + 1}</label>
                       <div 
                          className="aspect-video bg-black/50 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-yellow-600 transition-colors relative overflow-hidden"
                          onClick={() => document.getElementById(`hero-upload-${index}`)?.click()}
                       >
                          {heroImages[index] ? (
                             <img src={heroImages[index]} className="w-full h-full object-cover" />
                          ) : (
                             <div className="text-center">
                                 <Upload className="w-6 h-6 text-gray-600 mx-auto" />
                                 <span className="text-xs text-gray-600">Upload</span>
                             </div>
                          )}
                          <input 
                             id={`hero-upload-${index}`}
                             type="file" 
                             className="hidden" 
                             accept="image/*"
                             onChange={(e) => handleHeroSlotChange(index, e)}
                          />
                       </div>
                       {heroImages[index] && (
                         <button 
                            onClick={() => handleHeroSlotDelete(index)}
                            className="text-xs text-red-400 mt-2 hover:text-red-300 underline"
                         >
                            Remove
                         </button>
                       )}
                    </div>
                 ))}
               </div>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedService, setSelectedService] = useState('Portrait');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbSetupNeeded, setDbSetupNeeded] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Photos
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (photosError) {
         if (photosError.code === '42P01') { // table undefined
             setDbSetupNeeded(true);
         } else {
             console.error('Error fetching photos:', photosError);
         }
      } else {
         setPhotos(photosData || []);
      }

      // Fetch Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
        
       if (bookingsError && bookingsError.code !== '42P01') {
           console.error('Error fetching bookings:', bookingsError);
       } else if (bookingsData) {
           setBookings(bookingsData);
       }

       // Load hero images from localStorage
       const storedHeroImages = localStorage.getItem('heroImages');
       if (storedHeroImages) {
           try {
             setHeroImages(JSON.parse(storedHeroImages));
           } catch(e) { console.error("Error parsing hero images", e); }
       }

    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (bookingData: any) => {
      try {
          const { error } = await supabase.from('bookings').insert([bookingData]);
          if (error) throw error;
          
          // Refresh bookings locally
          const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
          if(data) setBookings(data);
          
          return true;
      } catch (e) {
          console.error(e);
          return false;
      }
  };
  
  const handleDeletePhoto = async (id: string, fileName: string) => {
      if(!window.confirm("Are you sure you want to delete this photo?")) return;
      
      try {
          // 1. Delete from storage
          const { error: storageError } = await supabase.storage.from('portfolio-images').remove([fileName]);
          if(storageError) console.warn("Storage delete warning:", storageError);
          
          // 2. Delete from DB
          const { error: dbError } = await supabase.from('photos').delete().eq('id', id);
          if(dbError) throw dbError;
          
          setPhotos(prev => prev.filter(p => p.id !== id));
      } catch (e) {
          alert("Error deleting photo");
          console.error(e);
      }
  };
  
  const handleUpdateHeroImages = (urls: string[]) => {
      setHeroImages(urls);
      localStorage.setItem('heroImages', JSON.stringify(urls));
  };

  const handleUploadSuccess = () => {
      fetchData(); 
  };

  const handlePackageBook = (service: string) => {
    setSelectedService(service);
    setActiveTab('book');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-900 selection:text-white">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'home' && (
          <>
            <Hero 
              onBookClick={() => {
                setSelectedService('Portrait');
                setActiveTab('book');
                window.scrollTo(0, 0);
              }} 
              heroImages={heroImages} 
            />
            <Highlights photos={photos.filter(p => p.is_highlight)} onViewGallery={() => setActiveTab('gallery')} />
            <Packages photos={photos} onBookClick={handlePackageBook} />
          </>
        )}
        {activeTab === 'gallery' && <Gallery photos={photos} isLoading={loading} />}
        {activeTab === 'book' && <BookingForm onBook={handleBookSession} initialService={selectedService} />}
        {activeTab === 'admin' && (
          <AdminDashboard 
            photos={photos} 
            bookings={bookings} 
            heroImages={heroImages}
            onUploadSuccess={handleUploadSuccess} 
            onDeletePhoto={handleDeletePhoto}
            onUpdateHeroImages={handleUpdateHeroImages}
            dbSetupNeeded={dbSetupNeeded}
          />
        )}
      </main>
      
      <footer className="bg-black py-16 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          
          {/* Social / Contact Links */}
          <div className="flex items-center gap-12 mb-10">
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/lostxrotimi?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 group"
            >
              <div className="p-3 rounded-full border border-yellow-900/30 text-yellow-600 group-hover:text-yellow-400 group-hover:border-yellow-500/50 group-hover:scale-110 transition-all duration-300 bg-white/5">
                <Instagram size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-yellow-500 transition-colors">Instagram</span>
            </a>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/18763066126" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 group"
            >
              <div className="p-3 rounded-full border border-yellow-900/30 text-yellow-600 group-hover:text-yellow-400 group-hover:border-yellow-500/50 group-hover:scale-110 transition-all duration-300 bg-white/5">
                <MessageCircle size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-yellow-500 transition-colors">WhatsApp</span>
            </a>

            {/* Email */}
            <a 
              href="mailto:info@lostxrotimi.com"
              className="flex flex-col items-center gap-3 group"
            >
              <div className="p-3 rounded-full border border-yellow-900/30 text-yellow-600 group-hover:text-yellow-400 group-hover:border-yellow-500/50 group-hover:scale-110 transition-all duration-300 bg-white/5">
                <Mail size={20} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-yellow-500 transition-colors">Email</span>
            </a>
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-white/10 mb-8"></div>

          {/* Copyright */}
          <div className="text-center">
             <div className="text-xl font-serif tracking-widest font-bold text-white flex items-center justify-center gap-2 mb-4">
                <Camera className="w-4 h-4 text-yellow-600" />
                LOST x ROTIMI
              </div>
            <p className="text-gray-600 text-xs tracking-widest uppercase">
              © {new Date().getFullYear()} All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

export default App;