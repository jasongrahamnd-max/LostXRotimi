import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { Camera, Calendar, User, Upload, X, Menu, Loader2, Sparkles, Instagram, Mail, CheckCircle } from "lucide-react";

// --- Configuration & Initialization ---

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Types
interface Photo {
  id: string;
  url: string;
  caption: string;
  category: string;
  dateAdded: number;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  type: string;
  message: string;
  status: 'pending' | 'confirmed' | 'archived';
  createdAt: number;
}

// Default Data (Empty for client uploads)
const INITIAL_PHOTOS: Photo[] = [];

// --- Components ---

const Navigation = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Portfolio' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'book', label: 'Book Session' },
    { id: 'admin', label: 'Client Access' }, // Hidden "Admin" for demo
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

const Hero = ({ onBookClick }: { onBookClick: () => void }) => (
  <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
    {/* Replaced specific image with an abstract dark gradient to avoid generic photos */}
    <div 
      className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#0a0a0a] to-black"
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-40" />
    
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

const Gallery = ({ photos }: { photos: Photo[] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-serif text-white mb-4">Selected Works</h2>
        <div className="w-16 h-1 bg-yellow-700 mx-auto"></div>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-sm bg-white/5">
           <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
           <p className="text-xl font-serif text-gray-400 italic">Portfolio is currently being curated.</p>
           <p className="text-sm text-gray-600 mt-2">Check back soon for new uploads.</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="break-inside-avoid mb-6 group relative cursor-zoom-in overflow-hidden"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo.url} 
                alt={photo.caption} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <p className="text-yellow-500 text-xs uppercase tracking-wider mb-1">{photo.category}</p>
                  <p className="text-white font-serif text-lg italic">{photo.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white">
            <X size={32} />
          </button>
          <img 
            src={selectedPhoto.url} 
            alt={selectedPhoto.caption}
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl" 
          />
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/80 font-serif">
            {selectedPhoto.caption}
          </div>
        </div>
      )}
    </div>
  );
};

const BookingForm = ({ onBook }: { onBook: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    type: 'Portrait',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook(formData);
    setSubmitted(true);
  };

  if (submitted) {
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
          onClick={() => setSubmitted(false)}
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
          className="w-full py-4 bg-yellow-700 hover:bg-yellow-600 text-white uppercase tracking-widest text-sm transition-colors"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

const AdminDashboard = ({ 
  photos, 
  bookings, 
  onUpload, 
  onDeletePhoto 
}: { 
  photos: Photo[], 
  bookings: Booking[], 
  onUpload: (p: Omit<Photo, 'id' | 'dateAdded'>) => void,
  onDeletePhoto: (id: string) => void
}) => {
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Portrait');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'uploads' | 'bookings'>('uploads');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert File to Base64
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAICaption = async () => {
    if (!newPhotoUrl) return;
    setIsGenerating(true);
    
    try {
      // Logic: Extract base64 data from Data URL
      const base64Data = newPhotoUrl.split(',')[1];
      const mimeType = newPhotoUrl.substring(newPhotoUrl.indexOf(':') + 1, newPhotoUrl.indexOf(';'));
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: "Write a short, artistic, sophisticated one-sentence caption for this photography portfolio image. Do not include quotes." }
          ]
        }
      });
      
      if (response.text) {
        setNewPhotoCaption(response.text);
      }
    } catch (error) {
      console.error("AI Generation Error", error);
      alert("Could not generate caption. Check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;
    onUpload({
      url: newPhotoUrl,
      caption: newPhotoCaption || 'Untitled',
      category: newPhotoCategory
    });
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12">
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
        </div>
      </div>

      {activeAdminTab === 'uploads' ? (
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Upload Form */}
          <div className="bg-white/5 p-8 border border-white/10 rounded-sm h-fit">
            <h3 className="text-xl font-serif text-white mb-6">Upload New Work</h3>
            
            <form onSubmit={handleUpload} className="space-y-6">
              
              {/* Image Preview / Input */}
              <div 
                className={`aspect-video w-full border-2 border-dashed border-white/20 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-yellow-600/50 transition-colors overflow-hidden relative ${!newPhotoUrl ? 'bg-black/30' : ''}`}
                onClick={() => !newPhotoUrl && fileInputRef.current?.click()}
              >
                {newPhotoUrl ? (
                  <>
                    <img src={newPhotoUrl} className="w-full h-full object-contain" alt="Preview" />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewPhotoUrl('');
                      }}
                      className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded-full hover:bg-red-900"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Click to select file or paste URL below</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {/* URL Fallback */}
              {!newPhotoUrl && (
                <div>
                   <input 
                    type="text" 
                    placeholder="Or paste image URL..."
                    className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm"
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                  />
                </div>
              )}

              {/* Caption & AI */}
              <div className="space-y-2">
                <label className="text-xs uppercase text-gray-500">Caption</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 p-3 text-white"
                    placeholder="Enter description..."
                  />
                  <button 
                    type="button"
                    disabled={!newPhotoUrl || isGenerating}
                    onClick={generateAICaption}
                    className="px-4 bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 disabled:opacity-50 flex items-center gap-2"
                    title="Generate with Gemini AI"
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span className="hidden md:inline">AI Caption</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase text-gray-500 block mb-2">Category</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 p-3 text-white"
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value)}
                >
                  <option>Portrait</option>
                  <option>Fashion</option>
                  <option>Wedding</option>
                  <option>Event</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={!newPhotoUrl}
                className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-800 disabled:text-gray-500 text-white uppercase tracking-widest text-sm"
              >
                Upload to Gallery
              </button>
            </form>
          </div>

          {/* Manage Existing */}
          <div className="space-y-4">
             <h3 className="text-xl font-serif text-white mb-6">Gallery Management</h3>
             {photos.length === 0 ? (
               <p className="text-gray-500 italic text-sm">No photos uploaded yet. Use the form to add your client's work.</p>
             ) : (
               <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                 {photos.map(p => (
                   <div key={p.id} className="relative group aspect-square">
                     <img src={p.url} className="w-full h-full object-cover rounded-sm border border-white/5" />
                     <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                       <p className="text-white text-xs mb-2 line-clamp-2">{p.caption}</p>
                       <button 
                         onClick={() => onDeletePhoto(p.id)}
                         className="px-3 py-1 bg-red-900/80 text-red-200 text-xs rounded hover:bg-red-800"
                       >
                         Delete
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No booking requests yet.</div>
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
                      <td className="p-4 whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</td>
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
    </div>
  );
};

const Footer = () => (
  <footer className="bg-black py-12 border-t border-white/10 text-center">
    <div className="flex justify-center gap-6 mb-8">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-yellow-500 transition-colors cursor-pointer">
        <Instagram size={20} />
      </div>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-yellow-500 transition-colors cursor-pointer">
        <Mail size={20} />
      </div>
    </div>
    <p className="font-serif text-gray-500 text-sm">© {new Date().getFullYear()} LOST x ROTIMI. All rights reserved.</p>
  </footer>
);

// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('lxr_photos');
    const savedBookings = localStorage.getItem('lxr_bookings');
    
    if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('lxr_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('lxr_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleBooking = (data: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: 'pending'
    };
    setBookings([newBooking, ...bookings]);
  };

  const handleUpload = (data: Omit<Photo, 'id' | 'dateAdded'>) => {
    const newPhoto: Photo = {
      ...data,
      id: crypto.randomUUID(),
      dateAdded: Date.now()
    };
    setPhotos([newPhoto, ...photos]);
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      setPhotos(photos.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-yellow-900 selection:text-white">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pt-20">
        {activeTab === 'home' && (
          <>
            <Hero onBookClick={() => setActiveTab('book')} />
            <Gallery photos={photos.slice(0, 6)} />
            <div className="text-center pb-24">
               <button 
                onClick={() => setActiveTab('gallery')}
                className="px-8 py-3 border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all uppercase tracking-widest text-sm"
               >
                 View Full Gallery
               </button>
            </div>
          </>
        )}
        
        {activeTab === 'gallery' && <Gallery photos={photos} />}
        
        {activeTab === 'book' && <BookingForm onBook={handleBooking} />}
        
        {activeTab === 'admin' && (
          <AdminDashboard 
            photos={photos} 
            bookings={bookings} 
            onUpload={handleUpload} 
            onDeletePhoto={handleDeletePhoto}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

export default App;