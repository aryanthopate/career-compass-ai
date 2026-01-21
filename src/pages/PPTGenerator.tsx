import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Presentation, Sparkles, Wand2, Download, Edit3, ChevronLeft, ChevronRight, 
  Palette, LayoutGrid, Image, Type, Loader2, Check, RefreshCw, Plus, Trash2,
  Zap, Stars, ArrowRight, Settings2, Layers, Eye, ImagePlus, Layout, 
  Quote, BarChart3, GitCompare, Clock, MoveHorizontal, Save, X, Copy,
  TrendingUp, Target, Rocket, Crown, Gem, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import pptxgen from 'pptxgenjs';

interface Slide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  content: string[];
  notes?: string;
  presenterNotes?: string;
  imagePrompt?: string;
  generatedImage?: string;
  layout: 'title' | 'content' | 'two-column' | 'image-left' | 'image-right' | 'quote' | 'stats' | 'timeline' | 'comparison' | 'spotlight' | 'hero-statement' | 'metrics-grid' | 'features-grid' | 'section-break' | 'magazine-hero' | 'chart-story' | 'progress-bars' | 'icon-list' | 'before-after' | 'gallery' | 'call-to-action' | 'key-takeaways' | 'agenda' | 'mixed-left' | 'mixed-right' | 'stats-visual' | 'features-visual' | 'timeline-visual' | 'comparison-visual' | 'quote-visual' | 'spotlight-visual' | 'takeaways-visual' | 'cta-visual';
  accentColor?: string;
  icon?: string;
}

const styleOptions = [
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', description: 'Netflix/Apple style', gradient: 'from-slate-900 to-violet-900' },
  { id: 'neon', name: 'Neon Nights', icon: '💜', description: 'Cyberpunk vibes', gradient: 'from-purple-900 to-pink-600' },
  { id: 'minimal-dark', name: 'Dark Minimal', icon: '🌙', description: 'Sleek & elegant', gradient: 'from-zinc-900 to-slate-800' },
  { id: 'gradient-mesh', name: 'Gradient Mesh', icon: '🌈', description: 'Modern gradients', gradient: 'from-teal-500 to-rose-500' },
  { id: 'corporate', name: 'Corporate Pro', icon: '💼', description: 'Fortune 500 ready', gradient: 'from-blue-900 to-indigo-800' },
  { id: 'startup', name: 'Startup Pitch', icon: '🚀', description: 'VC-ready deck', gradient: 'from-orange-600 to-rose-600' },
];

const colorSchemes = [
  { id: 'midnight-aurora', name: 'Midnight Aurora', colors: ['#0f0a1a', '#6366f1', '#a855f7', '#22d3ee'], gradient: 'from-indigo-950 via-purple-600 to-cyan-400' },
  { id: 'cyber-neon', name: 'Cyber Neon', colors: ['#0a0a0f', '#f43f5e', '#a855f7', '#06ffa5'], gradient: 'from-rose-600 via-purple-500 to-emerald-400' },
  { id: 'ocean-depths', name: 'Ocean Depths', colors: ['#020617', '#0ea5e9', '#6366f1', '#06b6d4'], gradient: 'from-blue-950 via-blue-500 to-cyan-400' },
  { id: 'solar-flare', name: 'Solar Flare', colors: ['#1c0a00', '#f97316', '#ef4444', '#fbbf24'], gradient: 'from-orange-950 via-orange-500 to-amber-400' },
  { id: 'forest-mist', name: 'Forest Mist', colors: ['#021a0a', '#10b981', '#34d399', '#6ee7b7'], gradient: 'from-green-950 via-emerald-500 to-green-300' },
  { id: 'royal-gold', name: 'Royal Gold', colors: ['#1a0a20', '#7c3aed', '#d97706', '#fcd34d'], gradient: 'from-purple-950 via-violet-600 to-amber-400' },
];

const layoutOptions = [
  { id: 'title', name: 'Title Hero', icon: Crown, description: 'Cinematic opener' },
  { id: 'magazine-hero', name: 'Magazine', icon: Layers, description: 'Editorial style' },
  { id: 'spotlight', name: 'Spotlight', icon: Zap, description: 'Feature focus' },
  { id: 'hero-statement', name: 'Statement', icon: Quote, description: 'Bold quote' },
  { id: 'stats', name: 'Stats', icon: BarChart3, description: 'Big metrics' },
  { id: 'metrics-grid', name: 'Metrics Grid', icon: LayoutGrid, description: 'Data dashboard' },
  { id: 'chart-story', name: 'Chart Story', icon: TrendingUp, description: 'Single stat' },
  { id: 'features-grid', name: 'Features', icon: Gem, description: 'Feature cards' },
  { id: 'timeline', name: 'Timeline', icon: Clock, description: 'Process steps' },
  { id: 'comparison', name: 'Compare', icon: GitCompare, description: 'Side by side' },
  { id: 'image-left', name: 'Image Left', icon: ImagePlus, description: 'Visual + text' },
  { id: 'image-right', name: 'Image Right', icon: ImagePlus, description: 'Text + visual' },
  { id: 'quote', name: 'Quote', icon: Quote, description: 'Testimonial' },
  { id: 'call-to-action', name: 'CTA', icon: Rocket, description: 'Action slide' },
  { id: 'section-break', name: 'Section', icon: Layout, description: 'Divider' },
  { id: 'content', name: 'Bullets', icon: Layers, description: 'Standard' },
];

export default function PPTGenerator() {
  const [step, setStep] = useState<'prompt' | 'customize' | 'preview' | 'edit'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [includeImages, setIncludeImages] = useState(true);
  const [generateAIImages, setGenerateAIImages] = useState(true);
  const [aiChoose, setAiChoose] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [previewMode, setPreviewMode] = useState<'slide' | 'grid'>('slide');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a presentation topic');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('🎬 Creating your masterpiece...');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ppt', {
        body: {
          prompt,
          style: aiChoose ? 'AI will select optimal creative direction' : selectedStyle,
          colorScheme: aiChoose ? 'AI will select perfect color harmony' : selectedColor,
          slideCount,
          includeImages,
          generateImages: generateAIImages && includeImages,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSlides(data.slides);
      setStep('preview');
      setCurrentSlide(0);
      toast.success('🎉 Legendary presentation created!');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate presentation');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const handleDownload = async () => {
    if (slides.length === 0) return;

    try {
      const pptx = new pptxgen();
      
      pptx.author = 'HireGenie AI';
      pptx.title = slides[0]?.title || 'AI Generated Presentation';
      pptx.subject = prompt;
      pptx.layout = 'LAYOUT_WIDE';

      // Premium color palettes
      const colorMap: Record<string, { 
        dark: string; primary: string; secondary: string; accent: string; 
        text: string; glow: string; neon: string; surface: string; muted: string;
      }> = {
        'midnight-aurora': { 
          dark: '0f0a1a', primary: '6366f1', secondary: 'a855f7', accent: '22d3ee', 
          text: 'FFFFFF', glow: 'c4b5fd', neon: '67e8f9', surface: '1e1b4b', muted: '6b7280'
        },
        'cyber-neon': { 
          dark: '0a0a0f', primary: 'f43f5e', secondary: 'a855f7', accent: '06ffa5', 
          text: 'FFFFFF', glow: 'fda4af', neon: '34d399', surface: '1f1f2e', muted: '6b7280'
        },
        'ocean-depths': { 
          dark: '020617', primary: '0ea5e9', secondary: '6366f1', accent: '06b6d4', 
          text: 'FFFFFF', glow: '7dd3fc', neon: '22d3ee', surface: '0f172a', muted: '6b7280'
        },
        'solar-flare': { 
          dark: '1c0a00', primary: 'f97316', secondary: 'ef4444', accent: 'fbbf24', 
          text: 'FFFFFF', glow: 'fdba74', neon: 'fcd34d', surface: '27150a', muted: '6b7280'
        },
        'forest-mist': { 
          dark: '021a0a', primary: '10b981', secondary: '34d399', accent: '6ee7b7', 
          text: 'FFFFFF', glow: '6ee7b7', neon: 'a7f3d0', surface: '052e16', muted: '6b7280'
        },
        'royal-gold': { 
          dark: '1a0a20', primary: '7c3aed', secondary: 'd97706', accent: 'fcd34d', 
          text: 'FFFFFF', glow: 'c4b5fd', neon: 'fde047', surface: '2e1065', muted: '6b7280'
        },
      };

      const colors = colorMap[selectedColor] || colorMap['midnight-aurora'];

      slides.forEach((slide, index) => {
        const pptSlide = pptx.addSlide();
        
        // ===== TITLE / OPENING SLIDE =====
        if (index === 0 || slide.layout === 'title') {
          pptSlide.background = { color: colors.dark };
          
          // Mesh gradient orbs
          pptSlide.addShape('ellipse', { x: 6, y: -2, w: 7, h: 7, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('ellipse', { x: 6.5, y: -1.5, w: 6, h: 6, fill: { type: 'solid', color: colors.secondary } });
          pptSlide.addShape('ellipse', { x: -2, y: 3, w: 5, h: 5, fill: { type: 'solid', color: colors.surface } });
          pptSlide.addShape('ellipse', { x: -1.5, y: 3.5, w: 4, h: 4, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('ellipse', { x: 8.5, y: 4, w: 2, h: 2, fill: { type: 'solid', color: colors.neon } });
          
          // Floating particles
          [[1, 0.8, 0.12], [9, 1.5, 0.1], [7.5, 2.8, 0.15], [2.5, 4.5, 0.1], [8, 0.5, 0.08]].forEach(([x, y, s]) => {
            pptSlide.addShape('ellipse', { x: x as number, y: y as number, w: s as number, h: s as number, fill: { type: 'solid', color: colors.glow } });
          });
          
          // Neon accent line
          pptSlide.addShape('rect', { x: 0.8, y: 2.4, w: 4, h: 0.08, fill: { type: 'solid', color: colors.neon } });
          
          // Icon with glass effect
          if (slide.icon) {
            pptSlide.addShape('roundRect', { x: 0.6, y: 1.3, w: 1.2, h: 1.2, fill: { type: 'solid', color: colors.surface }, rectRadius: 0.15 });
            pptSlide.addShape('roundRect', { x: 0.55, y: 1.25, w: 1.3, h: 1.3, line: { color: colors.glow, width: 2 }, fill: { type: 'none' }, rectRadius: 0.18 });
            pptSlide.addText(slide.icon, { x: 0.6, y: 1.3, w: 1.2, h: 1.2, fontSize: 40, align: 'center', valign: 'middle' });
          }

          // Title - BOLD dramatic
          pptSlide.addText(slide.title.toUpperCase(), { x: 0.8, y: 2.6, w: 8.5, h: 1.4, fontSize: 54, bold: true, color: 'FFFFFF', fontFace: 'Arial Black' });
          
          // Subtitle
          if (slide.subtitle) {
            pptSlide.addText(slide.subtitle, { x: 0.8, y: 4.1, w: 8, h: 0.7, fontSize: 22, color: colors.glow, fontFace: 'Arial' });
          }
          
          // Bottom neon bar
          pptSlide.addShape('rect', { x: 0, y: 5.35, w: '100%', h: 0.15, fill: { type: 'solid', color: colors.neon } });
          
        } else if (slide.layout === 'hero-statement' || slide.layout === 'call-to-action') {
          // ===== HERO STATEMENT / CTA =====
          pptSlide.background = { color: colors.dark };
          
          // Large gradient orbs
          pptSlide.addShape('ellipse', { x: -2, y: -2, w: 6, h: 6, fill: { type: 'solid', color: colors.surface } });
          pptSlide.addShape('ellipse', { x: 7, y: 2.5, w: 5, h: 5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('ellipse', { x: -1, y: 4, w: 3, h: 3, fill: { type: 'solid', color: colors.secondary } });
          
          // Central statement
          const statement = slide.content?.[0] || slide.title;
          pptSlide.addText(statement, { x: 0.5, y: 1.8, w: 9, h: 2, fontSize: 48, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', fontFace: 'Arial Black' });
          
          // Accent underline
          pptSlide.addShape('rect', { x: 3.5, y: 4, w: 3, h: 0.1, fill: { type: 'solid', color: colors.neon } });
          
          // CTA button for call-to-action
          if (slide.layout === 'call-to-action' && slide.content?.[1]) {
            pptSlide.addShape('roundRect', { x: 3.2, y: 4.4, w: 3.6, h: 0.7, fill: { type: 'solid', color: colors.primary }, rectRadius: 0.35 });
            pptSlide.addText(slide.content[1], { x: 3.2, y: 4.4, w: 3.6, h: 0.7, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
          }
          
          // Attribution
          if (slide.content?.[1] && slide.layout !== 'call-to-action') {
            pptSlide.addText(`— ${slide.content[1]}`, { x: 0, y: 4.4, w: 10, h: 0.5, fontSize: 16, color: colors.glow, align: 'center' });
          }
          
        } else if (slide.layout === 'stats') {
          // ===== STATS - BIG METRICS =====
          pptSlide.background = { color: 'F8FAFC' };
          
          // Dark header
          pptSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.3, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 7.5, y: -1.2, w: 3.5, h: 3.5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('ellipse', { x: 8.8, y: 0.3, w: 1.2, h: 1.2, fill: { type: 'solid', color: colors.neon } });
          
          // Left accent
          pptSlide.addShape('rect', { x: 0, y: 1.3, w: 0.06, h: 4.2, fill: { type: 'solid', color: colors.neon } });
          
          // Icon + Title
          if (slide.icon) {
            pptSlide.addShape('ellipse', { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(slide.icon, { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fontSize: 28, align: 'center', valign: 'middle' });
          }
          pptSlide.addText(slide.title, { x: 1.3, y: 0.4, w: 7, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF', fontFace: 'Arial' });
          
          // Stat cards
          const statCount = Math.min(slide.content?.length || 4, 4);
          const cardWidth = (9.4 / statCount) - 0.3;
          
          slide.content?.slice(0, 4).forEach((item, i) => {
            const [label, value] = item.split(':').map(s => s.trim());
            const xPos = 0.3 + (i * (cardWidth + 0.3));
            
            // Card with shadow
            pptSlide.addShape('roundRect', { x: xPos, y: 1.6, w: cardWidth, h: 3.2, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.12, shadow: { type: 'outer', blur: 12, offset: 4, angle: 45, color: '000000', opacity: 0.1 } });
            
            // Top accent
            pptSlide.addShape('rect', { x: xPos, y: 1.6, w: cardWidth, h: 0.5, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addShape('ellipse', { x: xPos + cardWidth - 0.7, y: 1.45, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.secondary } });
            
            // Value
            pptSlide.addText(value || item, { x: xPos, y: 2.4, w: cardWidth, h: 1.2, fontSize: 42, bold: true, color: colors.dark, align: 'center', fontFace: 'Arial Black' });
            
            // Label
            pptSlide.addText((label || '').toUpperCase(), { x: xPos, y: 4.0, w: cardWidth, h: 0.5, fontSize: 11, color: colors.muted, align: 'center', bold: true });
          });
          
        } else if (slide.layout === 'metrics-grid' || slide.layout === 'chart-story') {
          // ===== METRICS GRID =====
          pptSlide.background = { color: 'F8FAFC' };
          
          // Header
          pptSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.3, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 8, y: -0.8, w: 2.5, h: 2.5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('rect', { x: 0, y: 1.3, w: 0.06, h: 4.2, fill: { type: 'solid', color: colors.neon } });
          
          if (slide.icon) {
            pptSlide.addShape('ellipse', { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(slide.icon, { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fontSize: 28, align: 'center', valign: 'middle' });
          }
          pptSlide.addText(slide.title, { x: 1.3, y: 0.4, w: 7, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
          
          // Grid of metrics
          const metrics = slide.content?.slice(0, 6) || [];
          const cols = metrics.length <= 4 ? 2 : 3;
          const cardW = (9.4 / cols) - 0.25;
          const cardH = metrics.length > 3 ? 1.4 : 2.8;
          
          metrics.forEach((item, i) => {
            const [label, value] = item.split(':').map(s => s.trim());
            const col = i % cols;
            const row = Math.floor(i / cols);
            const xPos = 0.3 + (col * (cardW + 0.25));
            const yPos = 1.6 + (row * (cardH + 0.2));
            
            pptSlide.addShape('roundRect', { x: xPos, y: yPos, w: cardW, h: cardH, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.1, shadow: { type: 'outer', blur: 8, offset: 3, angle: 45, color: '000000', opacity: 0.08 } });
            pptSlide.addShape('rect', { x: xPos, y: yPos, w: cardW, h: 0.12, fill: { type: 'solid', color: i % 2 === 0 ? colors.primary : colors.secondary } });
            
            pptSlide.addText(value || item, { x: xPos, y: yPos + 0.25, w: cardW, h: 0.7, fontSize: 28, bold: true, color: colors.dark, align: 'center', fontFace: 'Arial Black' });
            pptSlide.addText((label || '').toUpperCase(), { x: xPos, y: yPos + cardH - 0.45, w: cardW, h: 0.35, fontSize: 9, color: colors.muted, align: 'center', bold: true });
          });
          
        } else if (slide.layout === 'spotlight' || slide.layout === 'features-grid') {
          // ===== SPOTLIGHT / FEATURES =====
          pptSlide.background = { color: 'F8FAFC' };
          
          // Header
          pptSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.3, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 8, y: -0.8, w: 2.5, h: 2.5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('rect', { x: 0, y: 1.3, w: 0.06, h: 4.2, fill: { type: 'solid', color: colors.neon } });
          
          if (slide.icon) {
            pptSlide.addShape('ellipse', { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(slide.icon, { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fontSize: 28, align: 'center', valign: 'middle' });
          }
          pptSlide.addText(slide.title, { x: 1.3, y: 0.4, w: 7, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
          
          if (slide.layout === 'spotlight') {
            // Large icon orb
            pptSlide.addShape('ellipse', { x: 0.4, y: 1.7, w: 2.2, h: 2.2, fill: { type: 'solid', color: colors.surface } });
            pptSlide.addShape('ellipse', { x: 0.5, y: 1.8, w: 2, h: 2, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addShape('ellipse', { x: 0.7, y: 2, w: 1.6, h: 1.6, fill: { type: 'solid', color: colors.neon } });
            pptSlide.addText(slide.icon || '✨', { x: 0.4, y: 1.7, w: 2.2, h: 2.2, fontSize: 60, align: 'center', valign: 'middle' });
            
            // Supporting points
            slide.content?.slice(0, 4).forEach((item, i) => {
              pptSlide.addShape('roundRect', { x: 3.2, y: 1.7 + (i * 0.7), w: 6.2, h: 0.6, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.08, shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '000000', opacity: 0.06 } });
              pptSlide.addShape('ellipse', { x: 3.35, y: 1.85 + (i * 0.7), w: 0.3, h: 0.3, fill: { type: 'solid', color: colors.primary } });
              pptSlide.addText(item, { x: 3.8, y: 1.78 + (i * 0.7), w: 5.4, h: 0.5, fontSize: 15, color: '334155' });
            });
          } else {
            // Features grid
            const features = slide.content?.slice(0, 6) || [];
            const cols = features.length <= 4 ? 2 : 3;
            const cardW = (9.4 / cols) - 0.25;
            const cardH = 1.35;
            const icons = ['🚀', '⚡', '🎯', '💎', '🔥', '✨'];
            
            features.forEach((item, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              const xPos = 0.3 + (col * (cardW + 0.25));
              const yPos = 1.6 + (row * (cardH + 0.15));
              
              pptSlide.addShape('roundRect', { x: xPos, y: yPos, w: cardW, h: cardH, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.1, shadow: { type: 'outer', blur: 8, offset: 3, angle: 45, color: '000000', opacity: 0.08 } });
              pptSlide.addShape('rect', { x: xPos, y: yPos, w: 0.08, h: cardH, fill: { type: 'solid', color: colors.primary } });
              
              pptSlide.addShape('roundRect', { x: xPos + 0.2, y: yPos + 0.2, w: 0.5, h: 0.5, fill: { type: 'solid', color: colors.surface }, rectRadius: 0.08 });
              pptSlide.addText(icons[i] || '✨', { x: xPos + 0.2, y: yPos + 0.2, w: 0.5, h: 0.5, fontSize: 18, align: 'center', valign: 'middle' });
              pptSlide.addText(item, { x: xPos + 0.85, y: yPos + 0.35, w: cardW - 1.1, h: 0.65, fontSize: 13, color: '334155' });
            });
          }
          
        } else if (slide.layout === 'timeline') {
          // ===== TIMELINE =====
          pptSlide.background = { color: 'F8FAFC' };
          
          // Header
          pptSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.3, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 8, y: -0.8, w: 2.5, h: 2.5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('rect', { x: 0, y: 1.3, w: 0.06, h: 4.2, fill: { type: 'solid', color: colors.neon } });
          
          if (slide.icon) {
            pptSlide.addShape('ellipse', { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(slide.icon, { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fontSize: 28, align: 'center', valign: 'middle' });
          }
          pptSlide.addText(slide.title, { x: 1.3, y: 0.4, w: 7, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
          
          const items = slide.content?.slice(0, 5) || [];
          const stepWidth = 9 / items.length;
          
          // Timeline track
          pptSlide.addShape('rect', { x: 0.5, y: 2.75, w: 9, h: 0.12, fill: { type: 'solid', color: colors.glow } });
          pptSlide.addShape('rect', { x: 0.5, y: 2.78, w: 9, h: 0.06, fill: { type: 'solid', color: colors.primary } });
          
          items.forEach((item, i) => {
            const xPos = 0.5 + (i * stepWidth) + (stepWidth / 2);
            
            // Outer glow
            pptSlide.addShape('ellipse', { x: xPos - 0.35, y: 2.46, w: 0.7, h: 0.7, fill: { type: 'solid', color: colors.glow } });
            // Number circle
            pptSlide.addShape('ellipse', { x: xPos - 0.25, y: 2.56, w: 0.5, h: 0.5, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(`${i + 1}`, { x: xPos - 0.25, y: 2.56, w: 0.5, h: 0.5, fontSize: 14, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true });
            
            // Connector
            pptSlide.addShape('rect', { x: xPos - 0.015, y: 3.2, w: 0.03, h: 0.35, fill: { type: 'solid', color: colors.glow } });
            
            // Step card
            pptSlide.addShape('roundRect', { x: xPos - (stepWidth / 2) + 0.1, y: 3.55, w: stepWidth - 0.2, h: 1.1, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.08, shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '000000', opacity: 0.06 } });
            pptSlide.addShape('rect', { x: xPos - (stepWidth / 2) + 0.1, y: 3.55, w: stepWidth - 0.2, h: 0.06, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(item, { x: xPos - (stepWidth / 2) + 0.15, y: 3.65, w: stepWidth - 0.3, h: 0.9, fontSize: 11, color: '334155', align: 'center', valign: 'top' });
          });
          
        } else if (slide.layout === 'comparison' || slide.layout === 'two-column' || slide.layout === 'before-after') {
          // ===== COMPARISON =====
          pptSlide.background = { color: 'F8FAFC' };
          
          // Header
          pptSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.3, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 8, y: -0.8, w: 2.5, h: 2.5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('rect', { x: 0, y: 1.3, w: 0.06, h: 4.2, fill: { type: 'solid', color: colors.neon } });
          
          if (slide.icon) {
            pptSlide.addShape('ellipse', { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(slide.icon, { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fontSize: 28, align: 'center', valign: 'middle' });
          }
          pptSlide.addText(slide.title, { x: 1.3, y: 0.4, w: 7, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
          
          const half = Math.ceil((slide.content?.length || 0) / 2);
          const leftContent = slide.content?.slice(0, half) || [];
          const rightContent = slide.content?.slice(half) || [];
          
          // Labels
          const leftLabel = slide.layout === 'before-after' ? 'BEFORE' : 'OPTION A';
          const rightLabel = slide.layout === 'before-after' ? 'AFTER' : 'OPTION B';
          
          pptSlide.addShape('roundRect', { x: 0.3, y: 1.5, w: 1.5, h: 0.4, fill: { type: 'solid', color: colors.primary }, rectRadius: 0.2 });
          pptSlide.addText(leftLabel, { x: 0.3, y: 1.5, w: 1.5, h: 0.4, fontSize: 11, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true });
          
          pptSlide.addShape('roundRect', { x: 5, y: 1.5, w: 1.5, h: 0.4, fill: { type: 'solid', color: colors.secondary }, rectRadius: 0.2 });
          pptSlide.addText(rightLabel, { x: 5, y: 1.5, w: 1.5, h: 0.4, fontSize: 11, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true });
          
          // Left card
          pptSlide.addShape('roundRect', { x: 0.3, y: 2, w: 4.4, h: 2.8, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.1, shadow: { type: 'outer', blur: 8, offset: 3, angle: 45, color: '000000', opacity: 0.08 } });
          pptSlide.addShape('rect', { x: 0.3, y: 2, w: 0.08, h: 2.8, fill: { type: 'solid', color: colors.primary } });
          
          // Right card
          pptSlide.addShape('roundRect', { x: 5, y: 2, w: 4.4, h: 2.8, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.1, shadow: { type: 'outer', blur: 8, offset: 3, angle: 45, color: '000000', opacity: 0.08 } });
          pptSlide.addShape('rect', { x: 9.32, y: 2, w: 0.08, h: 2.8, fill: { type: 'solid', color: colors.secondary } });
          
          // VS badge
          pptSlide.addShape('ellipse', { x: 4.5, y: 2.95, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 4.55, y: 3, w: 0.7, h: 0.7, line: { color: colors.neon, width: 2 }, fill: { type: 'none' } });
          pptSlide.addText('VS', { x: 4.5, y: 2.95, w: 0.8, h: 0.8, fontSize: 12, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true });
          
          // Content
          leftContent.forEach((item, i) => {
            pptSlide.addShape('ellipse', { x: 0.55, y: 2.3 + (i * 0.55), w: 0.15, h: 0.15, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(item, { x: 0.85, y: 2.2 + (i * 0.55), w: 3.6, h: 0.45, fontSize: 12, color: '334155' });
          });
          
          rightContent.forEach((item, i) => {
            pptSlide.addShape('ellipse', { x: 5.25, y: 2.3 + (i * 0.55), w: 0.15, h: 0.15, fill: { type: 'solid', color: colors.secondary } });
            pptSlide.addText(item, { x: 5.55, y: 2.2 + (i * 0.55), w: 3.6, h: 0.45, fontSize: 12, color: '334155' });
          });
          
        } else if (slide.layout === 'quote') {
          // ===== QUOTE =====
          pptSlide.background = { color: 'F8FAFC' };
          
          // Header
          pptSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.3, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 8, y: -0.8, w: 2.5, h: 2.5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('rect', { x: 0, y: 1.3, w: 0.06, h: 4.2, fill: { type: 'solid', color: colors.neon } });
          
          if (slide.icon) {
            pptSlide.addShape('ellipse', { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(slide.icon, { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fontSize: 28, align: 'center', valign: 'middle' });
          }
          pptSlide.addText(slide.title, { x: 1.3, y: 0.4, w: 7, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
          
          // Quote panel
          pptSlide.addShape('roundRect', { x: 0.5, y: 1.6, w: 9, h: 3, fill: { type: 'solid', color: colors.surface }, rectRadius: 0.15 });
          
          // Quote mark
          pptSlide.addShape('ellipse', { x: 0.6, y: 1.5, w: 1.2, h: 1.2, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addText('"', { x: 0.5, y: 1.2, w: 1.5, h: 1.5, fontSize: 80, color: 'FFFFFF', fontFace: 'Georgia', bold: true });
          
          // Quote text
          pptSlide.addText(slide.content?.[0] || '', { x: 1.5, y: 2.2, w: 7.5, h: 1.6, fontSize: 24, italic: true, color: 'FFFFFF', fontFace: 'Georgia' });
          
          // Author
          if (slide.content?.[1]) {
            pptSlide.addShape('rect', { x: 1.5, y: 4.0, w: 1.5, h: 0.05, fill: { type: 'solid', color: colors.neon } });
            pptSlide.addText(`— ${slide.content[1]}`, { x: 1.5, y: 4.15, w: 6, h: 0.4, fontSize: 14, color: colors.glow, bold: true });
          }
          
        } else if (slide.layout === 'image-left' || slide.layout === 'image-right' || slide.layout === 'mixed-left' || slide.layout === 'mixed-right' || 
                   slide.layout === 'stats-visual' || slide.layout === 'features-visual' || slide.layout === 'timeline-visual' ||
                   slide.layout === 'comparison-visual' || slide.layout === 'quote-visual' || slide.layout === 'spotlight-visual' ||
                   slide.layout === 'takeaways-visual' || slide.layout === 'cta-visual') {
          // ===== MIXED CONTENT LAYOUTS (Image + Text on same slide) =====
          pptSlide.background = { color: 'F8FAFC' };
          
          // Header bar
          pptSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.3, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 8, y: -0.8, w: 2.5, h: 2.5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('rect', { x: 0, y: 1.3, w: 0.06, h: 4.2, fill: { type: 'solid', color: colors.neon } });
          
          if (slide.icon) {
            pptSlide.addShape('ellipse', { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(slide.icon, { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fontSize: 28, align: 'center', valign: 'middle' });
          }
          pptSlide.addText(slide.title, { x: 1.3, y: 0.4, w: 7, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
          
          // Layout variations
          const isImageLeft = slide.layout === 'image-left' || slide.layout === 'mixed-left' || 
                             slide.layout === 'quote-visual' || slide.layout === 'spotlight-visual';
          const imageX = isImageLeft ? 0.3 : 5.2;
          const textX = isImageLeft ? 4.9 : 0.3;
          const imageW = 4.5;
          const imageH = 3.2;
          
          // Image frame with glow effect
          pptSlide.addShape('roundRect', { x: imageX - 0.1, y: 1.5, w: imageW + 0.2, h: imageH + 0.2, fill: { type: 'solid', color: colors.glow }, rectRadius: 0.18 });
          pptSlide.addShape('roundRect', { x: imageX - 0.05, y: 1.55, w: imageW + 0.1, h: imageH + 0.1, fill: { type: 'solid', color: colors.primary }, rectRadius: 0.15 });
          
          if (slide.generatedImage) {
            pptSlide.addImage({ data: slide.generatedImage, x: imageX, y: 1.6, w: imageW, h: imageH, rounding: true });
          } else {
            pptSlide.addShape('roundRect', { x: imageX, y: 1.6, w: imageW, h: imageH, fill: { type: 'solid', color: colors.surface }, rectRadius: 0.1 });
            pptSlide.addText('🖼️', { x: imageX, y: 2.8, w: imageW, h: 1, fontSize: 48, align: 'center', color: colors.glow });
          }
          
          // Content with professional styling - varies by layout type
          if (slide.layout === 'stats-visual' || slide.layout === 'takeaways-visual') {
            // Stats/Takeaways: Larger text with emphasis
            slide.content?.slice(0, 4).forEach((item, i) => {
              const [label, value] = item.split(':').map((s: string) => s.trim());
              pptSlide.addShape('roundRect', { x: textX, y: 1.6 + (i * 0.8), w: 4.5, h: 0.7, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.1, shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '000000', opacity: 0.06 } });
              pptSlide.addShape('rect', { x: textX, y: 1.6 + (i * 0.8), w: 0.1, h: 0.7, fill: { type: 'solid', color: colors.primary } });
              if (value) {
                pptSlide.addText(value, { x: textX + 0.2, y: 1.6 + (i * 0.8), w: 2, h: 0.35, fontSize: 18, bold: true, color: colors.dark });
                pptSlide.addText(label, { x: textX + 0.2, y: 1.95 + (i * 0.8), w: 4.1, h: 0.3, fontSize: 10, color: colors.muted });
              } else {
                pptSlide.addText(item, { x: textX + 0.2, y: 1.7 + (i * 0.8), w: 4.1, h: 0.5, fontSize: 14, color: '334155' });
              }
            });
          } else if (slide.layout === 'cta-visual') {
            // CTA: Bold action-oriented
            slide.content?.slice(0, 3).forEach((item, i) => {
              if (i === 0) {
                // Main CTA button
                pptSlide.addShape('roundRect', { x: textX, y: 2.2, w: 4.5, h: 0.8, fill: { type: 'solid', color: colors.primary }, rectRadius: 0.4 });
                pptSlide.addText(item, { x: textX, y: 2.2, w: 4.5, h: 0.8, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
              } else {
                pptSlide.addShape('roundRect', { x: textX, y: 2.8 + ((i - 1) * 0.6), w: 4.5, h: 0.5, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.08 });
                pptSlide.addText(item, { x: textX + 0.2, y: 2.85 + ((i - 1) * 0.6), w: 4.1, h: 0.4, fontSize: 12, color: '334155' });
              }
            });
          } else {
            // Standard mixed content styling
            slide.content?.forEach((item, i) => {
              pptSlide.addShape('roundRect', { x: textX, y: 1.65 + (i * 0.75), w: 4.5, h: 0.65, fill: { type: 'solid', color: 'FFFFFF' }, rectRadius: 0.08, shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '000000', opacity: 0.05 } });
              pptSlide.addShape('rect', { x: textX, y: 1.65 + (i * 0.75), w: 0.08, h: 0.65, fill: { type: 'solid', color: colors.primary } });
              pptSlide.addText(item, { x: textX + 0.2, y: 1.7 + (i * 0.75), w: 4.1, h: 0.55, fontSize: 13, color: '334155' });
            });
          }
          
        } else if (slide.layout === 'section-break') {
          // ===== SECTION BREAK =====
          pptSlide.background = { color: colors.dark };
          
          // Large orb
          pptSlide.addShape('ellipse', { x: 3, y: 1, w: 4, h: 4, fill: { type: 'solid', color: colors.surface } });
          pptSlide.addShape('ellipse', { x: 3.3, y: 1.3, w: 3.4, h: 3.4, fill: { type: 'solid', color: colors.primary } });
          
          // Icon
          if (slide.icon) {
            pptSlide.addText(slide.icon, { x: 0, y: 1.8, w: 10, h: 1.5, fontSize: 80, align: 'center' });
          }
          
          // Title
          pptSlide.addText(slide.title.toUpperCase(), { x: 0, y: 3.8, w: 10, h: 0.8, fontSize: 40, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial Black' });
          
          // Accent line
          pptSlide.addShape('rect', { x: 3.5, y: 4.6, w: 3, h: 0.08, fill: { type: 'solid', color: colors.neon } });
          
        } else {
          // ===== DEFAULT CONTENT =====
          pptSlide.background = { color: 'F8FAFC' };
          
          // Header
          pptSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.3, fill: { type: 'solid', color: colors.dark } });
          pptSlide.addShape('ellipse', { x: 8, y: -0.8, w: 2.5, h: 2.5, fill: { type: 'solid', color: colors.primary } });
          pptSlide.addShape('rect', { x: 0, y: 1.3, w: 0.06, h: 4.2, fill: { type: 'solid', color: colors.neon } });
          
          if (slide.icon) {
            pptSlide.addShape('ellipse', { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(slide.icon, { x: 0.3, y: 0.3, w: 0.8, h: 0.8, fontSize: 28, align: 'center', valign: 'middle' });
          }
          pptSlide.addText(slide.title, { x: 1.3, y: 0.4, w: 7, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
          
          // Content items
          slide.content?.forEach((item, i) => {
            const bgColor = i % 2 === 0 ? 'FFFFFF' : 'F1F5F9';
            pptSlide.addShape('roundRect', { x: 0.3, y: 1.55 + (i * 0.65), w: 9.4, h: 0.55, fill: { type: 'solid', color: bgColor }, rectRadius: 0.08 });
            
            // Numbered badge
            pptSlide.addShape('ellipse', { x: 0.45, y: 1.63 + (i * 0.65), w: 0.4, h: 0.4, fill: { type: 'solid', color: colors.primary } });
            pptSlide.addText(`${i + 1}`, { x: 0.45, y: 1.63 + (i * 0.65), w: 0.4, h: 0.4, fontSize: 12, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true });
            
            pptSlide.addText(item, { x: 1, y: 1.6 + (i * 0.65), w: 8.5, h: 0.5, fontSize: 14, color: '334155' });
          });
        }
        
        // Add presenter notes to every slide
        const notes = slide.presenterNotes || slide.notes || '';
        if (notes) {
          pptSlide.addNotes(notes);
        }
      });

      const fileName = `${slides[0]?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'presentation'}_${Date.now()}.pptx`;
      await pptx.writeFile({ fileName });
      toast.success('🎉 Presentation with speaker notes downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download presentation');
    }
  };

  const updateSlide = (updatedSlide: Slide) => {
    setSlides(prev => prev.map(s => s.slideNumber === updatedSlide.slideNumber ? updatedSlide : s));
    setEditingSlide(null);
    toast.success('Slide updated!');
  };

  const duplicateSlide = (slide: Slide) => {
    const newSlide = { ...slide, slideNumber: slides.length + 1 };
    setSlides([...slides, newSlide]);
    toast.success('Slide duplicated!');
  };

  const deleteSlide = (slideNumber: number) => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the last slide');
      return;
    }
    setSlides(prev => prev.filter(s => s.slideNumber !== slideNumber).map((s, i) => ({ ...s, slideNumber: i + 1 })));
    if (currentSlide >= slides.length - 1) setCurrentSlide(Math.max(0, slides.length - 2));
    toast.success('Slide deleted!');
  };

  // Get gradient based on color scheme
  const getGradientClass = () => {
    const colorGradients: Record<string, string> = {
      'midnight-aurora': 'from-indigo-600 via-purple-600 to-cyan-500',
      'cyber-neon': 'from-rose-600 via-purple-600 to-emerald-500',
      'ocean-depths': 'from-blue-700 via-indigo-600 to-cyan-500',
      'solar-flare': 'from-orange-600 via-red-600 to-amber-500',
      'forest-mist': 'from-green-700 via-emerald-600 to-teal-500',
      'royal-gold': 'from-purple-700 via-violet-600 to-amber-500',
    };
    return colorGradients[selectedColor] || 'from-indigo-600 via-purple-600 to-cyan-500';
  };

  // Render slide preview
  const renderSlidePreview = (slide: Slide, isMain = false) => {
    const gradientClass = getGradientClass();
    const size = isMain ? 'text-lg md:text-2xl' : 'text-[8px]';
    const contentSize = isMain ? 'text-sm md:text-base' : 'text-[6px]';

    // ===== TITLE SLIDE =====
    if (slide.layout === 'title' || slide.slideNumber === 1) {
      return (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
          {/* Mesh orbs */}
          <motion.div 
            className="absolute -top-10 -right-10 w-32 h-32 md:w-56 md:h-56 rounded-full bg-white/10 blur-2xl"
            animate={isMain ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : {}}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-8 -left-8 w-24 h-24 md:w-40 md:h-40 rounded-full bg-white/5 blur-xl"
            animate={isMain ? { scale: [1.2, 1, 1.2] } : {}}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="absolute top-4 right-4 w-8 h-8 md:w-16 md:h-16 rounded-full bg-white/20 blur-md" />
          
          {/* Particles */}
          {isMain && [1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 md:w-2 md:h-2 rounded-full bg-white/40"
              style={{ left: `${10 + i * 15}%`, top: `${20 + i * 10}%` }}
              animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
            />
          ))}
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-center p-3 md:p-10">
            {/* Neon line */}
            <motion.div 
              className="w-12 md:w-24 h-0.5 md:h-1 bg-white/60 rounded-full mb-2 md:mb-4"
              initial={isMain ? { scaleX: 0 } : false}
              animate={isMain ? { scaleX: 1 } : false}
              transition={{ duration: 0.5 }}
            />
            
            {/* Icon */}
            {slide.icon && (
              <motion.div 
                className={`${isMain ? 'w-12 h-12 md:w-16 md:h-16 text-2xl md:text-4xl' : 'w-5 h-5 text-xs'} rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-2 md:mb-4 border border-white/30`}
                initial={isMain ? { scale: 0, rotate: -180 } : false}
                animate={isMain ? { scale: 1, rotate: 0 } : false}
              >
                {slide.icon}
              </motion.div>
            )}
            
            {/* Title */}
            <motion.h1 
              className={`${isMain ? 'text-2xl md:text-5xl' : 'text-sm'} font-black text-white leading-tight tracking-tight`}
              initial={isMain ? { opacity: 0, y: 20 } : false}
              animate={isMain ? { opacity: 1, y: 0 } : false}
            >
              {slide.title}
            </motion.h1>
            
            {/* Subtitle */}
            {slide.subtitle && (
              <motion.p 
                className={`${isMain ? 'text-base md:text-xl' : 'text-[7px]'} text-white/70 mt-2 md:mt-4 max-w-xl`}
                initial={isMain ? { opacity: 0 } : false}
                animate={isMain ? { opacity: 1 } : false}
                transition={{ delay: 0.2 }}
              >
                {slide.subtitle}
              </motion.p>
            )}
          </div>
          
          {/* Bottom bar */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 md:h-2 bg-gradient-to-r from-white/40 via-white/60 to-white/40`} />
        </div>
      );
    }

    // ===== HERO STATEMENT / CTA =====
    if (slide.layout === 'hero-statement' || slide.layout === 'call-to-action') {
      const statement = slide.content?.[0] || slide.title;
      return (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
          {/* Ambient orbs */}
          <div className="absolute -top-16 -left-16 w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 w-28 h-28 md:w-40 md:h-40 rounded-full bg-white/5 blur-2xl" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-10 text-center">
            <motion.p 
              className={`${isMain ? 'text-xl md:text-4xl' : 'text-[10px]'} font-black text-white leading-tight max-w-3xl`}
              initial={isMain ? { opacity: 0, y: 20 } : false}
              animate={isMain ? { opacity: 1, y: 0 } : false}
            >
              "{statement}"
            </motion.p>
            
            <motion.div 
              className="w-12 md:w-24 h-0.5 md:h-1 bg-white/50 rounded-full mt-4 md:mt-6"
              initial={isMain ? { scaleX: 0 } : false}
              animate={isMain ? { scaleX: 1 } : false}
              transition={{ delay: 0.3 }}
            />
            
            {slide.layout === 'call-to-action' && slide.content?.[1] && (
              <motion.div 
                className={`mt-4 md:mt-6 px-4 md:px-8 py-2 md:py-3 rounded-full bg-white/20 backdrop-blur border border-white/30 ${isMain ? 'text-sm md:text-lg' : 'text-[6px]'} font-bold text-white`}
                initial={isMain ? { opacity: 0, scale: 0.8 } : false}
                animate={isMain ? { opacity: 1, scale: 1 } : false}
                transition={{ delay: 0.4 }}
              >
                {slide.content[1]}
              </motion.div>
            )}
            
            {slide.content?.[1] && slide.layout !== 'call-to-action' && (
              <p className={`${isMain ? 'text-sm md:text-lg' : 'text-[6px]'} text-white/60 mt-3 md:mt-4`}>
                — {slide.content[1]}
              </p>
            )}
          </div>
        </div>
      );
    }

    // ===== STATS LAYOUT =====
    if (slide.layout === 'stats') {
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1.5 md:p-2.5 rounded-xl relative z-10`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
          </div>
          
          {/* Stat Cards */}
          <div className="flex-1 flex items-center justify-center p-2 md:p-4 gap-2 md:gap-4">
            {slide.content?.slice(0, 4).map((item, i) => {
              const [label, value] = item.split(':').map(s => s.trim());
              return (
                <motion.div 
                  key={i} 
                  className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-t-4 border-primary"
                  initial={isMain ? { opacity: 0, y: 20 } : false}
                  animate={isMain ? { opacity: 1, y: 0 } : false}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className={`${isMain ? 'text-2xl md:text-4xl' : 'text-sm'} font-black bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                    {value || item}
                  </span>
                  <span className={`${isMain ? 'text-xs md:text-sm' : 'text-[5px]'} text-muted-foreground text-center mt-1 uppercase tracking-wider font-semibold`}>
                    {label || ''}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    // ===== METRICS GRID =====
    if (slide.layout === 'metrics-grid' || slide.layout === 'chart-story') {
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1.5 md:p-2.5 rounded-xl relative z-10`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 p-2 md:p-4">
            {slide.content?.slice(0, 6).map((item, i) => {
              const [label, value] = item.split(':').map(s => s.trim());
              return (
                <motion.div 
                  key={i} 
                  className="flex flex-col items-center justify-center p-2 md:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-t-2 border-primary/50"
                  initial={isMain ? { opacity: 0, scale: 0.8 } : false}
                  animate={isMain ? { opacity: 1, scale: 1 } : false}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className={`${isMain ? 'text-lg md:text-2xl' : 'text-xs'} font-black bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                    {value || item}
                  </span>
                  <span className={`${isMain ? 'text-[9px] md:text-xs' : 'text-[4px]'} text-muted-foreground text-center mt-1 uppercase tracking-wide`}>
                    {label || ''}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    // ===== SPOTLIGHT =====
    if (slide.layout === 'spotlight') {
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
          </div>
          
          <div className="flex-1 flex p-3 md:p-6 gap-4 md:gap-8">
            {/* Large Icon Orb */}
            <motion.div 
              className={`${isMain ? 'w-20 h-20 md:w-32 md:h-32' : 'w-8 h-8'} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-2xl flex-shrink-0 relative`}
              animate={isMain ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
              <span className={`${isMain ? 'text-3xl md:text-5xl' : 'text-sm'} relative z-10`}>{slide.icon || '✨'}</span>
            </motion.div>
            
            {/* Points */}
            <div className="flex-1 flex flex-col justify-center space-y-2 md:space-y-3">
              {slide.content?.slice(0, 4).map((item, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg border-l-4 border-primary`}
                  initial={isMain ? { opacity: 0, x: 30 } : false}
                  animate={isMain ? { opacity: 1, x: 0 } : false}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`${isMain ? 'w-2.5 h-2.5' : 'w-1 h-1'} rounded-full bg-gradient-to-br ${gradientClass}`} />
                  <span className={`${contentSize} text-foreground font-medium`}>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ===== FEATURES GRID =====
    if (slide.layout === 'features-grid') {
      const icons = ['🚀', '⚡', '🎯', '💎', '🔥', '✨'];
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1.5 md:p-2.5 rounded-xl relative z-10`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 p-2 md:p-4">
            {slide.content?.slice(0, 6).map((item, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-l-4 border-primary"
                initial={isMain ? { opacity: 0, x: -20 } : false}
                animate={isMain ? { opacity: 1, x: 0 } : false}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`${isMain ? 'w-8 h-8 md:w-10 md:h-10' : 'w-4 h-4'} rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <span className={`${isMain ? 'text-sm md:text-lg' : 'text-[6px]'}`}>{icons[i] || '✨'}</span>
                </div>
                <span className={`${isMain ? 'text-xs md:text-sm' : 'text-[5px]'} text-foreground font-medium`}>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    // ===== TIMELINE =====
    if (slide.layout === 'timeline') {
      const items = slide.content?.slice(0, 5) || [];
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1.5 md:p-2.5 rounded-xl relative z-10`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center p-3 md:p-6">
            {/* Track */}
            <div className={`w-full h-0.5 md:h-1 bg-gradient-to-r ${gradientClass} rounded-full mb-4 md:mb-8 relative`}>
              {items.map((_, i) => (
                <motion.div 
                  key={i}
                  className={`absolute ${isMain ? 'w-4 h-4 md:w-6 md:h-6' : 'w-2 h-2'} rounded-full bg-white border-2 md:border-4 border-primary top-1/2 -translate-y-1/2`}
                  style={{ left: `${(i / (items.length - 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                  initial={isMain ? { scale: 0 } : false}
                  animate={isMain ? { scale: 1 } : false}
                  transition={{ delay: i * 0.15 }}
                />
              ))}
            </div>
            
            {/* Steps */}
            <div className="flex justify-between gap-1 md:gap-2">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex-1 text-center p-1 md:p-2 bg-white dark:bg-slate-800 rounded-lg shadow border-t-2 border-primary"
                  initial={isMain ? { opacity: 0, y: 20 } : false}
                  animate={isMain ? { opacity: 1, y: 0 } : false}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`${isMain ? 'text-xs md:text-sm' : 'text-[5px]'} font-bold text-primary mb-1`}>Step {i + 1}</div>
                  <div className={`${isMain ? 'text-[10px] md:text-xs' : 'text-[4px]'} text-muted-foreground`}>{item}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ===== COMPARISON =====
    if (slide.layout === 'comparison' || slide.layout === 'two-column' || slide.layout === 'before-after') {
      const half = Math.ceil((slide.content?.length || 0) / 2);
      const leftContent = slide.content?.slice(0, half) || [];
      const rightContent = slide.content?.slice(half) || [];
      const leftLabel = slide.layout === 'before-after' ? 'BEFORE' : 'OPTION A';
      const rightLabel = slide.layout === 'before-after' ? 'AFTER' : 'OPTION B';
      
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1.5 md:p-2.5 rounded-xl relative z-10`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-2 md:gap-4 p-2 md:p-4 relative">
            {/* VS badge */}
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isMain ? 'w-8 h-8 md:w-12 md:h-12 text-xs md:text-sm' : 'w-4 h-4 text-[5px]'} rounded-full bg-slate-900 text-white font-bold flex items-center justify-center z-10 border-2 border-white shadow-lg`}>
              VS
            </div>
            
            {/* Left */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 md:p-4 border-l-4 border-primary">
              <Badge className={`${isMain ? 'text-xs' : 'text-[5px]'} mb-2 bg-primary`}>{leftLabel}</Badge>
              <div className="space-y-1 md:space-y-2">
                {leftContent.map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-start gap-1 md:gap-2"
                    initial={isMain ? { opacity: 0, x: -10 } : false}
                    animate={isMain ? { opacity: 1, x: 0 } : false}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`${isMain ? 'w-1.5 h-1.5 mt-1.5' : 'w-0.5 h-0.5 mt-0.5'} rounded-full bg-primary flex-shrink-0`} />
                    <span className={contentSize}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Right */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 md:p-4 border-r-4 border-accent">
              <Badge className={`${isMain ? 'text-xs' : 'text-[5px]'} mb-2 bg-accent`}>{rightLabel}</Badge>
              <div className="space-y-1 md:space-y-2">
                {rightContent.map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-start gap-1 md:gap-2"
                    initial={isMain ? { opacity: 0, x: 10 } : false}
                    animate={isMain ? { opacity: 1, x: 0 } : false}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`${isMain ? 'w-1.5 h-1.5 mt-1.5' : 'w-0.5 h-0.5 mt-0.5'} rounded-full bg-accent flex-shrink-0`} />
                    <span className={contentSize}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ===== QUOTE =====
    if (slide.layout === 'quote') {
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1.5 md:p-2.5 rounded-xl relative z-10`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-3 md:p-8">
            <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-4 md:p-8 max-w-2xl shadow-2xl relative overflow-hidden`}>
              <div className="absolute -top-4 -left-4 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/10 blur-xl" />
              <Quote className={`${isMain ? 'w-8 h-8 md:w-12 md:h-12' : 'w-3 h-3'} text-white/40 mb-2 md:mb-4`} />
              <motion.p 
                className={`${isMain ? 'text-lg md:text-2xl' : 'text-[8px]'} text-white italic leading-relaxed`}
                initial={isMain ? { opacity: 0 } : false}
                animate={isMain ? { opacity: 1 } : false}
              >
                {slide.content?.[0] || slide.subtitle}
              </motion.p>
              {slide.content?.[1] && (
                <p className={`${isMain ? 'text-sm md:text-base' : 'text-[6px]'} text-white/60 mt-3 md:mt-4`}>
                  — {slide.content[1]}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ===== MIXED CONTENT LAYOUTS (Image + Text) =====
    // Handles: image-left, image-right, mixed-left, mixed-right, stats-visual, features-visual, 
    // timeline-visual, comparison-visual, quote-visual, spotlight-visual, takeaways-visual, cta-visual
    if (slide.layout === 'image-left' || slide.layout === 'image-right' || slide.layout === 'mixed-left' || slide.layout === 'mixed-right' ||
        slide.layout === 'stats-visual' || slide.layout === 'features-visual' || slide.layout === 'timeline-visual' ||
        slide.layout === 'comparison-visual' || slide.layout === 'quote-visual' || slide.layout === 'spotlight-visual' ||
        slide.layout === 'takeaways-visual' || slide.layout === 'cta-visual') {
      const imageFirst = slide.layout === 'image-left' || slide.layout === 'mixed-left' || 
                         slide.layout === 'quote-visual' || slide.layout === 'spotlight-visual';
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1.5 md:p-2.5 rounded-xl relative z-10`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
          </div>
          
          <div className={`flex-1 grid grid-cols-2 gap-2 md:gap-4 p-2 md:p-4`}>
            {/* Image Panel */}
            <div className={`${imageFirst ? 'order-1' : 'order-2'} relative rounded-xl overflow-hidden shadow-xl`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-20`} />
              {slide.generatedImage ? (
                <img src={slide.generatedImage} alt="" className="w-full h-full object-cover relative z-10" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center min-h-[120px]`}>
                  <div className="text-center">
                    <ImagePlus className={`${isMain ? 'w-10 h-10' : 'w-4 h-4'} text-white/60 mx-auto mb-2`} />
                    <span className={`${isMain ? 'text-xs' : 'text-[4px]'} text-white/40`}>AI Image</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Content Panel - varies by layout type */}
            <div className={`${imageFirst ? 'order-2' : 'order-1'} flex flex-col justify-center space-y-1 md:space-y-2`}>
              {slide.layout === 'stats-visual' || slide.layout === 'takeaways-visual' ? (
                // Stats/Takeaways: Larger text with emphasis on values
                slide.content?.slice(0, 4).map((item, i) => {
                  const [label, value] = item.split(':').map((s: string) => s.trim());
                  return (
                    <motion.div
                      key={i}
                      className="p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-lg shadow border-l-2 border-primary"
                      initial={isMain ? { opacity: 0, x: imageFirst ? 20 : -20 } : false}
                      animate={isMain ? { opacity: 1, x: 0 } : false}
                      transition={{ delay: i * 0.1 }}
                    >
                      {value ? (
                        <>
                          <span className={`${isMain ? 'text-lg md:text-xl font-bold' : 'text-[8px] font-bold'} bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent block`}>
                            {value}
                          </span>
                          <span className={`${isMain ? 'text-[10px] md:text-xs' : 'text-[5px]'} text-muted-foreground`}>
                            {label}
                          </span>
                        </>
                      ) : (
                        <span className={contentSize}>{item}</span>
                      )}
                    </motion.div>
                  );
                })
              ) : slide.layout === 'cta-visual' ? (
                // CTA: Bold action-oriented styling
                <div className="flex flex-col items-center justify-center h-full space-y-2 md:space-y-3">
                  {slide.content?.[0] && (
                    <motion.div
                      className={`px-4 md:px-8 py-2 md:py-3 rounded-full bg-gradient-to-r ${gradientClass} shadow-lg`}
                      initial={isMain ? { opacity: 0, scale: 0.8 } : false}
                      animate={isMain ? { opacity: 1, scale: 1 } : false}
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className={`${isMain ? 'text-sm md:text-lg font-bold' : 'text-[6px] font-bold'} text-white`}>
                        {slide.content[0]}
                      </span>
                    </motion.div>
                  )}
                  {slide.content?.slice(1).map((item, i) => (
                    <motion.div
                      key={i}
                      className={`${isMain ? 'text-xs md:text-sm' : 'text-[5px]'} text-muted-foreground text-center`}
                      initial={isMain ? { opacity: 0, y: 10 } : false}
                      animate={isMain ? { opacity: 1, y: 0 } : false}
                      transition={{ delay: (i + 1) * 0.1 }}
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Standard mixed content
                slide.content?.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-1 md:gap-2 p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-lg shadow border-l-2 border-primary"
                    initial={isMain ? { opacity: 0, x: imageFirst ? 20 : -20 } : false}
                    animate={isMain ? { opacity: 1, x: 0 } : false}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`${isMain ? 'w-5 h-5 text-[10px]' : 'w-2 h-2 text-[4px]'} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {i + 1}
                    </div>
                    <span className={contentSize}>{item}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    // ===== SECTION BREAK =====
    if (slide.layout === 'section-break') {
      return (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full bg-white/10 blur-2xl"
            animate={isMain ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-12 text-center">
            {slide.icon && (
              <motion.div 
                className={`${isMain ? 'text-5xl md:text-8xl' : 'text-xl'} mb-2 md:mb-6`}
                animate={isMain ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {slide.icon}
              </motion.div>
            )}
            
            <h2 className={`${isMain ? 'text-2xl md:text-5xl' : 'text-sm'} font-black text-white tracking-wider uppercase`}>
              {slide.title}
            </h2>
            
            <div className="w-12 md:w-24 h-0.5 md:h-1 bg-white/50 rounded-full mt-3 md:mt-6" />
          </div>
        </div>
      );
    }

    // ===== DEFAULT CONTENT =====
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2 relative overflow-hidden`}>
          <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10 blur-xl" />
          {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1.5 md:p-2.5 rounded-xl relative z-10`}>{slide.icon}</span>}
          <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
        </div>
        
        <div className="flex-1 p-2 md:p-5 space-y-1 md:space-y-2">
          {slide.content?.map((item, i) => (
            <motion.div
              key={i}
              initial={isMain ? { opacity: 0, x: -20 } : false}
              animate={isMain ? { opacity: 1, x: 0 } : false}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-2 md:gap-3 p-1.5 md:p-3 rounded-lg ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800/50'} shadow-sm`}
            >
              <div className={`${isMain ? 'w-6 h-6 text-xs' : 'w-3 h-3 text-[5px]'} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {i + 1}
              </div>
              <span className={`${contentSize} text-foreground`}>{item}</span>
            </motion.div>
          ))}
        </div>
        
        <div className={`h-1 bg-gradient-to-r ${gradientClass}`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" 
        />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4 md:mb-6">
            <Crown className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Agency-Grade Presentations</span>
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              PPT Generator
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Create legendary presentations that captivate and convert
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="flex items-center gap-2 md:gap-4">
            {[
              { key: 'prompt', label: 'Topic', icon: Type },
              { key: 'customize', label: 'Style', icon: Palette },
              { key: 'preview', label: 'Preview', icon: Eye },
            ].map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.key;
              const isPast = ['prompt', 'customize', 'preview'].indexOf(step) > i;
              return (
                <div key={s.key} className="flex items-center">
                  <motion.div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${
                      isActive || isPast
                        ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </motion.div>
                  {i < 2 && (
                    <div className={`w-8 md:w-16 h-1 mx-1 md:mx-2 rounded-full transition-all ${
                      isPast ? 'bg-gradient-to-r from-primary to-accent' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Prompt */}
          {step === 'prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div 
                    className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Presentation className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">What's your presentation about?</h2>
                    <p className="text-muted-foreground text-sm md:text-base">Be specific for legendary results</p>
                  </div>
                </div>

                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., AI startup pitch deck for investors - $10M seed round, focus on market opportunity, team, and traction..."
                  className="min-h-[140px] text-base md:text-lg mb-6 bg-background/50 border-primary/20 focus:border-primary resize-none"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setStep('customize')}
                    disabled={!prompt.trim()}
                    className="flex-1 h-12 md:h-14 text-base md:text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30"
                  >
                    <Wand2 className="w-5 h-5 mr-2" />
                    Continue to Style
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Customize */}
          {step === 'customize' && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <Button variant="ghost" onClick={() => setStep('prompt')} className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <Switch checked={aiChoose} onCheckedChange={setAiChoose} id="ai-choose" />
                    <Label htmlFor="ai-choose" className="flex items-center gap-2 cursor-pointer">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm">Let AI decide style</span>
                    </Label>
                  </div>
                </div>

                {!aiChoose && (
                  <>
                    {/* Style Selection */}
                    <div className="mb-8">
                      <Label className="text-lg font-semibold mb-4 block">Choose Style</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {styleOptions.map((style) => (
                          <motion.div
                            key={style.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedStyle(style.id)}
                            className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                              selectedStyle === style.id
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${style.gradient} mb-3 flex items-center justify-center text-2xl shadow-inner`}>
                              {style.icon}
                            </div>
                            <div className="font-semibold">{style.name}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Color Scheme */}
                    <div className="mb-8">
                      <Label className="text-lg font-semibold mb-4 block">Color Scheme</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {colorSchemes.map((scheme) => (
                          <motion.div
                            key={scheme.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedColor(scheme.id)}
                            className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                              selectedColor === scheme.id
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${scheme.gradient} mb-3 shadow-inner`} />
                            <div className="font-semibold text-sm">{scheme.name}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div>
                    <Label className="mb-2 block">Slide Count</Label>
                    <Select value={slideCount.toString()} onValueChange={(v) => setSlideCount(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[6, 8, 10, 12, 15, 20].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} slides</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                    <Switch checked={includeImages} onCheckedChange={setIncludeImages} id="images" />
                    <Label htmlFor="images" className="cursor-pointer">Include images</Label>
                  </div>
                  
                  {includeImages && (
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                      <Switch checked={generateAIImages} onCheckedChange={setGenerateAIImages} id="ai-images" />
                      <Label htmlFor="ai-images" className="cursor-pointer flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI-generated images
                      </Label>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!aiChoose && (!selectedStyle || !selectedColor))}
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {generationProgress}
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Legendary Presentation
                      <Sparkles className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && slides.length > 0 && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto"
            >
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <Button variant="ghost" onClick={() => setStep('customize')} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === 'slide' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('slide')}
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    Slide
                  </Button>
                  <Button
                    variant={previewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('grid')}
                  >
                    <LayoutGrid className="w-4 h-4 mr-1" />
                    Grid
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                  <Button onClick={handleDownload} className="bg-gradient-to-r from-primary to-accent">
                    <Download className="w-4 h-4 mr-2" />
                    Download PPTX
                  </Button>
                </div>
              </div>

              {previewMode === 'slide' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Thumbnails */}
                  <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="bg-card/80 backdrop-blur-xl rounded-xl p-3 border border-primary/20 max-h-[600px] overflow-y-auto">
                      <div className="space-y-2">
                        {slides.map((slide, index) => (
                          <motion.div
                            key={slide.slideNumber}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setCurrentSlide(index)}
                            className={`group relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                              currentSlide === index ? 'border-primary shadow-lg shadow-primary/30' : 'border-transparent hover:border-primary/50'
                            }`}
                          >
                            <div className="absolute inset-0">
                              {renderSlidePreview(slide, false)}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-[8px]">{index + 1}</Badge>
                                <Badge variant="outline" className="text-[6px]">{slide.layout}</Badge>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="w-5 h-5"
                                onClick={(e) => { e.stopPropagation(); setEditingSlide(slide); }}
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="w-5 h-5"
                                onClick={(e) => { e.stopPropagation(); duplicateSlide(slide); }}
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                className="w-5 h-5"
                                onClick={(e) => { e.stopPropagation(); deleteSlide(slide.slideNumber); }}
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Preview */}
                  <div className="lg:col-span-3 order-1 lg:order-2">
                    <Card className="bg-card/80 backdrop-blur-xl border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
                      <div className="aspect-video relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute inset-0"
                          >
                            {renderSlidePreview(slides[currentSlide], true)}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      
                      {/* Presenter Notes Section */}
                      {slides[currentSlide]?.presenterNotes && (
                        <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Type className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Speaker Notes</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed max-h-20 overflow-y-auto">
                            {slides[currentSlide].presenterNotes}
                          </p>
                        </div>
                      )}
                      
                      {/* Navigation */}
                      <div className="p-4 flex items-center justify-between border-t border-border/50">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                          disabled={currentSlide === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {currentSlide + 1} / {slides.length}
                          </span>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                          disabled={currentSlide === slides.length - 1}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {slides.map((slide, index) => (
                    <motion.div
                      key={slide.slideNumber}
                      whileHover={{ scale: 1.02 }}
                      className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary shadow-lg"
                      onClick={() => { setCurrentSlide(index); setPreviewMode('slide'); }}
                    >
                      <div className="absolute inset-0">
                        {renderSlidePreview(slide, false)}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">{index + 1}</Badge>
                          <Badge variant="outline" className="text-[8px]">{slide.layout}</Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        {editingSlide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingSlide(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit Slide {editingSlide.slideNumber}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditingSlide(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={editingSlide.subtitle || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Layout</Label>
                  <Select
                    value={editingSlide.layout}
                    onValueChange={(v) => setEditingSlide({ ...editingSlide, layout: v as Slide['layout'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {layoutOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Icon (emoji)</Label>
                  <Input
                    value={editingSlide.icon || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, icon: e.target.value })}
                    className="text-2xl"
                  />
                </div>
                
                <div>
                  <Label>Content Points</Label>
                  <Textarea
                    value={editingSlide.content?.join('\n') || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, content: e.target.value.split('\n') })}
                    className="min-h-[120px]"
                    placeholder="One point per line"
                  />
                </div>
                
                <div>
                  <Label>Speaker Notes</Label>
                  <Textarea
                    value={editingSlide.notes || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, notes: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setEditingSlide(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => updateSlide(editingSlide)} className="flex-1 bg-gradient-to-r from-primary to-accent">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
