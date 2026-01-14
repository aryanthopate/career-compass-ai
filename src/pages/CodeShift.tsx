import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowRight,
  Code2,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Zap,
  RefreshCw,
  FileCode,
  Terminal,
  Braces,
  Hash,
  Coffee,
  Gem,
  CircleDot,
  FileJson,
  ArrowRightLeft,
  Cpu,
  Shield,
  Clock,
  Wand2,
} from 'lucide-react';

const languages = [
  { value: 'python', label: 'Python', icon: Hash, color: 'text-yellow-500', bg: 'bg-yellow-500/10', gradient: 'from-yellow-500 to-orange-500' },
  { value: 'javascript', label: 'JavaScript', icon: Braces, color: 'text-yellow-400', bg: 'bg-yellow-400/10', gradient: 'from-yellow-400 to-amber-500' },
  { value: 'typescript', label: 'TypeScript', icon: FileJson, color: 'text-blue-500', bg: 'bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500' },
  { value: 'java', label: 'Java', icon: Coffee, color: 'text-red-500', bg: 'bg-red-500/10', gradient: 'from-red-500 to-orange-500' },
  { value: 'cpp', label: 'C++', icon: Code2, color: 'text-blue-400', bg: 'bg-blue-400/10', gradient: 'from-blue-400 to-indigo-500' },
  { value: 'c', label: 'C', icon: Terminal, color: 'text-gray-500', bg: 'bg-gray-500/10', gradient: 'from-gray-500 to-slate-500' },
  { value: 'csharp', label: 'C#', icon: CircleDot, color: 'text-purple-500', bg: 'bg-purple-500/10', gradient: 'from-purple-500 to-violet-500' },
  { value: 'ruby', label: 'Ruby', icon: Gem, color: 'text-red-400', bg: 'bg-red-400/10', gradient: 'from-red-400 to-rose-500' },
  { value: 'go', label: 'Go', icon: Zap, color: 'text-cyan-500', bg: 'bg-cyan-500/10', gradient: 'from-cyan-500 to-teal-500' },
  { value: 'rust', label: 'Rust', icon: FileCode, color: 'text-orange-500', bg: 'bg-orange-500/10', gradient: 'from-orange-500 to-amber-600' },
  { value: 'php', label: 'PHP', icon: Code2, color: 'text-indigo-400', bg: 'bg-indigo-400/10', gradient: 'from-indigo-400 to-purple-500' },
  { value: 'swift', label: 'Swift', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-400/10', gradient: 'from-orange-400 to-red-500' },
  { value: 'kotlin', label: 'Kotlin', icon: Code2, color: 'text-violet-500', bg: 'bg-violet-500/10', gradient: 'from-violet-500 to-purple-600' },
];

export default function CodeShift() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const detectLanguage = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "No code provided",
        description: "Please paste some code to detect its language.",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('code-shift', {
        body: { action: 'detect', code: inputCode }
      });

      if (error) throw error;
      
      setDetectedLanguage(data.language);
      toast({
        title: "Language Detected!",
        description: `Detected: ${data.language}`,
      });
    } catch (err) {
      console.error('Detection error:', err);
      toast({
        title: "Detection failed",
        description: "Could not detect the programming language.",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const convertCode = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "No code provided",
        description: "Please paste some code to convert.",
        variant: "destructive",
      });
      return;
    }

    if (!targetLanguage) {
      toast({
        title: "Select target language",
        description: "Please select a language to convert to.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setOutputCode('');
    
    try {
      const { data, error } = await supabase.functions.invoke('code-shift', {
        body: { 
          action: 'convert', 
          code: inputCode,
          sourceLanguage: detectedLanguage,
          targetLanguage: targetLanguage
        }
      });

      if (error) throw error;
      
      setOutputCode(data.convertedCode);
      toast({
        title: "Conversion Complete!",
        description: `Successfully converted to ${targetLanguage}`,
      });
    } catch (err) {
      console.error('Conversion error:', err);
      toast({
        title: "Conversion failed",
        description: "Could not convert the code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!outputCode) return;
    await navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard.",
    });
  };

  const clearAll = () => {
    setInputCode('');
    setOutputCode('');
    setDetectedLanguage(null);
    setTargetLanguage('');
  };

  const getLanguageInfo = (langValue: string) => {
    return languages.find(l => l.value === langValue || l.label.toLowerCase() === langValue?.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Enhanced animated background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-[5%] w-80 h-80 bg-gradient-to-br from-primary/25 to-violet-500/20 rounded-full blur-3xl parallax-slow" />
            <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/15 rounded-full blur-3xl parallax-medium" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-radial from-cyan-500/10 via-primary/5 to-transparent rounded-full parallax-fast" />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>

          <div className="container px-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge className="mb-6 px-5 py-2 bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary border-primary/30 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  AI-Powered Code Translation
                </Badge>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent animate-text-reveal">
                  Code Shift
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Transform your code between programming languages while preserving the algorithm logic.
                <br className="hidden md:block" />
                <span className="text-primary/80 font-medium">Perfect for engineering students mastering multiple languages.</span>
              </p>

              {/* Feature pills */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-3 mt-8"
              >
                {[
                  { icon: Cpu, label: 'Smart Detection' },
                  { icon: Shield, label: 'Logic Preserved' },
                  { icon: Clock, label: 'Instant Results' },
                  { icon: Wand2, label: 'AI Optimized' },
                ].map((feature, i) => (
                  <div key={feature.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm">
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Converter Section */}
            <div className="grid lg:grid-cols-2 gap-6 relative">
              {/* Center Arrow */}
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-2xl shadow-primary/30"
                  animate={{ 
                    scale: isConverting ? [1, 1.1, 1] : 1,
                    rotate: isConverting ? 360 : 0 
                  }}
                  transition={{ 
                    duration: isConverting ? 1 : 0.3,
                    repeat: isConverting ? Infinity : 0,
                    ease: "linear"
                  }}
                >
                  <ArrowRightLeft className="w-7 h-7 text-white" />
                </motion.div>
              </div>

              {/* Input Panel */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-primary/5 h-full overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Code2 className="w-4 h-4 text-primary" />
                          </div>
                          Source Code
                        </CardTitle>
                        <CardDescription className="mt-1">Paste your code below</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <AnimatePresence>
                          {detectedLanguage && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              {(() => {
                                const langInfo = getLanguageInfo(detectedLanguage);
                                const Icon = langInfo?.icon || Code2;
                                return (
                                  <Badge className={`${langInfo?.bg || 'bg-primary/10'} ${langInfo?.color || 'text-primary'} border-0 gap-1.5 px-3 py-1.5`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {langInfo?.label || detectedLanguage}
                                  </Badge>
                                );
                              })()}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={detectLanguage}
                          disabled={isDetecting || !inputCode.trim()}
                          className="gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all"
                        >
                          {isDetecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          {isDetecting ? 'Detecting...' : 'Detect'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Textarea 
                      placeholder="// Paste your code here...&#10;&#10;function example() {&#10;  console.log('Hello World');&#10;}"
                      className="min-h-[350px] font-mono text-sm bg-secondary/30 border-border/50 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Output Panel */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-violet-500/5 h-full overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-violet-500/5 to-transparent border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <FileCode className="w-4 h-4 text-violet-500" />
                          </div>
                          Converted Code
                        </CardTitle>
                        <CardDescription className="mt-1">Your translated code appears here</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                          <SelectTrigger className="w-[160px] bg-secondary/50 border-border/50">
                            <SelectValue placeholder="Target language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => {
                              const Icon = lang.icon;
                              return (
                                <SelectItem key={lang.value} value={lang.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${lang.color}`} />
                                    {lang.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={copyToClipboard}
                          disabled={!outputCode}
                          className="hover:bg-primary/10 hover:border-primary/50 transition-all"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 relative">
                    <Textarea 
                      placeholder="// Converted code will appear here..."
                      className="min-h-[350px] font-mono text-sm bg-secondary/30 border-border/50 resize-none"
                      value={outputCode}
                      readOnly
                    />
                    
                    {/* Converting overlay */}
                    <AnimatePresence>
                      {isConverting && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-4 bg-background/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-4"
                        >
                          <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center animate-pulse">
                              <RefreshCw className="w-10 h-10 text-white animate-spin" />
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-violet-500 blur-xl opacity-50 animate-pulse" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">Converting code...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-4 mt-8"
            >
              <Button 
                size="lg"
                onClick={convertCode}
                disabled={isConverting || !inputCode.trim() || !targetLanguage}
                className="gap-3 px-8 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Convert Code
                  </>
                )}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={clearAll}
                className="gap-2 px-6 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Languages Section */}
        <section className="py-16 border-t border-border/50 bg-gradient-to-b from-transparent to-secondary/30">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Supported Languages</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Convert between 13+ popular programming languages with high accuracy
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
            >
              {languages.map((lang, index) => {
                const Icon = lang.icon;
                return (
                  <motion.div
                    key={lang.value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl ${lang.bg} border border-transparent hover:border-current/20 cursor-default transition-all shadow-sm hover:shadow-md`}
                  >
                    <Icon className={`w-5 h-5 ${lang.color}`} />
                    <span className={`font-medium ${lang.color}`}>{lang.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
