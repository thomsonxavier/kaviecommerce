"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "../../../components/AdminNav";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Search, Mail, Phone, MapPin, Package } from "lucide-react";
import { projectId } from "../../../utils/supabase/info";
import { adminCookieStorage } from "../../../utils/cookies";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orderIds: string[];
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = adminCookieStorage.getAdminToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchUsers(token);
  }, [router]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.phone.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-60c5a920/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <AdminNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3C6E47] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
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
          <h1 className="text-3xl text-[#222222]">User Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage all registered customers
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Customers</p>
            <h3 className="text-2xl mt-1">{users.length}</h3>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Showing Results</p>
            <h3 className="text-2xl mt-1">{filteredUsers.length}</h3>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Orders</p>
            <h3 className="text-2xl mt-1">
              {users.reduce((sum, user) => sum + user.orderIds.length, 0)}
            </h3>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="text-sm text-[#222222]">{user.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          {user.phone}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 flex items-start gap-1 max-w-xs">
                          <MapPin className="w-3 h-3 mt-1 flex-shrink-0 text-gray-500" />
                          <span className="line-clamp-2">{user.address}</span>
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#3C6E47] text-white rounded-full text-sm">
                          <Package className="w-3 h-3" />
                          {user.orderIds.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </p>
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
