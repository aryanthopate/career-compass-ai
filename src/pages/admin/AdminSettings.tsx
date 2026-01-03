import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Save, 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Palette,
  Code,
  Zap,
  Lock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/AuthContext';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  contactEmail: string;
  allowSignups: boolean;
  requireEmailVerification: boolean;
  maxResumeVersions: number;
  enableAIFeatures: boolean;
  enableInterviews: boolean;
  enableCareerVerdict: boolean;
  analyticsEnabled: boolean;
  debugMode: boolean;
  rateLimitPerMinute: number;
  sessionTimeout: number;
  primaryColor: string;
  accentColor: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Career Reality Engine',
    siteDescription: 'AI-powered career intelligence platform',
    maintenanceMode: false,
    contactEmail: '',
    allowSignups: true,
    requireEmailVerification: false,
    maxResumeVersions: 10,
    enableAIFeatures: true,
    enableInterviews: true,
    enableCareerVerdict: true,
    analyticsEnabled: true,
    debugMode: false,
    rateLimitPerMinute: 60,
    sessionTimeout: 30,
    primaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) {
        console.error('Error fetching settings:', error);
      } else if (data) {
        const settingsMap: Record<string, any> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        
        setSettings(prev => ({
          ...prev,
          siteName: settingsMap.siteName?.value || prev.siteName,
          siteDescription: settingsMap.siteDescription?.value || prev.siteDescription,
          maintenanceMode: settingsMap.maintenanceMode?.value || false,
          contactEmail: settingsMap.contactEmail?.value || '',
          allowSignups: settingsMap.allowSignups?.value ?? true,
          requireEmailVerification: settingsMap.requireEmailVerification?.value ?? false,
          maxResumeVersions: settingsMap.maxResumeVersions?.value || 10,
          enableAIFeatures: settingsMap.enableAIFeatures?.value ?? true,
          enableInterviews: settingsMap.enableInterviews?.value ?? true,
          enableCareerVerdict: settingsMap.enableCareerVerdict?.value ?? true,
          analyticsEnabled: settingsMap.analyticsEnabled?.value ?? true,
          debugMode: settingsMap.debugMode?.value ?? false,
          rateLimitPerMinute: settingsMap.rateLimitPerMinute?.value || 60,
          sessionTimeout: settingsMap.sessionTimeout?.value || 30,
        }));
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);

    const settingsToSave = Object.entries(settings).map(([key, val]) => ({
      key,
      value: { value: val },
    }));

    for (const setting of settingsToSave) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { 
            key: setting.key, 
            value: setting.value,
            updated_by: user?.id 
          },
          { onConflict: 'key' }
        );

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    }

    toast({ title: 'Settings Saved', description: 'All settings have been updated successfully.' });
    setSaving(false);
  };

  const SettingToggle = ({ 
    id, 
    label, 
    description, 
    checked, 
    onChange,
    icon: Icon,
    disabled = false,
  }: { 
    id: string; 
    label: string; 
    description: string; 
    checked: boolean; 
    onChange: (v: boolean) => void;
    icon: any;
    disabled?: boolean;
  }) => (
    <div className="flex items-start justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <Label htmlFor={id} className="font-medium cursor-pointer">{label}</Label>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure all platform-wide settings and features</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} size="lg" className="shadow-md">
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save All Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/50 p-1 grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notify</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Site Information
              </CardTitle>
              <CardDescription>Basic site configuration and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    placeholder="Career Reality Engine"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Support Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="support@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  placeholder="Describe your platform..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding
              </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      placeholder="#06b6d4"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingToggle
                id="enableAIFeatures"
                label="AI Features"
                description="Enable AI-powered resume improvements and suggestions"
                checked={settings.enableAIFeatures}
                onChange={(v) => setSettings({ ...settings, enableAIFeatures: v })}
                icon={Zap}
              />
              <SettingToggle
                id="enableInterviews"
                label="Mock Interviews"
                description="Allow users to practice interviews with AI"
                checked={settings.enableInterviews}
                onChange={(v) => setSettings({ ...settings, enableInterviews: v })}
                icon={Users}
              />
              <SettingToggle
                id="enableCareerVerdict"
                label="Career Verdict"
                description="Enable career readiness assessment feature"
                checked={settings.enableCareerVerdict}
                onChange={(v) => setSettings({ ...settings, enableCareerVerdict: v })}
                icon={CheckCircle2}
              />
              <SettingToggle
                id="analyticsEnabled"
                label="Analytics"
                description="Collect anonymous usage analytics"
                checked={settings.analyticsEnabled}
                onChange={(v) => setSettings({ ...settings, analyticsEnabled: v })}
                icon={Database}
              />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content Limits
              </CardTitle>
              <CardDescription>Configure content and storage limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="maxResumeVersions">Max Resume Versions per User</Label>
                <Input
                  id="maxResumeVersions"
                  type="number"
                  min={1}
                  max={50}
                  value={settings.maxResumeVersions}
                  onChange={(e) => setSettings({ ...settings, maxResumeVersions: parseInt(e.target.value) || 10 })}
                />
                <p className="text-xs text-muted-foreground">Users can store up to this many resume versions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Authentication
              </CardTitle>
              <CardDescription>Configure user authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingToggle
                id="allowSignups"
                label="Allow New Signups"
                description="Allow new users to register on the platform"
                checked={settings.allowSignups}
                onChange={(v) => setSettings({ ...settings, allowSignups: v })}
                icon={Users}
              />
              <SettingToggle
                id="requireEmailVerification"
                label="Require Email Verification"
                description="Users must verify their email before accessing features"
                checked={settings.requireEmailVerification}
                onChange={(v) => setSettings({ ...settings, requireEmailVerification: v })}
                icon={Mail}
              />
              <div className="p-4 rounded-xl bg-secondary/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <p className="text-sm text-muted-foreground mb-2">Auto-logout users after inactivity</p>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min={5}
                      max={1440}
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
                      className="max-w-32"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                System Mode
              </CardTitle>
              <CardDescription>Critical system settings - use with caution</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingToggle
                id="maintenanceMode"
                label="Maintenance Mode"
                description="Temporarily disable the site for all non-admin users"
                checked={settings.maintenanceMode}
                onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                icon={AlertTriangle}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure email notifications and templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Email configuration coming soon</p>
                <p className="text-sm mt-1">Configure SMTP settings and email templates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Developer Settings
              </CardTitle>
              <CardDescription>Advanced settings for developers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingToggle
                id="debugMode"
                label="Debug Mode"
                description="Enable verbose logging and debug information"
                checked={settings.debugMode}
                onChange={(v) => setSettings({ ...settings, debugMode: v })}
                icon={Code}
              />
              <div className="p-4 rounded-xl bg-secondary/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="rateLimitPerMinute">API Rate Limit (requests/min)</Label>
                    <p className="text-sm text-muted-foreground mb-2">Maximum API requests per user per minute</p>
                    <Input
                      id="rateLimitPerMinute"
                      type="number"
                      min={10}
                      max={1000}
                      value={settings.rateLimitPerMinute}
                      onChange={(e) => setSettings({ ...settings, rateLimitPerMinute: parseInt(e.target.value) || 60 })}
                      className="max-w-32"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <span className="text-muted-foreground">Platform Version</span>
                  <p className="font-mono font-medium">v1.0.0</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <span className="text-muted-foreground">Environment</span>
                  <p className="font-mono font-medium">Production</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <span className="text-muted-foreground">Database</span>
                  <p className="font-mono font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-score-good" />
                    Connected
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <span className="text-muted-foreground">AI Service</span>
                  <p className="font-mono font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-score-good" />
                    Operational
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
