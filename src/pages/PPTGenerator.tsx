import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Presentation, Sparkles, Wand2, Download, Edit3, ChevronLeft, ChevronRight, 
  Palette, LayoutGrid, Image, Type, Loader2, Check, RefreshCw, Plus, Trash2,
  Zap, Stars, ArrowRight, Settings2, Layers, Eye, ImagePlus, Layout, 
  Quote, BarChart3, GitCompare, Clock, MoveHorizontal, Save, X, Copy
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
  imagePrompt?: string;
  generatedImage?: string;
  layout: 'title' | 'content' | 'two-column' | 'image-left' | 'image-right' | 'quote' | 'stats' | 'timeline' | 'comparison';
  accentColor?: string;
  icon?: string;
}

const styleOptions = [
  { id: 'professional', name: 'Professional', icon: '💼', description: 'Clean corporate style', gradient: 'from-blue-600 to-indigo-600' },
  { id: 'creative', name: 'Creative', icon: '🎨', description: 'Bold artistic design', gradient: 'from-pink-500 to-purple-600' },
  { id: 'minimal', name: 'Minimal', icon: '✨', description: 'Simple elegant look', gradient: 'from-gray-600 to-slate-800' },
  { id: 'tech', name: 'Tech', icon: '🚀', description: 'Modern futuristic', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'academic', name: 'Academic', icon: '📚', description: 'Scholarly structured', gradient: 'from-emerald-600 to-teal-600' },
  { id: 'startup', name: 'Startup', icon: '💡', description: 'Pitch deck ready', gradient: 'from-orange-500 to-red-500' },
];

const colorSchemes = [
  { id: 'ocean', name: 'Ocean Depths', colors: ['#0f172a', '#1e40af', '#3b82f6', '#93c5fd'], gradient: 'from-blue-900 via-blue-600 to-blue-400' },
  { id: 'sunset', name: 'Sunset Glow', colors: ['#7c2d12', '#ea580c', '#fb923c', '#fed7aa'], gradient: 'from-orange-900 via-orange-500 to-orange-300' },
  { id: 'forest', name: 'Forest Green', colors: ['#14532d', '#16a34a', '#4ade80', '#bbf7d0'], gradient: 'from-green-900 via-green-500 to-green-300' },
  { id: 'royal', name: 'Royal Purple', colors: ['#4c1d95', '#7c3aed', '#a78bfa', '#ddd6fe'], gradient: 'from-purple-900 via-purple-500 to-purple-300' },
  { id: 'midnight', name: 'Midnight Dark', colors: ['#020617', '#1e293b', '#475569', '#94a3b8'], gradient: 'from-slate-950 via-slate-700 to-slate-500' },
  { id: 'aurora', name: 'Aurora Gradient', colors: ['#7c3aed', '#ec4899', '#f59e0b', '#10b981'], gradient: 'from-violet-600 via-pink-500 to-amber-500' },
];

const layoutOptions = [
  { id: 'title', name: 'Title', icon: Layout, description: 'Big centered title' },
  { id: 'content', name: 'Content', icon: Layers, description: 'Bullet points' },
  { id: 'image-left', name: 'Image Left', icon: ImagePlus, description: 'Image + text' },
  { id: 'image-right', name: 'Image Right', icon: ImagePlus, description: 'Text + image' },
  { id: 'two-column', name: 'Two Column', icon: MoveHorizontal, description: 'Split layout' },
  { id: 'quote', name: 'Quote', icon: Quote, description: 'Big quote' },
  { id: 'stats', name: 'Statistics', icon: BarChart3, description: 'Numbers focus' },
  { id: 'comparison', name: 'Comparison', icon: GitCompare, description: 'Side by side' },
  { id: 'timeline', name: 'Timeline', icon: Clock, description: 'Process steps' },
];

export default function PPTGenerator() {
  const [step, setStep] = useState<'prompt' | 'customize' | 'preview' | 'edit'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [slideCount, setSlideCount] = useState(8);
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
    setGenerationProgress('Creating your presentation...');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ppt', {
        body: {
          prompt,
          style: aiChoose ? 'AI will choose the best style based on content' : selectedStyle,
          colorScheme: aiChoose ? 'AI will choose optimal colors' : selectedColor,
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
      toast.success('🎉 Presentation generated successfully!');
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

      // Ultra-premium color systems with complex gradients
      const colorMap: Record<string, { 
        primary: string; secondary: string; accent: string; bg: string; text: string; 
        gradient1: string; gradient2: string; gradient3: string; glow: string; dark: string;
        neon: string; soft: string; highlight: string; surface: string;
      }> = {
        ocean: { 
          primary: '3b82f6', secondary: '6366f1', accent: '06b6d4', bg: '0c1929', text: 'FFFFFF', 
          gradient1: '0f172a', gradient2: '1e3a5f', gradient3: '3b82f6', glow: '60a5fa', dark: '020617',
          neon: '22d3ee', soft: '1e40af', highlight: '7dd3fc', surface: '0f172a'
        },
        sunset: { 
          primary: 'f97316', secondary: 'ef4444', accent: 'fbbf24', bg: '1c1917', text: 'FFFFFF', 
          gradient1: '7c2d12', gradient2: 'c2410c', gradient3: 'fb923c', glow: 'fdba74', dark: '0c0a09',
          neon: 'fcd34d', soft: 'ea580c', highlight: 'fef3c7', surface: '1c1917'
        },
        forest: { 
          primary: '22c55e', secondary: '14b8a6', accent: '84cc16', bg: '0f1f17', text: 'FFFFFF', 
          gradient1: '052e16', gradient2: '166534', gradient3: '4ade80', glow: '86efac', dark: '022c22',
          neon: 'a3e635', soft: '15803d', highlight: 'dcfce7', surface: '0d1f17'
        },
        royal: { 
          primary: 'a855f7', secondary: 'ec4899', accent: '8b5cf6', bg: '1e1033', text: 'FFFFFF', 
          gradient1: '2e1065', gradient2: '6b21a8', gradient3: 'c084fc', glow: 'd8b4fe', dark: '0c0015',
          neon: 'f0abfc', soft: '7c3aed', highlight: 'fae8ff', surface: '1a0a2e'
        },
        midnight: { 
          primary: '64748b', secondary: '94a3b8', accent: 'e2e8f0', bg: '0f172a', text: 'FFFFFF', 
          gradient1: '020617', gradient2: '1e293b', gradient3: '475569', glow: '94a3b8', dark: '000000',
          neon: 'cbd5e1', soft: '334155', highlight: 'f1f5f9', surface: '0f172a'
        },
        aurora: { 
          primary: 'a855f7', secondary: 'ec4899', accent: '22d3ee', bg: '0f0720', text: 'FFFFFF', 
          gradient1: '4c1d95', gradient2: 'be185d', gradient3: '06b6d4', glow: 'f0abfc', dark: '0a0015',
          neon: '67e8f9', soft: '9333ea', highlight: 'fdf4ff', surface: '0d0620'
        },
      };

      const colors = colorMap[selectedColor] || colorMap.ocean;

      slides.forEach((slide, index) => {
        const pptSlide = pptx.addSlide();
        
        // ===== TITLE SLIDE - EPIC CINEMATIC DESIGN =====
        if (index === 0 || slide.layout === 'title') {
          // Deep dark base
          pptSlide.background = { color: colors.dark };
          
          // MESH GRADIENT EFFECT - Multiple overlapping gradient orbs
          // Large primary orb (top-right) with blur effect simulation
          pptSlide.addShape('ellipse', {
            x: 5.5, y: -2.5, w: 8, h: 8,
            fill: { type: 'solid', color: colors.gradient2 },
          });
          pptSlide.addShape('ellipse', {
            x: 6, y: -2, w: 7, h: 7,
            fill: { type: 'solid', color: colors.primary },
          });
          pptSlide.addShape('ellipse', {
            x: 6.5, y: -1.5, w: 6, h: 6,
            fill: { type: 'solid', color: colors.soft },
          });
          
          // Secondary orb (bottom-left)
          pptSlide.addShape('ellipse', {
            x: -3, y: 3.5, w: 6, h: 6,
            fill: { type: 'solid', color: colors.gradient1 },
          });
          pptSlide.addShape('ellipse', {
            x: -2.5, y: 4, w: 5, h: 5,
            fill: { type: 'solid', color: colors.secondary },
          });
          
          // Accent neon orb (floating)
          pptSlide.addShape('ellipse', {
            x: 8.2, y: 3.8, w: 2.5, h: 2.5,
            fill: { type: 'solid', color: colors.neon },
          });
          pptSlide.addShape('ellipse', {
            x: 8.5, y: 4.1, w: 2, h: 2,
            fill: { type: 'solid', color: colors.accent },
          });
          
          // Small floating dots (particle effect)
          const particles = [
            { x: 1.2, y: 0.8, s: 0.15 }, { x: 9.2, y: 1.2, s: 0.12 },
            { x: 7.8, y: 2.5, s: 0.18 }, { x: 2.5, y: 4.8, s: 0.14 },
            { x: 8.8, y: 0.5, s: 0.1 }, { x: 3.5, y: 1.5, s: 0.16 },
          ];
          particles.forEach(p => {
            pptSlide.addShape('ellipse', {
              x: p.x, y: p.y, w: p.s, h: p.s,
              fill: { type: 'solid', color: colors.glow },
            });
          });
          
          // DIAGONAL CUT SHAPE - Modern angular accent
          pptSlide.addShape('rect', {
            x: -1, y: 4.2, w: 4, h: 3,
            fill: { type: 'solid', color: colors.primary },
            rotate: -15,
          });
          
          // Neon accent line with glow effect
          pptSlide.addShape('rect', {
            x: 0.8, y: 2.3, w: 4.5, h: 0.12,
            fill: { type: 'solid', color: colors.neon },
          });
          pptSlide.addShape('rect', {
            x: 0.8, y: 2.28, w: 4.5, h: 0.16,
            fill: { type: 'solid', color: colors.glow },
          });
          
          // Icon with glassmorphism effect
          if (slide.icon) {
            // Glass background
            pptSlide.addShape('roundRect', {
              x: 0.6, y: 1.2, w: 1.4, h: 1.4,
              fill: { type: 'solid', color: colors.surface },
              rectRadius: 0.2,
            });
            // Border glow
            pptSlide.addShape('roundRect', {
              x: 0.55, y: 1.15, w: 1.5, h: 1.5,
              line: { color: colors.glow, width: 2 },
              fill: { type: 'none' },
              rectRadius: 0.22,
            });
            pptSlide.addText(slide.icon, {
              x: 0.6, y: 1.2, w: 1.4, h: 1.4,
              fontSize: 48, align: 'center', valign: 'middle',
            });
          }

          // Main title - BOLD dramatic typography
          pptSlide.addText(slide.title.toUpperCase(), {
            x: 0.8, y: 2.55, w: 9, h: 1.6,
            fontSize: 58, bold: true, color: 'FFFFFF',
            fontFace: 'Arial Black',
          });
          
          // Subtitle with highlight
          if (slide.subtitle) {
            pptSlide.addText(slide.subtitle, {
              x: 0.8, y: 4.3, w: 8.5, h: 0.8,
              fontSize: 24, color: colors.highlight,
              fontFace: 'Arial',
            });
          }
          
          // Bottom neon bar
          pptSlide.addShape('rect', {
            x: 0, y: 5.3, w: '100%', h: 0.2,
            fill: { type: 'solid', color: colors.neon },
          });
          pptSlide.addShape('rect', {
            x: 0, y: 5.25, w: '100%', h: 0.08,
            fill: { type: 'solid', color: colors.glow },
          });
          
        } else {
          // ===== CONTENT SLIDES - ULTRA MODERN =====
          
          // Clean light background with subtle texture
          pptSlide.background = { color: 'F8FAFC' };
          
          // Dramatic dark header with gradient depth
          pptSlide.addShape('rect', {
            x: 0, y: 0, w: '100%', h: 1.4,
            fill: { type: 'solid', color: colors.dark },
          });
          
          // Layered decorative orbs in header
          pptSlide.addShape('ellipse', {
            x: 7.5, y: -1.5, w: 4, h: 4,
            fill: { type: 'solid', color: colors.gradient2 },
          });
          pptSlide.addShape('ellipse', {
            x: 8, y: -1, w: 3.2, h: 3.2,
            fill: { type: 'solid', color: colors.primary },
          });
          pptSlide.addShape('ellipse', {
            x: 9.5, y: 0.4, w: 1.2, h: 1.2,
            fill: { type: 'solid', color: colors.neon },
          });
          
          // Left edge neon accent
          pptSlide.addShape('rect', {
            x: 0, y: 1.4, w: 0.08, h: 4.1,
            fill: { type: 'solid', color: colors.neon },
          });
          pptSlide.addShape('rect', {
            x: 0.08, y: 1.4, w: 0.04, h: 4.1,
            fill: { type: 'solid', color: colors.glow },
          });
          
          // Floating corner accent
          pptSlide.addShape('roundRect', {
            x: 9.0, y: 4.6, w: 1.2, h: 1.2,
            fill: { type: 'solid', color: colors.primary },
            rectRadius: 0.6,
            rotate: 45,
          });

          // Icon badge with glow
          if (slide.icon) {
            pptSlide.addShape('ellipse', {
              x: 0.28, y: 0.28, w: 0.95, h: 0.95,
              fill: { type: 'solid', color: colors.primary },
            });
            pptSlide.addShape('ellipse', {
              x: 0.23, y: 0.23, w: 1.05, h: 1.05,
              line: { color: colors.glow, width: 2 },
              fill: { type: 'none' },
            });
            pptSlide.addText(slide.icon, {
              x: 0.3, y: 0.3, w: 0.9, h: 0.9,
              fontSize: 32, align: 'center', valign: 'middle',
            });
          }

          // Title with impact
          pptSlide.addText(slide.title, {
            x: 1.45, y: 0.4, w: 7, h: 0.8,
            fontSize: 32, bold: true, color: 'FFFFFF',
            fontFace: 'Arial',
          });

          // ===== LAYOUT SPECIFIC CONTENT =====
          
          if (slide.layout === 'image-left' || slide.layout === 'image-right') {
            const imageX = slide.layout === 'image-left' ? 0.3 : 5.2;
            const textX = slide.layout === 'image-left' ? 4.9 : 0.3;
            
            // Image frame with glow effect
            pptSlide.addShape('roundRect', {
              x: imageX - 0.08, y: 1.55, w: 4.66, h: 3.46,
              fill: { type: 'solid', color: colors.primary },
              rectRadius: 0.18,
            });
            pptSlide.addShape('roundRect', {
              x: imageX, y: 1.65, w: 4.5, h: 3.25,
              fill: { type: 'solid', color: colors.surface },
              rectRadius: 0.12,
            });
            
            if (slide.generatedImage) {
              pptSlide.addImage({
                data: slide.generatedImage,
                x: imageX + 0.08, y: 1.73, w: 4.34, h: 3.1,
              });
            } else {
              pptSlide.addText('🖼️', {
                x: imageX, y: 2.8, w: 4.5, h: 1,
                fontSize: 54, align: 'center', color: colors.glow,
              });
            }
            
            // Content with premium bullet design
            if (slide.content && slide.content.length > 0) {
              slide.content.forEach((item, i) => {
                // Bullet line
                pptSlide.addShape('rect', {
                  x: textX, y: 1.78 + (i * 0.75), w: 0.25, h: 0.08,
                  fill: { type: 'solid', color: colors.primary },
                });
                pptSlide.addText(item, {
                  x: textX + 0.4, y: 1.65 + (i * 0.75), w: 4.2, h: 0.65,
                  fontSize: 16, color: '1e293b',
                  fontFace: 'Arial',
                });
              });
            }
            
          } else if (slide.layout === 'stats') {
            // GLASSMORPHISM STAT CARDS
            const statCount = Math.min(slide.content?.length || 4, 4);
            const cardWidth = (9.4 / statCount) - 0.35;
            
            slide.content?.slice(0, 4).forEach((item, i) => {
              const parts = item.split(':');
              const label = parts[0]?.trim() || '';
              const value = parts[1]?.trim() || item;
              const xPos = 0.35 + (i * (cardWidth + 0.35));
              
              // Card outer glow
              pptSlide.addShape('roundRect', {
                x: xPos - 0.05, y: 1.65, w: cardWidth + 0.1, h: 3.05,
                fill: { type: 'solid', color: colors.glow },
                rectRadius: 0.18,
              });
              
              // Card body
              pptSlide.addShape('roundRect', {
                x: xPos, y: 1.7, w: cardWidth, h: 2.95,
                fill: { type: 'solid', color: 'FFFFFF' },
                rectRadius: 0.15,
              });
              
              // Top accent band with gradient feel
              pptSlide.addShape('rect', {
                x: xPos, y: 1.7, w: cardWidth, h: 0.6,
                fill: { type: 'solid', color: colors.primary },
              });
              pptSlide.addShape('ellipse', {
                x: xPos + cardWidth - 0.8, y: 1.5, w: 1, h: 1,
                fill: { type: 'solid', color: colors.secondary },
              });
              
              // Icon circle
              pptSlide.addShape('ellipse', {
                x: xPos + (cardWidth / 2) - 0.35, y: 2.1, w: 0.7, h: 0.7,
                fill: { type: 'solid', color: colors.neon },
              });
              
              // Big value
              pptSlide.addText(value, {
                x: xPos, y: 2.85, w: cardWidth, h: 1,
                fontSize: 44, bold: true, color: colors.dark, align: 'center',
                fontFace: 'Arial Black',
              });
              
              // Label
              pptSlide.addText(label.toUpperCase(), {
                x: xPos, y: 3.95, w: cardWidth, h: 0.5,
                fontSize: 11, color: '64748b', align: 'center',
                fontFace: 'Arial', bold: true,
              });
            });
            
          } else if (slide.layout === 'quote') {
            // DRAMATIC QUOTE DESIGN
            
            // Quote background panel
            pptSlide.addShape('roundRect', {
              x: 0.5, y: 1.6, w: 8.8, h: 3.2,
              fill: { type: 'solid', color: colors.surface },
              rectRadius: 0.2,
            });
            
            // Decorative quote mark with glow
            pptSlide.addShape('ellipse', {
              x: 0.6, y: 1.5, w: 1.5, h: 1.5,
              fill: { type: 'solid', color: colors.primary },
            });
            pptSlide.addText('"', {
              x: 0.5, y: 1.2, w: 1.8, h: 1.8,
              fontSize: 100, color: 'FFFFFF',
              fontFace: 'Georgia', bold: true,
            });
            
            // Quote text
            const quoteText = slide.content?.[0] || slide.subtitle || '';
            pptSlide.addText(quoteText, {
              x: 1.5, y: 2.2, w: 7.2, h: 1.8,
              fontSize: 28, italic: true, color: 'FFFFFF', align: 'left',
              fontFace: 'Georgia',
            });
            
            // Author line with accent
            if (slide.content?.[1]) {
              pptSlide.addShape('rect', {
                x: 1.5, y: 4.2, w: 2, h: 0.06,
                fill: { type: 'solid', color: colors.neon },
              });
              pptSlide.addText(`— ${slide.content[1]}`, {
                x: 1.5, y: 4.35, w: 6, h: 0.5,
                fontSize: 16, color: colors.glow,
                fontFace: 'Arial', bold: true,
              });
            }
            
          } else if (slide.layout === 'two-column' || slide.layout === 'comparison') {
            const half = Math.ceil((slide.content?.length || 0) / 2);
            const leftContent = slide.content?.slice(0, half) || [];
            const rightContent = slide.content?.slice(half) || [];
            
            // Column labels
            pptSlide.addShape('roundRect', {
              x: 0.3, y: 1.55, w: 1.8, h: 0.45,
              fill: { type: 'solid', color: colors.primary },
              rectRadius: 0.22,
            });
            pptSlide.addText('OPTION A', {
              x: 0.3, y: 1.55, w: 1.8, h: 0.45,
              fontSize: 12, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true,
            });
            
            pptSlide.addShape('roundRect', {
              x: 5.1, y: 1.55, w: 1.8, h: 0.45,
              fill: { type: 'solid', color: colors.secondary },
              rectRadius: 0.22,
            });
            pptSlide.addText('OPTION B', {
              x: 5.1, y: 1.55, w: 1.8, h: 0.45,
              fontSize: 12, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true,
            });
            
            // Left card
            pptSlide.addShape('roundRect', {
              x: 0.3, y: 2.1, w: 4.5, h: 2.95,
              fill: { type: 'solid', color: 'FFFFFF' },
              rectRadius: 0.12,
              shadow: { type: 'outer', blur: 10, offset: 3, angle: 45, color: '000000', opacity: 0.08 },
            });
            pptSlide.addShape('rect', {
              x: 0.3, y: 2.1, w: 0.1, h: 2.95,
              fill: { type: 'solid', color: colors.primary },
            });
            
            // Right card
            pptSlide.addShape('roundRect', {
              x: 5.0, y: 2.1, w: 4.5, h: 2.95,
              fill: { type: 'solid', color: 'FFFFFF' },
              rectRadius: 0.12,
              shadow: { type: 'outer', blur: 10, offset: 3, angle: 45, color: '000000', opacity: 0.08 },
            });
            pptSlide.addShape('rect', {
              x: 9.4, y: 2.1, w: 0.1, h: 2.95,
              fill: { type: 'solid', color: colors.secondary },
            });
            
            // VS badge
            pptSlide.addShape('ellipse', {
              x: 4.45, y: 3.15, w: 0.9, h: 0.9,
              fill: { type: 'solid', color: colors.dark },
            });
            pptSlide.addText('VS', {
              x: 4.45, y: 3.15, w: 0.9, h: 0.9,
              fontSize: 14, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true,
            });
            
            // Left content
            leftContent.forEach((item, i) => {
              pptSlide.addShape('ellipse', {
                x: 0.55, y: 2.4 + (i * 0.6), w: 0.18, h: 0.18,
                fill: { type: 'solid', color: colors.primary },
              });
              pptSlide.addText(item, {
                x: 0.9, y: 2.3 + (i * 0.6), w: 3.7, h: 0.5,
                fontSize: 14, color: '334155', fontFace: 'Arial',
              });
            });
            
            // Right content
            rightContent.forEach((item, i) => {
              pptSlide.addShape('ellipse', {
                x: 5.25, y: 2.4 + (i * 0.6), w: 0.18, h: 0.18,
                fill: { type: 'solid', color: colors.secondary },
              });
              pptSlide.addText(item, {
                x: 5.6, y: 2.3 + (i * 0.6), w: 3.7, h: 0.5,
                fontSize: 14, color: '334155', fontFace: 'Arial',
              });
            });
            
          } else if (slide.layout === 'timeline') {
            const items = slide.content?.slice(0, 5) || [];
            const stepWidth = 8.8 / items.length;
            
            // Timeline track with neon glow
            pptSlide.addShape('rect', {
              x: 0.5, y: 2.85, w: 8.8, h: 0.18,
              fill: { type: 'solid', color: colors.glow },
            });
            pptSlide.addShape('rect', {
              x: 0.5, y: 2.88, w: 8.8, h: 0.12,
              fill: { type: 'solid', color: colors.primary },
            });
            
            items.forEach((item, i) => {
              const xPos = 0.5 + (i * stepWidth) + (stepWidth / 2);
              
              // Outer glow ring
              pptSlide.addShape('ellipse', {
                x: xPos - 0.45, y: 2.48, w: 0.9, h: 0.9,
                fill: { type: 'solid', color: colors.glow },
              });
              
              // Inner numbered circle
              pptSlide.addShape('ellipse', {
                x: xPos - 0.32, y: 2.6, w: 0.65, h: 0.65,
                fill: { type: 'solid', color: colors.primary },
              });
              
              // Number
              pptSlide.addText(`${i + 1}`, {
                x: xPos - 0.32, y: 2.6, w: 0.65, h: 0.65,
                fontSize: 18, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true,
              });
              
              // Connecting line to card
              pptSlide.addShape('rect', {
                x: xPos - 0.02, y: 3.3, w: 0.04, h: 0.4,
                fill: { type: 'solid', color: colors.glow },
              });
              
              // Step card
              pptSlide.addShape('roundRect', {
                x: xPos - (stepWidth / 2) + 0.12, y: 3.7, w: stepWidth - 0.2, h: 1.15,
                fill: { type: 'solid', color: 'FFFFFF' },
                rectRadius: 0.1,
                shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '000000', opacity: 0.06 },
              });
              
              // Card top accent
              pptSlide.addShape('rect', {
                x: xPos - (stepWidth / 2) + 0.12, y: 3.7, w: stepWidth - 0.2, h: 0.08,
                fill: { type: 'solid', color: colors.primary },
              });
              
              pptSlide.addText(item, {
                x: xPos - (stepWidth / 2) + 0.18, y: 3.85, w: stepWidth - 0.32, h: 0.9,
                fontSize: 11, color: '334155', align: 'center', valign: 'top',
                fontFace: 'Arial',
              });
            });
            
          } else {
            // ===== DEFAULT CONTENT - MODERN ALTERNATING CARDS =====
            if (slide.content && slide.content.length > 0) {
              slide.content.forEach((item, i) => {
                const yPos = 1.6 + (i * 0.72);
                const isEven = i % 2 === 0;
                
                // Card background with subtle offset shadow
                pptSlide.addShape('roundRect', {
                  x: 0.35, y: yPos + 0.02, w: 9.1, h: 0.6,
                  fill: { type: 'solid', color: colors.glow },
                  rectRadius: 0.08,
                });
                pptSlide.addShape('roundRect', {
                  x: 0.3, y: yPos, w: 9.1, h: 0.6,
                  fill: { type: 'solid', color: isEven ? 'FFFFFF' : 'F1F5F9' },
                  rectRadius: 0.08,
                });
                
                // Left accent bar
                pptSlide.addShape('rect', {
                  x: 0.3, y: yPos, w: 0.08, h: 0.6,
                  fill: { type: 'solid', color: isEven ? colors.primary : colors.secondary },
                });
                
                // Number badge
                pptSlide.addShape('ellipse', {
                  x: 0.55, y: yPos + 0.15, w: 0.3, h: 0.3,
                  fill: { type: 'solid', color: colors.primary },
                });
                pptSlide.addText(`${i + 1}`, {
                  x: 0.55, y: yPos + 0.15, w: 0.3, h: 0.3,
                  fontSize: 11, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true,
                });
                
                // Text
                pptSlide.addText(item, {
                  x: 1.0, y: yPos + 0.08, w: 8.2, h: 0.48,
                  fontSize: 16, color: '1e293b',
                  fontFace: 'Arial',
                });
              });
            }
          }
          
          // ===== FOOTER - SLEEK MODERN =====
          
          // Neon bottom line
          pptSlide.addShape('rect', {
            x: 0, y: 5.38, w: '100%', h: 0.12,
            fill: { type: 'solid', color: colors.primary },
          });
          
          // Slide number with glow background
          pptSlide.addShape('ellipse', {
            x: 9.05, y: 4.95, w: 0.55, h: 0.55,
            fill: { type: 'solid', color: colors.glow },
          });
          pptSlide.addShape('ellipse', {
            x: 9.1, y: 5.0, w: 0.45, h: 0.45,
            fill: { type: 'solid', color: colors.dark },
          });
          pptSlide.addText(`${index + 1}`, {
            x: 9.1, y: 5.0, w: 0.45, h: 0.45,
            fontSize: 12, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true,
          });
        }

        // Speaker notes
        if (slide.notes) {
          pptSlide.addNotes(slide.notes);
        }
      });

      const fileName = `${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
      await pptx.writeFile({ fileName });
      toast.success('🔥 Epic presentation downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download presentation');
    }
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide({ ...slide });
    setStep('edit');
  };

  const handleSaveEdit = () => {
    if (!editingSlide) return;
    setSlides(prev => prev.map(s => 
      s.slideNumber === editingSlide.slideNumber ? editingSlide : s
    ));
    setEditingSlide(null);
    setStep('preview');
    toast.success('Slide updated!');
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      slideNumber: slides.length + 1,
      title: 'New Slide',
      content: ['Add your content here'],
      layout: 'content',
      icon: '📌',
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
    toast.success('Slide added!');
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error("Can't delete the only slide");
      return;
    }
    setSlides(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, slideNumber: i + 1 })));
    if (currentSlide >= slides.length - 1) {
      setCurrentSlide(Math.max(0, slides.length - 2));
    }
    toast.success('Slide deleted');
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToDuplicate = slides[index];
    const newSlide = { ...slideToDuplicate, slideNumber: slides.length + 1 };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides.map((s, i) => ({ ...s, slideNumber: i + 1 })));
    toast.success('Slide duplicated!');
  };

  const currentColorScheme = colorSchemes.find(c => c.id === selectedColor);

  const renderSlidePreview = (slide: Slide, isMain = false) => {
    const size = isMain ? 'text-xl md:text-3xl' : 'text-[10px]';
    const contentSize = isMain ? 'text-sm md:text-base' : 'text-[7px]';
    const gradientClass = currentColorScheme?.gradient || 'from-primary via-primary/80 to-accent';
    
    // ===== TITLE SLIDE - Premium Dark Theme =====
    if (slide.layout === 'title' || slide.slideNumber === 1) {
      return (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 md:w-64 md:h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute top-1/4 right-1/4 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/10 blur-xl" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-center p-4 md:p-12">
            {/* Accent line */}
            <div className="w-12 md:w-20 h-1 bg-white/60 rounded-full mb-3 md:mb-6" />
            
            {/* Icon */}
            {slide.icon && (
              <motion.div 
                className={`${isMain ? 'text-3xl md:text-5xl' : 'text-lg'} mb-2 md:mb-4 w-fit p-2 md:p-3 rounded-xl bg-white/10 backdrop-blur`}
                animate={isMain ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {slide.icon}
              </motion.div>
            )}
            
            {/* Title */}
            <h2 className={`${isMain ? 'text-2xl md:text-5xl' : 'text-sm'} font-black text-white leading-tight mb-2 md:mb-4`}>
              {slide.title}
            </h2>
            
            {/* Subtitle */}
            {slide.subtitle && (
              <p className={`${isMain ? 'text-base md:text-xl' : 'text-[8px]'} text-white/70 max-w-lg`}>
                {slide.subtitle}
              </p>
            )}
          </div>
          
          {/* Bottom accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 md:h-2 bg-gradient-to-r from-white/20 via-white/40 to-white/20" />
        </div>
      );
    }

    // ===== IMAGE LAYOUTS =====
    if (slide.layout === 'image-left' || slide.layout === 'image-right') {
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2`}>
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1 md:p-2 rounded-lg`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white`}>{slide.title}</h3>
          </div>
          
          {/* Content Grid */}
          <div className={`flex-1 grid grid-cols-2 gap-2 md:gap-4 p-2 md:p-4`}>
            <div className={slide.layout === 'image-left' ? 'order-1' : 'order-2'}>
              {slide.generatedImage ? (
                <img src={slide.generatedImage} alt="" className="w-full h-full object-cover rounded-xl shadow-lg" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradientClass} rounded-xl flex items-center justify-center shadow-lg`}>
                  <ImagePlus className={`${isMain ? 'w-10 h-10' : 'w-4 h-4'} text-white/50`} />
                </div>
              )}
            </div>
            <div className={`${slide.layout === 'image-left' ? 'order-2' : 'order-1'} flex flex-col justify-center space-y-1 md:space-y-3`}>
              {slide.content?.map((item, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-start gap-1 md:gap-3"
                  initial={isMain ? { opacity: 0, x: slide.layout === 'image-left' ? 20 : -20 } : false}
                  animate={isMain ? { opacity: 1, x: 0 } : false}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`${isMain ? 'w-2 h-2 mt-2' : 'w-1 h-1 mt-0.5'} rounded-full bg-primary flex-shrink-0`} />
                  <span className={`${contentSize} text-foreground`}>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ===== QUOTE LAYOUT =====
    if (slide.layout === 'quote') {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 md:p-8 relative overflow-hidden">
          {/* Decorative quote marks */}
          <div className={`absolute top-4 left-4 md:top-8 md:left-8 ${isMain ? 'text-6xl md:text-9xl' : 'text-2xl'} font-serif text-primary/10`}>"</div>
          <div className={`absolute bottom-4 right-4 md:bottom-8 md:right-8 ${isMain ? 'text-6xl md:text-9xl' : 'text-2xl'} font-serif text-primary/10 rotate-180`}>"</div>
          
          <Quote className={`${isMain ? 'w-6 h-6 md:w-10 md:h-10' : 'w-3 h-3'} text-primary mb-2 md:mb-4`} />
          <p className={`${isMain ? 'text-lg md:text-2xl' : 'text-[9px]'} italic text-foreground font-medium text-center max-w-xl mb-2 md:mb-4 leading-relaxed`}>
            "{slide.content?.[0] || slide.subtitle}"
          </p>
          {slide.content?.[1] && (
            <div className="flex items-center gap-2">
              <div className={`${isMain ? 'w-8' : 'w-4'} h-0.5 bg-primary`} />
              <p className={`${contentSize} text-muted-foreground font-medium`}>{slide.content[1]}</p>
            </div>
          )}
        </div>
      );
    }

    // ===== STATS LAYOUT =====
    if (slide.layout === 'stats') {
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2`}>
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1 md:p-2 rounded-lg`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white`}>{slide.title}</h3>
          </div>
          
          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 p-2 md:p-4">
            {slide.content?.slice(0, 4).map((item, i) => {
              const parts = item.split(':');
              const label = parts[0]?.trim() || '';
              const value = parts[1]?.trim() || item;
              return (
                <motion.div 
                  key={i} 
                  className="flex flex-col items-center justify-center p-2 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-primary/10"
                  initial={isMain ? { opacity: 0, y: 20 } : false}
                  animate={isMain ? { opacity: 1, y: 0 } : false}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`w-full h-1 bg-gradient-to-r ${gradientClass} rounded-full mb-2 md:mb-3`} />
                  <span className={`${isMain ? 'text-xl md:text-3xl' : 'text-xs'} font-black text-primary`}>
                    {value}
                  </span>
                  <span className={`${isMain ? 'text-xs md:text-sm' : 'text-[6px]'} text-muted-foreground text-center mt-1`}>{label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    // ===== TIMELINE LAYOUT =====
    if (slide.layout === 'timeline') {
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2`}>
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1 md:p-2 rounded-lg`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white`}>{slide.title}</h3>
          </div>
          
          {/* Timeline */}
          <div className="flex-1 flex items-center p-2 md:p-6">
            <div className="w-full relative">
              {/* Timeline line */}
              <div className={`absolute top-1/2 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r ${gradientClass} -translate-y-1/2 rounded-full`} />
              
              <div className="flex justify-between relative">
                {slide.content?.slice(0, 5).map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="flex flex-col items-center"
                    initial={isMain ? { opacity: 0, y: 20 } : false}
                    animate={isMain ? { opacity: 1, y: 0 } : false}
                    transition={{ delay: i * 0.15 }}
                  >
                    {/* Glow effect */}
                    <div className={`${isMain ? 'w-8 h-8 md:w-12 md:h-12' : 'w-4 h-4'} rounded-full bg-primary/20 absolute blur-md`} />
                    {/* Circle with number */}
                    <div className={`${isMain ? 'w-6 h-6 md:w-10 md:h-10' : 'w-3 h-3'} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white ${isMain ? 'text-xs md:text-base' : 'text-[6px]'} font-bold shadow-lg relative z-10`}>
                      {i + 1}
                    </div>
                    {/* Label card */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-1 md:p-2 mt-1 md:mt-3 max-w-16 md:max-w-24 border border-primary/10">
                      <span className={`${isMain ? 'text-[10px] md:text-xs' : 'text-[5px]'} text-center block text-foreground`}>{item}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ===== COMPARISON / TWO-COLUMN LAYOUT =====
    if (slide.layout === 'two-column' || slide.layout === 'comparison') {
      const half = Math.ceil((slide.content?.length || 0) / 2);
      const leftContent = slide.content?.slice(0, half) || [];
      const rightContent = slide.content?.slice(half) || [];
      
      return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2`}>
            {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1 md:p-2 rounded-lg`}>{slide.icon}</span>}
            <h3 className={`${size} font-bold text-white`}>{slide.title}</h3>
          </div>
          
          {/* Columns */}
          <div className="flex-1 grid grid-cols-2 gap-2 md:gap-4 p-2 md:p-4">
            {/* Left Column */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 md:p-4 border-t-4 border-primary">
              <div className="space-y-1 md:space-y-2">
                {leftContent.map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-start gap-1 md:gap-2"
                    initial={isMain ? { opacity: 0, x: -10 } : false}
                    animate={isMain ? { opacity: 1, x: 0 } : false}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`${isMain ? 'w-1.5 h-1.5 mt-1.5' : 'w-1 h-1 mt-0.5'} rounded-full bg-primary flex-shrink-0`} />
                    <span className={contentSize}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Right Column */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 md:p-4 border-t-4 border-accent">
              <div className="space-y-1 md:space-y-2">
                {rightContent.map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-start gap-1 md:gap-2"
                    initial={isMain ? { opacity: 0, x: 10 } : false}
                    animate={isMain ? { opacity: 1, x: 0 } : false}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`${isMain ? 'w-1.5 h-1.5 mt-1.5' : 'w-1 h-1 mt-0.5'} rounded-full bg-accent flex-shrink-0`} />
                    <span className={contentSize}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ===== DEFAULT CONTENT LAYOUT =====
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradientClass} p-2 md:p-4 flex items-center gap-2`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          {slide.icon && <span className={`${isMain ? 'text-xl' : 'text-xs'} bg-white/20 p-1 md:p-2 rounded-lg relative z-10`}>{slide.icon}</span>}
          <h3 className={`${size} font-bold text-white relative z-10`}>{slide.title}</h3>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-2 md:p-6 space-y-1 md:space-y-3">
          {slide.content?.map((item, i) => (
            <motion.div
              key={i}
              initial={isMain ? { opacity: 0, x: -20 } : false}
              animate={isMain ? { opacity: 1, x: 0 } : false}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-2 md:gap-3 p-1.5 md:p-3 rounded-lg ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800/50'} shadow-sm`}
            >
              <div className={`${isMain ? 'w-2 h-2 mt-1.5' : 'w-1 h-1 mt-0.5'} rounded-full bg-gradient-to-br ${gradientClass} flex-shrink-0`} />
              <span className={`${contentSize} text-foreground`}>{item}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Footer accent */}
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4 md:mb-6">
            <Stars className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI-Powered Presentations</span>
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              PPT Generator
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Create stunning, professional presentations with AI-generated content and images
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
                    <p className="text-muted-foreground text-sm md:text-base">Be detailed for better results</p>
                  </div>
                </div>

                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: Create a pitch deck for a sustainable fashion startup that focuses on recycled materials, targeting Gen-Z consumers. Include market analysis, business model, competitive advantages, and growth strategy..."
                  className="min-h-[180px] md:min-h-[200px] text-base md:text-lg bg-background/50 border-primary/20 focus:border-primary resize-none"
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>AI will generate {slideCount}+ slides with images</span>
                  </div>
                  <Button
                    onClick={() => setStep('customize')}
                    disabled={!prompt.trim()}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
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
              className="max-w-4xl mx-auto"
            >
              <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <motion.div 
                    className="p-3 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Settings2 className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">Customize Your Presentation</h2>
                    <p className="text-muted-foreground text-sm md:text-base">Choose style or let AI decide</p>
                  </div>
                </div>

                {/* AI Choose Option */}
                <motion.div
                  className={`p-4 md:p-6 rounded-xl border-2 cursor-pointer mb-6 md:mb-8 transition-all ${
                    aiChoose ? 'border-primary bg-gradient-to-br from-primary/10 to-accent/10' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setAiChoose(!aiChoose)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className={`p-3 md:p-4 rounded-xl ${aiChoose ? 'bg-gradient-to-br from-primary to-accent' : 'bg-muted'}`}
                      animate={aiChoose ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Wand2 className={`w-6 h-6 md:w-8 md:h-8 ${aiChoose ? 'text-white' : 'text-muted-foreground'}`} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-semibold flex flex-wrap items-center gap-2">
                        Let AI Choose
                        <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                          ✨ Recommended
                        </Badge>
                      </h3>
                      <p className="text-muted-foreground text-sm md:text-base">AI analyzes your topic and picks perfect style & colors</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      aiChoose ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {aiChoose && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </motion.div>

                {!aiChoose && (
                  <>
                    {/* Style Selection */}
                    <div className="mb-6 md:mb-8">
                      <Label className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-primary" />
                        Presentation Style
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
                        {styleOptions.map((style) => (
                          <motion.div
                            key={style.id}
                            className={`p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedStyle === style.id 
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedStyle(style.id)}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={`text-2xl md:text-3xl mb-2 p-2 rounded-lg bg-gradient-to-br ${style.gradient} w-fit`}>
                              {style.icon}
                            </div>
                            <h4 className="font-semibold text-sm md:text-base">{style.name}</h4>
                            <p className="text-xs md:text-sm text-muted-foreground">{style.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Color Scheme */}
                    <div className="mb-6 md:mb-8">
                      <Label className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Color Scheme
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
                        {colorSchemes.map((scheme) => (
                          <motion.div
                            key={scheme.id}
                            className={`p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedColor === scheme.id 
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedColor(scheme.id)}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={`h-8 md:h-10 rounded-lg bg-gradient-to-r ${scheme.gradient} mb-2 md:mb-3`} />
                            <div className="flex gap-1 mb-2">
                              {scheme.colors.map((color, i) => (
                                <div
                                  key={i}
                                  className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-border/50"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <h4 className="font-semibold text-sm md:text-base">{scheme.name}</h4>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Options */}
                <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-sm md:text-base">
                      <Layers className="w-4 h-4" />
                      Slide Count
                    </Label>
                    <Input
                      type="number"
                      value={slideCount}
                      onChange={(e) => setSlideCount(Math.max(3, Math.min(20, parseInt(e.target.value) || 8)))}
                      min={3}
                      max={20}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label className="flex items-center gap-2 mb-2 text-sm md:text-base">
                      <Image className="w-4 h-4" />
                      Include Images
                    </Label>
                    <div className="flex items-center gap-3 h-10">
                      <Switch checked={includeImages} onCheckedChange={setIncludeImages} />
                      <span className="text-sm text-muted-foreground">{includeImages ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label className="flex items-center gap-2 mb-2 text-sm md:text-base">
                      <ImagePlus className="w-4 h-4" />
                      AI Generate Images
                    </Label>
                    <div className="flex items-center gap-3 h-10">
                      <Switch 
                        checked={generateAIImages} 
                        onCheckedChange={setGenerateAIImages}
                        disabled={!includeImages}
                      />
                      <span className="text-sm text-muted-foreground">{generateAIImages ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <Button variant="outline" onClick={() => setStep('prompt')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || (!aiChoose && (!selectedStyle || !selectedColor))}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {generationProgress || 'Generating...'}
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Generate Presentation
                      </>
                    )}
                  </Button>
                </div>
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
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6 bg-card/80 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-primary/20">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep('customize')}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAddSlide}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleGenerate()}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Regenerate
                  </Button>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <Button 
                      variant={previewMode === 'slide' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setPreviewMode('slide')}
                      className="rounded-none"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={previewMode === 'grid' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setPreviewMode('grid')}
                      className="rounded-none"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleDownload}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30"
                >
                  <Download className="w-4 h-4" />
                  Download PPTX
                </Button>
              </div>

              {previewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {slides.map((slide, index) => (
                    <motion.div
                      key={index}
                      className={`aspect-video rounded-lg cursor-pointer overflow-hidden border-2 transition-all ${
                        currentSlide === index ? 'border-primary shadow-lg shadow-primary/30' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => { setCurrentSlide(index); setPreviewMode('slide'); }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="w-full h-full bg-card relative overflow-hidden">
                        {renderSlidePreview(slide, false)}
                        <div className="absolute bottom-1 right-1 bg-background/80 px-1.5 py-0.5 rounded text-xs font-medium">
                          {slide.slideNumber}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Slide View
                <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
                  {/* Slide Thumbnails */}
                  <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pb-2 lg:pb-0 lg:pr-2">
                    {slides.map((slide, index) => (
                      <motion.div
                        key={index}
                        className={`flex-shrink-0 w-32 lg:w-full p-2 rounded-lg cursor-pointer transition-all border-2 ${
                          currentSlide === index 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-border hover:border-primary/50 bg-card'
                        }`}
                        onClick={() => setCurrentSlide(index)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="aspect-video rounded overflow-hidden bg-muted mb-2 relative">
                          <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%]">
                            {renderSlidePreview(slide, false)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground truncate">
                            {slide.slideNumber}. {slide.title.substring(0, 15)}...
                          </span>
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => { e.stopPropagation(); handleEditSlide(slide); }}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(index); }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleDeleteSlide(index); }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Main Slide Preview */}
                  <div className="lg:col-span-4">
                    <Card className="aspect-video bg-card relative overflow-hidden shadow-2xl border-primary/20">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSlide}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          className="absolute inset-0"
                        >
                          {renderSlidePreview(slides[currentSlide], true)}
                        </motion.div>
                      </AnimatePresence>
                    </Card>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === currentSlide ? 'bg-primary w-6' : 'bg-muted hover:bg-primary/50'
                            }`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                        disabled={currentSlide === slides.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Speaker Notes */}
                    {slides[currentSlide]?.notes && (
                      <Card className="mt-4 p-4 bg-muted/50 border-primary/10">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Type className="w-4 h-4 text-primary" />
                          Speaker Notes
                        </h4>
                        <p className="text-sm text-muted-foreground">{slides[currentSlide]?.notes}</p>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Edit Slide */}
          {step === 'edit' && editingSlide && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">Edit Slide {editingSlide.slideNumber}</h2>
                      <p className="text-muted-foreground text-sm">Customize content and layout</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingSlide(null); setStep('preview'); }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Edit Form */}
                  <div className="space-y-4">
                    <div>
                      <Label>Layout</Label>
                      <Select
                        value={editingSlide.layout}
                        onValueChange={(value: Slide['layout']) => setEditingSlide({ ...editingSlide, layout: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {layoutOptions.map((layout) => (
                            <SelectItem key={layout.id} value={layout.id}>
                              <div className="flex items-center gap-2">
                                <layout.icon className="w-4 h-4" />
                                {layout.name}
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
                        className="mt-2"
                        placeholder="📌"
                      />
                    </div>

                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editingSlide.title}
                        onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Subtitle (optional)</Label>
                      <Input
                        value={editingSlide.subtitle || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Content (one item per line)</Label>
                      <Textarea
                        value={editingSlide.content.join('\n')}
                        onChange={(e) => setEditingSlide({ 
                          ...editingSlide, 
                          content: e.target.value.split('\n').filter(Boolean) 
                        })}
                        className="mt-2 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label>Speaker Notes</Label>
                      <Textarea
                        value={editingSlide.notes || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, notes: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div>
                    <Label className="mb-2 block">Live Preview</Label>
                    <Card className="aspect-video bg-card relative overflow-hidden border-primary/20">
                      {renderSlidePreview(editingSlide, true)}
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => { setEditingSlide(null); setStep('preview'); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="gap-2 bg-gradient-to-r from-primary to-accent">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
