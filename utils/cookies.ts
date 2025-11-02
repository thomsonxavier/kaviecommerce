import Cookies from 'js-cookie';

// Cookie names
export const COOKIE_NAMES = {
  CART: 'kavis-cart',
  WISHLIST: 'kavis-wishlist',
  USER: 'kavis-user',
  ACCESS_TOKEN: 'kavis-access-token',
  ADMIN_TOKEN: 'kavis-admin-token',
  ADMIN_EMAIL: 'kavis-admin-email',
} as const;

// Cookie options
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
  sameSite: 'strict' as const,
  path: '/',
};

// Cart and Wishlist operations
export const cookieStorage = {
  getItem: (name: string): string | null => {
    try {
      const value = Cookies.get(name);
      return value || null;
    } catch (error) {
      console.error(`Error getting cookie ${name}:`, error);
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      Cookies.set(name, value, COOKIE_OPTIONS);
    } catch (error) {
      console.error(`Error setting cookie ${name}:`, error);
    }
  },

  removeItem: (name: string): void => {
    try {
      Cookies.remove(name, { path: '/' });
    } catch (error) {
      console.error(`Error removing cookie ${name}:`, error);
    }
  },
};

// Admin token operations
export const adminCookieStorage = {
  getAdminToken: (): string | null => {
    try {
      const token = Cookies.get(COOKIE_NAMES.ADMIN_TOKEN);
      return token || null;
    } catch (error) {
      console.error('Error getting admin token:', error);
      return null;
    }
  },

  setAdminToken: (token: string): void => {
    try {
      Cookies.set(COOKIE_NAMES.ADMIN_TOKEN, token, {
        ...COOKIE_OPTIONS,
        expires: 7, // 7 days for admin sessions
      });
    } catch (error) {
      console.error('Error setting admin token:', error);
    }
  },

  removeAdminToken: (): void => {
    try {
      Cookies.remove(COOKIE_NAMES.ADMIN_TOKEN, { path: '/' });
    } catch (error) {
      console.error('Error removing admin token:', error);
    }
  },

  getAdminEmail: (): string | null => {
    try {
      const email = Cookies.get(COOKIE_NAMES.ADMIN_EMAIL);
      return email || null;
    } catch (error) {
      console.error('Error getting admin email:', error);
      return null;
    }
  },

  setAdminEmail: (email: string): void => {
    try {
      Cookies.set(COOKIE_NAMES.ADMIN_EMAIL, email, {
        ...COOKIE_OPTIONS,
        expires: 7,
      });
    } catch (error) {
      console.error('Error setting admin email:', error);
    }
  },

  removeAdminEmail: (): void => {
    try {
      Cookies.remove(COOKIE_NAMES.ADMIN_EMAIL, { path: '/' });
    } catch (error) {
      console.error('Error removing admin email:', error);
    }
  },

  clearAllAdminData: (): void => {
    adminCookieStorage.removeAdminToken();
    adminCookieStorage.removeAdminEmail();
  },
};

