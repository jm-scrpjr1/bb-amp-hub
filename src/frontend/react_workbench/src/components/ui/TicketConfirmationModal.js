import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { X, Ticket } from 'lucide-react';
import GenieModal from './GenieModal';

const TicketConfirmationModal = memo(function TicketConfirmationModal({ isOpen, onClose, triggerElement, ticketType = 'IT' }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // For now, just close the modal
    console.log('Ticket submitted:', { title, summary, type: ticketType });
    setTitle('');
    setSummary('');
    onClose();
  }, [title, summary, ticketType, onClose]);

  const handleCancel = useCallback(() => {
    setTitle('');
    setSummary('');
    onClose();
  }, [onClose]);

  if (!mounted) return null;

  const getTicketTypeInfo = () => {
    switch (ticketType) {
      case 'HR':
        return {
          title: 'HR Support Portal',
          description: 'Human Resources assistance',
          gradient: 'from-green-600 via-green-700 to-green-800',
          borderColor: 'border-green-300/50',
          glowColor: 'from-green-500/20 via-emerald-500/20 to-green-600/20',
          focusColor: 'focus:ring-green-500/50 focus:border-green-500 hover:border-green-300'
        };
      default:
        return {
          title: 'IT Support Portal',
          description: 'Information Technology assistance',
          gradient: 'from-blue-600 via-blue-700 to-blue-800',
          borderColor: 'border-blue-300/50',
          glowColor: 'from-blue-500/20 via-cyan-500/20 to-blue-600/20',
          focusColor: 'focus:ring-blue-500/50 focus:border-blue-500 hover:border-blue-300'
        };
    }
  };

  const typeInfo = getTicketTypeInfo();

  return (
    <GenieModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      className={`bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border ${typeInfo.borderColor}`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(37, 99, 235, 0.2), 0 0 50px rgba(37, 99, 235, 0.2)'
      }}
    >
      {/* Animated border glow */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${typeInfo.glowColor} blur-sm -z-10`} />

      {/* Header with theme-aligned gradient */}
      <div className={`relative p-6 bg-gradient-to-r ${typeInfo.gradient} text-white overflow-hidden`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              backgroundSize: '100% 100%',
            }}
          />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.05, 1]
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <Ticket className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h2
                className="text-xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {typeInfo.title}
              </motion.h2>
              <motion.p
                className="text-blue-100 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {typeInfo.description}
              </motion.p>
            </div>
          </div>

          <motion.div
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-sm border border-white/20"
            title="Close"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      {/* Enhanced Form Content */}
      <form onSubmit={handleSubmit} className="p-8 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="space-y-6">
          {/* Title Field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="ticket-title" className="block text-sm font-semibold text-gray-800 mb-3">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="ticket-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of your issue"
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 ${typeInfo.focusColor} outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm`}
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
            </div>
          </motion.div>

          {/* Summary Field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="ticket-summary" className="block text-sm font-semibold text-gray-800 mb-3">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="ticket-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Please provide more details about your issue..."
                rows={4}
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 ${typeInfo.focusColor} outline-none transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm`}
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Enhanced Action Buttons */}
        <motion.div
          className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            onClick={handleCancel}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-150 cursor-pointer font-medium border border-gray-200 hover:border-gray-300"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.1 }}
          >
            Cancel
          </motion.div>
          <motion.button
            type="submit"
            className={`px-8 py-3 bg-gradient-to-r ${ticketType === 'HR' ? 'from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600' : 'from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600'} text-white rounded-xl transition-colors duration-150 font-medium shadow-lg hover:shadow-xl`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.1 }}
          >
            <span className="flex items-center space-x-2">
              <span>Submit Ticket</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </span>
          </motion.button>
        </motion.div>
      </form>
    </GenieModal>
  );
});

export default TicketConfirmationModal;
