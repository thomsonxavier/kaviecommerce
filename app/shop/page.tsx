"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {  
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Filter } from "lucide-react";
import { Product } from "../../store/useStore";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { Header } from "../../components/Header";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>();
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    type: searchParams.get("type") || "all",
    priceRange: "",
  });

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

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
      // Keep static products as fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = (products || []).filter((product) => {
    if (filters.category && filters.category !== "all" && product.category !== filters.category) return false;
    if (filters.type && filters.type !== "all" && product.type !== filters.type) return false;
    if (filters.priceRange) {
      const minPrice = product.sizes[0].price;
      if (filters.priceRange === "0-200" && minPrice > 200) return false;
      if (filters.priceRange === "200-400" && (minPrice < 200 || minPrice > 400))
        return false;
      if (filters.priceRange === "400+" && minPrice < 400) return false;
    }
    return true;
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-[#222222]">Shop</h1>
          <Button
            variant="outline"
            className="md:hidden gap-2"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`${
              filterOpen ? "block" : "hidden"
            } md:block md:col-span-1`}
          >
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl mb-4">Filters</h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm mb-3 block">Category</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="all"
                        checked={filters.category === ""}
                        onCheckedChange={() => handleFilterChange("category", "")}
                      />
                      <Label htmlFor="all" className="text-sm cursor-pointer">
                        All Categories
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="personal"
                        checked={filters.category === "Personal Care"}
                        onCheckedChange={() =>
                          handleFilterChange("category", "Personal Care")
                        }
                      />
                      <Label
                        htmlFor="personal"
                        className="text-sm cursor-pointer"
                      >
                        Personal Care
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="home"
                        checked={filters.category === "Home Care"}
                        onCheckedChange={() =>
                          handleFilterChange("category", "Home Care")
                        }
                      />
                      <Label htmlFor="home" className="text-sm cursor-pointer">
                        Home Care
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-3 block">Product Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Shampoo">Shampoo</SelectItem>
                      <SelectItem value="Sanitary Napkin">
                        Sanitary Napkin
                      </SelectItem>
                      <SelectItem value="Detergent">Detergent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm mb-3 block">Price Range</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="price-all"
                        checked={filters.priceRange === ""}
                        onCheckedChange={() =>
                          handleFilterChange("priceRange", "")
                        }
                      />
                      <Label
                        htmlFor="price-all"
                        className="text-sm cursor-pointer"
                      >
                        All Prices
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="price-low"
                        checked={filters.priceRange === "0-200"}
                        onCheckedChange={() =>
                          handleFilterChange("priceRange", "0-200")
                        }
                      />
                      <Label
                        htmlFor="price-low"
                        className="text-sm cursor-pointer"
                      >
                        Under ₹200
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="price-mid"
                        checked={filters.priceRange === "200-400"}
                        onCheckedChange={() =>
                          handleFilterChange("priceRange", "200-400")
                        }
                      />
                      <Label
                        htmlFor="price-mid"
                        className="text-sm cursor-pointer"
                      >
                        ₹200 - ₹400
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="price-high"
                        checked={filters.priceRange === "400+"}
                        onCheckedChange={() =>
                          handleFilterChange("priceRange", "400+")
                        }
                      />
                      <Label
                        htmlFor="price-high"
                        className="text-sm cursor-pointer"
                      >
                        Above ₹400
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({ category: "", type: "", priceRange: "" })
                  }
                >
                  Clear All Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Product Grid */}
          <div className="md:col-span-3">
            <div className="mb-4 text-sm text-gray-600">
              {loading ? "Loading products..." : `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-10 w-full mt-3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">No products found</p>
                <Button
                  onClick={() =>
                    setFilters({ category: "", type: "", priceRange: "" })
                  }
                  className="bg-[#3C6E47] hover:bg-[#2d5336]"
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.filter(p => p.inStock !== false).map((product) => (
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
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Badge className="bg-red-500 text-white px-4 py-2">Out of Stock</Badge>
                        </div>
                      )}
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"} />
                      </button> */}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm mb-2 line-clamp-2">
                        {product.name}
                      </h3>
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
                        disabled={!product.inStock}
                        className="w-full mt-3 bg-[#3C6E47] hover:bg-[#2d5336] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {product.inStock ? "View Details" : "Out of Stock"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {/* <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => router.push("/shop")}
            className="flex flex-col items-center gap-1 py-2"
          >
            <ShoppingCart className="w-5 h-5 text-[#3C6E47]" />
            <span className="text-xs text-gray-600">Shop</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2">
            <Search className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Search</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Account</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2">
            <Heart
              className={`w-5 h-5 ${
                wishlist.length > 0 ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F8F8]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <Skeleton className="h-12 w-full max-w-md" />
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
