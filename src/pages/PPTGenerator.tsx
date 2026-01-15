import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Presentation, Sparkles, Wand2, Download, Edit3, ChevronLeft, ChevronRight, 
  Palette, LayoutGrid, Image, Type, Loader2, Check, RefreshCw, Plus, Trash2,
  Zap, Stars, ArrowRight, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  layout: 'title' | 'content' | 'two-column' | 'image-left' | 'image-right' | 'quote' | 'stats';
}

const styleOptions = [
  { id: 'professional', name: 'Professional', icon: '💼', description: 'Clean, corporate style' },
  { id: 'creative', name: 'Creative', icon: '🎨', description: 'Bold, artistic design' },
  { id: 'minimal', name: 'Minimal', icon: '✨', description: 'Simple, elegant look' },
  { id: 'tech', name: 'Tech', icon: '🚀', description: 'Modern, futuristic feel' },
  { id: 'academic', name: 'Academic', icon: '📚', description: 'Scholarly, structured' },
  { id: 'startup', name: 'Startup', icon: '💡', description: 'Pitch deck ready' },
];

const colorSchemes = [
  { id: 'blue', name: 'Ocean Blue', colors: ['#1e3a5f', '#2563eb', '#60a5fa'] },
  { id: 'green', name: 'Forest Green', colors: ['#14532d', '#16a34a', '#4ade80'] },
  { id: 'purple', name: 'Royal Purple', colors: ['#4c1d95', '#8b5cf6', '#c4b5fd'] },
  { id: 'orange', name: 'Sunset Orange', colors: ['#9a3412', '#f97316', '#fdba74'] },
  { id: 'dark', name: 'Dark Mode', colors: ['#0f172a', '#334155', '#64748b'] },
  { id: 'gradient', name: 'Gradient Mix', colors: ['#7c3aed', '#ec4899', '#f59e0b'] },
];

export default function PPTGenerator() {
  const [step, setStep] = useState<'prompt' | 'customize' | 'preview' | 'edit'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [includeImages, setIncludeImages] = useState(true);
  const [aiChoose, setAiChoose] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a presentation topic');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ppt', {
        body: {
          prompt,
          style: aiChoose ? 'AI will choose the best style' : selectedStyle,
          colorScheme: aiChoose ? 'AI will choose optimal colors' : selectedColor,
          slideCount,
          includeImages,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSlides(data.slides);
      setStep('preview');
      toast.success('Presentation generated successfully!');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate presentation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (slides.length === 0) return;

    try {
      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.author = 'HireGenie AI';
      pptx.title = slides[0]?.title || 'AI Generated Presentation';
      pptx.subject = prompt;

      // Color scheme mapping
      const colorMap: Record<string, { primary: string; secondary: string; accent: string; bg: string }> = {
        blue: { primary: '#1e3a5f', secondary: '#2563eb', accent: '#60a5fa', bg: '#f0f9ff' },
        green: { primary: '#14532d', secondary: '#16a34a', accent: '#4ade80', bg: '#f0fdf4' },
        purple: { primary: '#4c1d95', secondary: '#8b5cf6', accent: '#c4b5fd', bg: '#faf5ff' },
        orange: { primary: '#9a3412', secondary: '#f97316', accent: '#fdba74', bg: '#fff7ed' },
        dark: { primary: '#0f172a', secondary: '#334155', accent: '#94a3b8', bg: '#1e293b' },
        gradient: { primary: '#7c3aed', secondary: '#ec4899', accent: '#f59e0b', bg: '#fdf4ff' },
      };

      const colors = colorMap[selectedColor] || colorMap.blue;

      slides.forEach((slide, index) => {
        const pptSlide = pptx.addSlide();
        
        // Set background
        if (index === 0 || slide.layout === 'title') {
          pptSlide.background = { color: colors.primary };
        } else {
          pptSlide.background = { color: 'FFFFFF' };
        }

        // Title slide
        if (index === 0 || slide.layout === 'title') {
          pptSlide.addText(slide.title, {
            x: 0.5,
            y: 2,
            w: 9,
            h: 1.5,
            fontSize: 44,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
          });
          if (slide.subtitle) {
            pptSlide.addText(slide.subtitle, {
              x: 0.5,
              y: 3.5,
              w: 9,
              h: 0.8,
              fontSize: 24,
              color: colors.accent.replace('#', ''),
              align: 'center',
            });
          }
        } else {
          // Content slides
          pptSlide.addText(slide.title, {
            x: 0.5,
            y: 0.3,
            w: 9,
            h: 0.8,
            fontSize: 32,
            bold: true,
            color: colors.primary.replace('#', ''),
          });

          // Add content bullets
          if (slide.content && slide.content.length > 0) {
            const bulletText = slide.content.map(item => ({ text: item, options: { bullet: true } }));
            pptSlide.addText(bulletText, {
              x: 0.5,
              y: 1.3,
              w: 9,
              h: 4,
              fontSize: 18,
              color: '333333',
              valign: 'top',
              lineSpacing: 28,
            });
          }
        }

        // Add slide number
        if (index > 0) {
          pptSlide.addText(`${index + 1}`, {
            x: 9,
            y: 5.2,
            w: 0.5,
            h: 0.3,
            fontSize: 12,
            color: '666666',
            align: 'right',
          });
        }

        // Add notes
        if (slide.notes) {
          pptSlide.addNotes(slide.notes);
        }
      });

      // Save
      const fileName = `${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
      await pptx.writeFile({ fileName });
      toast.success('Presentation downloaded!');
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
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
    toast.success('Slide added!');
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the only slide');
      return;
    }
    setSlides(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, slideNumber: i + 1 })));
    if (currentSlide >= slides.length - 1) {
      setCurrentSlide(Math.max(0, slides.length - 2));
    }
    toast.success('Slide deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Stars className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">AI-Powered Presentations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              PPT Generator
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create stunning presentations in seconds. Just describe your topic and let AI do the magic.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {['prompt', 'customize', 'preview'].map((s, i) => (
              <div key={s} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step === s || ['prompt', 'customize', 'preview'].indexOf(step) > i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {['prompt', 'customize', 'preview'].indexOf(step) > i ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    i + 1
                  )}
                </motion.div>
                {i < 2 && (
                  <div className={`w-16 h-1 mx-2 rounded ${
                    ['prompt', 'customize', 'preview'].indexOf(step) > i ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Prompt */}
          {step === 'prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-8 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Presentation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">What's your presentation about?</h2>
                    <p className="text-muted-foreground">Be as detailed as possible for better results</p>
                  </div>
                </div>

                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: Create a pitch deck for a sustainable fashion startup that focuses on recycled materials, targeting Gen-Z consumers. Include market analysis, business model, and growth strategy..."
                  className="min-h-[200px] text-lg bg-background/50 border-primary/20 focus:border-primary resize-none"
                />

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span>AI will generate {slideCount}+ slides</span>
                  </div>
                  <Button
                    onClick={() => setStep('customize')}
                    disabled={!prompt.trim()}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
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
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="p-8 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-primary">
                    <Settings2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Customize Your Presentation</h2>
                    <p className="text-muted-foreground">Choose your style or let AI decide</p>
                  </div>
                </div>

                {/* AI Choose Option */}
                <motion.div
                  className={`p-6 rounded-xl border-2 cursor-pointer mb-8 transition-all ${
                    aiChoose ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setAiChoose(!aiChoose)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${aiChoose ? 'bg-primary' : 'bg-muted'}`}>
                      <Wand2 className={`w-8 h-8 ${aiChoose ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        Let AI Choose
                        <Badge variant="secondary" className="bg-gradient-to-r from-primary to-accent text-white">
                          Recommended
                        </Badge>
                      </h3>
                      <p className="text-muted-foreground">AI will analyze your topic and choose the perfect style, colors, and layout</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      aiChoose ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {aiChoose && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </motion.div>

                {!aiChoose && (
                  <>
                    {/* Style Selection */}
                    <div className="mb-8">
                      <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-primary" />
                        Presentation Style
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {styleOptions.map((style) => (
                          <motion.div
                            key={style.id}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedStyle === style.id 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedStyle(style.id)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-3xl mb-2">{style.icon}</div>
                            <h4 className="font-semibold">{style.name}</h4>
                            <p className="text-sm text-muted-foreground">{style.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Color Scheme */}
                    <div className="mb-8">
                      <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Color Scheme
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {colorSchemes.map((scheme) => (
                          <motion.div
                            key={scheme.id}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedColor === scheme.id 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedColor(scheme.id)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex gap-1 mb-3">
                              {scheme.colors.map((color, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <h4 className="font-semibold">{scheme.name}</h4>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Type className="w-4 h-4" />
                      Number of Slides
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
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Image className="w-4 h-4" />
                      Image Suggestions
                    </Label>
                    <Button
                      variant={includeImages ? 'default' : 'outline'}
                      onClick={() => setIncludeImages(!includeImages)}
                      className="w-full"
                    >
                      {includeImages ? 'Include Images' : 'Text Only'}
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('prompt')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || (!aiChoose && (!selectedStyle || !selectedColor))}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
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
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-6xl mx-auto"
            >
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setStep('customize')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button variant="outline" onClick={handleAddSlide}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slide
                  </Button>
                  <Button variant="outline" onClick={() => handleGenerate()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <Button
                  onClick={handleDownload}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  <Download className="w-5 h-5" />
                  Download PPTX
                </Button>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                {/* Slide Thumbnails */}
                <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {slides.map((slide, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        currentSlide === index 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Slide {slide.slideNumber}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); handleEditSlide(slide); }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDeleteSlide(index); }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm font-medium truncate">{slide.title}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Main Slide Preview */}
                <div className="lg:col-span-3">
                  <Card className="aspect-[16/9] p-8 bg-gradient-to-br from-card to-muted relative overflow-hidden">
                    {slides[currentSlide]?.layout === 'title' || currentSlide === 0 ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center text-center p-8">
                        <motion.h2
                          key={slides[currentSlide]?.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl md:text-4xl font-bold text-white mb-4"
                        >
                          {slides[currentSlide]?.title}
                        </motion.h2>
                        {slides[currentSlide]?.subtitle && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-white/80"
                          >
                            {slides[currentSlide]?.subtitle}
                          </motion.p>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <motion.h3
                          key={slides[currentSlide]?.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-2xl md:text-3xl font-bold text-primary mb-6"
                        >
                          {slides[currentSlide]?.title}
                        </motion.h3>
                        <ul className="space-y-3 flex-1">
                          {slides[currentSlide]?.content.map((item, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 text-lg"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <div className="text-right text-sm text-muted-foreground">
                          {slides[currentSlide]?.slideNumber} / {slides.length}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Navigation */}
                  <div className="flex justify-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="flex items-center text-muted-foreground">
                      {currentSlide + 1} / {slides.length}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                      disabled={currentSlide === slides.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Speaker Notes */}
                  {slides[currentSlide]?.notes && (
                    <Card className="mt-4 p-4 bg-muted/50">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Speaker Notes
                      </h4>
                      <p className="text-sm text-muted-foreground">{slides[currentSlide]?.notes}</p>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit Slide */}
          {step === 'edit' && editingSlide && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-8 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Edit Slide {editingSlide.slideNumber}</h2>
                    <p className="text-muted-foreground">Customize the content to your needs</p>
                  </div>
                </div>

                <div className="space-y-6">
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
                    <Label>Content (one bullet point per line)</Label>
                    <Textarea
                      value={editingSlide.content.join('\n')}
                      onChange={(e) => setEditingSlide({ 
                        ...editingSlide, 
                        content: e.target.value.split('\n').filter(Boolean) 
                      })}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>

                  <div>
                    <Label>Speaker Notes (optional)</Label>
                    <Textarea
                      value={editingSlide.notes || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, notes: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => { setEditingSlide(null); setStep('preview'); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="gap-2 bg-gradient-to-r from-primary to-accent">
                    <Check className="w-4 h-4" />
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
