"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Leaf, Mail, Lock, User as UserIcon, Phone, MapPin } from "lucide-react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Redirect to login page after successful signup
      router.push("/login?registered=true");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account");
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

      <Card className="max-w-lg w-full p-8 relative z-10 shadow-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => router.push("/")}
              className="w-16 h-16 bg-[#3C6E47] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Leaf className="w-8 h-8 text-white" />
            </button>
          </div>
          <h1 className="text-3xl mb-2 text-[#222222]">Create Account</h1>
          <p className="text-gray-600">Join Kavis Naturals Family</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="mt-2"
            />
          </div>

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
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address (Optional)
            </Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City"
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

          <div>
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
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
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-[#3C6E47] hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
