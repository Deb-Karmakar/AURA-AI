"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<string>("google");
  const [apiKey, setApiKey] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load existing settings
    const savedProvider = localStorage.getItem("ai_interviewer_provider");
    const savedKey = localStorage.getItem("ai_interviewer_api_key");
    if (savedProvider) setProvider(savedProvider);
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem("ai_interviewer_provider", provider);
    localStorage.setItem("ai_interviewer_api_key", apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">API Settings</h1>
          <p className="text-muted-foreground">
            Configure your own LLM API key for the AI Interviewer.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Select AI Provider</Label>
            <RadioGroup value={provider} onValueChange={setProvider} className="flex flex-col gap-3">
              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent transition-colors" onClick={() => setProvider("google")}>
                <RadioGroupItem value="google" id="google" />
                <Label htmlFor="google" className="flex-1 cursor-pointer font-medium">Google (Gemini)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent transition-colors" onClick={() => setProvider("openai")}>
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai" className="flex-1 cursor-pointer font-medium">OpenAI (GPT-4o)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-accent transition-colors" onClick={() => setProvider("anthropic")}>
                <RadioGroupItem value="anthropic" id="anthropic" />
                <Label htmlFor="anthropic" className="flex-1 cursor-pointer font-medium">Anthropic (Claude)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={`Enter your ${provider === 'google' ? 'Gemini' : provider === 'openai' ? 'OpenAI' : 'Claude'} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your key is stored locally in your browser and is never saved to our database.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleSave} className="w-full" size="lg">
              {isSaved ? "Saved!" : "Save Settings"}
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
