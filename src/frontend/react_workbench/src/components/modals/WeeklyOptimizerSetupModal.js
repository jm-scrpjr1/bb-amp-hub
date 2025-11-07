import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Mail, Layout, MessageSquare, Check, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../providers/AuthProvider';
import environmentConfig from '../../config/environment';

const WeeklyOptimizerSetupModal = ({ isOpen, onClose, onSaveComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    schedule_day: 'Sunday',
    schedule_time: '18:00',
    delivery_email: true,
    delivery_dashboard: true,
    delivery_slack: false,
    user_role: '',
    top_priorities: '',
    time_constraints: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      checkGoogleConnection();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${environmentConfig.apiUrl}/weekly-optimizer/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSettings(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleConnection = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${environmentConfig.apiUrl}/weekly-optimizer/google-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleConnected(data.connected);
      }
    } catch (err) {
      console.error('Error checking Google connection:', err);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setConnecting(true);
      const token = localStorage.getItem('authToken');

      // Get OAuth URL from backend
      const response = await fetch(`${environmentConfig.apiUrl}/weekly-optimizer/google-auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Google OAuth');
      }

      const data = await response.json();

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.authUrl,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll for popup closure
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          setConnecting(false);
          // Recheck connection status
          checkGoogleConnection();
        }
      }, 500);
    } catch (err) {
      console.error('Error connecting Google Calendar:', err);
      alert('Failed to connect Google Calendar. Please try again.');
      setConnecting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${environmentConfig.apiUrl}/weekly-optimizer/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      // Call the callback to trigger optimization
      if (onSaveComplete) {
        try {
          await onSaveComplete();
        } catch (triggerError) {
          console.error('Error triggering optimization:', triggerError);
          // Show detailed error message
          const errorMsg = triggerError.message || 'Failed to trigger optimization';
          alert(`Settings saved successfully!\n\nHowever, there was an issue generating the optimization:\n${errorMsg}\n\nThis might be due to calendar permissions. Please contact your admin or try again later.`);
          onClose();
          return;
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving settings:', err);
      alert(`Failed to save settings:\n${err.message}\n\nPlease try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const scheduleOptions = [
    { day: 'Sunday', time: '18:00', label: 'Every Sunday at 6:00 PM' },
    { day: 'Monday', time: '08:00', label: 'Every Monday at 8:00 AM' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Weekly Optimizer Setup</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <>
                {/* Calendar Connection Status */}
                {googleConnected ? (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-500 rounded-full p-3">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                          📅 Calendar Connected
                        </h3>
                        <p className="text-green-700 text-sm mb-2">
                          Your Google Calendar is connected and ready!
                        </p>
                        <div className="bg-white rounded-lg p-3 mt-3">
                          <p className="text-sm text-gray-700">
                            <strong>Connected Account:</strong> {user?.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ✓ Read calendar events<br />
                            ✓ Access email summaries
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl p-6 border-2 border-cyan-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full p-3">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          📅 Connect Your Calendar
                        </h3>
                        <p className="text-gray-700 text-sm mb-3">
                          Connect your Google Calendar to enable AI-powered weekly optimization
                        </p>
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-800 mb-2">
                            🔒 Permissions Required:
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>✓ Read calendar events</li>
                            <li>✓ Access email summaries</li>
                          </ul>
                        </div>
                        <button
                          onClick={handleConnectGoogle}
                          disabled={connecting}
                          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {connecting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Calendar className="h-5 w-5" />
                              Connect Google Calendar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Configuration (TPS Context) */}
                <div className="bg-gradient-to-br from-purple-50 to-cyan-50 border-2 border-purple-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Weekly Plan Configuration</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Help me understand your role and priorities for better recommendations:
                  </p>

                  <div className="space-y-4">
                    {/* Role & Context */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Role & Context
                      </label>
                      <input
                        type="text"
                        value={settings.user_role || ''}
                        onChange={(e) => setSettings({ ...settings, user_role: e.target.value })}
                        placeholder="e.g., IT Supervisor, Sales Manager, Product Lead"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Describe your role and current strategic goals
                      </p>
                    </div>

                    {/* Top Priorities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Top Priorities (3-5 OKRs)
                      </label>
                      <textarea
                        value={settings.top_priorities || ''}
                        onChange={(e) => setSettings({ ...settings, top_priorities: e.target.value })}
                        placeholder="e.g., AI Workbench launch, Team capacity building, CISA portal completion"
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        What are your 3-5 most important objectives this week?
                      </p>
                    </div>

                    {/* Time Constraints */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Constraints & Blocks
                      </label>
                      <textarea
                        value={settings.time_constraints || ''}
                        onChange={(e) => setSettings({ ...settings, time_constraints: e.target.value })}
                        placeholder="e.g., Focus time at least 3 hours per day, No meetings before 9 AM"
                        rows={2}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Any non-negotiable commitments or scheduling constraints?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Schedule Preferences */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Schedule Preferences</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Choose when you want your weekly optimization to run:
                  </p>
                  
                  <div className="space-y-3">
                    {scheduleOptions.map((option) => (
                      <label
                        key={`${option.day}-${option.time}`}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          settings.schedule_day === option.day && settings.schedule_time === option.time
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="schedule"
                          checked={settings.schedule_day === option.day && settings.schedule_time === option.time}
                          onChange={() => setSettings({
                            ...settings,
                            schedule_day: option.day,
                            schedule_time: option.time
                          })}
                          className="w-5 h-5 text-purple-600"
                        />
                        <span className="text-gray-800 font-medium">{option.label}</span>
                      </label>
                    ))}
                    
                    <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Custom schedule (coming soon)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5 text-cyan-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Delivery Method</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Choose how you want to receive your weekly optimization:
                  </p>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-cyan-300 transition-all">
                      <input
                        type="checkbox"
                        checked={settings.delivery_email}
                        onChange={(e) => setSettings({ ...settings, delivery_email: e.target.checked })}
                        className="w-5 h-5 text-cyan-600 rounded"
                      />
                      <Mail className="h-5 w-5 text-cyan-600" />
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">Email summary to my inbox</p>
                        <p className="text-xs text-gray-500">Receive a detailed email every week</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-cyan-300 transition-all">
                      <input
                        type="checkbox"
                        checked={settings.delivery_dashboard}
                        onChange={(e) => setSettings({ ...settings, delivery_dashboard: e.target.checked })}
                        className="w-5 h-5 text-cyan-600 rounded"
                      />
                      <Layout className="h-5 w-5 text-cyan-600" />
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">Show in dashboard</p>
                        <p className="text-xs text-gray-500">View in your AI Workbench</p>
                      </div>
                    </label>

                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60">
                      <input
                        type="checkbox"
                        disabled
                        className="w-5 h-5 text-gray-400 rounded"
                      />
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-gray-500 font-medium">Slack notification</p>
                        <p className="text-xs text-gray-400">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Save & Activate Workflow
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WeeklyOptimizerSetupModal;

