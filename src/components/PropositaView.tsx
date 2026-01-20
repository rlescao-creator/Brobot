"use client";

import { useEffect, useState } from "react";
import { Check, Trash2, Calendar, Loader2, TrendingUp, X, Trophy, Flame } from "lucide-react";
import { getGoals, toggleGoal, deleteGoal, markGoalFailed } from "@/app/actions";
import clsx from "clsx";

type Goal = {
    id: string;
    text: string;
    deadline: string | null;
    completed: boolean;
    completedAt: Date | null;
    failed: boolean;
    createdAt: Date;
};

export default function PropositaView({ userId }: { userId: string }) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGoals();
    }, [userId]);

    const loadGoals = async () => {
        try {
            const data = await getGoals(userId);
            setGoals(data);
        } catch (error) {
            console.error("Failed to load goals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setGoals(goals.map(g => g.id === id ? { ...g, completed: !currentStatus } : g));
        await toggleGoal(id, !currentStatus);
    };

    const handleDelete = async (id: string) => {
        // Optimistic update
        setGoals(goals.filter(g => g.id !== id));
        await deleteGoal(id);
    };

    const handleMarkFailed = async (id: string) => {
        // Optimistic update
        setGoals(goals.map(g => g.id === id ? { ...g, failed: true, completed: false } : g));
        await markGoalFailed(id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="text-sm text-zinc-500">Loading your goals...</p>
                </div>
            </div>
        );
    }

    if (goals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-70">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700 shadow-lg">
                    <Check className="w-10 h-10 text-zinc-500" />
                </div>
                <div className="space-y-2">
                    <p className="text-zinc-400 max-w-md font-medium">
                        No goals yet
                    </p>
                    <p className="text-zinc-600 max-w-xs text-sm">
                        Ask Brobot to "add to Proposita" when you're ready to commit.
                    </p>
                </div>
                <div className="px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs text-zinc-500">
                    💪 Set goals • 📊 Track progress • ✅ Stay accountable
                </div>
            </div>
        );
    }

    // Stats
    const activeGoals = goals.filter(g => !g.completed && !g.failed);
    const completedGoals = goals.filter(g => g.completed);
    const failedGoals = goals.filter(g => g.failed);
    const totalGoals = goals.length;
    const successRate = totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0;
    
    // Streak calculation (consecutive days with completions)
    const today = new Date();
    const completedDates = completedGoals
        .filter(g => g.completedAt)
        .map(g => new Date(g.completedAt!))
        .sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    checkDate.setHours(0, 0, 0, 0);
    
    for (let date of completedDates) {
        const completionDate = new Date(date);
        completionDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((checkDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === currentStreak || diffDays === currentStreak + 1) {
            currentStreak = diffDays + 1;
        } else {
            break;
        }
    }

    // Parse deadline and categorize goals by timeline
    const parseDeadline = (goal: Goal): Date | null => {
        // Check both deadline field and goal text for date information
        const textToSearch = goal.deadline || goal.text;
        if (!textToSearch) return null;
        
        // Remove ordinal suffixes (st, nd, rd, th) for easier parsing
        const cleanText = textToSearch.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
        
        // Format: "March 31, 2026" or "March 31 2026" or "3/31/2026" or "2026-03-02"
        const fullDateMatch = cleanText.match(/(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
        if (fullDateMatch) {
            const parsed = new Date(fullDateMatch[0]);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        
        // Format: "December 2026" or "by December 2026" (month + year without specific day)
        const monthYearMatch = cleanText.match(/(?:by\s+)?(\w+)\s+(\d{4})/);
        if (monthYearMatch) {
            const monthYear = monthYearMatch[1] + " " + monthYearMatch[2];
            const parsed = new Date(monthYear + " 28");
            if (!isNaN(parsed.getTime())) {
                parsed.setMonth(parsed.getMonth() + 1, 0); // Last day of month
                return parsed;
            }
        }
        
        // Format: "June 10" (month + day without year) - assume next occurrence
        const monthDayMatch = cleanText.match(/(\w+)\s+(\d{1,2})(?!\d)/);
        if (monthDayMatch) {
            const currentYear = today.getFullYear();
            let parsed = new Date(monthDayMatch[1] + " " + monthDayMatch[2] + ", " + currentYear);
            if (!isNaN(parsed.getTime())) {
                // If date already passed this year, assume next year
                if (parsed < today) {
                    parsed = new Date(monthDayMatch[1] + " " + monthDayMatch[2] + ", " + (currentYear + 1));
                }
                return parsed;
            }
        }
        
        return null;
    };

    const getGoalTimeline = (goal: Goal): 'daily' | 'short' | 'medium' | 'long' => {
        const deadline = parseDeadline(goal);
        if (!deadline) {
            // No specific deadline = daily/recurring goal
            return 'daily';
        }
        
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 7) return 'daily'; // 1 week or less
        if (daysUntil <= 60) return 'short'; // 1 week to 2 months
        if (daysUntil <= 150) return 'medium'; // 2 to 5 months
        return 'long'; // 5+ months
    };

    // Categorize active goals by timeline
    const dailyGoals = activeGoals.filter(g => getGoalTimeline(g) === 'daily');
    const shortTermGoals = activeGoals.filter(g => getGoalTimeline(g) === 'short');
    const mediumTermGoals = activeGoals.filter(g => getGoalTimeline(g) === 'medium');
    const longTermGoals = activeGoals.filter(g => getGoalTimeline(g) === 'long');

    // This week stats (only for daily/short-term goals)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekCompleted = completedGoals.filter(g => g.completedAt && new Date(g.completedAt) >= weekStart).length;
    const thisWeekFailed = failedGoals.filter(g => g.createdAt && new Date(g.createdAt) >= weekStart).length;
    // Total = daily/short-term active goals + completed this week + failed this week
    const thisWeekTotal = (dailyGoals.length + shortTermGoals.length) + thisWeekCompleted + thisWeekFailed;

    return (
        <div className="space-y-6 pb-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Success Rate */}
                <div className="relative group glass-panel p-6 rounded-2xl shadow-2xl border border-orange-500/30 hover:border-orange-500/60 transition-all duration-500 hover:scale-110 animate-fade-in cursor-pointer overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-3">
                            <Trophy className="w-6 h-6 text-orange-500 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                            <h3 className="text-sm font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">Success Rate</h3>
                        </div>
                        <div className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                            {Math.round(successRate)}%
                        </div>
                        <p className="text-xs text-zinc-600 group-hover:text-zinc-500 mt-2 transition-colors">
                            {completedGoals.length} {completedGoals.length === 1 ? 'victory' : 'victories'}
                        </p>
                    </div>
                </div>

                {/* Current Streak */}
                <div className="relative group glass-panel p-6 rounded-2xl shadow-2xl border border-orange-500/30 hover:border-red-500/60 transition-all duration-500 hover:scale-110 animate-fade-in cursor-pointer overflow-hidden" style={{ animationDelay: '0.1s' }}>
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-3">
                            <Flame className={`w-6 h-6 text-orange-500 ${currentStreak > 0 ? 'animate-pulse' : ''} group-hover:scale-125 transition-all duration-300`} />
                            <h3 className="text-sm font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">Streak</h3>
                        </div>
                        <div className="text-4xl font-black bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                            {currentStreak}
                        </div>
                        <p className="text-xs text-zinc-600 group-hover:text-zinc-500 mt-2 transition-colors">
                            {currentStreak === 1 ? 'day' : 'days'} strong
                        </p>
                    </div>
                </div>
            </div>

            {/* This Week Stats */}
            {thisWeekTotal > 0 && (
                <div className="relative group glass-panel p-5 rounded-2xl shadow-lg border border-orange-500/10 hover:border-orange-500/30 transition-all animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {/* Subtle glow */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                            <h3 className="text-sm font-bold text-zinc-300 group-hover:text-zinc-200 transition-colors">This Week</h3>
                        </div>
                        <span className="text-sm font-bold text-zinc-400 group-hover:text-orange-400 transition-colors">
                            {thisWeekCompleted}/{thisWeekTotal} completed
                        </span>
                    </div>
                    <div className="relative w-full bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                        {/* Animated progress bar */}
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000 ease-out animate-progress-bar relative"
                            style={{ width: `${thisWeekTotal > 0 ? (thisWeekCompleted / thisWeekTotal) * 100 : 0}%` }}
                        >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                        </div>
                        {/* Subtle pulse on the bar */}
                        <div className="absolute inset-0 bg-orange-500/20 animate-pulse pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Daily/Weekly Goals */}
            {dailyGoals.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">This Week (≤7 days)</h3>
                    {dailyGoals.map((goal, index) => (
                    <div
                        key={goal.id}
                        className="relative group flex items-start gap-4 p-6 rounded-xl border transition-all animate-slide-up shadow-xl bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-sm border-zinc-800/60 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02] overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <button
                            onClick={() => handleToggle(goal.id, false)}
                            className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 border-zinc-600 hover:border-green-500 hover:bg-green-500/10 text-transparent hover:text-green-500 flex items-center justify-center transition-all mt-0.5 transform hover:scale-125 active:scale-95"
                            title="Mark complete"
                        >
                            <Check className="w-5 h-5" />
                        </button>

                        <div className="relative z-10 flex-1 min-w-0">
                            <p className="text-sm leading-relaxed transition-all font-semibold text-zinc-100 group-hover:text-white">
                                {goal.text}
                            </p>
                            {goal.deadline && (
                                <div className="flex items-center gap-1.5 mt-2.5 text-xs text-amber-500 group-hover:text-amber-400 transition-colors">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="font-medium">{goal.deadline}</span>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                                onClick={() => handleMarkFailed(goal.id)}
                                className="p-2.5 text-zinc-500 hover:text-red-400 transition-all transform hover:scale-125 active:scale-95 rounded-lg hover:bg-red-500/20"
                                title="Mark as failed"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(goal.id)}
                                className="p-2.5 text-zinc-600 hover:text-zinc-300 transition-all transform hover:scale-125 active:scale-95 rounded-lg hover:bg-zinc-700/50"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
            )}

            {/* Short-term Goals (1 week to 2 months) */}
            {shortTermGoals.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Short-Term (1 week - 2 months)</h3>
                    {shortTermGoals.map((goal, index) => (
                    <div
                        key={goal.id}
                        className="relative group flex items-start gap-4 p-6 rounded-xl border transition-all animate-slide-up shadow-xl bg-gradient-to-br from-blue-900/25 to-black/90 backdrop-blur-sm border-blue-800/40 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <button
                            onClick={() => handleToggle(goal.id, false)}
                            className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 border-zinc-600 hover:border-green-500 hover:bg-green-500/10 text-transparent hover:text-green-500 flex items-center justify-center transition-all mt-0.5 transform hover:scale-125 active:scale-95"
                            title="Mark complete"
                        >
                            <Check className="w-5 h-5" />
                        </button>

                        <div className="relative z-10 flex-1 min-w-0">
                            <p className="text-sm leading-relaxed transition-all font-semibold text-zinc-100 group-hover:text-white">
                                {goal.text}
                            </p>
                            {goal.deadline && (
                                <div className="flex items-center gap-1.5 mt-2.5 text-xs text-blue-500 group-hover:text-blue-400 transition-colors">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="font-medium">{goal.deadline}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleMarkFailed(goal.id)}
                                className="p-2 text-zinc-500 hover:text-red-400 transition-all transform hover:scale-110 rounded-lg hover:bg-red-500/10"
                                title="Mark as failed"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(goal.id)}
                                className="p-2 text-zinc-600 hover:text-zinc-400 transition-all transform hover:scale-110 rounded-lg"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
            )}

            {/* Medium-term Goals (2 to 5 months) */}
            {mediumTermGoals.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Mid-Term (2 - 5 months)</h3>
                    {mediumTermGoals.map((goal, index) => (
                    <div
                        key={goal.id}
                        className="relative group flex items-start gap-4 p-6 rounded-xl border transition-all animate-slide-up shadow-xl bg-gradient-to-br from-purple-900/25 to-black/90 backdrop-blur-sm border-purple-800/40 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <button
                            onClick={() => handleToggle(goal.id, false)}
                            className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 border-zinc-600 hover:border-green-500 hover:bg-green-500/10 text-transparent hover:text-green-500 flex items-center justify-center transition-all mt-0.5 transform hover:scale-125 active:scale-95"
                            title="Mark complete"
                    >
                        <Check className="w-5 h-5" />
                    </button>

                    <div className="relative z-10 flex-1 min-w-0">
                            <p className="text-sm leading-relaxed transition-all font-semibold text-zinc-100 group-hover:text-white">
                                {goal.text}
                            </p>
                            {goal.deadline && (
                                <div className="flex items-center gap-1.5 mt-2.5 text-xs text-purple-500 group-hover:text-purple-400 transition-colors">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="font-medium">{goal.deadline}</span>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                                onClick={() => handleMarkFailed(goal.id)}
                                className="p-2.5 text-zinc-500 hover:text-red-400 transition-all transform hover:scale-125 active:scale-95 rounded-lg hover:bg-red-500/20"
                                title="Mark as failed"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(goal.id)}
                                className="p-2 text-zinc-600 hover:text-zinc-400 transition-all transform hover:scale-110 rounded-lg"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
            )}

            {/* Long-term Goals (5+ months) */}
            {longTermGoals.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Long-Term (5+ months)</h3>
                    {longTermGoals.map((goal, index) => (
                    <div
                        key={goal.id}
                        className="relative group flex items-start gap-4 p-6 rounded-xl border transition-all animate-slide-up shadow-xl bg-gradient-to-br from-amber-900/25 to-black/90 backdrop-blur-sm border-amber-800/40 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/20 hover:scale-[1.02] overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <button
                            onClick={() => handleToggle(goal.id, false)}
                            className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 border-zinc-600 hover:border-green-500 hover:bg-green-500/10 text-transparent hover:text-green-500 flex items-center justify-center transition-all mt-0.5 transform hover:scale-125 active:scale-95"
                            title="Mark complete"
                        >
                            <Check className="w-5 h-5" />
                        </button>

                        <div className="relative z-10 flex-1 min-w-0">
                            <p className="text-sm leading-relaxed transition-all font-semibold text-zinc-100 group-hover:text-white">
                            {goal.text}
                        </p>
                        {goal.deadline && (
                            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-amber-500 group-hover:text-amber-400 transition-colors">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="font-medium">{goal.deadline}</span>
                            </div>
                        )}
                        </div>

                        <div className="relative z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                                onClick={() => handleMarkFailed(goal.id)}
                                className="p-2.5 text-zinc-500 hover:text-red-400 transition-all transform hover:scale-125 active:scale-95 rounded-lg hover:bg-red-500/20"
                                title="Mark as failed"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(goal.id)}
                                className="p-2 text-zinc-500 hover:text-zinc-300 transition-all transform hover:scale-110 rounded-lg hover:bg-zinc-700/50"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                </div>
            )}

            {/* Victories (Completed Goals) */}
            {completedGoals.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-green-500" />
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider">Victories</h3>
                    </div>
                    {completedGoals.map((goal) => (
                        <div
                            key={goal.id}
                            className="relative group flex items-start gap-4 p-6 rounded-xl border transition-all shadow-xl bg-green-500/10 border-green-500/30 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/20 hover:scale-[1.02] overflow-hidden"
                        >
                            {/* Glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-400/60 flex items-center justify-center text-white shadow-lg shadow-green-500/40 mt-0.5 group-hover:scale-110 transition-transform">
                                <Check className="w-5 h-5" />
                            </div>

                            <div className="relative z-10 flex-1 min-w-0">
                                <p className="text-sm leading-relaxed font-semibold text-zinc-300 line-through group-hover:text-zinc-200 transition-colors">
                                    {goal.text}
                                </p>
                                <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                    {goal.completedAt && (
                                        <span className="font-medium">✓ {new Date(goal.completedAt).toLocaleDateString()}</span>
                                    )}
                                    {goal.deadline && (
                                        <>
                                            <span>•</span>
                                            <span>Target: {goal.deadline}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                    <button
                        onClick={() => handleDelete(goal.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-zinc-400 transition-all transform hover:scale-110 rounded-lg"
                                title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
                </div>
            )}

            {/* Failed Promises */}
            {failedGoals.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Unfulfilled Promises</h3>
                    </div>
                    {failedGoals.map((goal) => (
                        <div
                            key={goal.id}
                            className="group flex items-start gap-4 p-5 rounded-xl border transition-all shadow-lg bg-red-500/5 border-red-500/20"
                        >
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-400/50 flex items-center justify-center text-white shadow-lg shadow-red-500/30 mt-0.5">
                                <X className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-relaxed font-medium text-zinc-400 line-through">
                                    {goal.text}
                                </p>
                                {goal.deadline && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-600">
                                        <Calendar className="w-3 h-3" />
                                        <span>Deadline: {goal.deadline}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleDelete(goal.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-zinc-400 transition-all transform hover:scale-110 rounded-lg"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Motivational Footer */}
            {(completedGoals.length > 0 || failedGoals.length > 0) && (
                <div className="text-center pt-4">
                    <p className="text-sm text-zinc-500">
                        {failedGoals.length > 0 
                            ? "Learn from the past. Execute in the present." 
                            : completedGoals.length === totalGoals
                            ? "All goals crushed. Set new ones."
                            : "Keep pushing. Every victory counts."}
                    </p>
                </div>
            )}
        </div>
    );
}
