import React, { useState } from 'react';
import { Settings, Radio, XCircle, ChevronRight } from 'lucide-react';
import { useCosmo } from '../../contexts/CosmoContext';

interface CosmoPreferencesProps {
  onClose: () => void;
}

export function CosmoPreferences({ onClose }: CosmoPreferencesProps) {
  const { state, disableUntil } = useCosmo();
  const [mode, setMode] = useState<'enable' | 'dismiss'>(state.disabledUntil ? 'enable' : 'dismiss');

  const handleAction = (type: 'next-level' | 'manual' | null) => {
    disableUntil(type);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="text-orange-500" size={20} />
          <h3 className="text-lg font-semibold text-white">Cosmo Settings</h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex bg-gray-700/50 p-0.5 rounded-lg">
          <button
            onClick={() => setMode('enable')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'enable' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio size={14} />
            <span>Enable</span>
          </button>
          <button
            onClick={() => setMode('dismiss')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'dismiss' 
                ? 'bg-gray-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <XCircle size={14} />
            <span>Dismiss</span>
          </button>
        </div>

        {/* Action Options */}
        <div className="p-4 bg-gray-700/50 rounded-lg space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="text-orange-500" size={18} />
            <div>
              <div className="text-sm font-medium text-white">
                {mode === 'enable' ? 'Enable Cosmo' : 'Dismiss Cosmo'}
              </div>
              <div className="text-xs text-gray-400">
                {mode === 'enable' 
                  ? 'Re-enable Cosmo to show on page refresh'
                  : 'Choose how long to dismiss Cosmo'
                }
              </div>
            </div>
          </div>
          
          {mode === 'enable' ? (
            <button
              onClick={() => handleAction(null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Radio size={16} />
              <span>Enable Cosmo</span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => handleAction('next-level')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
              >
                <span>Until Next Level</span>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => handleAction('manual')}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
              >
                <span>Until I Enable</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}