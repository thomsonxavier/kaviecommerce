"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card } from "../../../components/ui/card";
import { Lock, Mail, Leaf } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { adminCookieStorage } from "../../../utils/cookies";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      // Verify user has admin role
      const userRole = data.user?.user_metadata?.role;
      if (userRole !== 'admin') {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin credentials required.");
      }

      // Store access token in cookies
      adminCookieStorage.setAdminToken(data.session.access_token);
      adminCookieStorage.setAdminEmail(formData.email);

      // Redirect to dashboard
      router.push("/admin/dashboard");
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
            <div className="w-16 h-16 bg-[#3C6E47] rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl mb-2 text-[#222222]">Kavis Naturals</h1>
          <p className="text-gray-600">Admin Panel</p>
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
              placeholder="admin@kavisnaturals.com"
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

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">Secure admin access only</p>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/create")}
              className="text-sm text-gray-600 hover:text-[#3C6E47]"
            >
              Create Admin Account
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-sm text-gray-600 hover:text-[#3C6E47]"
            >
              Back to Customer Site
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
