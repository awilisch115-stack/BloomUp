
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, Variants } from 'framer-motion';
import { Page, AppStep, StylePreset, RedesignResult, PlanType } from './types';
import { STYLE_PRESETS } from './constants';
import { redesignRoom, getDetailedPlan, searchNearbyStores, StoreResult } from './services/geminiService';
import BeforeAfterSlider from './components/BeforeAfterSlider';

const Logo: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const containerVariants: Variants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.2 } }
  };
  const leafVariants: Variants = {
    initial: { scale: 0, rotate: -20, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
  };
  const textVariants: Variants = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };
  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.05, filter: "drop-shadow(0 0 12px rgba(50, 205, 50, 0.3))", y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer group px-3 py-1 rounded-xl transition-all duration-300"
    >
      <motion.div variants={leafVariants} className="w-8 h-8 md:w-10 md:h-10">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M20 35C20 35 20 20 35 10C35 10 25 10 15 25" stroke="#061a10" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 35C20 35 20 25 5 15C5 15 12 12 20 25" stroke="#32CD32" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="35" r="2" fill="#061a10" />
        </svg>
      </motion.div>
      <motion.div variants={textVariants} className="flex font-sans font-black text-xl md:text-2xl tracking-tighter uppercase">
        <span className="text-[#061a10]">Bloom</span>
        <span className="text-[#32CD32]">Up</span>
      </motion.div>
    </motion.div>
  );
};

const HeroCarousel: React.FC = () => {
  const headlines = ["Renewal Starts Here", "Instant Yard Reset", "Reclaim Your Yard", "Restore What’s Lost"];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % headlines.length), 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="relative h-[25vh] md:h-[30vh] lg:h-[40vh] flex items-center justify-center overflow-hidden mb-12">
      <AnimatePresence mode="wait">
        <motion.h1
          key={index}
          initial={{ opacity: 0, y: 80, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -80, scale: 0.95, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], scale: { type: "spring", damping: 15, stiffness: 100 } }}
          className="absolute text-6xl md:text-8xl lg:text-[10rem] leading-[0.9] tracking-tighter font-medium w-full text-center px-4"
        >
          {headlines[index].split(' ').map((word, i) => (
            <React.Fragment key={i}>
              {i === headlines[index].split(' ').length - 1 ? <span className="italic font-light text-[#2d5a27]">{word}</span> : word + ' '}
            </React.Fragment>
          ))}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Upload your photo",
      text: "Start by uploading a photo of your yard. BloomUp will use it as the foundation for your custom garden design."
    },
    {
      number: "02",
      title: "Get inspiration!",
      text: "See your dream yard come to life and share your new outdoor space with friends and family."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-24 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
      {steps.map((step, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="relative group p-8 rounded-[32px] bg-white/40 border border-[#061a10]/5 backdrop-blur-sm"
        >
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-[#32CD32] font-black text-2xl md:text-3xl tracking-tighter">{step.number}.</span>
            <h3 className="serif text-2xl md:text-3xl font-bold">{step.title}</h3>
          </div>
          <p className="text-[#6b7a61] leading-relaxed text-sm md:text-base font-light">
            {step.text}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const BloomReveal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xPercent = useMotionValue(50);
  const smoothX = useSpring(xPercent, { damping: 30, stiffness: 200, mass: 0.8 });
  const clipPath = useTransform(smoothX, (v) => `inset(0 0 0 ${100 - v}%)`);
  const handleMove = (e: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left) / rect.width) * 100;
    xPercent.set(x);
  };
  return (
    <motion.div 
      ref={containerRef} onMouseMove={handleMove} onTouchMove={handleMove}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full aspect-[21/9] rounded-[40px] overflow-hidden group bg-neutral-200 shadow-2xl"
    >
      <img src="https://images.unsplash.com/photo-1594498653385-d5172c532c00?q=80&w=1600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Before" />
      <motion.div style={{ clipPath }} className="absolute inset-0 w-full h-full pointer-events-none">
        <img src="https://images.unsplash.com/photo-1558905734-b830302fa92c?q=80&w=1600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="After" />
      </motion.div>
      <motion.div style={{ left: useTransform(smoothX, (v) => `${v}%`) }} className="absolute top-0 bottom-0 w-1 bg-white/40 backdrop-blur-md z-20 pointer-events-none -translate-x-1/2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full blur-[2px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full blur-[2px]" />
      </motion.div>
    </motion.div>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [appStep, setAppStep] = useState<AppStep>(AppStep.UPLOAD);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [result, setResult] = useState<RedesignResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanType>(() => (localStorage.getItem('bloomup_plan') as PlanType) || 'FREE');
  const [attemptsToday, setAttemptsToday] = useState<number>(() => {
    const stored = localStorage.getItem('bloomup_attempts');
    const lastDate = localStorage.getItem('bloomup_last_date');
    const today = new Date().toDateString();
    if (lastDate !== today) {
      localStorage.setItem('bloomup_last_date', today);
      localStorage.setItem('bloomup_attempts', '0');
      return 0;
    }
    return stored ? parseInt(stored) : 0;
  });

  const [isSearchingStores, setIsSearchingStores] = useState(false);
  const [storeResults, setStoreResults] = useState<StoreResult[] | null>(null);

  useEffect(() => {
    localStorage.setItem('bloomup_plan', planType);
  }, [planType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setAppStep(AppStep.UPLOAD);
        setCurrentPage(Page.LAB);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartRedesign = async () => {
    if (!originalImage || !selectedStyle) return;
    
    // Plan Logic Check
    if (planType === 'FREE' && attemptsToday >= 2) {
      setError("You have reached your 2 free transformations for today. Upgrade to Pro for unlimited access.");
      return;
    }

    setAppStep(AppStep.PROCESSING);
    setError(null);
    try {
      const redesigned = await redesignRoom(originalImage, selectedStyle);
      const { inventory, guide, maintenanceChecklist } = await getDetailedPlan(selectedStyle);
      setResult({ 
        originalImage, 
        redesignedImage: redesigned, 
        style: selectedStyle, 
        inventory, 
        implementationGuide: guide,
        maintenanceChecklist
      });
      
      // Increment Attempts
      const newAttempts = attemptsToday + 1;
      setAttemptsToday(newAttempts);
      localStorage.setItem('bloomup_attempts', newAttempts.toString());
      
      setAppStep(AppStep.RESULT);
    } catch (err) {
      setError("Landscape synthesis interrupted. Try again.");
      setAppStep(AppStep.UPLOAD);
    }
  };

  const handleSearchStores = async () => {
    if (!result?.inventory) return;
    setIsSearchingStores(true);
    setStoreResults(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsSearchingStores(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const items = result.inventory.map(i => i.item);
          const stores = await searchNearbyStores(items, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setStoreResults(stores);
        } catch (err) {
          setError("Failed to locate sourcing partners.");
        } finally {
          setIsSearchingStores(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enable location to find sourcing stores.");
        setIsSearchingStores(false);
      }
    );
  };

  const resetAll = () => {
    setCurrentPage(Page.HOME);
    setAppStep(AppStep.UPLOAD);
    setOriginalImage(null);
    setResult(null);
    setStoreResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen text-[#061a10] bg-[#efede8] selection:bg-[#2d5a27] selection:text-white">
      <header className="fixed top-0 w-full z-50 glass px-6 md:px-12 py-4 flex justify-between items-center border-b border-[#061a10]/5">
        <Logo onClick={resetAll} />
        
        <div className="flex items-center gap-8">
          <div className="flex bg-[#061a10]/5 p-1 rounded-full text-[9px] font-black uppercase tracking-widest">
            <div className={`px-4 py-2 rounded-full transition-all ${planType === 'FREE' ? 'bg-[#061a10] text-white' : 'text-[#6b7a61]'}`}>Free</div>
            <div className={`px-4 py-2 rounded-full transition-all ${planType === 'PRO' ? 'bg-[#2d5a27] text-white' : 'text-[#6b7a61]'}`}>Pro</div>
          </div>

          <nav className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#6b7a61]">
            <button onClick={() => setCurrentPage(Page.LAB)} className={`hover:text-[#061a10] transition-colors ${currentPage === Page.LAB ? 'text-[#061a10]' : ''}`}>Lab</button>
            <button onClick={() => setCurrentPage(Page.PLANS)} className={`hover:text-[#061a10] transition-colors ${currentPage === Page.PLANS ? 'text-[#061a10]' : ''}`}>Plans</button>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-32 max-w-[1400px] mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          {currentPage === Page.HOME && (
            <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center pt-20">
              <div className="inline-block px-6 py-2 rounded-full glass-dark text-[9px] font-black uppercase tracking-[0.5em] mb-12">
                Landscape Elevation Lab 1.0 — {planType === 'FREE' ? `Attempts: ${attemptsToday}/2` : 'Unlimited Pro Access'}
              </div>
              <HeroCarousel />
              <p className="text-xl md:text-2xl text-[#6b7a61] max-w-3xl mx-auto mb-16 font-light leading-relaxed">Level up your landscape in one click.</p>
              
              <HowItWorks />

              <div className="mb-24"><BloomReveal /></div>
              <div className="flex justify-center mb-32">
                <motion.label whileHover={{ scale: 1.05, backgroundColor: "#143627" }} whileTap={{ scale: 0.98 }} className="bg-[#061a10] text-[#efede8] px-12 py-6 rounded-full font-bold text-lg cursor-pointer shadow-2xl flex items-center gap-4">
                  <span>Start the transformation</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </motion.label>
              </div>
            </motion.div>
          )}

          {currentPage === Page.LAB && (
            <motion.div key="lab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {appStep === AppStep.UPLOAD && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 pt-10">
                  <div className="lg:col-span-8">
                    {error && (
                      <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-[32px] mb-12 flex flex-col items-center text-center gap-4 shadow-xl">
                        <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="font-bold text-xl uppercase tracking-tighter">{error}</p>
                        {planType === 'FREE' && (
                          <button onClick={() => setCurrentPage(Page.PLANS)} className="bg-[#061a10] text-white px-8 py-3 rounded-full text-xs font-black tracking-widest uppercase hover:bg-black transition-all">Upgrade Now</button>
                        )}
                      </motion.div>
                    )}
                    <h2 className="text-5xl font-bold mb-4 tracking-tighter uppercase">BLOOMUP BLOGS</h2>
                    <p className="text-[#6b7a61] text-lg font-light leading-relaxed mb-12 max-w-2xl">
                      A synthesis of botanical beauty and modern design. Get inspired by our latest perspectives on the living landscape.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {STYLE_PRESETS.map((style) => (
                        <motion.button key={style.id} onClick={() => setSelectedStyle(style)} whileHover={{ scale: 1.02, y: -5 }} className={`p-6 rounded-[32px] border-2 transition-all ${selectedStyle.id === style.id ? 'border-[#143627] bg-white shadow-xl' : 'border-transparent bg-white/40'}`}>
                          <img src={style.image} className="w-full aspect-video object-cover rounded-[20px] mb-6 grayscale hover:grayscale-0 transition-all duration-700" alt={style.name} />
                          <h4 className="font-bold text-2xl uppercase tracking-tighter text-left">{style.name}</h4>
                          <p className="text-[10px] uppercase font-black tracking-widest text-[#6b7a61] text-left mt-2">{style.description}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <div className="sticky top-32 space-y-10">
                      <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-[#061a10]/5">
                        <div className="aspect-[3/4] bg-[#efede8] rounded-[24px] overflow-hidden relative flex items-center justify-center group">
                          {originalImage ? <img src={originalImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" /> : <div className="text-center p-8 opacity-30"><svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="1.5"/></svg><p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Photo</p></div>}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {originalImage && (
                          <button onClick={handleStartRedesign} disabled={planType === 'FREE' && attemptsToday >= 2} className={`w-full bg-[#061a10] text-[#efede8] py-6 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl ${planType === 'FREE' && attemptsToday >= 2 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-102'}`}>
                            {planType === 'FREE' ? `Start Transformation (${2 - attemptsToday} left)` : 'Start Unlimited Synthesis'}
                          </button>
                        )}
                        <label className="w-full bg-white/50 text-[#061a10] py-4 rounded-full font-bold text-sm cursor-pointer flex justify-center hover:bg-white transition-all border border-black/5">Replace Photo <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/></label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {appStep === AppStep.PROCESSING && (
                <div className="flex flex-col items-center justify-center py-48 text-center">
                   <div className="loader-dots flex gap-6 mb-12"><div className="w-6 h-6 rounded-full"></div><div className="w-6 h-6 rounded-full"></div><div className="w-6 h-6 rounded-full"></div></div>
                   <h2 className="text-5xl font-bold uppercase tracking-tighter mb-4">Cultivating Space...</h2>
                   <p className="text-[#6b7a61] text-xl font-light italic">BloomUp is restoring your landscape's original order.</p>
                </div>
              )}

              {appStep === AppStep.RESULT && result && (
                <div className="space-y-32 pb-40">
                  <div className="space-y-20">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#6b7a61] mb-4 block">Archive: BLOOM-SYN-102 | Tier: {planType}</span>
                        <h2 className="text-6xl font-bold tracking-tighter uppercase">Transformation <span className="italic font-light text-[#2d5a27]">Blueprint</span></h2>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setAppStep(AppStep.UPLOAD)} className="p-5 bg-white rounded-full shadow-lg hover:bg-[#efede8] transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                        <a href={result.redesignedImage} download="bloomup_restoration.png" className="bg-[#061a10] text-[#efede8] px-10 py-5 rounded-full font-bold text-sm tracking-widest uppercase shadow-xl hover:bg-[#143627] transition-colors">Export Plan</a>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-[56px] shadow-2xl border border-black/5">
                      <BeforeAfterSlider before={result.originalImage} after={result.redesignedImage} />
                    </div>
                  </div>

                  <section className="bg-[#1a1a1a] text-[#efede8] p-16 rounded-[48px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#32CD32]/10 blur-[100px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col lg:flex-row gap-20">
                      <div className="lg:w-1/3 space-y-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#6b7a61]">Expert Protocol</span>
                        <h3 className="serif text-4xl font-bold italic leading-tight">Professional <br/> Maintenance <span className="not-italic text-[#32CD32]">Checklist</span></h3>
                        <div className="h-px bg-white/10 w-24"></div>
                        <p className="text-sm font-light leading-relaxed text-[#6b7a61]">Strict adherence to these bullet points ensures the synthesized state remains consistent with the architectural vision.</p>
                      </div>
                      <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {result.maintenanceChecklist.map((point, i) => (
                          <div key={i} className="flex gap-4 group">
                            <div className="w-6 h-6 bg-[#32CD32] rounded-full flex items-center justify-center flex-shrink-0 text-[#061a10] mt-1 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(50,205,50,0.4)]">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                            </div>
                            <p className="text-sm font-light leading-relaxed group-hover:text-white transition-colors">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-12">
                    <div className="flex items-center gap-6"><h3 className="serif text-4xl font-bold tracking-tighter uppercase">The Living Specs</h3><div className="h-px bg-black/10 flex-grow"></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {result.inventory.map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4"><h4 className="font-bold text-lg uppercase tracking-tight">{item.item}</h4><span className="bg-[#32CD32]/10 text-[#2d5a27] px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{item.priceRange}</span></div>
                          <p className="text-sm text-[#6b7a61] leading-relaxed font-light">{item.description}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Maps Grounding Section */}
                    <div className="mt-20 bg-white/40 p-12 rounded-[48px] border border-[#061a10]/5 space-y-10">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left">
                          <h4 className="serif text-3xl font-bold uppercase tracking-tight">Sourcing Partners</h4>
                          <p className="text-sm text-[#6b7a61] font-light mt-2">Find the nearest garden centers and equipment suppliers for these items.</p>
                        </div>
                        <button 
                          onClick={handleSearchStores} 
                          disabled={isSearchingStores}
                          className="bg-[#061a10] text-[#efede8] px-10 py-5 rounded-full font-bold text-[11px] tracking-widest uppercase shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                        >
                          {isSearchingStores ? 'Scanning Perimeter...' : 'Locate Nearby Stores'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {storeResults && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden"
                          >
                            {storeResults.map((store, i) => (
                              <motion.a 
                                key={i}
                                href={store.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 bg-white rounded-3xl border border-black/5 flex items-center justify-between group hover:border-[#32CD32] transition-colors"
                              >
                                <span className="font-bold text-[11px] uppercase tracking-tight truncate pr-4">{store.title}</span>
                                <div className="w-8 h-8 bg-[#32CD32]/10 rounded-full flex items-center justify-center text-[#2d5a27] group-hover:bg-[#32CD32] group-hover:text-white transition-all">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                              </motion.a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>
                  
                  <section className="space-y-16">
                    <div className="text-center max-w-2xl mx-auto"><h3 className="serif text-5xl font-bold uppercase mb-4">Implementation Protocol</h3><div className="w-12 h-px bg-[#061a10]/20 mx-auto mt-8"></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {result.implementationGuide.map((step, i) => (
                        <div key={i} className="relative group">
                          <div className="absolute -top-6 -left-4 text-8xl font-black text-[#061a10]/5 select-none transition-colors group-hover:text-[#32CD32]/10">{i + 1}</div>
                          <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm relative z-10 h-full">
                            <span className="text-[9px] font-black text-[#2d5a27] tracking-[0.3em] uppercase block mb-4">Step {i+1}</span>
                            <h4 className="serif text-2xl font-bold mb-6">{step.title}</h4>
                            <ul className="space-y-4">{step.actions.map((action, j) => (<li key={j} className="text-[11px] leading-relaxed font-light text-[#6b7a61] flex gap-3"><div className="w-1 h-1 bg-[#32CD32] rounded-full mt-1.5 flex-shrink-0"></div>{action}</li>))}</ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </motion.div>
          )}

          {currentPage === Page.PLANS && (
            <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-12 pb-32">
              <div className="max-w-5xl mx-auto space-y-32">
                <section className="text-center space-y-12">
                   <h2 className="serif text-5xl md:text-7xl font-light italic text-[#1a1a1a]">Choose your <span className="font-bold not-italic text-[#2d5a27]">Experience</span></h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 items-stretch">
                     {/* Free Plan */}
                     <div className={`p-12 rounded-[48px] border flex flex-col transition-all bg-white/40 border-black/5`}>
                        <div className="mb-8">
                          <h3 className="serif text-3xl font-bold mb-2">Free Plan</h3>
                          <div className="w-12 h-px bg-black/10 mx-auto"></div>
                        </div>
                        <ul className="text-left space-y-6 mb-12 flex-grow">
                          <li className="text-[11px] uppercase font-bold tracking-[0.2em] flex items-start gap-4 text-[#6b7a61]">
                            <div className="w-2 h-2 bg-black rounded-full mt-1 flex-shrink-0"></div>
                            2 image transformations per day
                          </li>
                          <li className="text-[11px] uppercase font-bold tracking-[0.2em] flex items-start gap-4 text-[#6b7a61]">
                            <div className="w-2 h-2 bg-black rounded-full mt-1 flex-shrink-0"></div>
                            standard garden improvement suggestions
                          </li>
                        </ul>
                        <div className="py-5 text-center text-[10px] font-black uppercase tracking-widest text-[#061a10]/40">Active by Default</div>
                     </div>

                     {/* Pro Plan */}
                     <div className={`p-12 rounded-[48px] border flex flex-col transition-all relative overflow-hidden border-[#2d5a27] bg-white shadow-2xl`}>
                        <div className="absolute top-0 right-0 p-4">
                           <span className="bg-[#32CD32] text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">Premium</span>
                        </div>
                        <div className="mb-8">
                          <h3 className="serif text-3xl font-bold">Pro Version</h3>
                          <div className="text-[#32CD32] font-black text-xl mt-1">€4.99 per month</div>
                          <div className="w-12 h-px bg-[#32CD32]/30 mx-auto mt-6"></div>
                        </div>
                        <ul className="text-left space-y-6 mb-12 flex-grow">
                          <li className="text-[11px] uppercase font-black tracking-[0.2em] flex items-start gap-4 text-[#061a10]">
                            <div className="w-2 h-2 bg-[#32CD32] rounded-full mt-1 flex-shrink-0"></div>
                            unlimited image transformations per day
                          </li>
                          <li className="text-[11px] uppercase font-black tracking-[0.2em] flex items-start gap-4 text-[#061a10]">
                            <div className="w-2 h-2 bg-[#32CD32] rounded-full mt-1 flex-shrink-0"></div>
                            powerful, detailed tips
                          </li>
                          <li className="text-[11px] uppercase font-black tracking-[0.2em] flex items-start gap-4 text-[#061a10]">
                            <div className="w-2 h-2 bg-[#32CD32] rounded-full mt-1 flex-shrink-0"></div>
                            specific product recommendations: tools, fertilizers, equipment
                          </li>
                        </ul>
                        <button onClick={() => setCurrentPage(Page.PAYMENT)} className="w-full py-5 bg-[#2d5a27] text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-[#143627] hover:scale-102 transition-all">
                          Go Pro
                        </button>
                     </div>
                   </div>
                </section>
              </div>
            </motion.div>
          )}

          {currentPage === Page.PAYMENT && (
            <motion.div key="payment" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pt-24 pb-32 max-w-xl mx-auto">
              <div className="bg-white p-12 rounded-[56px] shadow-2xl border border-black/5 space-y-12">
                <div className="text-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#6b7a61] block mb-4">Secure Checkout</span>
                  <h2 className="serif text-4xl font-bold tracking-tighter uppercase">Select Payment</h2>
                </div>
                
                <div className="space-y-4">
                  {[
                    { name: 'Credit or Debit Card', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                    { name: 'PayPal', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                    { name: 'Apple Pay', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }
                  ].map((method) => (
                    <button key={method.name} onClick={() => { setPlanType('PRO'); setCurrentPage(Page.LAB); }} className="w-full p-6 bg-[#efede8] rounded-3xl flex items-center gap-6 hover:bg-white border-2 border-transparent hover:border-[#32CD32] transition-all group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#2d5a27] group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={method.icon} /></svg>
                      </div>
                      <span className="font-bold text-sm uppercase tracking-widest">{method.name}</span>
                    </button>
                  ))}
                </div>
                
                <button onClick={() => setCurrentPage(Page.PLANS)} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-[#6b7a61] hover:text-[#061a10] transition-colors">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-black/5 py-20 px-8 bg-white/30 backdrop-blur-xl mt-auto relative z-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-[#6b7a61] text-[9px] font-black uppercase tracking-[0.5em]">
          <div>© 2024 BloomUp Labs. <br/> Algorithmic Exterior Protocol.</div>
          <div className="flex gap-10"><a href="#" className="hover:text-[#061a10] transition-all">Mission</a><a href="#" className="hover:text-[#061a10] transition-all">Ecology</a><a href="#" className="hover:text-[#061a10] transition-all">Contact</a></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
