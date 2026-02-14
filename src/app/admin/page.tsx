"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building,
  Compass,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Ban,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice, formatDate } from "@/lib/utils";

type AdminTab = "overview" | "properties" | "tours" | "bookings" | "hosts";

// Demo data
const stats = {
  totalProperties: 45,
  totalTours: 28,
  totalBookings: 156,
  totalRevenue: 125000,
  pendingHosts: 5,
  activeUsers: 320,
};

const demoHosts = [
  {
    id: "1",
    name: "Ahmed Rahman",
    email: "ahmed@example.com",
    hostType: "APARTMENT",
    companyName: "Gulshan Properties",
    status: "APPROVED",
    totalRevenue: 45000,
    properties: 3,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Karim Hassan",
    email: "karim@example.com",
    hostType: "TOUR_OPERATOR",
    companyName: "Bangladesh Eco Tours",
    status: "PENDING",
    totalRevenue: 0,
    properties: 0,
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    name: "Fatima Begum",
    email: "fatima@example.com",
    hostType: "HOTEL",
    companyName: "Cox's Bazar Resorts",
    status: "APPROVED",
    totalRevenue: 78000,
    properties: 5,
    createdAt: new Date("2023-11-10"),
  },
  {
    id: "4",
    name: "Rahim Uddin",
    email: "rahim@example.com",
    hostType: "RESORT",
    companyName: "Sylhet Hill Resorts",
    status: "SUSPENDED",
    totalRevenue: 12000,
    properties: 2,
    createdAt: new Date("2024-01-05"),
  },
];

const demoBookings = [
  {
    id: "1",
    guest: "John Doe",
    type: "Property",
    name: "Luxury Apartment in Gulshan",
    dates: "Mar 15-18, 2024",
    amount: 495,
    status: "CONFIRMED",
  },
  {
    id: "2",
    guest: "Jane Smith",
    type: "Tour",
    name: "Sundarbans Adventure",
    dates: "Apr 10, 2024",
    amount: 1155,
    status: "PENDING",
  },
  {
    id: "3",
    guest: "Mike Johnson",
    type: "Property",
    name: "Seaside Resort Cox's Bazar",
    dates: "Feb 1-4, 2024",
    amount: 825,
    status: "COMPLETED",
  },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }

    // Check if user is admin
    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [status, session, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredHosts = demoHosts.filter((host) => {
    const matchesSearch =
      host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || host.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-slate-600">Manage properties, tours, bookings, and hosts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "overview" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("overview")}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === "properties" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("properties")}
                  >
                    <Building className="h-4 w-4 mr-3" />
                    Properties
                    <Badge variant="outline" className="ml-auto">
                      {stats.totalProperties}
                    </Badge>
                  </Button>
                  <Button
                    variant={activeTab === "tours" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("tours")}
                  >
                    <Compass className="h-4 w-4 mr-3" />
                    Tours
                    <Badge variant="outline" className="ml-auto">
                      {stats.totalTours}
                    </Badge>
                  </Button>
                  <Button
                    variant={activeTab === "bookings" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    Bookings
                    <Badge variant="outline" className="ml-auto">
                      {stats.totalBookings}
                    </Badge>
                  </Button>
                  <Button
                    variant={activeTab === "hosts" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("hosts")}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Hosts
                    {stats.pendingHosts > 0 && (
                      <Badge className="ml-auto bg-yellow-500">
                        {stats.pendingHosts}
                      </Badge>
                    )}
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Properties</p>
                          <p className="text-xl font-bold">{stats.totalProperties}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Compass className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Tours</p>
                          <p className="text-xl font-bold">{stats.totalTours}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Bookings</p>
                          <p className="text-xl font-bold">{stats.totalBookings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Revenue</p>
                          <p className="text-xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {demoBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{booking.guest}</p>
                            <p className="text-sm text-slate-500">
                              {booking.type}: {booking.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={statusColors[booking.status]}>
                              {booking.status}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              {formatPrice(booking.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Hosts */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Pending Host Applications</CardTitle>
                    <Badge className="bg-yellow-500">{stats.pendingHosts} pending</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {demoHosts
                        .filter((h) => h.status === "PENDING")
                        .map((host) => (
                          <div
                            key={host.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{host.name}</p>
                              <p className="text-sm text-slate-500">
                                {host.hostType} - {host.companyName}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive">
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Hosts Tab */}
            {activeTab === "hosts" && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Manage Hosts</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search hosts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-slate-500">
                            Host
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-slate-500">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-slate-500">
                            Company
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-slate-500">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-slate-500">
                            Revenue
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHosts.map((host) => (
                          <tr key={host.id} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{host.name}</p>
                                <p className="text-sm text-slate-500">{host.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{host.hostType}</Badge>
                            </td>
                            <td className="py-3 px-4">{host.companyName}</td>
                            <td className="py-3 px-4">
                              <Badge className={statusColors[host.status]}>
                                {host.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {formatPrice(host.totalRevenue)}
                            </td>
                            <td className="py-3 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {host.status === "PENDING" && (
                                    <>
                                      <DropdownMenuItem className="text-green-600">
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {host.status === "APPROVED" && (
                                    <DropdownMenuItem className="text-orange-600">
                                      <Ban className="h-4 w-4 mr-2" />
                                      Suspend
                                    </DropdownMenuItem>
                                  )}
                                  {host.status === "SUSPENDED" && (
                                    <DropdownMenuItem className="text-green-600">
                                      <Check className="h-4 w-4 mr-2" />
                                      Reactivate
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Properties Tab */}
            {activeTab === "properties" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-center py-12">
                    Property management interface - Coming soon
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tours Tab */}
            {activeTab === "tours" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Tours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-center py-12">
                    Tour management interface - Coming soon
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-center py-12">
                    Booking management interface - Coming soon
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}