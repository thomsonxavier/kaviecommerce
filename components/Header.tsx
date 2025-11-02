"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Leaf, ShoppingCart,  User, Menu, X, LogOut } from "lucide-react";
import { useStore } from "../store/useStore";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function Header() {
  const router = useRouter();
  const { cart,  user, setUser, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);


         // Check for existing session on mount
         useEffect(() => {
           const checkSession = async () => {
             if (!user && typeof window !== "undefined") {
               try {
                 const supabaseUrl = `https://${projectId}.supabase.co`;
                 const supabase = createClient(supabaseUrl, publicAnonKey);

                 const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                 if (sessionError) {
                   console.error("Session error:", sessionError);
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
                     }
                   } catch (error) {
                     console.error("Error fetching profile:", error);
                   }
                 }
               } catch (error) {
                 console.error("Error in checkSession:", error);
               }
             }
           };

           checkSession();
           // eslint-disable-next-line react-hooks/exhaustive-deps
         }, []);

  const handleLogout = async () => {
    try {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      const supabase = createClient(supabaseUrl, publicAnonKey);
      await supabase.auth.signOut();
      logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Top Notice Bar */}
      <div className="bg-[#3C6E47] text-white text-center py-2 text-sm px-4">
        Free Shipping Above ₹600 Order | Get Premium Pay Optimum
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-[#3C6E47] rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg text-[#222222]">Kavis Naturals</h1>
                <p className="text-xs text-gray-500">Pure & Natural Care</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => router.push("/")}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => router.push("/shop")}>
                Shop
              </Button>
              <Button variant="ghost" onClick={() => router.push("/returns")}>Returns & Refunds</Button>
              <Button variant="ghost" onClick={() => router.push("/contactus")}>Contact Us</Button>
            </nav>

            {/* Search & Icons */}
            <div className="flex items-center gap-3">
              {/* <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg w-64">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div> */}

              {/* <Button variant="ghost" size="icon" className="hidden md:flex">
                <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              </Button> */}

                     {user ? (
                       <div className="relative hidden md:block" style={{ zIndex: 1000 }}>
                         <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                           <DropdownMenuTrigger asChild>
                             <Button
                               variant="ghost"
                               size="icon"
                               style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                             >
                               <User className="w-5 h-5" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent
                             align="end"
                             className="w-64"
                             onEscapeKeyDown={() => {
                               setDropdownOpen(false);
                             }}
                           >
                    <DropdownMenuLabel>
                      <div>
                        <p className="text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 font-normal">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                             <DropdownMenuItem
                               onClick={() => {
                                 setDropdownOpen(false);
                                 router.push("/account");
                               }}
                             >
                               <User className="w-4 h-4 mr-2" />
                               My Account
                             </DropdownMenuItem>
                             <DropdownMenuItem
                               onClick={() => {
                                 setDropdownOpen(false);
                                 handleLogout();
                               }}
                               className="text-red-600 focus:text-red-600"
                             >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => router.push("/login")}
                >
                  <User className="w-5 h-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => router.push("/checkout")}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#3C6E47] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => {
                router.push("/");
                setMobileMenuOpen(false);
              }}>
                Home
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => {
                router.push("/shop");
                setMobileMenuOpen(false);
              }}>
                Shop
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => {
                router.push("/returns");
                setMobileMenuOpen(false);
              }}>
                Returns & Refunds
              </Button>
              <Button variant="ghost" onClick={() => {
                router.push("/contactus");
                setMobileMenuOpen(false);
              }} className="w-full justify-start">
                Contact Us
              </Button>
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push("/account");
                      setMobileMenuOpen(false);
                    }}
                  >
                    My Account
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
