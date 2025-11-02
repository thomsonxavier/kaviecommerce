"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "../../../components/AdminNav";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Plus, Edit, Trash2, Package, Image as ImageIcon, X } from "lucide-react";
import { projectId } from "../../../utils/supabase/info";
import { toast } from "sonner";
import { Product } from "../../../store/useStore";
import { adminCookieStorage } from "../../../utils/cookies";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "Personal Care" as "Personal Care" | "Home Care",
    type: "",
    description: "",
    ingredients: "",
    images: ["", "", "", "", ""],
    sizes: [{ value: "", price: 0 }],
    inStock: true,
  });
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    const token = adminCookieStorage.getAdminToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const token = adminCookieStorage.getAdminToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/products`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = adminCookieStorage.getAdminToken();
    if (!token) return;

    try {
      // Auto-generate ID from name for new products
      let productId = formData.id;
      if (!editingProduct) {
        // Generate slug from product name
        productId = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `product-${Date.now()}`;
      }
      
      const productData = {
        id: productId,
        name: formData.name,
        category: formData.category,
        type: formData.type,
        description: formData.description,
        ingredients: formData.ingredients
          .split("\n")
          .filter((i) => i.trim() !== ""),
        images: formData.images.filter((img) => img.trim() !== ""),
        sizes: formData.sizes.filter((s) => s.value && s.price > 0),
        inStock: formData.inStock,
      };

      const url = editingProduct
        ? `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/products/${editingProduct.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/products`;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save product");
      }

      toast.success(
        editingProduct ? "Product updated successfully" : "Product created successfully"
      );
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const token = adminCookieStorage.getAdminToken();
    if (!token) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      type: product.type,
      description: product.description || "",
      ingredients: (product.ingredients || []).join("\n"),
      images: [
        ...(product.images || []),
        ...Array(5 - (product.images || []).length).fill(""),
      ].slice(0, 5),
      sizes: product.sizes.length > 0 ? product.sizes : [{ value: "", price: 0 }],
      inStock: product.inStock !== undefined ? product.inStock : true,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      id: "",
      name: "",
      category: "Personal Care",
      type: "",
      description: "",
      ingredients: "",
      images: ["", "", "", "", ""],
      sizes: [{ value: "", price: 0 }],
      inStock: true,
    });
    setUploadingImages([false, false, false, false, false]);
  };

  const addSizeField = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { value: "", price: 0 }],
    });
  };

  const removeSizeField = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  const updateSize = (index: number, field: "value" | "price", value: any) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = field === "price" ? Number(value) : value;
    setFormData({ ...formData, sizes: newSizes });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleFileUpload = async (index: number, file: File) => {
    const token = adminCookieStorage.getAdminToken();
    if (!token) return;

    // Update uploading state
    const newUploadingStates = [...uploadingImages];
    newUploadingStates[index] = true;
    setUploadingImages(newUploadingStates);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataUpload,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      const data = await response.json();
      updateImage(index, data.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      newUploadingStates[index] = false;
      setUploadingImages(newUploadingStates);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = formData.images[index];
    if (!imageUrl) return;

    const token = adminCookieStorage.getAdminToken();
    if (!token) return;

    try {
      // Delete from storage if it's a Supabase URL
      if (imageUrl.includes('make-60c5a920-products')) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/delete-image`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ url: imageUrl }),
          }
        );
      }
      
      updateImage(index, "");
      toast.success("Image removed");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl text-[#222222]">Product Management</h1>
            <p className="text-gray-600 mt-2">Add, edit, and manage your products</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-[#3C6E47] hover:bg-[#2d5336] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label>Product Name*</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Aloe Vera Shampoo"
                    />
                  {!editingProduct && formData.name && (
                    <p className="text-xs text-gray-500 mt-1">
                      ID will be: {formData.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '') || 'product-id'}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category*</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Personal Care">Personal Care</SelectItem>
                        <SelectItem value="Home Care">Home Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type*</Label>
                    <Input
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="Shampoo, Detergent, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Ingredients (one per line)</Label>
                  <Textarea
                    value={formData.ingredients}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    placeholder="Aloe Vera Extract&#10;Coconut Oil&#10;Vitamin E"
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Product Images (up to 5)</Label>
                    <Badge variant="outline">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {formData.images.filter((img) => img.trim()).length}/5
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(index, file);
                              }}
                              disabled={uploadingImages[index]}
                              className="cursor-pointer"
                            />
                          </div>
                          {img && (
                            <Button
                              type="button"
                              onClick={() => removeImage(index)}
                              variant="outline"
                              size="icon"
                              disabled={uploadingImages[index]}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {uploadingImages[index] && (
                          <p className="text-xs text-gray-500">Uploading...</p>
                        )}
                        {img && !uploadingImages[index] && (
                          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={img}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Sizes & Prices*</Label>
                    <Button
                      type="button"
                      onClick={addSizeField}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Size
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.sizes.map((size, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          required
                          value={size.value}
                          onChange={(e) => updateSize(index, "value", e.target.value)}
                          placeholder="200ml, 1L, etc."
                          className="flex-1"
                        />
                        <Input
                          required
                          type="number"
                          value={size.price || ""}
                          onChange={(e) => updateSize(index, "price", e.target.value)}
                          placeholder="Price"
                          className="flex-1"
                        />
                        {formData.sizes.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeSizeField(index)}
                            variant="outline"
                            size="icon"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base">In Stock</Label>
                    <p className="text-sm text-gray-600">
                      Mark product as available for purchase
                    </p>
                  </div>
                  <Switch
                    checked={formData.inStock}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, inStock: checked })
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#3C6E47] hover:bg-[#2d5336] text-white"
                  >
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3C6E47] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first product</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-[#3C6E47] hover:bg-[#2d5336] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-[#F4E9D8] relative">
                  {product.images && product.images.length > 0 && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge className="bg-red-500 text-white">Out of Stock</Badge>
                    </div>
                  )}
                  {product.images && product.images.length > 1 && (
                    <Badge className="absolute top-2 right-2 bg-white">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {product.images.length}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg mb-1">{product.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.sizes.map((size, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {size.value}: ₹{size.price}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(product)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="outline"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      size="sm"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
