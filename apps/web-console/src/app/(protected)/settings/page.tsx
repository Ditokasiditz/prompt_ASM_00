"use client"

import React, { useState, useRef } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Bell, Monitor, Check, Upload, Loader2, User } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { API_BASE, apiFetch } from "@/lib/api"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const { user, updateUser } = useAuth()
  
  // States for interactive demo purposes
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [highSeverityAlerts, setHighSeverityAlerts] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (approx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be strictly under 2MB");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      
      try {
        const response = await apiFetch(`${API_BASE}/api/profile/avatar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatar: base64String })
        });

        if (response.ok) {
          updateUser({ avatar: base64String });
        } else {
          const data = await response.json();
          alert(`Failed to upload avatar: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Upload error', error);
        alert('Failed to connect to server');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-4xl space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your account settings and preferences.
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
              </TabsList>

              {/* PROFILE TAB */}
              <TabsContent value="profile" className="space-y-6 animate-in fade-in duration-300">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>
                      View your profile details and update your avatar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-3xl font-semibold text-primary overflow-hidden relative group">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span>{user?.username?.substring(0, 2).toUpperCase() || "GU"}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <Button 
                             onClick={() => fileInputRef.current?.click()} 
                             variant="outline" 
                             size="sm"
                             disabled={uploading}
                           >
                             {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                             Change Avatar
                           </Button>
                           <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleAvatarChange} 
                              accept="image/png, image/jpeg, image/gif, image/webp" 
                              className="hidden" 
                           />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          JPG, GIF or PNG. Max size of 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mt-2 pt-6 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={user?.username || ""} readOnly className="bg-muted/50 cursor-not-allowed text-muted-foreground focus-visible:ring-0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" value={user?.role || ""} readOnly className="bg-muted/50 capitalize cursor-not-allowed text-muted-foreground focus-visible:ring-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* APPEARANCE TAB */}
              <TabsContent value="appearance" className="space-y-6 animate-in fade-in duration-300">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Preferences</CardTitle>
                    <CardDescription>
                      Customize how EASM looks on your device.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Light Theme Option */}
                      <button
                        onClick={() => setTheme("light")}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-accent focus:outline-none",
                          theme === "light" ? "border-primary bg-primary/5" : "border-muted border"
                        )}
                      >
                        <div className="w-full h-24 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm relative overflow-hidden">
                          <div className="absolute inset-0 flex flex-col p-2 space-y-2">
                            <div className="flex gap-2 w-full h-4">
                              <div className="w-4 h-full bg-slate-200 rounded-sm"></div>
                              <div className="w-full h-full bg-white rounded-sm"></div>
                            </div>
                            <div className="w-full flex-1 bg-white rounded-sm flex items-center justify-center">
                              <Sun className="h-6 w-6 text-orange-500" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          Light 
                          {theme === "light" && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      </button>

                      {/* Dark Theme Option */}
                      <button
                        onClick={() => setTheme("dark")}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-accent focus:outline-none",
                          theme === "dark" || (!theme && typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) 
                            ? "border-primary bg-primary/5" 
                            : "border-muted border"
                        )}
                      >
                        <div className="w-full h-24 rounded-md bg-slate-900 flex items-center justify-center border border-slate-800 shadow-sm relative overflow-hidden">
                          <div className="absolute inset-0 flex flex-col p-2 space-y-2">
                            <div className="flex gap-2 w-full h-4">
                              <div className="w-4 h-full bg-slate-800 rounded-sm"></div>
                              <div className="w-full h-full bg-slate-950 rounded-sm"></div>
                            </div>
                            <div className="w-full flex-1 bg-slate-950 rounded-sm flex items-center justify-center">
                              <Moon className="h-6 w-6 text-slate-300" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          Dark
                          {(theme === "dark" || (!theme && typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))) && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      </button>

                      {/* System Theme Option */}
                      <button
                        onClick={() => setTheme("system")}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-accent focus:outline-none",
                          theme === "system" ? "border-primary bg-primary/5" : "border-muted border"
                        )}
                      >
                        <div className="w-full h-24 rounded-md bg-gradient-to-r from-slate-100 to-slate-900 flex items-center justify-center border shadow-sm relative overflow-hidden">
                           <div className="absolute inset-0 flex flex-col p-2 space-y-2">
                            <div className="flex gap-2 w-full h-4">
                               <div className="w-4 h-full bg-gradient-to-b from-slate-300 to-slate-800 rounded-sm"></div>
                               <div className="w-full h-full bg-gradient-to-r from-white to-slate-950 rounded-sm"></div>
                            </div>
                            <div className="w-full flex-1 bg-gradient-to-r from-white to-slate-950 rounded-sm flex items-center justify-center">
                              <Monitor className="h-6 w-6 text-slate-500 mix-blend-difference" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          System
                          {theme === "system" && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* NOTIFICATIONS TAB */}
              <TabsContent value="notifications" className="space-y-6 animate-in fade-in duration-300">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                      Choose what updates you want to receive via email.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-4">
                      <div className="space-y-1">
                        <Label className="text-base">High Severity Alerts</Label>
                        <p className="text-sm text-muted-foreground whitespace-normal break-words">
                          Immediate email notifications when new critical or high severity vulnerabilities are discovered.
                        </p>
                      </div>
                      <Switch 
                        checked={highSeverityAlerts} 
                        onCheckedChange={setHighSeverityAlerts} 
                      />
                    </div>
                    
                    <div className="block h-[1px] w-full bg-border"></div>

                    <div className="flex items-center justify-between space-x-4">
                      <div className="space-y-1">
                        <Label className="text-base">Weekly Summary Digest</Label>
                        <p className="text-sm text-muted-foreground whitespace-normal break-words">
                          A comprehensive weekly report of your attack surface changes and overall health score.
                        </p>
                      </div>
                      <Switch 
                        checked={weeklyDigest} 
                        onCheckedChange={setWeeklyDigest} 
                      />
                    </div>

                    <div className="block h-[1px] w-full bg-border"></div>

                    <div className="flex items-center justify-between space-x-4">
                      <div className="space-y-1">
                        <Label className="text-base">Product Updates</Label>
                        <p className="text-sm text-muted-foreground whitespace-normal break-words">
                          Receive emails about new EASM features and platform maintenance.
                        </p>
                      </div>
                      <Switch 
                        checked={emailAlerts} 
                        onCheckedChange={setEmailAlerts} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
      </div>
    </main>
  )
}
