"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import {
  Leaf,
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  Star,
  Check,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useStore, Product } from "../../../store/useStore";
import { products as staticProducts } from "../../../data/products";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { Header } from "../../../components/Header";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { cart, wishlist, toggleWishlist, addToCart } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch product data
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Set initial selected size when product loads
  useEffect(() => {
    if (product && !selectedSize && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].value);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        fetchRelatedProducts(data.product.category);
      } else {
        // Fallback to static products
        const staticProduct = staticProducts.find((p) => p.id === productId);
        if (staticProduct) {
          setProduct(staticProduct);
          const related = staticProducts
            .filter((p) => p.category === staticProduct.category && p.id !== productId)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      // Fallback to static products
      const staticProduct = staticProducts.find((p) => p.id === productId);
      if (staticProduct) {
        setProduct(staticProduct);
        const related = staticProducts
          .filter((p) => p.category === staticProduct.category && p.id !== productId)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string) => {
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
        const related = data.products
          .filter((p: Product) => p.category === category && p.id !== productId && p.inStock !== false)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3C6E47] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Button
            onClick={() => router.push("/shop")}
            className="bg-[#3C6E47] hover:bg-[#2d5336]"
          >
            Back to Shop
          </Button>
        </Card>
      </div>
    );
  }

  const currentPrice =
    product.sizes.find((s) => s.value === selectedSize)?.price ||
    product.sizes[0]?.price || 0;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Header />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/shop")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-[#F4E9D8] rounded-2xl overflow-hidden mb-4 relative group">
              <ImageWithFallback
                src={
                  product.images && product.images.length > 0
                    ? product.images[currentImageIndex]
                    : "https://images.unsplash.com/photo-1637523861607-a6b7c6f9fe02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2hhbXBvbyUyMGJvdHRsZXxlbnwxfHx8fDE3NjE4OTc5NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? product.images!.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === product.images!.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-white w-6"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-[#F4E9D8] rounded-lg overflow-hidden cursor-pointer transition-all ${
                      currentImageIndex === index
                        ? "ring-2 ring-[#3C6E47]"
                        : "hover:ring-2 hover:ring-[#3C6E47]"
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-[#3C6E47] text-white">
                {product.category}
              </Badge>
              {!product.inStock && (
                <Badge className="bg-red-500 text-white">Out of Stock</Badge>
              )}
            </div>
            <h1 className="text-3xl mb-2 text-[#222222]">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(47 reviews)</span>
            </div>

            <div className="mb-6">
              <Label className="text-lg mb-3 block">Select Size</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                <div className="grid grid-cols-2 gap-3">
                  {product.sizes.map((size) => (
                    <div key={size.value} className="relative">
                      <RadioGroupItem
                        value={size.value}
                        id={size.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={size.value}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#3C6E47] peer-checked:border-[#3C6E47] peer-checked:bg-[#F4E9D8] transition-all"
                      >
                        <span className="text-sm">{size.value}</span>
                        <span className="text-lg text-[#3C6E47]">
                          ₹{size.price}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl text-[#3C6E47]">
                  ₹{currentPrice}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize || !product.inStock}
                className="flex-1 bg-[#3C6E47] hover:bg-[#2d5336] text-white py-6 rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!product.inStock ? (
                  "Out of Stock"
                ) : addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              {/* <Button
                variant="outline"
                size="icon"
                className="px-6 rounded-xl border-[#3C6E47] hover:bg-[#3C6E47] hover:text-white"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlist.includes(product.id)
                      ? "fill-red-500 text-red-500"
                      : ""
                  }`}
                />
              </Button> */}
            </div>

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Check className="w-5 h-5" />
                <span>In Stock - Ships within 2-3 business days</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Information Tabs */}
        <Card className="p-6 mb-12">
          <Tabs defaultValue="description">
            <TabsList className="mb-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <h3 className="text-xl">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our {product.name} is carefully formulated using only the finest
                natural ingredients. We ensure that every product meets the
                highest standards of quality and purity. Perfect for daily use
                and suitable for all skin/hair types.
              </p>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4">
              <h3 className="text-xl">Natural Ingredients</h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {product.ingredients?.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <Leaf className="w-4 h-4 text-[#3C6E47]" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </TabsContent>

          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl mb-6 text-[#222222]">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="group cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => router.push(`/shop/${relatedProduct.id}`)}
                >
                  <div className="aspect-square bg-[#F4E9D8] rounded-t-lg overflow-hidden relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1637523861607-a6b7c6f9fe02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2hhbXBvbyUyMGJvdHRsZXxlbnwxfHx8fDE3NjE4OTc5NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {relatedProduct.sizes[0].value}
                    </p>
                    <p className="text-lg text-[#3C6E47]">
                      ₹{relatedProduct.sizes[0].price}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
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
          {/* <button className="flex flex-col items-center gap-1 py-2">
            <Heart
              className={`w-5 h-5 ${
                wishlist.length > 0 ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
            <span className="text-xs text-gray-600">Wishlist</span>
          </button> */}
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
      </div>
    </div>
  );
}
