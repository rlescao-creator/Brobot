"use client";

import { Send, Bot, User as UserIcon, Menu, ListTodo, MessageSquare, Image as ImageIcon, X, Flame, Plus, Trash2, Target, Sparkles, LogOut } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { addGoals, signUp, login as loginAction, createConversation, getConversations, getConversation, saveMessage, deleteConversation } from "./actions";
import LandingPage from "@/components/LandingPage";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
};

const DAILY_QUOTES = [
  {
    main: "The obstacle is the way.",
    sub: "What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    year: "170 AD"
  },
  {
    main: "He who knows himself is enlightened.",
    sub: "Knowing others is intelligence; knowing yourself is true wisdom.",
    author: "Lao Tzu",
    year: "6th century BC"
  },
  {
    main: "In the midst of chaos, there is also opportunity.",
    sub: "The supreme art of war is to subdue the enemy without fighting.",
    author: "Sun Tzu",
    year: "5th century BC"
  },
  {
    main: "No man is free who is not master of himself.",
    sub: "First say to yourself what you would be; then do what you have to do.",
    author: "Epictetus",
    year: "100 AD"
  },
  {
    main: "What we do now echoes in eternity.",
    sub: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    year: "170 AD"
  },
  {
    main: "The mind is everything. What you think you become.",
    sub: "No one saves us but ourselves. No one can and no one may.",
    author: "Buddha",
    year: "5th century BC"
  },
  {
    main: "Fortune favors the bold.",
    sub: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.",
    author: "Seneca",
    year: "65 AD"
  },
  {
    main: "Discipline equals freedom.",
    sub: "The more you sweat in training, the less you bleed in battle.",
    author: "Spartan Maxim",
    year: "Ancient Sparta"
  },
  {
    main: "Victory belongs to the most persevering.",
    sub: "Impossible is a word to be found only in the dictionary of fools.",
    author: "Napoleon Bonaparte",
    year: "1800s"
  },
  {
    main: "Know thyself.",
    sub: "The unexamined life is not worth living.",
    author: "Socrates",
    year: "400 BC"
  },
  {
    main: "I am not afraid of an army of lions led by a sheep.",
    sub: "I am afraid of an army of sheep led by a lion.",
    author: "Alexander the Great",
    year: "330 BC"
  },
  {
    main: "Waste no more time arguing what a good man should be. Be one.",
    sub: "You have power over your mind - not outside events.",
    author: "Marcus Aurelius",
    year: "170 AD"
  }
];

export default function Chat() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(true);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authError, setAuthError] = useState("");
  
  // Quote of the day - changes daily
  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }, []);

  // Check localStorage for user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("brobot_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
      setShowLanding(false);
    }
  }, []);

  console.log("Chat component rendering...", { isLoggedIn, authMode, user: !!user });

  // Conversation State
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Manual Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    console.log("Starting auth process...", { authMode, email });

    try {
      if (authMode === "signup") {
        console.log("Attempting sign up...");
        const result = await signUp(email, password);
        console.log("Sign up result:", result);
        if (result.success && result.user) {
          setUser(result.user);
          setIsLoggedIn(true);
          localStorage.setItem("brobot_user", JSON.stringify(result.user));
        } else {
          setAuthError(result.error || "Failed to sign up");
        }
      } else {
        console.log("Attempting login...");
        const result = await loginAction(email, password);
        console.log("Login result:", result);
        if (result.success && result.user) {
          setUser(result.user);
          setIsLoggedIn(true);
          localStorage.setItem("brobot_user", JSON.stringify(result.user));
        } else {
          setAuthError(result.error || "Invalid credentials");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthError("An unexpected error occurred. Check console.");
    }
  };

  // Load conversations when user logs in
  useEffect(() => {
    if (isLoggedIn && user) {
      loadConversations();
    }
  }, [isLoggedIn, user]);

  const loadConversations = async () => {
    if (!user) return;
    const convos = await getConversations(user.id);
    setConversations(convos);
  };

  const handleNewChat = async () => {
    if (!user) return;
    const newConvo = await createConversation(user.id, "New Chat");
    setCurrentConversationId(newConvo.id);
    setMessages([]);
    await loadConversations();
  };

  const handleLoadConversation = async (id: string) => {
    const convo = await getConversation(id);
    if (convo) {
      setCurrentConversationId(id);
      setMessages(convo.messages.map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        image: m.image || undefined,
      })));
    }
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    await loadConversations();
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || !user) {
      console.log("Submit blocked:", { hasInput: !!input.trim(), hasImage: !!selectedImage, hasUser: !!user });
      return;
    }

    console.log("Submitting message...", { input, hasImage: !!selectedImage });
    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: "user" as const, 
      content: input || "Rate my physique",
      image: selectedImage || undefined
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    // Create new AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      console.log("Fetching /api/chat with messages:", [...messages, userMessage]);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
        signal: abortController.signal,
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: "" };

      setMessages((prev) => [...prev, assistantMessage]);

      console.log("Starting stream read...");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage.content += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...assistantMessage };
          return newMessages;
        });
      }
      console.log("Stream finished.");

      // Save messages to database
      if (user) {
        let convoId = currentConversationId;
        
        // Create new conversation if needed
        if (!convoId) {
          const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : "");
          const newConvo = await createConversation(user.id, title);
          convoId = newConvo.id;
          setCurrentConversationId(convoId);
          await loadConversations();
        }
        
        // Save both messages
        await saveMessage(convoId, "user", userMessage.content, userMessage.image);
        await saveMessage(convoId, "assistant", assistantMessage.content);
      }

      // Proposita Logic (Post-processing)
      const propositaRegex = /Added to Proposita:\s*\n((?:[-*] .+\n?)+)/;
      const match = assistantMessage.content.match(propositaRegex);

      if (match && match[1]) {
        console.log("Proposita match found:", match[1]);
        const goalsText = match[1];
        const goals = goalsText
          .split("\n")
          .filter((line) => {
            const trimmed = line.trim();
            return trimmed.startsWith("- ") || trimmed.startsWith("* ");
          })
          .map((line) => {
            const text = line.replace(/^[-*]\s+/, "").trim();
            return { text, deadline: undefined };
          });

        if (goals.length > 0) {
          console.log("Adding goals to DB...", goals);
          await addGoals(user.id, goals);
          setShowSaveNotification(true);
          setTimeout(() => setShowSaveNotification(false), 3000);
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error("Error sending message:", error);
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "Error: Could not connect to Brobot." }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isLoggedIn) {
      scrollToBottom();
    }
  }, [messages, isLoggedIn]);

  // Show landing page first
  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen text-white p-6 overflow-hidden">
        {/* Epic background with warrior image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/logo_brobot.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black/90" />
          <div className="absolute inset-0 backdrop-blur-sm" />
        </div>
        
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="text-center">
            <div className="relative mx-auto mb-6 w-32 h-32 animate-pulse-slow">
              <img 
                src="/logo_brobot.png" 
                alt="Brobot" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-orange-500/60"
              />
            </div>
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
              BROBOT
            </h2>
            <p className="text-zinc-400 mt-2 font-medium tracking-wide">Real Talk. No BS.</p>
            <p className="text-zinc-600 text-xs mt-1 tracking-widest">THE WARRIOR'S PATH</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-500/30"
            >
              {authMode === "login" ? "Login" : "Sign Up"}
            </button>

            <p className="text-center text-sm text-zinc-500">
              {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-white hover:underline"
              >
                {authMode === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Get first name from email
  const firstName = user?.email.split('@')[0].split('.')[0] || 'Warrior';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={clsx(
        "flex-shrink-0 w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all",
        !showSidebar && "hidden"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-800">
          <button
            onClick={handleNewChat}
            className="group relative w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            <Plus className="relative w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative">New Chat</span>
            
            {/* Glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-500 to-red-600 blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={clsx(
                "group relative p-3 rounded-xl cursor-pointer transition-all",
                currentConversationId === convo.id
                  ? "bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30"
                  : "bg-zinc-900/50 hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
              )}
              onClick={() => handleLoadConversation(convo.id)}
            >
              <p className="text-sm font-medium text-white truncate pr-8">{convo.title}</p>
              <p className="text-xs text-zinc-600 mt-1">
                {new Date(convo.updatedAt).toLocaleDateString()}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(convo.id);
                }}
                className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-center text-zinc-600 text-sm py-8">
              No conversations yet.<br/>Click "New Chat" to start.
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col h-screen flex-1 max-w-4xl mx-auto px-6 py-4 md:px-8 md:py-6 overflow-hidden">
        {/* Subtle warrior background */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: 'url(/logo_brobot.png)' }}
          />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
      <header className="flex items-center justify-between py-6 mb-8 border-b border-zinc-800/50 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 blur-xl -z-10" />
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/30 ring-2 ring-orange-500/20 transform hover:scale-105 transition-transform">
            <img 
              src="/logo_brobot.png" 
              alt="Brobot" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight leading-none">BROBOT</h1>
            <p className="text-xs text-zinc-500 font-semibold tracking-wide">Real Talk. No BS.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/proposita")}
              className="group px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-sm font-bold bg-zinc-900/95 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/60 hover:border-orange-500/40 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 active:scale-95"
            >
              <Target className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
              <span className="hidden sm:inline">Proposita</span>
            </button>
            <button
              onClick={() => router.push("/womanslator")}
              className="group px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-sm font-bold bg-zinc-900/95 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/60 hover:border-orange-500/40 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
              <span className="hidden sm:inline">Womanslator</span>
            </button>
          </div>
          
          {/* Logout Button - Separated */}
          <div className="h-8 w-px bg-zinc-700/50"></div>
          <button
            onClick={() => {
              localStorage.removeItem("brobot_user");
              setIsLoggedIn(false);
              setUser(null);
            }}
            className="group px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm text-zinc-400 rounded-xl text-sm font-bold hover:bg-red-900/30 hover:text-red-400 hover:border-red-500/40 transition-all duration-300 border border-zinc-800/60 shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:scale-105 active:scale-95 flex items-center gap-2"
            title="Logout"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {showSaveNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-full text-sm font-medium animate-in fade-in slide-in-from-top-2 shadow-lg shadow-green-500/20 backdrop-blur-sm z-50">
          <span className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            Goals saved to Proposita
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 pb-4 scrollbar-hide relative z-10">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-70">
                {/* Animated warrior image */}
                <div className="relative w-40 h-40 group animate-fade-in">
                  {/* Rotating rings */}
                  <div className="absolute inset-0 animate-spin-slow opacity-30">
                    <div className="absolute inset-0 rounded-full border-2 border-orange-500/40 border-dashed" />
                  </div>
                  <div className="absolute inset-0 animate-spin-reverse opacity-20" style={{ animationDelay: '0.5s' }}>
                    <div className="absolute inset-2 rounded-full border-2 border-red-500/40 border-dashed" />
                  </div>
                  
                  {/* Pulsing glows */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-2xl animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                  
                  {/* Image */}
                  <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src="/logo_brobot.png" 
                      alt="Brobot" 
                      className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-orange-500/60 ring-2 ring-orange-500/30 group-hover:ring-orange-500/50 transition-all"
                    />
                  </div>
                </div>
                
                {/* Animated quote */}
                <div className="space-y-4 animate-fade-in-delay-1">
                  <p className="text-zinc-200 max-w-md text-xl font-bold italic animate-text-glow">
                    "{dailyQuote.main}"
                  </p>
                  <p className="text-zinc-500 max-w-md text-sm font-medium">
                    {dailyQuote.sub}
                  </p>
                  <div className="space-y-1.5">
                    <p className="text-orange-400 text-sm font-bold">
                      — {dailyQuote.author}
                    </p>
                    <p className="text-zinc-600 text-xs font-medium">
                      {dailyQuote.year}
                    </p>
                  </div>
                  <p className="text-zinc-700 text-xs font-medium flex items-center justify-center gap-2 pt-2">
                    <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                    {displayName}'s Daily Quote
                    <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                  </p>
                </div>
                
                {/* Animated category badges */}
                <div className="flex flex-wrap gap-2.5 justify-center max-w-lg animate-fade-in-delay-2">
                  {['Fitness', 'Goals', 'Relationships', 'Motivation'].map((cat, i) => (
                    <span 
                      key={cat}
                      className="group px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs text-zinc-400 font-semibold hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/50 hover:text-orange-300 transition-all cursor-pointer hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-orange-500/20 animate-slide-up"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="group px-4 py-2 bg-zinc-800/50 border border-orange-500/30 rounded-full text-xs text-orange-400/90 font-semibold hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-500/60 hover:text-orange-300 transition-all cursor-pointer hover:scale-105 hover:-translate-y-0.5 shadow-lg hover:shadow-orange-500/30 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    I just want to talk
                  </span>
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={m.id}
                className={clsx(
                  "flex gap-4 max-w-[90%] animate-in fade-in slide-in-from-bottom-3 duration-500",
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div
                  className={clsx(
                    "flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300",
                    m.role === "user" 
                      ? "w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-white border border-zinc-600 hover:border-zinc-500 hover:scale-110" 
                      : "w-10 h-10"
                  )}
                >
                  {m.role === "user" ? (
                    <UserIcon className="w-5 h-5" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70 transition-all duration-300 hover:scale-110">
                      <img 
                        src="/logo_brobot.png" 
                        alt="Brobot" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div
                  className={clsx(
                    "rounded-2xl text-sm leading-relaxed shadow-2xl space-y-2 backdrop-blur-sm transition-all duration-300 hover:shadow-3xl",
                    m.role === "user"
                      ? "bg-gradient-to-br from-zinc-800/95 to-zinc-900/95 text-zinc-100 rounded-tr-md border border-zinc-700/70 shadow-black/40 hover:border-zinc-600"
                      : "bg-gradient-to-br from-zinc-900/98 to-black/98 border-2 border-orange-500/40 text-zinc-50 rounded-tl-md shadow-orange-500/30 hover:border-orange-500/60 hover:shadow-orange-500/40"
                  )}
                >
                  {m.image && (
                    <div className="relative group">
                      <img 
                        src={m.image} 
                        alt="Uploaded" 
                        className="rounded-t-xl max-w-xs w-full object-cover border-b border-zinc-800 transition-all duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl"></div>
                    </div>
                  )}
                  <div className="px-6 py-4 whitespace-pre-wrap font-medium">
                  {m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 mr-auto max-w-[90%] animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="w-11 h-11 flex items-center justify-center flex-shrink-0 mt-1 rounded-xl overflow-hidden shadow-lg shadow-orange-500/50 animate-pulse">
                  <img 
                    src="/logo_brobot.png" 
                    alt="Brobot" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-sm border-2 border-orange-500/30 px-6 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-xl shadow-orange-500/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-[shine_2s_ease-in-out_infinite]"></div>
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce shadow-lg shadow-orange-500/50" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce shadow-lg shadow-orange-400/50" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce shadow-lg shadow-red-500/50" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
      </div>

      <div>
        <div className="mt-6 space-y-4">
          {selectedImage && (
            <div className="relative inline-block animate-in fade-in slide-in-from-bottom-2">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="rounded-2xl max-w-xs w-full object-cover border-2 border-orange-500/40 shadow-2xl shadow-orange-500/30 ring-1 ring-orange-500/20"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-xl shadow-red-500/30 transform hover:scale-110 ring-2 ring-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative group">
            <div className="relative">
          <input
                className="w-full bg-zinc-900/95 backdrop-blur-sm border-2 border-zinc-800/70 text-white rounded-2xl py-5 pl-7 pr-32 focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500/50 placeholder:text-zinc-500 shadow-2xl hover:shadow-3xl transition-all duration-300 font-medium text-base group-hover:border-zinc-700/80 focus:bg-zinc-900"
            value={input}
            onChange={handleInputChange}
            placeholder="What's on your mind?"
          />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
            <div className="absolute right-3 top-3 flex gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group/btn p-3 bg-zinc-800/95 backdrop-blur-sm text-zinc-400 rounded-xl hover:bg-zinc-700 hover:text-orange-400 transition-all duration-300 border border-zinc-700/70 hover:border-orange-500/50 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transform hover:scale-110 active:scale-95"
                title="Upload image"
              >
                <ImageIcon className="w-5 h-5 transition-transform group-hover/btn:rotate-12" />
              </button>
          {isLoading ? (
            <button
              type="button"
              onClick={() => stop()}
                  className="group/btn p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-xl shadow-red-500/40 hover:shadow-red-500/60 transform hover:scale-110 active:scale-95"
                  title="Stop generation"
            >
                  <div className="w-3.5 h-3.5 bg-white rounded-sm animate-pulse" />
            </button>
          ) : (
            <button
              type="submit"
                  disabled={!input.trim() && !selectedImage}
                  className="group/btn p-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-red-600 transition-all duration-300 shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 transform hover:scale-110 active:scale-95 disabled:transform-none disabled:shadow-lg"
                  title="Send message"
            >
                  <Send className="w-5 h-5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </button>
          )}
            </div>
        </form>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
