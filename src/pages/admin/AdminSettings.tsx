import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/AuthContext';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  contactEmail: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Career Reality Engine',
    siteDescription: 'AI-powered career intelligence platform',
    maintenanceMode: false,
    contactEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        
        setSettings({
          siteName: settingsMap.siteName?.value || 'Career Reality Engine',
          siteDescription: settingsMap.siteDescription?.value || 'AI-powered career intelligence platform',
          maintenanceMode: settingsMap.maintenanceMode?.value || false,
          contactEmail: settingsMap.contactEmail?.value || '',
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);

    const settingsToSave = [
      { key: 'siteName', value: { value: settings.siteName } },
      { key: 'siteDescription', value: { value: settings.siteDescription } },
      { key: 'maintenanceMode', value: { value: settings.maintenanceMode } },
      { key: 'contactEmail', value: { value: settings.contactEmail } },
    ];

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

    toast({ title: 'Success', description: 'Settings saved successfully' });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="support@example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Advanced system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable the site for maintenance
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
