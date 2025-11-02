"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "../../../components/AdminNav";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Search, Eye, IndianRupee } from "lucide-react";
import { projectId } from "../../../utils/supabase/info";
import { adminCookieStorage } from "../../../utils/cookies";

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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const token = adminCookieStorage.getAdminToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchOrders(token);
  }, [router]);

  useEffect(() => {
    let filtered = orders;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.userName.toLowerCase().includes(query) ||
          order.userEmail.toLowerCase().includes(query) ||
          order.userPhone.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);
      setFilteredOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const token = adminCookieStorage.getAdminToken();
    if (!token) return;

    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = await response.json();

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? data.order : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
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
            <p className="text-gray-600">Loading orders...</p>
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
          <h1 className="text-3xl text-[#222222]">Order Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage all customer orders
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Order ID, customer name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-xs text-gray-600">All Orders</p>
            <h3 className="text-xl mt-1">{orders.length}</h3>
          </Card>
          {STATUS_OPTIONS.map((status) => (
            <Card key={status} className="p-4">
              <p className="text-xs text-gray-600">{status}</p>
              <h3 className="text-xl mt-1">
                {orders.filter((o) => o.status === status).length}
              </h3>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell>
                        <p className="text-sm font-mono text-gray-600">
                          {order.id.substring(0, 8)}...
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{order.userName}</p>
                          <p className="text-xs text-gray-500">
                            {order.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {order.products.length} item
                          {order.products.length !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {order.products.map((p) => p.name).join(", ")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm flex items-center">
                          <IndianRupee className="w-3 h-3" />
                          {order.totalAmount.toFixed(2)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(order.id, value)
                          }
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  STATUS_COLORS[order.status]
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
                                    className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`}
                                  />
                                  {status}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/admin/orders/${order.id}`)
                          }
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
