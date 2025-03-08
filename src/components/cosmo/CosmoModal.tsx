import React, { useState } from 'react';
import { X, Radio, Zap, Trophy, Target, Brain, Moon, Activity, Apple, Database, ChevronLeft, ChevronRight, Heart, Settings, Rocket, Flame, Loader2 } from 'lucide-react';
import { useCosmo } from '../../contexts/CosmoContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { useLevelRecommendations } from '../../hooks/useLevelRecommendations';
import { useNavigate } from 'react-router-dom';
import { CosmoPreferences } from './CosmoPreferences';
import { scrollToSection } from '../../lib/utils';

export function CosmoModal() {
  const { state, hideCosmo } = useCosmo();
  const { user } = useSupabase();
  const { stats } = usePlayerStats(user);
  const { recommendations, loading: loadingRecommendations } = useLevelRecommendations(stats.level);
  const navigate = useNavigate();
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  if (state.isMinimized) {
    return null;
  }

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sleep':
        return <Moon size={16} className="text-orange-500" />;
      case 'mindset':
        return <Brain size={16} className="text-orange-500" />;
      case 'exercise':
        return <Activity size={16} className="text-orange-500" />;
      case 'nutrition':
        return <Apple size={16} className="text-orange-500" />;
      case 'biohacking':
        return <Database size={16} className="text-orange-500" />;
      case 'contests':
        return <Target size={16} className="text-orange-500" />;
      default:
        return <Rocket size={16} className="text-orange-500" />;
    }
  };

  if (showPreferences) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <button
              onClick={() => setShowPreferences(false)} 
              className="text-gray-400 hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          <CosmoPreferences onClose={() => setShowPreferences(false)} />
        </div>
      </div>
    );
  }

  if (selectedTopic) {
    const topic = helpTopics.find(t => t.id === selectedTopic);
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800/70 rounded-lg max-w-md w-full shadow-xl border border-gray-700/50 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {topic?.icon}
              <h2 className="text-lg font-semibold text-white">{topic?.title}</h2>
            </div>
            <button
              onClick={() => setSelectedTopic(null)}
              className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto min-h-0">
            <div className="space-y-8">
              {topic?.content.split('\n\n').map((section, i) => {
                const [title, ...content] = section.split('\n');
                return (
                  <div key={i} className="space-y-3">
                    <h4 className="text-orange-500 font-medium flex items-center gap-2">
                      {getTopicIcon(title)}
                      <span>{title}</span>
                    </h4>
                    <div className="space-y-2 pl-6">
                      {content.map((line, j) => (
                        <div key={j} className="flex items-start gap-2 text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-2 flex-shrink-0" />
                          <span>{line.replace('• ', '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => setSelectedTopic(null)}
                className="flex items-center gap-2 px-4 py-2 bg-black/20 text-orange-500 hover:text-orange-400 rounded-lg hover:bg-black/40 transition-all mt-8 w-full"
              >
                <ChevronLeft size={16} />
                <span>Back to Topics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" />

      {/* Content */}
      <div className="bg-gray-800 rounded-lg max-w-md w-full border border-orange-500/30 shadow-[0_0_15px_rgba(255,107,0,0.15)] relative mt-24 mb-8">
        {/* Header - now has its own stacking context */}
        <div className="flex items-center justify-between p-4 border-b border-orange-500/20 bg-gray-900 relative z-10">
          <div className="flex items-center gap-3">
            <Radio className="text-orange-500 animate-radio-wave" size={24} />
            <h2 className="text-lg font-semibold text-white flex-1 pr-4">I'm Cosmo, your Health Rocket Guide</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={hideCosmo}
              className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreferences(true)}
                className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-700/50 transition-colors flex items-center gap-1"
              >
                <Settings size={12} />
                <span>On/Off</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-6 relative">
          {/* Welcome Message */}
          <div className="text-gray-300 text-sm">
            I can help you Level Up, Earn Fuel Points, and Increase your HealthSpan.
          </div>

          {/* Level 1 Recommendations */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Rocket className="text-orange-500" size={16} />
              <span>Recommendations for Level {stats.level}</span>
            </h3>
            <div className="relative">
              <div className="overflow-hidden">
                {loadingRecommendations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  </div>
                ) : (
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {recommendations.map(rec => (
                    <div
                      key={rec.id}
                      className="w-full flex-shrink-0 px-2"
                    >
                      <div
                        className="w-full p-4 rounded-lg bg-gray-800/95 backdrop-blur-sm border border-orange-500/20 shadow-lg text-left relative hover:border-orange-500/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {getIconForCategory(rec.category)}
                          <div className="flex-1 min-w-0">
                            <div className="mb-8">
                              <h3 className="text-sm font-medium text-white">{rec.title}</h3>
                              <p className="text-xs text-gray-300 mt-1">{rec.description}</p>
                            </div>
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  // Use the scroll_target from the recommendation
                                  scrollToSection(rec.scroll_target, 'start');
                                  if (rec.action === 'openChallengeLibrary') {
                                    // Trigger challenge library to open
                                    window.dispatchEvent(new CustomEvent('openChallengeLibrary'));
                                  }
                                  hideCosmo();
                                }}
                                className="px-4 py-1.5 border border-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-500/10 transition-colors shadow-lg hover:shadow-orange-500/10 mt-2"
                              >
                                Go There
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
              {/* Navigation Buttons */}
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    disabled={currentSlide === 0}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 hover:bg-gray-700/50 rounded-lg transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-1">
                    {recommendations.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          currentSlide === index 
                            ? 'bg-orange-500' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentSlide(prev => Math.min(recommendations.length - 1, prev + 1))}
                    disabled={currentSlide === recommendations.length - 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 hover:bg-gray-700/50 rounded-lg transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {currentSlide + 1} of {recommendations.length}
                </div>
              </div>
            </div>
          </div>

          {/* Help Topics */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Radio className="text-orange-500" size={16} />
              <span>I can also help you learn about:</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {helpTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className="flex flex-col gap-2 p-3 bg-gray-800/95 backdrop-blur-sm border border-orange-500/20 rounded-lg text-left hover:bg-gray-700 hover:border-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-orange-500/10"
                >
                  <div className="text-orange-500">{topic.icon}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{topic.title}</div>
                    <div className="text-xs text-gray-300 mt-0.5">{topic.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const helpTopics = [
  {
    id: 'how-to-play',
    icon: <Rocket size={16} />,
    title: 'Game Basics',
    description: 'Learn how to play and earn rewards',
    content: `Your Mission:
• Add 20+ years of healthy life!
• Create your profile and set your health baseline
• Earn Fuel Points through daily healthy actions
• Launch your Health Rocket to level up

Health Categories:
• Mindset
• Sleep
• Exercise
• Nutrition
• Biohacking

Track Progress:
• Track your +HealthSpan and HealthScore progress with monthly updates
• Win prizes and climb the leaderboard`
  },
  {
    id: 'fuel-points',
    icon: <Zap size={16} />,
    title: 'Fuel Points',
    description: 'Learn about FP and leveling up',
    content: `Earn Fuel Points (FP):
• Daily Boosts (1-9 FP each)
• Challenges (50 FP)
• Quests (150 FP)

Level Up System:
• Level 2 requires 20 FP
• Each new level needs 41.4% more FP

Unlock Features:
• New challenges
• Additional quest slots
• Special prizes`
  },
  {
    id: 'boosts',
    icon: <Activity size={16} />,
    title: 'Daily Boosts',
    description: 'Learn about boosts and streaks',
    content: `Daily Actions:
• Complete up to 3 Daily Boosts
• Each boost has a 7-day cooldown

Burn Streak Bonuses:
• 3 days: +5 FP
• 7 days: +10 FP
• 21 days: +100 FP

Pro Features:
• Pro Plan unlocks Tier 2 Boosts
• Maintain streaks to unlock challenges`
  },
  {
    id: 'challenges',
    icon: <Target size={16} />,
    title: 'Challenges & Quests',
    description: 'Learn about long-term goals',
    content: `Challenges:
• 21-day duration
• Earn 50 FP each
• Unlock after 3-day streak
• Chat with other challengers
• Required verification posts

Quests:
• 90-day duration
• Earn 150 FP each
• Complete 2-3 related challenges
• Quest group chat support
• Verification milestones required

Pro Content:
• Pro Plan unlocks Tier 2 content`
  },
  {
    id: 'health',
    icon: <Heart size={16} />,
    title: 'Health Tracking',
    description: 'Learn about health metrics',
    content: `HealthScore Categories:
• Mindset (20%)
• Sleep (20%)
• Exercise (20%)
• Nutrition (20%)
• Biohacking (20%)

Progress Tracking:
• Update score monthly (every 30 days)
• +HealthSpan shows added years of healthy life
• Track progress toward 20+ year goal`
  },
  {
    id: 'prizes',
    icon: <Trophy size={16} />,
    title: 'Prize Pool',
    description: 'Learn about rewards',
    content: `Monthly Status Ranks:
• Commander (All players)
• Hero (Top 50%) - 2X prize chances
• Legend (Top 10%) - 5X prize chances

Prize System:
• Monthly prize pools with draws every 30 days
• Win products from health partners
• Pro Plan required for prizes`
  }
];

// Helper function to get appropriate icon for section titles
function getTopicIcon(title: string) {
  const iconMap: Record<string, React.ReactNode> = {
    'Your Mission': <Rocket size={18} />,
    'Health Categories': <Heart size={18} />,
    'Track Progress': <Target size={18} />,
    'Earn Fuel Points (FP)': <Zap size={18} />,
    'Level Up System': <Trophy size={18} />,
    'Unlock Features': <ChevronRight size={18} />,
    'Daily Actions': <Activity size={18} />,
    'Burn Streak Bonuses': <Flame size={18} />,
    'Pro Features': <Trophy size={18} />,
    'Challenges': <Target size={18} />,
    'Quests': <Trophy size={18} />,
    'Pro Content': <ChevronRight size={18} />,
    'HealthScore Categories': <Heart size={18} />,
    'Progress Tracking': <Target size={18} />,
    'Monthly Status Ranks': <Trophy size={18} />,
    'Prize System': <Trophy size={18} />,
    'Mindset Experts': <Brain size={18} className="text-orange-500" />,
    'Sleep Experts': <Brain size={18} className="text-blue-500" />,
    'Exercise Experts': <Brain size={18} className="text-lime-500" />,
    'Nutrition Experts': <Brain size={18} className="text-yellow-500" />,
    'Biohacking Experts': <Brain size={18} className="text-purple-500" />
  };

  return iconMap[title] || <ChevronRight size={18} />;
}