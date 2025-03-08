import React, { useState } from 'react';
import { X, Send, Brain, Moon, Activity, Apple, Database, Rocket } from 'lucide-react';

interface CosmoMessage {
  id: string;
  content: string;
  isUser: boolean;
}

interface CosmoChatProps {
  onClose: () => void;
}

export function CosmoChat({ onClose }: CosmoChatProps) {
  const [messages, setMessages] = useState<CosmoMessage[]>([{
    id: 'welcome',
    content: "Hi! I'm Cosmo, your Health Rocket guide. How can I help you optimize your health journey?",
    isUser: false
  }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: CosmoMessage = {
      id: crypto.randomUUID(),
      content: input,
      isUser: true
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate Cosmo response
    setTimeout(() => {
      const cosmoMessage: CosmoMessage = {
        id: crypto.randomUUID(),
        content: getResponse(input),
        isUser: false
      };
      setMessages(prev => [...prev, cosmoMessage]);
    }, 1000);
  };

  const getResponse = (message: string): string => {
    // Simple response mapping - in production this would be more sophisticated
    const responses: Record<string, string> = {
      'help': 'I can help you with game basics, health optimization, and tracking your progress. What would you like to learn about?',
      'boost': 'Daily Boosts are quick actions you can complete each day. You can do up to 3 boosts per day to earn Fuel Points (FP) and maintain your streak.',
      'challenge': 'Challenges are 21-day focused improvements in specific areas. You can have up to 2 active challenges at once.',
      'quest': 'Quests are 90-day transformational journeys that combine multiple challenges and daily boosts.',
      'streak': 'Burn Streaks reward daily consistency. Complete at least 1 boost daily to maintain your streak. You get bonus FP at 3, 7, and 21 days!',
      'points': 'Fuel Points (FP) are earned by completing boosts, challenges, and quests. They help level up your rocket and unlock new features.',
      'default': 'I can help you learn about game mechanics, health optimization strategies, and tracking your progress. What would you like to know more about?'
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    return responses.default;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Rocket className="text-orange-500" size={24} />
            <h2 className="text-lg font-semibold text-white">Chat with Cosmo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.isUser
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Topics */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
            {[
              { icon: <Brain size={14} />, label: 'Mindset' },
              { icon: <Moon size={14} />, label: 'Sleep' },
              { icon: <Activity size={14} />, label: 'Exercise' },
              { icon: <Apple size={14} />, label: 'Nutrition' },
              { icon: <Database size={14} />, label: 'Biohacking' }
            ].map(topic => (
              <button
                key={topic.label}
                onClick={() => setInput(`Tell me about ${topic.label.toLowerCase()}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-full hover:bg-gray-700 whitespace-nowrap text-sm"
              >
                {topic.icon}
                <span>{topic.label}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Cosmo anything..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}