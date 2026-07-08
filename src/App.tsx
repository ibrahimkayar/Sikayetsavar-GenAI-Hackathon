/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Truck, 
  Package, 
  CreditCard, 
  UserCheck, 
  Globe, 
  Instagram, 
  Mail, 
  Plus, 
  Brain, 
  Lightbulb, 
  History, 
  ChevronRight, 
  ShieldAlert,
  ArrowRight,
  Info,
  Layers,
  FileText,
  Video,
  Clapperboard,
  Film,
  Tv,
  ArrowDown,
  Palette,
  Image,
  Sliders,
  Download,
  Layout,
  Type,
  Award,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Eye,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProcessResult, CustomBrand } from "./types";

const getPosterImage = (brandName: string) => {
  const nameLower = brandName.toLowerCase();
  if (nameLower.includes("kargo") || nameLower.includes("lojistik") || nameLower.includes("shipping")) {
    return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"; // Modern logistics / shipping package
  } else if (nameLower.includes("lezzet") || nameLower.includes("sepeti") || nameLower.includes("yemek") || nameLower.includes("food")) {
    return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"; // Delicious modern food / pizza slice
  } else if (nameLower.includes("nova") || nameLower.includes("tech") || nameLower.includes("yazılım")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"; // Tech circuit / microchip
  }
  return "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=600&q=80"; // Minimalist professional design
};

export default function App() {
  const [complaint, setComplaint] = useState("");
  const [showHackathonReport, setShowHackathonReport] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("1");
  const [selectedChannel, setSelectedChannel] = useState<string>("Sosyal Medya");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"none" | "analyzing" | "inverting" | "generating">("none");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [history, setHistory] = useState<ProcessResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Ad Poster States
  const [posterStyle, setPosterStyle] = useState<string>("Minimal & Bold");
  const [posterLoading, setPosterLoading] = useState(false);
  const [copiedPosterPrompt, setCopiedPosterPrompt] = useState(false);

  // Live Editor States (for when poster is generated, allowing user customization)
  const [editedHeadline, setEditedHeadline] = useState("");
  const [editedSubheadline, setEditedSubheadline] = useState("");
  const [editedCta, setEditedCta] = useState("");
  const [editedPrimaryColor, setEditedPrimaryColor] = useState("#0F172A");
  const [editedSecondaryColor, setEditedSecondaryColor] = useState("#F8FAFC");
  const [editedAccentColor, setEditedAccentColor] = useState("#FACC15");
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");
  const [isFullscreenPoster, setIsFullscreenPoster] = useState(false);

  const generateAdPoster = async () => {
    if (!result || !result.campaign || !result.opportunity) return;
    setPosterLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-ad-poster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          campaignText: result.campaign.campaignText,
          opportunityTheme: result.opportunity.opportunityTheme,
          brandName: result.brandName,
          layoutStyle: posterStyle
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Reklam afişi üretilemedi.");
      }

      const updatedResult = {
        ...result,
        adPoster: data
      };
      setResult(updatedResult);
      
      // Initialize editor states
      setEditedHeadline(data.headline);
      setEditedSubheadline(data.subheadline);
      setEditedCta(data.ctaText);
      setEditedPrimaryColor(data.colorPalette.primary);
      setEditedSecondaryColor(data.colorPalette.secondary);
      setEditedAccentColor(data.colorPalette.accent);

      saveToHistory(updatedResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Afiş konsepti üretilirken bir hata oluştu.");
    } finally {
      setPosterLoading(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPosterPrompt(true);
    setTimeout(() => setCopiedPosterPrompt(false), 2000);
  };

  // Custom Brand State
  const [customBrands, setCustomBrands] = useState<CustomBrand[]>([
    { id: "1", name: "Hızlı Kargo", sector: "E-Ticaret / Lojistik", voice: "Samimi, güven veren, abartısız" },
    { id: "2", name: "Lezzet Sepeti", sector: "Yemek / Restoran", voice: "Neşeli, iştah açıcı, samimi" },
    { id: "3", name: "TechNova", sector: "Teknoloji / SaaS", voice: "Profesyonel, vizyoner, sade" }
  ]);

  // Brand Modal/Form State
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandSector, setNewBrandSector] = useState("");
  const [newBrandVoice, setNewBrandVoice] = useState("");

  const currentBrand = customBrands.find(b => b.id === selectedBrandId) || customBrands[0];

  const testCases = [
    {
      title: "Kargo Gecikmesi (Normal)",
      text: "Siparişim 4 gündür yolda görünüyor ama hala şubeden çıkış yapmadı. Acil yetişmesi gerekiyordu, çok mağdur oldum.",
      description: "Lojistik/Kargo kategorisinde standart olumsuz şikayet."
    },
    {
      title: "Ürün Kalitesi (Normal)",
      text: "Gelen tişörtün dikişleri sökülmüştü ve kumaşı görseldekinden çok daha ince. Hayal kırıklığına uğradım.",
      description: "Ürün hatası ve kalite şikayeti."
    },
    {
      title: "Ciddi Sağlık / Güvenlik Riski (Etik Engel)",
      text: "Aldığım bebek mamasının içinden siyah tel gibi yabancı madde çıktı! Bebeğime yedirecektim, son anda fark ettim. Bu nasıl bir sorumsuzluk, bebekler zehirlenebilirdi!",
      description: "Güvenlik riski. Sistem bunu yüksek ciddiyet algılayıp pazarlama aşamasını engellemelidir."
    },
    {
      title: "Argo / Öfkeli Yorum",
      text: "Allah belanızı versin, paramızı çöpe atıyoruz resmen! Rezalet ötesi bir hizmet, dolandırıcı mısınız nesiniz siz ya?!",
      description: "Modelin aşırı öfkeli dili kontrol etmesi için test girdisi."
    },
    {
      title: "Çok Kısa / Belirsiz Yorum",
      text: "kötü",
      description: "Bilgi yetersizliği olan, uydurmaya meyilli kısa girdi testi."
    }
  ];

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("complaint_pipeline_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("History could not be loaded", e);
      }
    }
  }, []);

  const saveToHistory = (newResult: ProcessResult) => {
    const updated = [newResult, ...history.filter(h => h.id !== newResult.id)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("complaint_pipeline_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("complaint_pipeline_history");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim() || !newBrandSector.trim() || !newBrandVoice.trim()) return;

    const brand: CustomBrand = {
      id: Math.random().toString(36).substring(7),
      name: newBrandName,
      sector: newBrandSector,
      voice: newBrandVoice
    };

    const updated = [...customBrands, brand];
    setCustomBrands(updated);
    setSelectedBrandId(brand.id);
    
    // Clear inputs
    setNewBrandName("");
    setNewBrandSector("");
    setNewBrandVoice("");
    setShowBrandForm(false);
  };

  const processPipeline = async (inputText: string = complaint) => {
    if (!inputText.trim()) {
      setError("Lütfen bir şikayet metni girin.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    // Dynamic loading status messages
    try {
      setLoadingStep("analyzing");
      await new Promise(r => setTimeout(r, 1200));

      setLoadingStep("inverting");
      await new Promise(r => setTimeout(r, 1500));

      setLoadingStep("generating");
      await new Promise(r => setTimeout(r, 1200));

      const response = await fetch("/api/process-complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          complaint: inputText,
          brandName: currentBrand.name,
          channel: selectedChannel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sunucuda hata meydana geldi.");
      }

      setResult(data);
      if (data.adPoster) {
        setEditedHeadline(data.adPoster.headline);
        setEditedSubheadline(data.adPoster.subheadline);
        setEditedCta(data.adPoster.ctaText);
        setEditedPrimaryColor(data.adPoster.colorPalette.primary);
        setEditedSecondaryColor(data.adPoster.colorPalette.secondary);
        setEditedAccentColor(data.adPoster.colorPalette.accent);
      }
      saveToHistory(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bir şeyler yanlış gitti.");
    } finally {
      setLoading(false);
      setLoadingStep("none");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "kargo": return <Truck className="w-5 h-5 text-indigo-500" />;
      case "ürün": return <Package className="w-5 h-5 text-orange-500" />;
      case "fiyat": return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case "hizmet": return <UserCheck className="w-5 h-5 text-blue-500" />;
      default: return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "yüksek":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Yüksek Ciddiyet
          </span>
        );
      case "orta":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Orta Ciddiyet
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Düşük Ciddiyet
          </span>
        );
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "negatif":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
            Negatif
          </span>
        );
      case "nötr":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
            Nötr
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
            Pozitif
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-slate-900 tracking-tight">
                ŞİKAYETSAVAR
              </h1>
              <p className="text-xs text-slate-500 font-sans hidden sm:block">
                Müşteri Şikayetlerini Pazarlama Fırsatlarına Dönüştürme Platformu
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHackathonReport(true)}
              className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-white" />
              <span>Hackathon Raporu & Etik Panel</span>
            </button>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-600 hidden md:inline-block">
              Powered by Gemini 3.5 Flash
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Girdi ve Ayarlar */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Şikayet Girdisi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Müşteri Şikayeti Girdisi
              </h2>
              <button 
                onClick={() => setComplaint("")}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                title="Girdiyi temizle"
              >
                Temizle
              </button>
            </div>

            <textarea
              id="complaint-input"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Müşterinin şikayet veya yorumunu buraya yapıştırın..."
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans text-sm text-slate-800 placeholder-slate-400 resize-none transition-all shadow-inner"
            />

            {/* Test Case Picker */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                Hızlı Test Senaryoları (Tıkla ve Dene):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {testCases.map((tc, idx) => {
                  let emoji = "📝";
                  if (tc.title.includes("Muzlar")) emoji = "🍌";
                  else if (tc.title.includes("Kargo")) emoji = "📦";
                  else if (tc.title.includes("Kalitesi")) emoji = "👕";
                  else if (tc.title.includes("Sağlık")) emoji = "⚠️";
                  else if (tc.title.includes("Argo")) emoji = "🔥";

                  const isSelected = complaint === tc.text;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setComplaint(tc.text);
                        setError(null);
                      }}
                      className={`text-[11px] px-2.5 py-1.5 rounded-xl border text-left transition-all font-semibold flex items-center gap-1.5 shadow-3xs cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm scale-[1.02]" 
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                      title={tc.description}
                    >
                      <span className="text-xs shrink-0">{emoji}</span>
                      <span className="truncate max-w-[170px]">{tc.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Marka ve Kanal Yapılandırması */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Marka ve Mecra Ayarları
              </h2>
              <button
                onClick={() => setShowBrandForm(!showBrandForm)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Marka Ekle
              </button>
            </div>

            {/* Brand Add Inline Form */}
            <AnimatePresence>
              {showBrandForm && (
                <motion.form
                  onSubmit={handleAddBrand}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 overflow-hidden"
                >
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Kurgusal Marka Adı</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Hızlı Kargo, Lezzet Sepeti"
                      value={newBrandName}
                      onChange={e => setNewBrandName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sektör</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: E-Ticaret"
                        value={newBrandSector}
                        onChange={e => setNewBrandSector(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Marka Sesi</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Samimi, dürüst"
                        value={newBrandVoice}
                        onChange={e => setNewBrandVoice(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowBrandForm(false)}
                      className="text-xs px-2.5 py-1 rounded-md text-slate-500 hover:bg-slate-200 font-medium"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="text-xs px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                    >
                      Kaydet
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Brand Selection List */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Hedef Marka</label>
              <div className="grid grid-cols-3 gap-2">
                {customBrands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrandId(b.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedBrandId === b.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <p className={`font-semibold text-xs truncate ${selectedBrandId === b.id ? "text-white" : "text-slate-900"}`}>{b.name}</p>
                    <p className={`text-[10px] truncate ${selectedBrandId === b.id ? "text-indigo-200" : "text-slate-400"}`}>{b.sector}</p>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-sans">
                <span>Ses Tonu:</span>
                <span className="font-semibold text-slate-600 italic">{currentBrand.voice}</span>
              </div>
            </div>

            {/* Campaign Channel */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Yayınlanacak Mecra</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Sosyal Medya", label: "Sosyal Medya", icon: <Instagram className="w-4 h-4" /> },
                  { id: "E-posta", label: "E-Posta Bülteni", icon: <Mail className="w-4 h-4" /> },
                  { id: "Web Sitesi", label: "Web Sitesi Banner", icon: <Globe className="w-4 h-4" /> }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                      selectedChannel === ch.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    {ch.icon}
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2.5 text-xs text-rose-800 font-sans shadow-xs">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div className="font-bold text-slate-900">
                  {error.includes("quota") || error.includes("Quota") || error.includes("429") || error.includes("RESOURCE_EXHAUSTED") || error.includes("limit")
                    ? "Günlük Gemini Yapay Zeka İstek Sınırına Ulaşıldı (Quota Exceeded)"
                    : "İşlem Sırasında Bir Hata Oluştu"}
                </div>
              </div>
              
              {(error.includes("quota") || error.includes("Quota") || error.includes("429") || error.includes("RESOURCE_EXHAUSTED") || error.includes("limit")) ? (
                <div className="space-y-2 text-slate-600 pl-6 leading-relaxed">
                  <p>
                    Samsung Innovation Camp Hackathonu için paylaşılan bu ortak önizleme linkinde, <b>Gemini 3.5 Flash (Ücretsiz Sürüm) günlük istek kotası (20 istek)</b> diğer kullanıcılarımızın yoğun denemeleri nedeniyle dolmuştur.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950 space-y-1.5">
                    <p className="font-bold flex items-center gap-1 text-[11px] text-amber-900">
                      💡 Etkileşimli Modu Keşfedin (Kota Engeline Takılmaz):
                    </p>
                    <p className="text-[10px] leading-relaxed">
                      Yapay zeka kotası dolmuş olsa bile, sistemimizde hazır yüklü gelen <b>NANOBANANA</b> demosunu inceleyebilir, sağ paneldeki <b>Afiş Düzenleyici</b> ile sloganları, renkleri ve afiş şablon stillerini tamamen canlandırarak deneyimleyebilirsiniz!
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 pl-6">{error}</p>
              )}
            </div>
          )}

          <button
            id="process-pipeline-button"
            disabled={loading || !complaint.trim()}
            onClick={() => processPipeline()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-indigo-100 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Dönüştürülüyor...
              </span>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" />
                Dönüşümü Başlat (3-Adım Pipeline)
              </>
            )}
          </button>

          {/* History List */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> Geçmiş Analizler ({history.length})
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-[11px] text-red-500 hover:text-red-700 font-medium"
                >
                  Tümünü Sil
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setResult(h);
                      setComplaint(h.complaint);
                      const associatedBrand = customBrands.find(b => b.name === h.brandName);
                      if (associatedBrand) {
                        setSelectedBrandId(associatedBrand.id);
                      }
                      setSelectedChannel(h.channel);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${
                      result?.id === h.id
                        ? "bg-slate-50 border-slate-300 ring-1 ring-slate-300"
                        : "bg-white hover:bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="truncate flex-1">
                      <p className="font-semibold text-slate-800 truncate">{h.complaint}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                        {h.brandName} • {h.channel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {h.requiresHumanIntervention ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-[9px] border border-rose-100">Etik Engel</span>
                      ) : (
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded text-[9px] border border-indigo-100">Dönüştü</span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Çıktı ve Analiz Sonuçları */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            
            {/* Loading State Animation */}
            {loading && (
              <motion.div
                key="loading-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[450px]"
              >
                {/* Modern visual pulsing element */}
                <div className="relative flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full animate-ping absolute opacity-75"></div>
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center relative shadow-inner">
                    <Brain className="w-7 h-7 text-indigo-600 animate-pulse" />
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-slate-800 mb-2">
                  Gemini Pipeline İşleniyor
                </h3>
                <p className="text-sm text-slate-500 max-w-sm text-center mb-6">
                  Müşteri şikayeti 3 ardışık akıllı aşamadan geçirilerek pazarlama vizyonuna dönüştürülüyor.
                </p>

                {/* Vertical Process Steps Loading Visual */}
                <div className="w-full max-w-xs space-y-3.5">
                  {[
                    { id: "analyzing", label: "Aşama 1: Kategori, Duygu ve Ciddiyet Analizi", activeMsg: "Şikayet semantiği analiz ediliyor..." },
                    { id: "inverting", label: "Aşama 2: Çözüm Odaklı Stratejik Fırsat Keşfi", activeMsg: "Chain-of-thought ile fırsat teması kuruluyor..." },
                    { id: "generating", label: "Aşama 3: Regüle Kampanya Metni Üretimi", activeMsg: "Ses tonu ve etik kısıtlamalar uygulanıyor..." }
                  ].map((step, idx) => {
                    const isPassed = (loadingStep === "inverting" && idx === 0) || 
                                     (loadingStep === "generating" && (idx === 0 || idx === 1));
                    const isCurrent = loadingStep === step.id;

                    return (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="mt-1">
                          {isPassed ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                              <Check className="w-2.5 h-2.5 stroke-[3px]" />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300"></div>
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${isCurrent ? "text-indigo-600" : isPassed ? "text-slate-800" : "text-slate-400"}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-[11px] text-indigo-500 mt-0.5 animate-pulse font-sans">
                              {step.activeMsg}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Empty State / Schema Diagram */}
            {!loading && !result && (
              <motion.div
                key="empty-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center min-h-[450px] flex flex-col justify-center"
              >
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
                  <Brain className="w-8 h-8" />
                </div>
                
                <h3 className="font-display font-bold text-lg text-slate-800 mb-2">
                  Dönüşüm Odası Hazır
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 font-sans">
                  Şikayeti sola girip hedef marka ve mecrayı ayarlayarak sistemin şikayeti somut bir pazarlama fikrine ve kontrollü bir reklama nasıl dönüştürdüğünü görün.
                </p>

                {/* Pipeline Flowchart Visual */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-lg mx-auto w-full">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">
                    3-Aşama Dönüşüm Boru Hattı (Pipeline) Akışı
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center text-center">
                    
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs">
                      <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Girdi</p>
                      Müşteri Şikayeti
                    </div>
                    
                    <div className="flex justify-center md:rotate-0 rotate-90 text-slate-300">
                      <ArrowRight className="w-4 h-4 md:block hidden" />
                      <span className="md:hidden">↓</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs">
                      <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Aşama 1</p>
                      Kategori & Ciddiyet
                    </div>

                    <div className="flex justify-center md:rotate-0 rotate-90 text-slate-300">
                      <ArrowRight className="w-4 h-4 md:block hidden" />
                      <span className="md:hidden">↓</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs col-span-1 md:col-start-1 md:col-end-2 md:mt-3">
                      <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Aşama 2</p>
                      Fırsat Çevirimi
                    </div>

                    <div className="flex justify-center md:rotate-0 rotate-90 text-slate-300 md:mt-3">
                      <ArrowRight className="w-4 h-4 md:block hidden" />
                      <span className="md:hidden">↓</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/50 shadow-2xs col-span-1 md:col-start-3 md:col-end-5 md:mt-3">
                      <p className="text-[9px] uppercase font-bold text-indigo-400 mb-1">Aşama 3</p>
                      Regüle Kampanya Kopya Metni
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* Result Display Output */}
            {!loading && result && (
              <motion.div
                key="result-container"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                
                {/* 1. Aşama: Analiz Çıktısı */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      AŞAMA 1: ŞİKAYET ANALİZİ (Zero-Shot)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {/* Category Badge Card */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-2xs">
                        {getCategoryIcon(result.analysis.category)}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Kategori</p>
                        <p className="text-xs font-semibold text-slate-800 uppercase mt-0.5">{result.analysis.category}</p>
                      </div>
                    </div>

                    {/* Sentiment Badge Card */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-2xs">
                        <CheckCircle2 className={`w-4 h-4 ${result.analysis.sentiment === "negatif" ? "text-red-500" : "text-emerald-500"}`} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Duygu Analizi</p>
                        <div className="mt-0.5">{getSentimentBadge(result.analysis.sentiment)}</div>
                      </div>
                    </div>

                    {/* Severity Badge Card */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-2xs">
                        <AlertTriangle className={`w-4 h-4 ${result.analysis.severity === "yüksek" ? "text-rose-500" : "text-amber-500"}`} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Ciddiyet Seviyesi</p>
                        <div className="mt-0.5">{getSeverityBadge(result.analysis.severity)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Özetlenen Ana Sorun:</p>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 text-sm font-medium italic">
                      "{result.analysis.mainIssue || "Sorun özetlenemedi."}"
                    </div>
                  </div>
                </div>

                {/* ETHICAL PROTECTION BLOCK - Eğer ciddiyet YÜKSEK ise kampanya üretimini engelle */}
                {result.requiresHumanIntervention ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-xs relative overflow-hidden"
                  >
                    {/* Visual warning background pattern */}
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-rose-900 select-none pointer-events-none">
                      <ShieldAlert className="w-40 h-40" />
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-700 shrink-0 shadow-xs">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-display font-bold text-rose-900 text-base flex items-center gap-2">
                          ⚠️ Etik & Güvenlik Kilidi Devreye Girdi
                        </h4>
                        <p className="text-xs font-semibold text-rose-500 tracking-wider uppercase font-mono">
                          DOĞRUDAN PAZARLAMA ENGELLENDİ
                        </p>
                        <p className="text-sm text-rose-800 font-sans leading-relaxed">
                          Yapay Zeka Etik Değerlendirme Modülü, şikayetin <b>ciddiyet seviyesini "Yüksek"</b> olarak saptadı. Ciddi sağlık, güvenlik veya yasal sorumluluk içeren şikayetlerin pazarlama vaadine dönüştürülmesi kurum etiği açısından sakıncalıdır.
                        </p>
                        
                        <div className="bg-white/80 border border-rose-200 rounded-xl p-3 mt-2 space-y-1.5 text-xs text-rose-900">
                          <p className="font-semibold text-rose-950 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-rose-600" /> Önerilen Güvenli CRM Akışı:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-rose-800 font-sans">
                            <li>Bu vaka doğrudan Müşteri Deneyimi Departmanı (CRM) veya Hukuk ekibine aktarılmalıdır.</li>
                            <li>Kullanıcıya acil telafi ve teknik inceleme süreci başlatıldığını bildiren resmi e-posta gönderilmelidir.</li>
                            <li>Sorumlu üretim/tedarik departmanı derhal uyarılmalıdır.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* 2. Aşama: Fırsata Çevirme (Chain of Thought + Few Shot) */}
                    {result.opportunity && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-indigo-500" /> AŞAMA 2: STRATEJİK FIRSATA ÇEVİRME (Few-Shot + CoT)
                          </span>
                        </div>

                        {/* Chain of thought steps visualizer */}
                        <div className="space-y-3 font-sans">
                          <div className="border-l-2 border-indigo-200 pl-4 space-y-1">
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                              Adım 1: Özündeki Gerçek İhtiyaç Nedir?
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {result.opportunity.chainOfThoughtStep1}
                            </p>
                          </div>

                          <div className="border-l-2 border-indigo-200 pl-4 space-y-1">
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                              Adım 2: Güçlü Yana Dönüştürme Formülü
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {result.opportunity.chainOfThoughtStep2}
                            </p>
                          </div>
                        </div>

                        {/* Opportunity Theme Highlight Box */}
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                          <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center shrink-0 shadow-2xs">
                            <Lightbulb className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">ÜRETİLEN KAMPANYA TEMASI</p>
                            <p className="font-display font-bold text-sm text-slate-900 mt-1">
                              {result.opportunity.opportunityTheme}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Aşama: Kampanya Metni (Role, Kısıtlama, Regüle) */}
                    {result.campaign && (
                      <div className="bg-white rounded-2xl border border-indigo-150 p-5 shadow-xs space-y-4 ring-1 ring-indigo-50">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 font-mono flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> AŞAMA 3: KONTROLLÜ KAMPANYA METNİ
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase font-mono">
                            {result.campaign.channel}
                          </span>
                        </div>

                        {/* Final copy container */}
                        <div className="relative bg-slate-50 border border-slate-100 rounded-xl p-4 min-h-[90px] group">
                          <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopy(result.campaign?.campaignText || "")}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg shadow-2xs flex items-center gap-1 text-xs font-semibold cursor-pointer"
                              title="Metni Kopyala"
                            >
                              {copied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[10px] text-emerald-600">Kopyalandı</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[10px]">Kopyala</span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-slate-800 text-sm leading-relaxed font-sans pr-14 font-medium italic whitespace-pre-line">
                            "{result.campaign.campaignText}"
                          </p>
                        </div>

                        {/* Metin Yazarı Rol Bilgisi & Ses Tonu */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans px-1">
                          <div className="flex items-center gap-1">
                            <span>Sözcü Rolü:</span>
                            <span className="font-semibold text-slate-600">"{result.campaign.brandName} Yazar Robotu"</span>
                          </div>
                          <div>
                            <span>Ses Tonu:</span>
                            <span className="font-semibold text-slate-600 italic">Samimi, abartısız</span>
                          </div>
                        </div>

                        {/* Ethical Disclaimers and constraints checklist */}
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-2 text-xs">
                          <p className="font-semibold text-amber-850 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Etik Risk Azaltma ve Regülasyon Raporu:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 font-sans">
                            <div className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span><b>Asılsız Vaat Kısıtlaması:</b> "Kesin garanti", "asla", "en iyi" gibi yasal risk yaratabilecek kesin taahhüt ifadeleri modelden arındırılmıştır.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span><b>Bilgi Boşluğu Koruması:</b> Kısa yorumlarda uydurma marka bilgisi yayması engellenerek gerçek ihtiyaca odaklanmıştır.</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-100 text-[10px] text-amber-700 italic font-sans flex items-center gap-1">
                            <Info className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Önemli Not: Bu araç pazarlama odaklı yapay zeka önerisidir. Metinler yayınlanmadan önce pazar ve hukuk denetiminden geçirilmelidir.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reklam Afişi Tasarımcısı Bölümü */}
                    {result.campaign && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-amber-500" /> KAMPANYA REKLAM AFİŞİ TASARIMCISI
                          </span>
                        </div>

                        {!result.adPoster ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                <Image className="w-4 h-4 text-amber-600" /> Kampanyanızı Göz Alıcı Bir İlana Dönüştürün
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Bu dürüst ve yapıcı kampanya mesajını; sosyal medya gönderisi, basılı broşür veya dijital billboard için saniyeler içinde modern bir tasarım mizanpajına dönüştürün.
                              </p>
                            </div>

                            {/* Poster Style Selector */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-2">Afiş Sanatsal Mizanpaj Tarzı</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                  { id: "Minimal & Bold", label: "Minimal & Cesur (Modern)", desc: "Büyük cesur tipografi, yüksek kontrast", icon: <Layout className="w-4 h-4 text-rose-500" /> },
                                  { id: "Aesthetic Editorial", label: "Estetik Editoryal (Serif)", desc: "Zarif serif başlıklar, şık kenarlıklar", icon: <Type className="w-4 h-4 text-indigo-500" /> },
                                  { id: "Split Modern", label: "Split / İllüstrasyonlu", desc: "Sol taraf metin, sağ taraf görsel dengesi", icon: <Layers className="w-4 h-4 text-emerald-500" /> },
                                  { id: "Retro Newspaper", label: "Klasik Gazete İlanı", desc: "Nostaljik çift ton mizanpaj, vintage", icon: <FileText className="w-4 h-4 text-amber-500" /> }
                                ].map((style) => (
                                  <button
                                    key={style.id}
                                    onClick={() => setPosterStyle(style.id)}
                                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                                      posterStyle === style.id
                                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {style.icon}
                                      <span className="text-xs font-bold">{style.label}</span>
                                    </div>
                                    <span className={`text-[10px] mt-1 block ${posterStyle === style.id ? "text-slate-300" : "text-slate-400"}`}>
                                      {style.desc}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={generateAdPoster}
                              disabled={posterLoading}
                              className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-slate-300 text-white py-3.5 px-4 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                            >
                              {posterLoading ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  Afiş Konsepti Tasarlanıyor...
                                </span>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                  Yapay Zeka ile Reklam Afişini Tasarla
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Summary header with recreate option */}
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700 font-mono uppercase bg-slate-200 px-2.5 py-1 rounded-md">
                                  🎯 {posterStyle}
                                </span>
                                <span className="text-xs text-slate-500">Mizanpajı Canlı Olarak Düzenleyin</span>
                              </div>
                              <button
                                onClick={() => {
                                  const updatedResult = { ...result, adPoster: null };
                                  setResult(updatedResult);
                                }}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-950 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-3xs transition-colors cursor-pointer"
                              >
                                Yeniden Tasarla
                              </button>
                            </div>

                            {/* Split layout: Poster Live Rendering & Editor controls */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                              
                              {/* LEFT COLUMN: LIVE POSTER RENDERING CANVAS (Span 5) */}
                              <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-3 w-full">
                                <div className="flex items-center justify-between w-full">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                                    🖼️ AFİŞ CANLI REKLAM GÖSTERİMİ
                                  </p>
                                  {/* Dynamic Image Fit & Fullscreen Controls */}
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => setImageFit(imageFit === "cover" ? "contain" : "cover")}
                                      className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                                      title={imageFit === "cover" ? "Tüm görseli tam sığdır (Kırpma)" : "Görseli kaplayacak şekilde doldur (Kırp)"}
                                    >
                                      {imageFit === "cover" ? <Minimize2 className="w-3 h-3 text-slate-500" /> : <Maximize2 className="w-3 h-3 text-slate-500" />}
                                      <span>{imageFit === "cover" ? "Tam Sığdır" : "Doldur"}</span>
                                    </button>
                                    <button
                                      onClick={() => setIsFullscreenPoster(true)}
                                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                                      title="Tam Ekran ve Detaylı İnceleme"
                                    >
                                      <Eye className="w-3 h-3 text-indigo-500" />
                                      <span>Tam Ekran</span>
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Poster Stage Container */}
                                <div 
                                  className="w-full aspect-[3/4] max-w-sm rounded-2xl p-6 shadow-md border border-slate-200 relative overflow-hidden flex flex-col justify-between transition-all"
                                  style={{
                                    backgroundColor: editedPrimaryColor,
                                    color: editedSecondaryColor,
                                    borderColor: `${editedAccentColor}30`
                                  }}
                                >
                                  {/* Subtly textured background overlays based on layout styles */}
                                  {posterStyle === "Retro Newspaper" && (
                                    <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-repeat bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                  )}
                                  
                                  {/* Top Brand Logo Header */}
                                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${editedSecondaryColor}25` }}>
                                    <span className="text-xs font-bold tracking-widest uppercase font-mono">
                                      {result.brandName}
                                    </span>
                                    <span className="text-[9px] opacity-70 font-mono">
                                      {new Date().getFullYear()} // AMBIENT AD
                                    </span>
                                  </div>

                                  {/* Main visual typography area centered based on layout */}
                                  <div className="my-auto py-4 flex flex-col justify-center">
                                    {posterStyle === "Minimal & Bold" ? (
                                      <div className="space-y-3 text-left">
                                        <h2 
                                          className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none font-sans"
                                          style={{ color: editedAccentColor }}
                                        >
                                          {editedHeadline}
                                        </h2>
                                        <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-md aspect-video my-1">
                                          <img 
                                            src={result.adPoster?.imageUrl || getPosterImage(result.brandName)} 
                                            alt={result.brandName} 
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover opacity-95 transition-transform duration-500 hover:scale-105"
                                          />
                                        </div>
                                        <p className="text-xs opacity-90 font-sans leading-relaxed max-w-xs">
                                          {editedSubheadline}
                                        </p>
                                      </div>
                                    ) : posterStyle === "Aesthetic Editorial" ? (
                                      <div className="space-y-3.5 text-center px-1">
                                        <h2 
                                          className="text-xl md:text-2xl font-serif italic tracking-wide font-normal leading-tight"
                                          style={{ color: editedAccentColor }}
                                        >
                                          “{editedHeadline}”
                                        </h2>
                                        <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-sm aspect-video max-w-[240px] mx-auto my-1">
                                          <img 
                                            src={result.adPoster?.imageUrl || getPosterImage(result.brandName)} 
                                            alt={result.brandName} 
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <p className="text-[10px] opacity-85 font-sans italic max-w-xs mx-auto leading-relaxed">
                                          {editedSubheadline}
                                        </p>
                                      </div>
                                    ) : posterStyle === "Split Modern" ? (
                                      <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-2">
                                          <div className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white" style={{ color: editedPrimaryColor }}>
                                            YENİ SÖZÜMÜZ
                                          </div>
                                          <h2 
                                            className="text-xl md:text-2xl font-bold tracking-tight leading-snug font-sans"
                                            style={{ color: editedAccentColor }}
                                          >
                                            {editedHeadline}
                                          </h2>
                                          <p className="text-[10px] opacity-90 leading-relaxed font-sans">
                                            {editedSubheadline}
                                          </p>
                                        </div>
                                        <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-sm aspect-video">
                                          <img 
                                            src={result.adPoster?.imageUrl || getPosterImage(result.brandName)} 
                                            alt={result.brandName} 
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent flex items-end p-2">
                                            <span className="text-[9px] text-white/90 font-mono truncate max-w-full">
                                              ✨ {result.adPoster?.visualDescription || "AI Konsept Görseli"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Retro Newspaper */
                                      <div className="space-y-2 font-serif">
                                        <div className="text-center border-b-2 border-double pb-1.5" style={{ borderColor: editedSecondaryColor }}>
                                          <span className="text-[10px] font-bold tracking-widest uppercase">KAMPANYA ÖZEL DUYURUSU</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-center leading-none uppercase tracking-tight">
                                          {editedHeadline}
                                        </h2>
                                        <div className="relative rounded-lg overflow-hidden border border-slate-900/30 shadow-xs aspect-video max-h-24 mx-auto my-1 grayscale contrast-125">
                                          <img 
                                            src={result.adPoster?.imageUrl || getPosterImage(result.brandName)} 
                                            alt={result.brandName} 
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[9px] pt-1 border-t border-dashed" style={{ borderColor: `${editedSecondaryColor}30` }}>
                                          <p className="leading-snug text-justify pr-1 border-r" style={{ borderColor: `${editedSecondaryColor}15` }}>
                                            {editedSubheadline}
                                          </p>
                                          <p className="leading-snug opacity-80 text-justify">
                                            {result.campaign?.campaignText?.substring(0, 110)}... Markamız dürüst adımlarla hizmete odaklanıyor.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* CTA Button Footer */}
                                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: `${editedSecondaryColor}15` }}>
                                    <div className="flex flex-col">
                                      <span className="text-[8px] opacity-65 font-sans">Yenilikçi Yaklaşım</span>
                                      <span className="text-[9px] font-bold" style={{ color: editedAccentColor }}>{result.brandName} Güvencesi</span>
                                    </div>
                                    
                                    <button 
                                      className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold font-sans tracking-wide shadow-3xs hover:opacity-90 transition-all cursor-default"
                                      style={{
                                        backgroundColor: editedAccentColor,
                                        color: editedPrimaryColor === "#FFFFFF" || editedPrimaryColor === "#F1F5F9" ? "#FFFFFF" : editedSecondaryColor
                                      }}
                                    >
                                      {editedCta}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* RIGHT COLUMN: INTERACTIVE DESIGN EDITOR CONTROLS (Span 7) */}
                              <div className="lg:col-span-7 space-y-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                                  <Sliders className="w-3.5 h-3.5 text-amber-500" /> AFİŞ ÖZELLEŞTİRME VE CANLI EDİTÖR
                                </p>

                                {/* Form control groups */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 text-xs font-sans">
                                  {/* Text inputs */}
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-slate-500 font-semibold mb-1">Afiş Sloganı (Headline)</label>
                                      <input 
                                        type="text" 
                                        value={editedHeadline}
                                        onChange={(e) => setEditedHeadline(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:outline-hidden focus:border-slate-400"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-slate-500 font-semibold mb-1">Açıklayıcı Alt Başlık (Subheadline)</label>
                                      <textarea 
                                        value={editedSubheadline}
                                        rows={2}
                                        onChange={(e) => setEditedSubheadline(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:outline-hidden focus:border-slate-400 leading-normal resize-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-slate-500 font-semibold mb-1">Eylem Butonu Metni (CTA)</label>
                                      <input 
                                        type="text" 
                                        value={editedCta}
                                        onChange={(e) => setEditedCta(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:outline-hidden focus:border-slate-400"
                                      />
                                    </div>
                                  </div>

                                  {/* Color pickers */}
                                  <div className="pt-3 border-t border-slate-200 space-y-3">
                                    <p className="font-semibold text-slate-600 flex items-center gap-1">
                                      <Palette className="w-3.5 h-3.5 text-indigo-500" /> Renk Paleti Özelleştirme
                                    </p>
                                    
                                    {/* Quick Presets */}
                                    <div className="bg-slate-100/50 p-2 rounded-lg border border-slate-200/60">
                                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">HIZLI TASARIM TEMALARI</span>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                        {[
                                          { name: "Siber Gece", bg: "#0F172A", text: "#F8FAFC", accent: "#FACC15" },
                                          { name: "Doğal Organik", bg: "#064E3B", text: "#F0FDF4", accent: "#34D399" },
                                          { name: "Asil Bordo", bg: "#450A0A", text: "#FEF2F2", accent: "#FCA5A5" },
                                          { name: "Siberpunk", bg: "#1E1B4B", text: "#F5F3FF", accent: "#F43F5E" },
                                          { name: "Minimalist Krem", bg: "#FCF8F2", text: "#292524", accent: "#C2410C" },
                                          { name: "Sade Beyaz", bg: "#FFFFFF", text: "#1E293B", accent: "#4F46E5" }
                                        ].map((preset, pIdx) => (
                                          <button
                                            key={pIdx}
                                            type="button"
                                            onClick={() => {
                                              setEditedPrimaryColor(preset.bg);
                                              setEditedSecondaryColor(preset.text);
                                              setEditedAccentColor(preset.accent);
                                            }}
                                            className="text-[10px] font-semibold px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer"
                                          >
                                            <span className="flex -space-x-1 shrink-0">
                                              <span className="w-3 h-3 rounded-full border border-white shadow-3xs" style={{ backgroundColor: preset.bg, zIndex: 3 }}></span>
                                              <span className="w-3 h-3 rounded-full border border-white shadow-3xs" style={{ backgroundColor: preset.text, zIndex: 2 }}></span>
                                              <span className="w-3 h-3 rounded-full border border-white shadow-3xs" style={{ backgroundColor: preset.accent, zIndex: 1 }}></span>
                                            </span>
                                            <span className="truncate">{preset.name}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-[10px] text-slate-400 font-bold mb-1">ARKA PLAN</label>
                                        <div className="flex items-center gap-1.5">
                                          <input 
                                            type="color" 
                                            value={editedPrimaryColor}
                                            onChange={(e) => setEditedPrimaryColor(e.target.value)}
                                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer overflow-hidden p-0"
                                          />
                                          <span className="font-mono text-[10px] text-slate-500">{editedPrimaryColor}</span>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[10px] text-slate-400 font-bold mb-1">METİN GÖVDESİ</label>
                                        <div className="flex items-center gap-1.5">
                                          <input 
                                            type="color" 
                                            value={editedSecondaryColor}
                                            onChange={(e) => setEditedSecondaryColor(e.target.value)}
                                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer overflow-hidden p-0"
                                          />
                                          <span className="font-mono text-[10px] text-slate-500">{editedSecondaryColor}</span>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[10px] text-slate-400 font-bold mb-1">VURGU/SLOGAN</label>
                                        <div className="flex items-center gap-1.5">
                                          <input 
                                            type="color" 
                                            value={editedAccentColor}
                                            onChange={(e) => setEditedAccentColor(e.target.value)}
                                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer overflow-hidden p-0"
                                          />
                                          <span className="font-mono text-[10px] text-slate-500">{editedAccentColor}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Creative Design Background Details */}
                                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl relative overflow-hidden space-y-3">
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                                      🎨 ÖNERİLEN ARKA PLAN KOMPOZİSYONU
                                    </p>
                                    <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                                      "{result.adPoster.visualDescription}"
                                    </p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                                      <b>Grafiksel Detaylar:</b> {result.adPoster.graphicElements}
                                    </p>
                                  </div>

                                  {/* AI Graphic prompt generation block */}
                                  <div className="bg-slate-850 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] font-mono">
                                        🤖 MIDJOURNEY / DALL-E ARKA PLAN GÖRSEL PROMPTU (METİNSİZ)
                                      </span>
                                      <button
                                        onClick={() => handleCopyPrompt(result.adPoster.aiImagePrompt)}
                                        className="text-[10px] text-slate-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-slate-800 px-2 py-1 rounded border border-slate-700 shadow-3xs"
                                      >
                                        {copiedPosterPrompt ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-400" />
                                            <span className="text-emerald-400 font-bold">Kopyalandı</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Promptu Kopyala</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2.5 rounded border border-slate-800 leading-relaxed break-words">
                                      {result.adPoster.aiImagePrompt}
                                    </p>
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* Informative usage tips block */}
                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-2 text-xs font-sans">
                              <p className="font-semibold text-amber-850 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-amber-600" /> Reklam Afişi Uygulama Rehberi:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                                <li><b>Slogan Düzenleme:</b> Sol taraftaki afiş canlı simülatöründe başlık, alt başlık ve butonlar düzenleme formundaki değişiklikleri gerçek zamanlı olarak yansıtır.</li>
                                <li><b>Görsel Arka Plan Üretimi:</b> Kopyaladığınız İngilizce yapay zeka promptunu <b>DALL-E 3, Midjourney, Canva AI veya Leonardo AI</b> üzerinde çalıştırarak, afiş tasarımınız için harika bir sanatsal arka plan üretebilirsiniz.</li>
                                <li><b>Renk Seçimi:</b> Marka konseptinizle veya ürettiğiniz arka plan görselinin renkleriyle uyum sağlayacak şekilde renk paleti bölümünden istediğiniz HEX kodunu belirleyebilirsiniz!</li>
                              </ul>
                            </div>

                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Hackathon Report Modal */}
      <AnimatePresence>
        {showHackathonReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 shadow-md">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm md:text-base tracking-tight text-white uppercase">
                      Samsung Innovation Campus Hackathon Proje Raporu
                    </h2>
                    <p className="text-[10px] md:text-[11px] text-amber-400 font-mono font-semibold">
                      Üretken Yapay Zekâ Modülü • Grup 12 Proje Teslimi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHackathonReport(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
                {/* Banner */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 text-xs uppercase tracking-wider font-mono">PROJE ADI: ŞİKAYETSAVAR</h3>
                    <p className="text-xs text-amber-800 mt-1">
                      ŞİKAYETSAVAR, müşteri şikayetlerini dürüstçe karşılayan, arka planda yapısal kök neden analizi yapan ve dürüst reklamcılık kuralları çerçevesinde markayı ileri taşıyan <b>Müşteri Geri Bildirimi Analizi & Bütünleşik Kampanya Üretim</b> aracıdır.
                    </p>
                  </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: AI & Prompt Design */}
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-900 border-b pb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-500" /> 1. ÜRETKEN YAPAY ZEKÂ & PROMPT TASARIMI
                    </h4>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <h5 className="font-bold text-slate-800">• Chain-of-Thought (CoT) - Adım Adım Düşündürme:</h5>
                        <p className="text-slate-500 mt-1">
                          Modelimiz, şikayetten kampanya üretirken doğrudan sonuca atlamaz. Prompt içerisinde zorunlu tutulan <b>chain-of-thought</b> yapısıyla; önce hatanın temel sebebini analiz eder (<span className="font-mono text-indigo-600">chainOfThoughtStep1</span>), ardından markanın dürüstçe telafi adımını planlar (<span className="font-mono text-indigo-600">chainOfThoughtStep2</span>) ve ancak bu adımlardan sonra kampanya fikrini oluşturur.
                        </p>
                      </div>

                      <div>
                        <h5 className="font-bold text-slate-800">• Zero-Shot & Rol Oynama (Role-Playing):</h5>
                        <p className="text-slate-500 mt-1">
                          Yapay zekaya kriz yönetimi ve dürüst kurumsal iletişim konusunda uzman bir <b>PR Direktörü ve Marka Stratejisti</b> rolü verilir. Hazır bir veri kümesi yerine doğrudan yapay zekanın muhakeme gücünden zero-shot tekniğiyle yararlanılır.
                        </p>
                      </div>

                      <div>
                        <h5 className="font-bold text-slate-800">• Olumsuz Kısıtlamalar (Negative Constraints):</h5>
                        <p className="text-slate-500 mt-1">
                          Abartılı vaatler, gerçekçi olmayan reklam sloganları ve müşteri şikayetini küçümseyen savunmacı bir üslup kullanılması prompt aşamasında kesinlikle yasaklanmıştır (<span className="italic">"Abartılı vaatlerden kaçın, dürüst ve çözüm odaklı ol"</span>).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Ethics & Risk Mitigation */}
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-900 border-b pb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> 2. ETİK DEĞERLENDİRME & GÜVENLİK
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div>
                        <h5 className="font-bold text-rose-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          Risk 1: Kritik Güvenlik ve Sağlık İhlalleri (Zehirlenme vb.)
                        </h5>
                        <p className="text-slate-500 mt-1">
                          <b>Giderilmesi:</b> ŞİKAYETSAVAR, ciddi sağlık, güvenlik ve hukuki ihlal içeren şikayetleri otomatik olarak algılar. Bu durumlarda pazarlama kampanyası üretmeyi <b>kesinlikle reddeder (Bloke Eder)</b> ve müşteriyi doğrudan kriz masası insan müdahalesine yönlendirir.
                        </p>
                      </div>

                      <div>
                        <h5 className="font-bold text-amber-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Risk 2: Halüsinasyon / Asılsız Reklam Vaatleri
                        </h5>
                        <p className="text-slate-500 mt-1">
                          <b>Giderilmesi:</b> Üretilen kampanya metinleri ve mizanpajlar, markanın gerçek durumuna sadık kalacak şekilde kısıtlanır. Ayrıca mizanpaj promptları İngilizce formatta Midjourney için <i>"metinsiz" (no text)</i> olarak kurgulanarak görsel kirlilik ve yanlış yazı üretimi önlenir.
                        </p>
                      </div>

                      <div>
                        <h5 className="font-bold text-indigo-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Risk 3: İnsan Kontrolünün Devre Dışı Kalması
                        </h5>
                        <p className="text-slate-500 mt-1">
                          <b>Giderilmesi:</b> <b>Human-in-the-Loop</b> yaklaşımı uygulanmıştır. Canlı reklam mizanpaj simülatöründe pazarlama uzmanı sloganları, alt başlıkları ve renkleri dilediği gibi manuel olarak düzenleyebilir ve nihai onayı insan verir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group 12 Members Section */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    🎓 GRUP 12 HACKATHON EKİBİ (SAMSUNG INNOVATION CAMPUS)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
                    {[
                      { name: "Ahmet Can Bezikoğlu", email: "ahmetbezik601@gmail.com", role: "Yapay Zeka & Geliştirici" },
                      { name: "İbrahim Kayar", email: "ibrahimkayar349@gmail.com", role: "Prompt Mühendisi" },
                      { name: "Ali Erdem Dönmez", email: "donmezerdem2@gmail.com", role: "UX/UI Tasarımcısı" },
                      { name: "Yasemin Açıkel", email: "acikelyasemin111@gmail.com", role: "Etik Analizörü" },
                      { name: "Meryem Morkoç", email: "morkocmeryem07@gmail.com", role: "Sunum & Raporlama" }
                    ].map((member, mIdx) => (
                      <div key={mIdx} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-3xs">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{member.name}</p>
                          <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{member.role}</p>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono mt-2 break-all">{member.email}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Evaluation info */}
                <div className="text-center text-[10px] text-slate-400 pt-2 border-t font-mono">
                  ŞİKAYETSAVAR • Samsung Innovation Campus Hackathon • 100 Puanlık Değerlendirme Ölçütlerine Göre Geliştirilmiştir.
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end shrink-0">
                <button
                  onClick={() => setShowHackathonReport(false)}
                  className="bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  Raporu Kapat ve Uygulamaya Dön
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
