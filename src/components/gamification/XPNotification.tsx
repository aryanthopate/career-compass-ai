import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, Trophy, TrendingUp } from 'lucide-react';

interface XPNotificationProps {
  xp: number;
  action: string;
  show: boolean;
  onClose: () => void;
}

export function XPNotification({ xp, action, show, onClose }: XPNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-24 left-1/2 z-50"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-orange-500/30 blur-xl rounded-full" />
            
            <div className="relative glass-card px-6 py-4 rounded-2xl border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center"
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  {/* Sparkles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: [0, 1.5], opacity: [1, 0] }}
                      transition={{ delay: i * 0.2, duration: 0.6 }}
                      className="absolute top-1/2 left-1/2"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <div>
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent"
                  >
                    +{xp} XP
                  </motion.div>
                  <p className="text-sm text-muted-foreground">{action}</p>
                </div>

                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                    >
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LevelUpNotificationProps {
  level: number;
  skill: string;
  show: boolean;
  onClose: () => void;
}

export function LevelUpNotification({ level, skill, show, onClose }: LevelUpNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-24 right-8 z-50"
        >
          <div className="relative">
            {/* Celebration particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  x: Math.cos((i / 12) * Math.PI * 2) * 100,
                  y: Math.sin((i / 12) * Math.PI * 2) * 100,
                }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary"
              />
            ))}

            <div className="glass-card px-8 py-6 rounded-2xl border-2 border-primary/50 shadow-glow">
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-1">Level Up!</h3>
                  <p className="text-sm text-muted-foreground mb-2">{skill}</p>
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-lg font-bold text-primary">Level {level}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AchievementNotificationProps {
  name: string;
  description: string;
  icon?: string;
  show: boolean;
  onClose: () => void;
}

export function AchievementNotification({ name, description, icon, show, onClose }: AchievementNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-24 right-8 z-50"
        >
          <div className="glass-card px-6 py-4 rounded-2xl border-2 border-amber-500/50 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl">
                {icon || '🏆'}
              </div>
              <div>
                <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-1">
                  Achievement Unlocked!
                </p>
                <h4 className="font-bold">{name}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
