import React, { useState, useRef } from 'react';
import { MessageCircle, X, Rocket, Battery, Flame, Target, Heart, Trophy, Brain, ChevronRight, Compass, Zap } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import { TopicTags } from './TopicTags';
import { useSupabase } from '../../contexts/SupabaseContext';
import { supabase } from '../../lib/supabase';
import { GuideMessage as GuideMessageComponent } from './GuideMessage';

interface FormattedSection {
  title: string;
  icon: React.ReactNode;
  content: string[];
  color?: string;
}

const formatResponse = (topic: string): FormattedSection[] => {
  switch (topic) {
    case 'how-to-play':
      return [{
        title: 'Your Mission',
        icon: <Rocket className="text-orange-500" size={16} />,
        content: [
          'Add 20+ years of healthy life!',
          'Create your profile and set your health baseline',
          'Earn Fuel Points through daily healthy actions',
          'Launch your Health Rocket to level up'
        ]
      }, {
        title: 'Health Categories',
        icon: <Heart className="text-orange-500" size={16} />,
        content: [
          'Mindset',
          'Sleep',
          'Exercise', 
          'Nutrition',
          'Biohacking'
        ]
      }, {
        title: 'Track Progress',
        icon: <Target className="text-orange-500" size={16} />,
        content: [
          'Track your +HealthSpan and HealthScore progress with monthly updates',
          'Win prizes and climb the leaderboard'
        ]
      }];

    case 'fuel-points':
      return [{
        title: 'Earn Fuel Points (FP)',
        icon: <Battery className="text-orange-500" size={16} />,
        content: [
          'Daily Boosts (1-9 FP each)',
          'Challenges (50 FP)',
          'Quests (150 FP)'
        ]
      }, {
        title: 'Level Up System',
        icon: <Rocket className="text-orange-500" size={16} />,
        content: [
          'Level 2 requires 20 FP',
          'Each new level needs 41.4% more FP'
        ]
      }, {
        title: 'Unlock Features',
        icon: <ChevronRight className="text-orange-500" size={16} />,
        content: [
          'New challenges',
          'Additional quest slots',
          'Special prizes'
        ]
      }];

    case 'boosts':
      return [{
        title: 'Daily Actions',
        icon: <Flame className="text-orange-500" size={16} />,
        content: [
          'Complete up to 3 Daily Boosts',
          'Each boost has a 7-day cooldown'
        ]
      }, {
        title: 'Burn Streak Bonuses',
        icon: <Flame className="text-lime-500" size={16} />,
        content: [
          '3 days: +5 FP',
          '7 days: +10 FP',
          '21 days: +100 FP'
        ]
      }, {
        title: 'Pro Features',
        icon: <Trophy className="text-orange-500" size={16} />,
        content: [
          'Pro Plan unlocks Tier 2 Boosts',
          'Maintain streaks to unlock challenges'
        ]
      }];

    case 'challenges':
      return [{
        title: 'Challenges',
        icon: <Target className="text-orange-500" size={16} />,
        content: [
          '21-day duration',
          'Earn 50 FP each',
          'Unlock after 3-day streak',
          'Chat with other challengers',
          'Required verification posts'
        ]
      }, {
        title: 'Quests',
        icon: <Trophy className="text-orange-500" size={16} />,
        content: [
          '90-day duration',
          'Earn 150 FP each',
          'Complete 2-3 related challenges',
          'Quest group chat support',
          'Verification milestones required'
        ]
      }, {
        title: 'Pro Content',
        icon: <ChevronRight className="text-orange-500" size={16} />,
        content: [
          'Pro Plan unlocks Tier 2 content'
        ]
      }];

    case 'health':
      return [{
        title: 'HealthScore Categories',
        icon: <Heart className="text-orange-500" size={16} />,
        content: [
          'Mindset (20%)',
          'Sleep (20%)',
          'Exercise (20%)',
          'Nutrition (20%)',
          'Biohacking (20%)'
        ]
      }, {
        title: 'Progress Tracking',
        icon: <Target className="text-orange-500" size={16} />,
        content: [
          'Update score monthly (every 30 days)',
          '+HealthSpan shows added years of healthy life',
          'Track progress toward 20+ year goal'
        ]
      }];

    case 'prizes':
      return [{
        title: 'Monthly Status Ranks',
        icon: <Trophy className="text-orange-500" size={16} />,
        content: [
          'Commander (All players)',
          'Hero (Top 50%) - 2X prize chances',
          'Legend (Top 10%) - 5X prize chances'
        ]
      }, {
        title: 'Prize System',
        icon: <Trophy className="text-lime-500" size={16} />,
        content: [
          'Monthly prize pools with draws every 30 days',
          'Win products from health partners',
          'Pro Plan required for prizes'
        ]
      }];

    case 'experts':
      return [{
        title: 'Mindset Experts',
        icon: <Brain className="text-orange-500" size={16} />,
        content: [
          'Dr. Andrew Huberman (Neuroscience)',
          'Dr. Joe Dispenza (Mental performance)',
          'Tony Robbins (Peak performance)',
          'Dr. Carol Dweck (Growth mindset)',
          'Sam Harris (Meditation)'
        ]
      }, {
        title: 'Sleep Experts',
        icon: <Brain className="text-blue-500" size={16} />,
        content: [
          'Dr. Matthew Walker (Sleep science)',
          'Dr. Kirk Parsley (Executive sleep)',
          'Dr. Michael Breus (Chronotypes)',
          'Dan Pardi (Sleep technology)',
          'Dr. Meir Kryger (Sleep disorders)'
        ]
      }, {
        title: 'Exercise Experts',
        icon: <Brain className="text-lime-500" size={16} />,
        content: [
          'Dr. Peter Attia (Longevity)',
          'Dr. Andy Galpin (Muscle physiology)',
          'Dr. Gabrielle Lyon (Muscle-centric medicine)',
          'Ben Patrick (Joint health)',
          'Eugene Trufkin (Business leader fitness)'
        ]
      }, {
        title: 'Nutrition Experts',
        icon: <Brain className="text-yellow-500" size={16} />,
        content: [
          'Dr. Casey Means (Metabolic health)',
          'Dr. Mark Hyman (Functional medicine)',
          'Dr. Rhonda Patrick (Nutrigenomics)',
          'Dr. Steven Gundry (Longevity nutrition)',
          'Chris Kresser (Practical nutrition)'
        ]
      }, {
        title: 'Biohacking Experts',
        icon: <Brain className="text-purple-500" size={16} />,
        content: [
          'Dave Asprey (Performance optimization)',
          'Dr. David Sinclair (Longevity research)',
          'Ben Greenfield (Advanced protocols)',
          'Dr. Molly Maloof (Health optimization)',
          'Siim Land (Metabolic optimization)'
        ]
      }];

    default:
      return [];
  }
};

const formatMessage = (sections: FormattedSection[]): string => {
  return sections.map(section => {
    const title = `${section.title}\n`;
    const content = section.content.map(line => `• ${line}`).join('\n');
    return `${title}${content}\n`;
  }).join('\n');
};

const GUIDE_RESPONSES: Record<string, string> = {
  'how-to-play': formatMessage(formatResponse('how-to-play')),
  'fuel-points': formatMessage(formatResponse('fuel-points')),
  'boosts': formatMessage(formatResponse('boosts')),
  'challenges': formatMessage(formatResponse('challenges')),
  'health': formatMessage(formatResponse('health')),
  'prizes': formatMessage(formatResponse('prizes')),
  'experts': formatMessage(formatResponse('experts'))
};

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export function PlayerGuide() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const { user } = useSupabase();

  // Show initial menu when opening
  const handleOpen = () => {
    setIsOpen(true);
    setMessages([{
      text: "I'm MC, your Health Rocket guide. I can help you learn about:",
      isUser: false
    }]);
    setCurrentTopic(null);
    setShowSupportForm(false);
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supportMessage.trim()) return;

    try {
      const { error } = await supabase.rpc('submit_support_message', {
        p_user_id: user.id,
        p_message: supportMessage
      });

      if (error) throw error;

      // Add success message
      setMessages(prev => [...prev, {
        text: "Thanks for reaching out! Our support team will get back to you soon.",
        isUser: false
      }]);

      // Reset form
      setSupportMessage('');
      setShowSupportForm(false);
    } catch (err) {
      console.error('Error submitting support message:', err);
      setMessages(prev => [...prev, {
        text: "Sorry, there was an error sending your message. Please try again.",
        isUser: false
      }]);
    }
  };

  const handleTopicSelect = (topicId: string) => {
    setMessages(prev => [
      ...prev,
      { text: GUIDE_RESPONSES[topicId], isUser: false }
    ]);
    setCurrentTopic(topicId);
  };

  const handleBackToTopics = () => {
    setCurrentTopic(null);
    setMessages([{
      text: "I'm MC, your Health Rocket player guide. I can help you learn more about:",
      isUser: false
    }]);
  };

  return (
    <div className="sticky bottom-0 z-50 flex items-center gap-2">
    </div>
  );
}