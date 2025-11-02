import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
// @ts-expect-error - Deno allows .tsx extension in imports
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client helper
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
};

// Middleware to verify admin authentication
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('Authorization error while verifying admin token:', error);
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// Initialize storage buckets on startup
const initializeStorage = async () => {
  try {
    const supabase = getSupabaseClient();
    const bucketName = 'make-60c5a920-products';
    
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log(`Created storage bucket: ${bucketName}`);
    }
  } catch (error) {
    console.log('Error initializing storage:', error);
  }
};

// Initialize storage on startup
initializeStorage();

// Health check endpoint
app.get("/make-server-60c5a920/health", (c) => {
  return c.json({ status: "ok" });
});

// Upload product image (admin only)
app.post("/make-server-60c5a920/upload-image", requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, 400);
    }

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    const supabase = getSupabaseClient();
    const bucketName = 'make-60c5a920-products';
    const fileName = `${Date.now()}_${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      console.log('Error uploading image:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return c.json({ success: true, url: publicUrl });
  } catch (error) {
    console.log('Error in image upload:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete product image (admin only)
app.delete("/make-server-60c5a920/delete-image", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { url } = body;

    if (!url) {
      return c.json({ error: 'No URL provided' }, 400);
    }

    // Extract filename from URL
    const bucketName = 'make-60c5a920-products';
    const urlParts = url.split(`/${bucketName}/`);
    if (urlParts.length < 2) {
      return c.json({ error: 'Invalid URL format' }, 400);
    }
    const fileName = urlParts[1];

    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.log('Error deleting image:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in image deletion:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Secure Admin creation endpoint with master password
app.post("/make-server-60c5a920/admin/create", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, masterPassword } = body;

    if (!email || !password || !name || !masterPassword) {
      return c.json({ error: 'Email, password, name, and master password are required' }, 400);
    }

    // Verify master password
    if (masterPassword !== '085296') {
      return c.json({ error: 'Invalid master password. Access denied.' }, 403);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating admin user:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Error in admin creation:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Customer signup endpoint
app.post("/make-server-60c5a920/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, phone, address } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone: phone || '', address: address || '', role: 'customer' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating customer user:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Error in customer signup:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create new order (no auth required - customer endpoint)
app.post("/make-server-60c5a920/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, address, products, totalAmount } = body;

    if (!name || !email || !phone || !address || !products || !totalAmount) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const orderId = crypto.randomUUID();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const order = {
      id: orderId,
      userId,
      userName: name,
      userEmail: email,
      userPhone: phone,
      userAddress: address,
      products,
      totalAmount,
      status: 'Pending',
      courierDetails: '',
      createdAt,
    };

    const user = {
      id: userId,
      name,
      email,
      phone,
      address,
      orderIds: [orderId],
      createdAt,
    };

    // Store order and user
    await kv.set(`order:${orderId}`, order);
    await kv.set(`user:${userId}`, user);
    
    // Add to order index
    const orderIndex = await kv.get('orderIndex') || [];
    orderIndex.push(orderId);
    await kv.set('orderIndex', orderIndex);

    // Add to user index
    const userIndex = await kv.get('userIndex') || [];
    userIndex.push(userId);
    await kv.set('userIndex', userIndex);

    return c.json({ success: true, orderId, userId });
  } catch (error) {
    console.log('Error creating order:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all orders (admin only)
app.get("/make-server-60c5a920/orders", requireAuth, async (c) => {
  try {
    const orderIndex = await kv.get('orderIndex') || [];
    const orders = [];

    for (const orderId of orderIndex) {
      const order = await kv.get(`order:${orderId}`);
      if (order) {
        orders.push(order);
      }
    }

    // Sort by createdAt descending
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ orders });
  } catch (error) {
    console.log('Error fetching orders:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single order by ID (admin only)
app.get("/make-server-60c5a920/orders/:id", requireAuth, async (c) => {
  try {
    const orderId = c.req.param('id');
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    return c.json({ order });
  } catch (error) {
    console.log('Error fetching order:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update order status (admin only)
app.put("/make-server-60c5a920/orders/:id", requireAuth, async (c) => {
  try {
    const orderId = c.req.param('id');
    const body = await c.req.json();
    const { status, courierDetails } = body;

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const updatedOrder = {
      ...order,
      ...(status && { status }),
      ...(courierDetails !== undefined && { courierDetails }),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, updatedOrder);

    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log('Error updating order:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-60c5a920/users", requireAuth, async (c) => {
  try {
    const userIndex = await kv.get('userIndex') || [];
    const users = [];

    for (const userId of userIndex) {
      const user = await kv.get(`user:${userId}`);
      if (user) {
        users.push(user);
      }
    }

    // Sort by createdAt descending
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ users });
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get dashboard stats (admin only)
app.get("/make-server-60c5a920/stats", requireAuth, async (c) => {
  try {
    const orderIndex = await kv.get('orderIndex') || [];
    const userIndex = await kv.get('userIndex') || [];
    
    const orders = [];
    for (const orderId of orderIndex) {
      const order = await kv.get(`order:${orderId}`);
      if (order) {
        orders.push(order);
      }
    }

    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      'Payment Received': 0,
      'On Delivery': 0,
      Delivered: 0,
    };

    orders.forEach(order => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
    });

    const totalRevenue = orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return c.json({
      totalUsers: userIndex.length,
      totalOrders: orderIndex.length,
      statusCounts,
      totalRevenue,
    });
  } catch (error) {
    console.log('Error fetching stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user profile (requires auth)
app.get("/make-server-60c5a920/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');

    const supabase = getSupabaseClient();
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    const { data: { user }, error } = await anonSupabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Error fetching user profile:', error);
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
        role: user.user_metadata?.role || 'customer',
      }
    });
  } catch (error) {
    console.log('Error fetching profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user orders by email (requires auth)
app.get("/make-server-60c5a920/my-orders", requireAuth, async (c) => {
  try {
    const userEmail = c.get('userEmail');
    
    const orderIndex = await kv.get('orderIndex') || [];
    const userOrders = [];

    for (const orderId of orderIndex) {
      const order = await kv.get(`order:${orderId}`);
      if (order && order.userEmail === userEmail) {
        userOrders.push(order);
      }
    }

    // Sort by createdAt descending
    userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ orders: userOrders });
  } catch (error) {
    console.log('Error fetching user orders:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all products (public endpoint)
app.get("/make-server-60c5a920/products", async (c) => {
  try {
    const productIndex = await kv.get('productIndex') || [];
    const products = [];

    for (const productId of productIndex) {
      const product = await kv.get(`product:${productId}`);
      if (product) {
        products.push(product);
      }
    }

    return c.json({ products });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single product by ID (public endpoint)
app.get("/make-server-60c5a920/products/:id", async (c) => {
  try {
    const productId = c.req.param('id');
    const product = await kv.get(`product:${productId}`);

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({ product });
  } catch (error) {
    console.log('Error fetching product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create new product (admin only)
app.post("/make-server-60c5a920/products", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { id, name, category, type, sizes, images, description, ingredients, inStock } = body;

    if (!id || !name || !category || !type || !sizes) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate images array (max 5)
    if (images && images.length > 5) {
      return c.json({ error: 'Maximum 5 images allowed' }, 400);
    }

    const product = {
      id,
      name,
      category,
      type,
      sizes,
      images: images || [],
      description: description || '',
      ingredients: ingredients || [],
      inStock: inStock !== undefined ? inStock : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`product:${id}`, product);

    // Add to product index
    const productIndex = await kv.get('productIndex') || [];
    if (!productIndex.includes(id)) {
      productIndex.push(id);
      await kv.set('productIndex', productIndex);
    }

    return c.json({ success: true, product });
  } catch (error) {
    console.log('Error creating product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update product (admin only)
app.put("/make-server-60c5a920/products/:id", requireAuth, async (c) => {
  try {
    const productId = c.req.param('id');
    const body = await c.req.json();
    const { name, category, type, sizes, images, description, ingredients, inStock } = body;

    const existingProduct = await kv.get(`product:${productId}`);
    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Validate images array (max 5)
    if (images && images.length > 5) {
      return c.json({ error: 'Maximum 5 images allowed' }, 400);
    }

    const updatedProduct = {
      ...existingProduct,
      ...(name && { name }),
      ...(category && { category }),
      ...(type && { type }),
      ...(sizes && { sizes }),
      ...(images !== undefined && { images }),
      ...(description !== undefined && { description }),
      ...(ingredients !== undefined && { ingredients }),
      ...(inStock !== undefined && { inStock }),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`product:${productId}`, updatedProduct);

    return c.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log('Error updating product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete product (admin only)
app.delete("/make-server-60c5a920/products/:id", requireAuth, async (c) => {
  try {
    const productId = c.req.param('id');
    
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    await kv.del(`product:${productId}`);

    // Remove from product index
    const productIndex = await kv.get('productIndex') || [];
    const updatedIndex = productIndex.filter((id: string) => id !== productId);
    await kv.set('productIndex', updatedIndex);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);