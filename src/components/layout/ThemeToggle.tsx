import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative rounded-full overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{
              scale: theme === 'light' ? 1 : 0,
              rotate: theme === 'light' ? 0 : 180,
              opacity: theme === 'light' ? 1 : 0,
            }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            className="absolute"
          >
            <Sun className="w-5 h-5 text-amber-500" />
          </motion.div>
          
          <motion.div
            initial={false}
            animate={{
              scale: theme === 'dark' ? 1 : 0,
              rotate: theme === 'dark' ? 0 : -180,
              opacity: theme === 'dark' ? 1 : 0,
            }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            className="absolute"
          >
            <Moon className="w-5 h-5 text-blue-400" />
          </motion.div>
          
          {/* Animated ring */}
          <motion.div
            initial={false}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ duration: 0.5 }}
            key={theme}
            className={`absolute inset-0 rounded-full ${
              theme === 'dark' ? 'bg-blue-400/20' : 'bg-amber-500/20'
            }`}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Switch to {theme === 'light' ? 'dark' : 'light'} mode</p>
      </TooltipContent>
    </Tooltip>
  );
}
