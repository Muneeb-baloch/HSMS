"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  usePrivacySettings,
  useUpdatePrivacySettings,
} from "@/lib/hooks/entities/usePrivacy";
import { UpdatePrivacySettingsDto } from "@/lib/types/privacy";
import { Loader2, Shield, Bell, Database, Trophy } from "lucide-react";

export function PrivacyDashboard() {
  const { data: settings, isLoading, isError } = usePrivacySettings();
  const updateMutation = useUpdatePrivacySettings();
  const [savingField, setSavingField] = useState<string | null>(null);

  const handleToggle = (field: string, value: boolean) => {
    setSavingField(field);
    const update: UpdatePrivacySettingsDto = { [field]: value };
    updateMutation.mutate(update, {
      onSettled: () => setSavingField(null),
    });
  };

  const handleNotificationToggle = (field: string, value: boolean) => {
    if (!settings) return;
    setSavingField(`notificationPreferences.${field}`);
    const update: UpdatePrivacySettingsDto = {
      notificationPreferences: {
        ...settings.notificationPreferences,
        [field]: value,
      },
    };
    updateMutation.mutate(update, {
      onSettled: () => setSavingField(null),
    });
  };

  const handleQuietHoursChange = (
    field: "quietHoursStart" | "quietHoursEnd",
    value: string
  ) => {
    if (!settings) return;
    setSavingField(`notificationPreferences.${field}`);
    const update: UpdatePrivacySettingsDto = {
      notificationPreferences: {
        ...settings.notificationPreferences,
        [field]: value || null,
      },
    };
    updateMutation.mutate(update, {
      onSettled: () => setSavingField(null),
    });
  };

  const handleProfileVisibilityChange = (
    value: "everyone" | "committee-only" | "hidden"
  ) => {
    setSavingField("profileVisibility");
    updateMutation.mutate(
      { profileVisibility: value },
      {
        onSettled: () => setSavingField(null),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          Failed to load privacy settings. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Profile Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Profile Visibility</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Control who can see your profile information
              </p>
            </div>
            <div className="flex items-center gap-2">
              {savingField === "profileVisibility" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Select
                value={settings.profileVisibility}
                onValueChange={handleProfileVisibilityChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="committee-only">Committee Only</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SettingToggle
            label="Show Email"
            description="Allow others to see your email address"
            checked={settings.showEmail}
            saving={savingField === "showEmail"}
            onCheckedChange={(v) => handleToggle("showEmail", v)}
          />

          <SettingToggle
            label="Show Phone"
            description="Allow others to see your phone number"
            checked={settings.showPhone}
            saving={savingField === "showPhone"}
            onCheckedChange={(v) => handleToggle("showPhone", v)}
          />

          <SettingToggle
            label="Show Address"
            description="Allow others to see your address"
            checked={settings.showAddress}
            saving={savingField === "showAddress"}
            onCheckedChange={(v) => handleToggle("showAddress", v)}
          />

          <SettingToggle
            label="Directory Opt-Out"
            description="Remove yourself from the member directory"
            checked={settings.directoryOptOut}
            saving={savingField === "directoryOptOut"}
            onCheckedChange={(v) => handleToggle("directoryOptOut", v)}
          />
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingToggle
              label="Email Notifications"
              description="Receive notifications via email"
              checked={settings.notificationPreferences.email}
              saving={savingField === "notificationPreferences.email"}
              onCheckedChange={(v) => handleNotificationToggle("email", v)}
            />

            <SettingToggle
              label="Push Notifications"
              description="Receive push notifications"
              checked={settings.notificationPreferences.push}
              saving={savingField === "notificationPreferences.push"}
              onCheckedChange={(v) => handleNotificationToggle("push", v)}
            />

            <SettingToggle
              label="SMS Notifications"
              description="Receive notifications via SMS"
              checked={settings.notificationPreferences.sms}
              saving={savingField === "notificationPreferences.sms"}
              onCheckedChange={(v) => handleNotificationToggle("sms", v)}
            />

            <SettingToggle
              label="Digest Notifications"
              description="Receive a daily digest summary"
              checked={settings.notificationPreferences.digest}
              saving={savingField === "notificationPreferences.digest"}
              onCheckedChange={(v) => handleNotificationToggle("digest", v)}
            />
          </div>

          <div className="border-t pt-4">
            <Label className="text-sm font-medium">Quiet Hours</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Set a time range during which notifications will be silenced
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Start</Label>
                <Input
                  type="time"
                  className="w-[140px]"
                  value={settings.notificationPreferences.quietHoursStart || ""}
                  onChange={(e) =>
                    handleQuietHoursChange("quietHoursStart", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">End</Label>
                <Input
                  type="time"
                  className="w-[140px]"
                  value={settings.notificationPreferences.quietHoursEnd || ""}
                  onChange={(e) =>
                    handleQuietHoursChange("quietHoursEnd", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data & Consent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingToggle
            label="Third-Party Sharing"
            description="Allow your data to be shared with third-party services"
            checked={settings.thirdPartySharing}
            saving={savingField === "thirdPartySharing"}
            onCheckedChange={(v) => handleToggle("thirdPartySharing", v)}
          />

          <SettingToggle
            label="Data Retention Consent"
            description="Consent to retain your data for analytics and improvement"
            checked={settings.dataRetentionConsent}
            saving={savingField === "dataRetentionConsent"}
            onCheckedChange={(v) => handleToggle("dataRetentionConsent", v)}
          />

          <SettingToggle
            label="Marketing Consent"
            description="Receive marketing and promotional communications"
            checked={settings.marketingConsent}
            saving={savingField === "marketingConsent"}
            onCheckedChange={(v) => handleToggle("marketingConsent", v)}
          />

          <SettingToggle
            label="Allow Anonymous Complaints"
            description="Enable the option to submit complaints anonymously"
            checked={settings.allowAnonymousComplaints}
            saving={savingField === "allowAnonymousComplaints"}
            onCheckedChange={(v) =>
              handleToggle("allowAnonymousComplaints", v)
            }
          />
        </CardContent>
      </Card>

      {/* Gamification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Gamification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SettingToggle
            label="Show on Leaderboard"
            description="Display your name and score on the community leaderboard"
            checked={settings.showOnLeaderboard}
            saving={savingField === "showOnLeaderboard"}
            onCheckedChange={(v) => handleToggle("showOnLeaderboard", v)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  saving,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  saving: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
        <Badge variant={checked ? "success" : "secondary"} className="text-xs">
          {checked ? "On" : "Off"}
        </Badge>
      </div>
    </div>
  );
}
