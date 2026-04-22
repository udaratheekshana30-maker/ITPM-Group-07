import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Waves, 
  Wind, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Settings,
  LayoutDashboard,
  Calendar
} from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const MachineCard = ({ machine, onBook }) => {
  const isAvailable = machine.status === 'available';
  const Icon = machine.type === 'washer' ? Waves : Wind;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${isAvailable ? 'bg-indigo-500/20' : 'bg-slate-700/20'}`}>
          <Icon className={isAvailable ? 'text-indigo-400' : 'text-slate-400'} size={28} />
        </div>
        <span className={`status-badge status-${machine.status}`}>
          {machine.status}
        </span>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-1">{machine.name}</h3>
        <p className="text-slate-400 text-sm capitalize">{machine.type}</p>
      </div>

      <div className="flex items-center gap-2 mt-4 text-sm">
        {machine.status === 'busy' ? (
          <>
            <Clock size={16} className="text-yellow-400" />
            <span className="text-yellow-400 font-medium">{machine.timeRemaining} mins remaining</span>
          </>
        ) : isAvailable ? (
          <>
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-green-400 font-medium">Ready to use</span>
          </>
        ) : (
          <>
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400 font-medium">Maintenance required</span>
          </>
        )}
      </div>

      <button 
        onClick={() => onBook(machine.id)}
        disabled={!isAvailable}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
      >
        {isAvailable ? 'Book Now' : 'Currently Unavailable'}
      </button>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
        <Icon size={120} />
      </div>
    </motion.div>
  );
};

const App = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API_URL}/machines`);
      setMachines(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching machines:', error);
      setLoading(false);
    }
  };

  const handleBook = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/book`, { id });
      if (response.data.success) {
        showNotification('Machine booked successfully!', 'success');
        fetchMachines();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Booking failed', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="container min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1>Laundry<span className="text-indigo-400">Hub</span></h1>
          <p className="subtitle">Smart laundry management for modern living.</p>
        </motion.div>

        <div className="flex gap-4">
          <div className="glass-card px-6 py-4 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Available</p>
              <p className="text-2xl font-bold">{machines.filter(m => m.status === 'available').length}</p>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Busy</p>
              <p className="text-2xl font-bold">{machines.filter(m => m.status === 'busy').length}</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="flex gap-6 mb-10 overflow-x-auto pb-4">
        {[
          { icon: LayoutDashboard, label: 'Overview', active: true },
          { icon: Waves, label: 'Washers', active: false },
          { icon: Wind, label: 'Dryers', active: false },
          { icon: Calendar, label: 'Schedules', active: false },
          { icon: Settings, label: 'Settings', active: false },
        ].map((item, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -2 }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              item.active 
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
              : 'text-slate-400 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-semibold whitespace-nowrap">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <motion.div 
          className="grid-container"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {machines.map(machine => (
            <MachineCard key={machine.id} machine={machine} onBook={handleBook} />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              notification.type === 'success' 
              ? 'bg-green-500/20 border-green-500/40 text-green-400' 
              : 'bg-red-500/20 border-red-500/40 text-red-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="font-semibold">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 pt-10 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>© 2026 LaundryHub Pro. All rights reserved.</p>
        <p className="mt-2">Connecting people with clean clothes, one cycle at a time.</p>
      </footer>
    </div>
  );
};

export default App;
