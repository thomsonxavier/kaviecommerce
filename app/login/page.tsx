"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Lock, Mail, Leaf } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { useStore } from "../../store/useStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Account created successfully! Please sign in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      const supabase = createClient(supabaseUrl, publicAnonKey);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.session) {
        throw new Error("No session created");
      }

      // Fetch user profile
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/profile`,
        {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData.user, data.session.access_token);
      }

      // Redirect based on redirect param or default to home
      const redirectPath = searchParams.get("redirect");
      router.push(redirectPath || "/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F8F8] to-[#F4E9D8] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10">
          <Leaf className="w-32 h-32 text-[#3C6E47]" />
        </div>
        <div className="absolute bottom-20 right-20">
          <Leaf className="w-40 h-40 text-[#3C6E47] transform rotate-45" />
        </div>
        <div className="absolute top-1/2 right-10">
          <Leaf className="w-24 h-24 text-[#3C6E47] transform -rotate-12" />
        </div>
      </div>

      <Card className="max-w-md w-full p-8 relative z-10 shadow-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => router.push("/")}
              className="w-16 h-16 bg-[#3C6E47] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Leaf className="w-8 h-8 text-white" />
            </button>
          </div>
          <h1 className="text-3xl mb-2 text-[#222222]">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="mt-2"
            />
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3C6E47] hover:bg-[#2d5336] text-white py-6 rounded-xl"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-[#3C6E47] hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
