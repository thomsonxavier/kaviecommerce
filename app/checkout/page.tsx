"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../store/useStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card } from "../../components/ui/card";
import { ShoppingBag, MapPin, Phone, Mail, User, Plus, Minus, Trash2 } from "lucide-react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, user, updateQuantity, removeFromCart, accessToken } = useStore();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Require authentication to checkout
  useEffect(() => {
    if (!user || !accessToken) {
      router.push("/login?redirect=checkout");
    } else {
      setCheckingAuth(false);
    }
  }, [user, accessToken, router]);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        products: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          size: item.selectedSize,
          price: item.price,
        })),
        totalAmount,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit order");
      }

      // Clear cart and redirect to thank you page
      clearCart();
      router.push(`/thank-you?orderId=${result.orderId}`);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3C6E47] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before checking out</p>
          <Button
            onClick={() => router.push("/shop")}
            className="bg-[#3C6E47] hover:bg-[#2d5336]"
          >
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl mb-6">Contact & Delivery Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address *
                  </Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, apartment/unit, city, state, PIN code"
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div className="bg-[#F4E9D8] p-4 rounded-lg">
                  <p className="text-sm text-[#222222]">
                    <strong>Note:</strong> Our team will contact you within 24 hours to confirm your order and arrange delivery details.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3C6E47] hover:bg-[#2d5336] text-white py-6 rounded-xl"
                >
                  {loading ? "Submitting..." : "Submit Order"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-2xl mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 items-start border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="w-20 h-20 bg-[#F4E9D8] rounded-lg flex items-center justify-center overflow-hidden">
                      <ShoppingBag className="w-8 h-8 text-[#3C6E47]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {item.selectedSize}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border rounded-lg">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.selectedSize, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm font-medium mt-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{totalAmount >= 600 ? "Free" : "To be confirmed"}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#3C6E47]">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {totalAmount >= 600 && (
                <div className="mt-4 bg-green-50 text-green-800 p-3 rounded-lg text-sm text-center">
                  🎉 You get FREE shipping!
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
