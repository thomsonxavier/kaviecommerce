"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminNav } from "../../../../components/AdminNav";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Save,
  Truck,
} from "lucide-react";
import { projectId } from "../../../../utils/supabase/info";
import { adminCookieStorage } from "../../../../utils/cookies";

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    size?: string;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  courierDetails: string;
  createdAt: string;
  updatedAt?: string;
}

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Payment Received",
  "On Delivery",
  "Delivered",
];

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-gray-500",
  Confirmed: "bg-blue-500",
  "Payment Received": "bg-yellow-500",
  "On Delivery": "bg-orange-500",
  Delivered: "bg-green-500",
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [courierDetails, setCourierDetails] = useState("");

  useEffect(() => {
    const token = adminCookieStorage.getAdminToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchOrder(token);
  }, [orderId, router]);

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setCourierDetails(order.courierDetails || "");
    }
  }, [order]);

  const fetchOrder = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = adminCookieStorage.getAdminToken();
    if (!token || !order) return;

    setSaving(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            courierDetails: courierDetails,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = await response.json();
      setOrder(data.order);
      alert("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <AdminNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3C6E47] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <AdminNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">Order not found</p>
            <Button onClick={() => router.push("/admin/orders")}>
              Back to Orders
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/orders")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl text-[#222222]">Order Details</h1>
              <p className="text-gray-600 mt-2 font-mono text-sm">
                Order ID: {order.id}
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#3C6E47] hover:bg-[#2d5336] gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info & Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <Card className="p-6">
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#3C6E47]" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-[#F4E9D8] rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-[#3C6E47]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Size: {product.size || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Unit Price</p>
                      <p className="text-sm flex items-center justify-end">
                        <IndianRupee className="w-3 h-3" />
                        {product.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Subtotal</p>
                      <p className="flex items-center justify-end">
                        <IndianRupee className="w-4 h-4" />
                        {(product.price * product.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Total Amount</span>
                  <span className="flex items-center text-[#3C6E47]">
                    <IndianRupee className="w-5 h-5" />
                    {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-6">
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#3C6E47]" />
                Customer Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-sm">{order.userName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm">{order.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-sm">{order.userPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="text-sm">{order.userAddress}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Status & Tracking */}
          <div className="space-y-6">
            {/* Status Update */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">Order Status</h2>
              <div className="space-y-4">
                <div>
                  <Label>Current Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            STATUS_COLORS[newStatus]
                          }`}
                        />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}
                            />
                            {status}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="courier" className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Courier / Tracking Details
                  </Label>
                  <Textarea
                    id="courier"
                    value={courierDetails}
                    onChange={(e) => setCourierDetails(e.target.value)}
                    placeholder="Enter courier name, tracking number, or delivery notes..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>
            </Card>

            {/* Order Timeline */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">Order Timeline</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                {order.updatedAt && (
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p>{formatDate(order.updatedAt)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl mb-4">Quick Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items</span>
                  <span>
                    {order.products.reduce(
                      (sum, p) => sum + p.quantity,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Types</span>
                  <span>{order.products.length}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Total Value</span>
                  <span className="flex items-center text-[#3C6E47]">
                    <IndianRupee className="w-4 h-4" />
                    {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
