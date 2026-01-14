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
} from 'lucide-react';

const languages = [
  { value: 'python', label: 'Python', icon: Hash, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { value: 'javascript', label: 'JavaScript', icon: Braces, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { value: 'typescript', label: 'TypeScript', icon: FileJson, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { value: 'java', label: 'Java', icon: Coffee, color: 'text-red-500', bg: 'bg-red-500/10' },
  { value: 'cpp', label: 'C++', icon: Code2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { value: 'c', label: 'C', icon: Terminal, color: 'text-gray-500', bg: 'bg-gray-500/10' },
  { value: 'csharp', label: 'C#', icon: CircleDot, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { value: 'ruby', label: 'Ruby', icon: Gem, color: 'text-red-400', bg: 'bg-red-400/10' },
  { value: 'go', label: 'Go', icon: Zap, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { value: 'rust', label: 'Rust', icon: FileCode, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { value: 'php', label: 'PHP', icon: Code2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { value: 'swift', label: 'Swift', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { value: 'kotlin', label: 'Kotlin', icon: Code2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
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
    await navigator.clipboard.writeText(outputCode);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputCode('');
    setOutputCode('');
    setDetectedLanguage(null);
    setTargetLanguage('');
  };

  const getLanguageInfo = (lang: string) => {
    return languages.find(l => l.value === lang) || languages[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
        </div>

        <div className="container px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Code Translation
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent">
                Code Shift
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert your code between programming languages while preserving the algorithm logic.
              Perfect for engineering students learning multiple languages.
            </p>
          </motion.div>

          {/* Main Converter Grid */}
          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-primary" />
                        Input Code
                      </CardTitle>
                      <CardDescription>Paste your code here</CardDescription>
                    </div>
                    <AnimatePresence mode="wait">
                      {detectedLanguage && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Badge variant="secondary" className={`${getLanguageInfo(detectedLanguage).bg} ${getLanguageInfo(detectedLanguage).color} border-0`}>
                            Detected: {getLanguageInfo(detectedLanguage).label}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`// Paste your code here...\n// Example:\nprint("Hello World")\nfor i in range(10):\n    print(i)`}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="min-h-[300px] font-mono text-sm bg-background/50 resize-none"
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={detectLanguage}
                      disabled={isDetecting || !inputCode.trim()}
                      variant="outline"
                      className="flex-1"
                    >
                      {isDetecting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Detect Language
                    </Button>
                    <Button
                      onClick={clearAll}
                      variant="ghost"
                      size="icon"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Output Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-emerald-500" />
                        Output Code
                      </CardTitle>
                      <CardDescription>Converted code will appear here</CardDescription>
                    </div>
                    {outputCode && (
                      <Button
                        onClick={copyToClipboard}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="// Converted code will appear here..."
                      value={outputCode}
                      readOnly
                      className="min-h-[300px] font-mono text-sm bg-background/50 resize-none"
                    />
                    {isConverting && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Converting code...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => {
                          const Icon = lang.icon;
                          return (
                            <SelectItem 
                              key={lang.value} 
                              value={lang.value}
                              disabled={lang.value === detectedLanguage}
                            >
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
                      onClick={convertCode}
                      disabled={isConverting || !inputCode.trim() || !targetLanguage}
                      className="gap-2 px-6 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Convert
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Supported Languages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">Supported Languages</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {languages.map((lang) => {
                const Icon = lang.icon;
                return (
                  <Badge 
                    key={lang.value}
                    variant="outline" 
                    className={`gap-1.5 px-3 py-1.5 ${lang.bg} border-0`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${lang.color}`} />
                    <span className={lang.color}>{lang.label}</span>
                  </Badge>
                );
              })}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Zap,
                title: "Smart Detection",
                description: "AI automatically detects the programming language of your code",
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
              },
              {
                icon: Code2,
                title: "Algorithm Preserved",
                description: "Logic and functionality remain intact during conversion",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Sparkles,
                title: "Clean Output",
                description: "Get properly formatted, working code in your target language",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
            ].map((feature, i) => (
              <Card key={i} className="border-border/50 bg-card/30 backdrop-blur-sm text-center">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
