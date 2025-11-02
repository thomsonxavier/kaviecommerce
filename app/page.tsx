"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Leaf,
  Package,
  Star,
  Shield,
  Truck,
} from "lucide-react";
import { useStore, Product } from "../store/useStore";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [products, setProducts] = useState<Product[]>();
  const [loading, setLoading] = useState(true);

  const personalCareProducts = (products || []).filter((p) => p.category === "Personal Care" && p.inStock !== false).slice(0, 4);
  const homeCareProducts = (products || []).filter((p) => p.category === "Home Care" && p.inStock !== false).slice(0, 2);
  const dealProducts = [...personalCareProducts.slice(0, 2), ...homeCareProducts.slice(0, 2)];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/products`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!user && typeof window !== "undefined") {
        const supabaseUrl = `https://${projectId}.supabase.co`;
        const supabase = createClient(supabaseUrl, publicAnonKey);
        
        const { data: { session } } = await supabase.auth.getSession();
        
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
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
          }
        }
      }
    };

    checkSession();
  }, []);

  const testimonials = [
    {
      name: "Priya Sharma",
      rating: 5,
      comment:
        "Best natural products I've used! My hair feels so healthy after using the Aloe Vera shampoo.",
    },
    {
      name: "Rajesh Kumar",
      rating: 5,
      comment:
        "The organic detergent is amazing. Cleans well and doesn't irritate my skin.",
    },
    {
      name: "Anita Patel",
      rating: 5,
      comment:
        "Love the sanitary napkins! Finally found a chemical-free option that actually works.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#F4E9D8] to-[#F8F8F8] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="bg-[#3C6E47] text-white mb-4">
                100% Natural & Organic
              </Badge>
              <h2 className="text-4xl md:text-5xl mb-4 text-[#222222]">
                Naturally Pure Care for You & Home
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Discover our range of chemical-free, eco-friendly personal care and home care products made with nature&apos;s best ingredients.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => router.push("/shop")}
                  className="bg-[#3C6E47] hover:bg-[#2d5336] text-white px-8 py-6 rounded-xl"
                >
                  Shop Now
                </Button>
                {/* <Button
                  variant="outline"
                  className="px-8 py-6 rounded-xl border-[#3C6E47] text-[#3C6E47] hover:bg-[#3C6E47] hover:text-white"
                >
                  Learn More
                </Button> */}
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1757332050856-edeb5bf846be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwbmF0dXJhbCUyMG9yZ2FuaWN8ZW58MXx8fHwxNzYxOTgxMjE4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Natural products"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Carousel */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center mb-8 text-[#222222]">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push("/shop?category=Personal+Care&type=Shampoo")}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:shadow-lg transition-all group"
            >
              <div className="w-24 h-24 bg-[#F4E9D8] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-12 h-12 text-[#3C6E47]" />
              </div>
              <h3 className="text-sm">Shampoos</h3>
            </button>

            <button
              onClick={() => router.push("/shop?category=Personal+Care&type=Sanitary+Napkin")}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:shadow-lg transition-all group"
            >
              <div className="w-24 h-24 bg-[#F4E9D8] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-12 h-12 text-[#3C6E47]" />
              </div>
              <h3 className="text-sm">Sanitary Napkins</h3>
            </button>

            <button
              onClick={() => router.push("/shop?category=Home+Care")}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:shadow-lg transition-all group"
            >
              <div className="w-24 h-24 bg-[#F4E9D8] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Leaf className="w-12 h-12 text-[#3C6E47]" />
              </div>
              <h3 className="text-sm">Detergents</h3>
            </button>
          </div>
        </div>
      </section>

      {/* Shop by Main Categories */}
      <section className="py-12 bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all"
              onClick={() => router.push("/shop?category=Personal+Care")}
            >
              <div className="h-64 relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1675016317884-28915da1c64d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwY29zbWV0aWNzJTIwc3BhfGVufDF8fHx8MTc2MTk4MTIxOXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Personal Care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl mb-2">Personal Care</h3>
                  <p className="text-sm opacity-90">
                    Shampoos, Sanitary Napkins & More
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all"
              onClick={() => router.push("/shop?category=Home+Care")}
            >
              <div className="h-64 relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1624377225030-f0bb343eaa4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwZGV0ZXJnZW50fGVufDF8fHx8MTc2MTk4MTIxOXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Home Care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl mb-2">Home Care</h3>
                  <p className="text-sm opacity-90">
                    Organic Liquid Detergents
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Deal of the Day */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl text-[#222222]">Featured Products</h2>
            <Button
              onClick={() => router.push("/shop")}
              variant="outline"
              className="border-[#3C6E47] text-[#3C6E47] hover:bg-[#3C6E47] hover:text-white"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-10 w-full mt-3" />
                  </div>
                </Card>
              ))
            ) : dealProducts.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-xl transition-all"
                onClick={() => router.push(`/shop/${product.id}`)}
              >
                <div className="aspect-square bg-[#F4E9D8] rounded-t-lg overflow-hidden relative">
                  <ImageWithFallback
                    src={product.images && product.images.length > 0 
                      ? product.images[0] 
                      : "https://images.unsplash.com/photo-1637523861607-a6b7c6f9fe02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2hhbXBvbyUyMGJvdHRsZXxlbnwxfHx8fDE3NjE4OTc5NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlist.includes(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button> */}
                </div>
                <div className="p-4">
                  <h3 className="text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {product.sizes[0].value}
                  </p>
                  <p className="text-lg text-[#3C6E47]">
                    ₹{product.sizes[0].price}
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/shop/${product.id}`);
                    }}
                    className="w-full mt-3 bg-[#3C6E47] hover:bg-[#2d5336] text-white rounded-xl"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center mb-12 text-[#222222]">
            Why Choose Kavis Naturals?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#3C6E47] rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl mb-2">Pure & Natural</h3>
              <p className="text-gray-600">
                100% chemical-free products made from the finest natural ingredients
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#3C6E47] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl mb-2">Unmatched Quality</h3>
              <p className="text-gray-600">
                Rigorously tested and certified organic products for your peace of mind
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#3C6E47] rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Free shipping on orders above ₹600, delivered right to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center mb-12 text-[#222222]">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{testimonial.comment}</p>
                <p className="text-sm text-gray-600">- {testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Mobile Bottom Navigation */}
      {/* <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => router.push("/shop")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <Package className="w-5 h-5 text-[#3C6E47]" />
            <span className="text-xs text-gray-600">Shop</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2">
            <Search className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Search</span>
          </button>
          <button
            onClick={() => router.push(user ? "/account" : "/login")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">{user ? "Account" : "Login"}</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2">
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            <span className="text-xs text-gray-600">Wishlist</span>
          </button>
          <button
            onClick={() => router.push("/checkout")}
            className="flex flex-col items-center gap-1 py-2 relative"
          >
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-4 bg-[#3C6E47] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
            <span className="text-xs text-gray-600">Cart</span>
          </button>
        </div>
      </div> */}
    </div>
  );
}
