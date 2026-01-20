'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageSquare, Target, LogOut } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    title: "WOMANSLATOR",
    subtitle: "Decode What She Really Means",
    inputLabel: "WHAT DID SHE SAY / DO?",
    inputPlaceholder: "Type what she said or did here...",
    translateButton: "🔥 Translate",
    translating: "Translating...",
    quickExamplesTitle: "Or try a quick example:",
    sheMeans: "SHE MEANS:",
    whatItMeans: "WHAT IT MEANS:",
    why: "WHY:",
    sayThis: "SAY THIS:",
    whatToDo: "WHAT TO DO:",
    copyButton: "📋 Copy Response",
    copied: "✓ Copied!",
    newTranslation: "🔄 New Translation",
    quickExamples: [
      "I'm fine",
      "I'm busy",
      "I need space",
      "Let's just be friends",
      "We need to talk",
      "Do whatever you want",
      "You're too good for me"
    ]
  },
  fr: {
    title: "WOMANSLATOR",
    subtitle: "Décode Ce Qu'Elle Veut Vraiment Dire",
    inputLabel: "QU'A-T-ELLE DIT / FAIT ?",
    inputPlaceholder: "Écris ce qu'elle a dit ou fait ici...",
    translateButton: "🔥 Traduire",
    translating: "Traduction...",
    quickExamplesTitle: "Ou essaie un exemple rapide :",
    sheMeans: "ELLE VEUT DIRE :",
    whatItMeans: "CELA SIGNIFIE :",
    why: "POURQUOI :",
    sayThis: "DIS CECI :",
    whatToDo: "QUOI FAIRE :",
    copyButton: "📋 Copier la Réponse",
    copied: "✓ Copié !",
    newTranslation: "🔄 Nouvelle Traduction",
    quickExamples: [
      "Je vais bien",
      "Je suis occupée",
      "J'ai besoin d'espace",
      "Restons amis",
      "On doit parler",
      "Fais ce que tu veux",
      "Tu es trop bien pour moi"
    ]
  },
  es: {
    title: "WOMANSLATOR",
    subtitle: "Descifra Lo Que Ella Realmente Significa",
    inputLabel: "¿QUÉ DIJO / HIZO ELLA?",
    inputPlaceholder: "Escribe lo que ella dijo o hizo aquí...",
    translateButton: "🔥 Traducir",
    translating: "Traduciendo...",
    quickExamplesTitle: "O prueba un ejemplo rápido:",
    sheMeans: "ELLA SIGNIFICA:",
    whatItMeans: "LO QUE SIGNIFICA:",
    why: "POR QUÉ:",
    sayThis: "DI ESTO:",
    whatToDo: "QUÉ HACER:",
    copyButton: "📋 Copiar Respuesta",
    copied: "✓ ¡Copiado!",
    newTranslation: "🔄 Nueva Traducción",
    quickExamples: [
      "Estoy bien",
      "Estoy ocupada",
      "Necesito espacio",
      "Seamos solo amigos",
      "Tenemos que hablar",
      "Haz lo que quieras",
      "Eres demasiado bueno para mí"
    ]
  },
  de: {
    title: "WOMANSLATOR",
    subtitle: "Entschlüssle Was Sie Wirklich Meint",
    inputLabel: "WAS HAT SIE GESAGT / GETAN?",
    inputPlaceholder: "Schreib hier, was sie gesagt oder getan hat...",
    translateButton: "🔥 Übersetzen",
    translating: "Übersetze...",
    quickExamplesTitle: "Oder probiere ein schnelles Beispiel:",
    sheMeans: "SIE MEINT:",
    whatItMeans: "WAS ES BEDEUTET:",
    why: "WARUM:",
    sayThis: "SAG DAS:",
    whatToDo: "WAS TUN:",
    copyButton: "📋 Antwort Kopieren",
    copied: "✓ Kopiert!",
    newTranslation: "🔄 Neue Übersetzung",
    quickExamples: [
      "Mir geht's gut",
      "Ich bin beschäftigt",
      "Ich brauche Raum",
      "Lass uns Freunde bleiben",
      "Wir müssen reden",
      "Mach was du willst",
      "Du bist zu gut für mich"
    ]
  }
};

export default function WomanslatorPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<{
    sheMeans: string;
    why: string;
    sayThis: string;
    whatToDo: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    const user = localStorage.getItem('brobot_user');
    if (user) {
      setIsLoggedIn(true);
    } else {
      window.location.href = '/';
    }
    
    // Load saved language preference
    const savedLang = localStorage.getItem('womanslator_language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('womanslator_language', lang);
  };

  const handleQuickExample = (example: string) => {
    setInputText(example);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setResult(null);

    try {
      const response = await fetch('/api/womanslator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, language }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyResponse = () => {
    if (result?.sayThis) {
      navigator.clipboard.writeText(result.sayThis);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleNewTranslation = () => {
    setInputText('');
    setResult(null);
    setCopySuccess(false);
  };

  if (!isLoggedIn) {
    return <div className="min-h-screen bg-black"></div>;
  }

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background warrior image */}
      <div className="fixed inset-0 z-0 opacity-[0.03]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/logo_brobot.png)' }}
        />
      </div>

      {/* Header */}
      <header className="relative border-b border-zinc-800/50 bg-black/90 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-orange-500/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-xl shadow-orange-500/20 ring-2 ring-orange-500/30 hover:ring-orange-500/50 transition-all hover:scale-105">
              <img 
                src="/logo_brobot.png" 
                alt="Brobot" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight leading-none">
                WOMANSLATOR
              </h1>
              <p className="text-xs text-zinc-500 font-semibold tracking-wide">Decode. Understand. Respond.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800/60 rounded-xl px-3 py-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`text-2xl transition-all duration-300 hover:scale-125 ${language === 'en' ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-70'}`}
                title="English"
              >
                🇬🇧
              </button>
              <button
                onClick={() => handleLanguageChange('fr')}
                className={`text-2xl transition-all duration-300 hover:scale-125 ${language === 'fr' ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-70'}`}
                title="Français"
              >
                🇫🇷
              </button>
              <button
                onClick={() => handleLanguageChange('es')}
                className={`text-2xl transition-all duration-300 hover:scale-125 ${language === 'es' ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-70'}`}
                title="Español"
              >
                🇪🇸
              </button>
              <button
                onClick={() => handleLanguageChange('de')}
                className={`text-2xl transition-all duration-300 hover:scale-125 ${language === 'de' ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-70'}`}
                title="Deutsch"
              >
                🇩🇪
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <a
                href="/"
                className="group px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-sm font-bold bg-zinc-900/95 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/60 hover:border-orange-500/40 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 active:scale-95"
              >
                <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span className="hidden sm:inline">Chat</span>
              </a>
              <a
                href="/proposita"
                className="group px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-sm font-bold bg-zinc-900/95 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/60 hover:border-orange-500/40 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 active:scale-95"
              >
                <Target className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span className="hidden sm:inline">Proposita</span>
              </a>
            </div>
            
            {/* Logout Button - Separated */}
            <div className="h-8 w-px bg-zinc-700/50"></div>
            <button
              onClick={() => {
                localStorage.removeItem('brobot_user');
                window.location.href = '/';
              }}
              className="group px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm text-zinc-400 rounded-xl text-sm font-bold hover:bg-red-900/30 hover:text-red-400 hover:border-red-500/40 transition-all duration-300 border border-zinc-800/60 shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:scale-105 active:scale-95 flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 z-10">
        {isTranslating ? (
          // Loading Skeleton
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center animate-pulse">
              <div className="h-6 bg-gray-700/30 rounded w-32 mx-auto mb-4"></div>
              <div className="h-10 bg-orange-500/20 rounded-lg w-3/4 mx-auto"></div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
              <div className="relative bg-zinc-900/90 border border-orange-500/30 rounded-2xl p-8 sm:p-10 space-y-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-8 bg-orange-500/20 rounded w-48 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-700/30 rounded w-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                      <div className="h-6 bg-gray-700/30 rounded w-5/6 animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !result ? (
          // Landing View
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Title */}
            <div className="text-center space-y-4">
              <div className="inline-block">
                <h1 className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-wider animate-in zoom-in duration-500">
                  {t.title}
                </h1>
                <div className="h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full mt-2 animate-pulse"></div>
              </div>
              <p className="text-xl sm:text-2xl text-gray-400 font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
                {t.subtitle}
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
              <label className="block text-lg font-bold text-orange-400/90 tracking-wide">
                {t.inputLabel}
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-200"></div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="relative w-full bg-zinc-900/90 border border-orange-500/30 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 resize-none text-lg backdrop-blur-sm transition-all duration-200"
                  rows={5}
                />
              </div>
              <button
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                className="relative w-full group overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-5 rounded-xl transition-all duration-300 text-xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/60 hover:scale-[1.03] active:scale-[0.98] disabled:hover:scale-100 disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isTranslating ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t.translating}
                    </>
                  ) : (
                    <>{t.translateButton}</>
                  )}
                </span>
                {!isTranslating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                )}
              </button>
            </div>

            {/* Quick Examples */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="text-center">
                <p className="text-gray-400 text-lg font-semibold mb-2">
                  {t.quickExamplesTitle}
                </p>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mx-auto"></div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
                {t.quickExamples.map((example, idx) => (
                  <button
                    key={example}
                    onClick={() => handleQuickExample(example)}
                    className="group px-6 py-3 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/50 hover:border-orange-500/70 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-sm hover:scale-110 hover:shadow-xl hover:shadow-orange-500/30 animate-in fade-in slide-in-from-bottom duration-500 active:scale-95"
                    style={{ animationDelay: `${600 + idx * 50}ms` }}
                  >
                    <span className="block transition-transform duration-300 group-hover:scale-105">
                      "{example}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Output View
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Original Text */}
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3">She said/did:</p>
              <p className="text-2xl sm:text-3xl text-orange-400/90 italic font-semibold">"{inputText}"</p>
            </div>

            {/* Result Card */}
            <div className="relative group animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-zinc-900/90 border border-orange-500/30 rounded-2xl p-8 sm:p-10 space-y-8 shadow-2xl backdrop-blur-sm">
                {/* She Means */}
                <div className="animate-in fade-in slide-in-from-left duration-500 delay-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    <h3 className="text-orange-500 font-black text-xl uppercase tracking-wider">
                      {t.sheMeans}
                    </h3>
                  </div>
                  <p className="text-white text-lg sm:text-xl leading-relaxed pl-5">
                    {result.sheMeans}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>

                {/* Why */}
                <div className="animate-in fade-in slide-in-from-left duration-500 delay-400">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    <h3 className="text-orange-500 font-black text-xl uppercase tracking-wider">
                      {t.why}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-lg sm:text-xl leading-relaxed pl-5">
                    {result.why}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>

                {/* Say This */}
                <div className="animate-in fade-in slide-in-from-left duration-500 delay-500 bg-zinc-800/50 rounded-xl p-6 border border-orange-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                    <h3 className="text-orange-400 font-black text-xl uppercase tracking-wider">
                      {t.sayThis}
                    </h3>
                  </div>
                  <p className="text-white text-lg sm:text-xl leading-relaxed font-medium pl-5">
                    {result.sayThis}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>

              {/* What To Do */}
              <div className="animate-in fade-in slide-in-from-left duration-500 delay-600 bg-red-950/30 rounded-xl p-6 border border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-700 rounded-full"></div>
                  <h3 className="text-red-500 font-black text-xl uppercase tracking-wider">
                    {t.whatToDo}
                  </h3>
                </div>
                <div className="text-white text-lg sm:text-xl leading-relaxed font-semibold pl-5 space-y-3">
                  {result.whatToDo.split(/(?<=\.)\s+(?=\d+\.|\*\*|[A-Z])/).map((sentence, idx) => (
                    <p key={idx} className={sentence.match(/^\d+\./) ? 'mt-4 first:mt-0' : ''}>
                      {sentence}
                    </p>
                  ))}
                </div>
              </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700">
              <button
                onClick={handleCopyResponse}
                className="relative flex-1 group overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-5 rounded-xl transition-all duration-300 text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/60 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {copySuccess ? (
                    <>
                      <span className="text-xl">✓</span>
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📋</span>
                      {t.copyButton.replace('📋 ', '')}
                    </>
                  )}
                </span>
                {!copySuccess && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                )}
              </button>
              <button
                onClick={handleNewTranslation}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-orange-500/50 text-white font-bold py-5 rounded-xl transition-all duration-300 text-lg shadow-xl hover:shadow-orange-500/20 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="text-xl">🔄</span>
                {t.newTranslation.replace('🔄 ', '')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

