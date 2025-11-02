/**
 * Admin Account Creation Page
 * 
 * This page allows creation of admin accounts with a master password requirement.
 * Master Password: 085296
 * 
 * Only users with the master password can create admin accounts.
 * Customer accounts are created through the regular signup flow.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card } from "../../../components/ui/card";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Lock, Mail, User as UserIcon, Leaf, Shield, AlertCircle } from "lucide-react";
import { projectId } from "../../../utils/supabase/info";
import { adminCookieStorage } from "../../../utils/cookies";

export default function AdminCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    masterPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // useEffect(() => {
  //   const token = localStorage.getItem("admin_token");
  //   if (!token) {
  //     router.push("/admin/login");
  //   }
  // }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

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

    const token = adminCookieStorage.getAdminToken();
    if (!token) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/admin/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            masterPassword: formData.masterPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin account");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        masterPassword: "",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      console.error("Admin creation error:", err);
      setError(err.message || "Failed to create admin account");
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
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl mb-2 text-[#222222]">Create Admin Account</h1>
          <p className="text-gray-600">Kavis Naturals Admin Panel</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-600">
              Admin account created successfully! Redirecting to login...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="pt-4 border-t">
            <Label htmlFor="masterPassword" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600" />
              Master Password
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Required to create admin accounts. Contact system administrator.
            </p>
            <Input
              id="masterPassword"
              type="password"
              required
              value={formData.masterPassword}
              onChange={(e) =>
                setFormData({ ...formData, masterPassword: e.target.value })
              }
              placeholder="Master password"
              className="mt-2 border-red-200 focus:border-red-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full bg-[#3C6E47] hover:bg-[#2d5336] text-white py-6"
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
          </Button>

          <div className="text-center pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/login")}
              className="text-sm text-gray-600 hover:text-[#3C6E47]"
            >
              Already have an account? Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
