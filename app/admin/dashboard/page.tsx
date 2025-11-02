"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "../../../components/AdminNav";
import { Card } from "../../../components/ui/card";
import {
  Users,
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  IndianRupee,
} from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { adminCookieStorage } from "../../../utils/cookies";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  statusCounts: {
    Pending: number;
    Confirmed: number;
    "Payment Received": number;
    "On Delivery": number;
    Delivered: number;
  };
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = adminCookieStorage.getAdminToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <AdminNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3C6E47] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-[#222222]">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <h3 className="text-3xl mt-2">{stats?.totalUsers || 0}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <h3 className="text-3xl mt-2">{stats?.totalOrders || 0}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <h3 className="text-3xl mt-2">
                  {stats?.statusCounts.Pending || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <h3 className="text-3xl mt-2 flex items-center">
                  <IndianRupee className="w-6 h-6" />
                  {stats?.totalRevenue?.toFixed(0) || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Order Status Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl mb-6">Order Status Overview</h2>
            <div className="space-y-4">
              {[
                { label: "Pending", count: stats?.statusCounts.Pending || 0, color: "bg-gray-500" },
                {
                  label: "Confirmed",
                  count: stats?.statusCounts.Confirmed || 0,
                  color: "bg-blue-500",
                },
                {
                  label: "Payment Received",
                  count: stats?.statusCounts["Payment Received"] || 0,
                  color: "bg-yellow-500",
                },
                {
                  label: "On Delivery",
                  count: stats?.statusCounts["On Delivery"] || 0,
                  color: "bg-orange-500",
                },
                {
                  label: "Delivered",
                  count: stats?.statusCounts.Delivered || 0,
                  color: "bg-green-500",
                },
              ].map((status) => (
                <div key={status.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">{status.label}</span>
                    <span className="text-sm">{status.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${status.color} h-2 rounded-full transition-all duration-500`}
                      style={{
                        width: `${
                          stats?.totalOrders
                            ? (status.count / stats.totalOrders) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/admin/orders")}
                className="w-full text-left p-4 bg-[#3C6E47] text-white rounded-lg hover:bg-[#2d5336] transition-colors"
              >
                <Package className="w-5 h-5 mb-2" />
                <h3 className="text-sm">View All Orders</h3>
                <p className="text-xs opacity-90 mt-1">
                  Manage and update order statuses
                </p>
              </button>

              <button
                onClick={() => router.push("/admin/users")}
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-[#3C6E47] transition-colors"
              >
                <Users className="w-5 h-5 mb-2 text-[#3C6E47]" />
                <h3 className="text-sm">Manage Users</h3>
                <p className="text-xs text-gray-600 mt-1">
                  View customer information
                </p>
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-[#3C6E47] transition-colors"
              >
                <CheckCircle className="w-5 h-5 mb-2 text-[#3C6E47]" />
                <h3 className="text-sm">View Store</h3>
                <p className="text-xs text-gray-600 mt-1">
                  See your customer-facing website
                </p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
