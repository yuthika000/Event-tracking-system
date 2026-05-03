
import React from 'react';
import { UserRole } from '../types';
import { User, ShieldCheck, GraduationCap, Building2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onSelect: (role: UserRole) => void;
}

const PortalSelection: React.FC<Props> = ({ onSelect }) => {
  const portals = [
    {
      role: UserRole.STUDENT,
      title: 'Student Portal',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-200',
      desc: 'Digitalized applications for OD, Leave, and Permissions.'
    },
    {
      role: UserRole.ADVISOR,
      title: 'Advisor Portal',
      icon: User,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200',
      desc: 'First-level academic verification and workflow approval.'
    },
    {
      role: UserRole.HOD,
      title: 'HOD Portal',
      icon: Building2,
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-purple-200',
      desc: 'Departmental oversight and secondary validation.'
    },
    {
      role: UserRole.PRINCIPAL,
      title: 'Principal Portal',
      icon: ShieldCheck,
      color: 'from-rose-500 to-orange-600',
      shadow: 'shadow-rose-200',
      desc: 'Final executive authority for high-level permissions.'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.4, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.4, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px]"
      />

      <div className="max-w-5xl w-full text-center mb-16 relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 backdrop-blur-md border border-slate-200 rounded-full shadow-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-600 tracking-widest uppercase">The Future of Campus Workflow</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]"
        >
          Student Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Tracker</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          A seamless, transparent, and high-efficiency approval system designed for modern educational institutions.
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full relative z-10"
      >
        {portals.map((portal) => (
          <motion.button
            key={portal.role}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(portal.role)}
            className="group relative bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50 hover:border-indigo-400 hover:shadow-[0_30px_60px_rgba(79,70,229,0.12)] transition-all duration-300 text-left"
          >
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${portal.color} flex items-center justify-center mb-8 shadow-2xl ${portal.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
              <portal.icon className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
              {portal.title}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {portal.desc}
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-indigo-600 tracking-wide uppercase">Get Started</span>
              <div className="w-8 h-px bg-indigo-200 group-hover:w-16 transition-all duration-500"></div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-20 text-slate-400 text-sm font-medium relative z-10"
      >
        Built for transparency and administrative excellence.
      </motion.footer>
    </div>
  );
};

export default PortalSelection;
