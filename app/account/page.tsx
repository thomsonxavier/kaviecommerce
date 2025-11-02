"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { createClient } from "@supabase/supabase-js";
import { Header } from "../../components/Header";

interface Order {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  products: any[];
  totalAmount: number;
  status: string;
  courierDetails: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, accessToken, setUser } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      // If user is already in store, proceed
      if (user && accessToken) {
        setCheckingAuth(false);
        fetchOrders();
        return;
      }

      // Try to restore from Supabase session
      try {
        const supabaseUrl = `https://${projectId}.supabase.co`;
        const supabase = createClient(supabaseUrl, publicAnonKey);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          router.push("/login");
          return;
        }

        if (session?.access_token) {
          // Fetch user profile
          try {
            const profileResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/profile`,
              {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setUser(profileData.user, session.access_token);
              setCheckingAuth(false);
              fetchOrders();
            } else {
              router.push("/login");
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
        router.push("/login");
      }
    };

    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, user, accessToken, setUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Payment Received":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "On Delivery":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3C6E47] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#3C6E47] rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl mb-2 text-[#222222]">{user.name}</h2>
                <Badge className="bg-[#3C6E47] text-white mb-6">Customer</Badge>

                <Separator className="my-4" />

                <div className="w-full space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{user.phone}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{user.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="text-lg mb-4">Order Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="text-[#3C6E47]">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered</span>
                  <span className="text-[#3C6E47]">
                    {orders.filter((o) => o.status === "Delivered").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="text-[#3C6E47]">
                    {orders.filter((o) => o.status !== "Delivered").length}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Orders List */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-[#222222]">My Orders</h2>
              <Button
                onClick={() => router.push("/shop")}
                className="bg-[#3C6E47] hover:bg-[#2d5336] text-white"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>

            {loading ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Loading orders...</p>
              </Card>
            ) : orders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-4">
                  Start shopping to place your first order!
                </p>
                <Button
                  onClick={() => router.push("/shop")}
                  className="bg-[#3C6E47] hover:bg-[#2d5336] text-white"
                >
                  Browse Products
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg mb-1">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <h4 className="text-sm mb-2">Order Items:</h4>
                      {order.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm text-gray-700"
                        >
                          <span>
                            {product.name} ({product.selectedSize}) x {product.quantity}
                          </span>
                          <span>₹{product.price * product.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl text-[#3C6E47]">₹{order.totalAmount}</p>
                      </div>
                      {order.courierDetails && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Courier Details</p>
                          <p className="text-sm">{order.courierDetails}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
