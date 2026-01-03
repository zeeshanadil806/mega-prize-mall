"use client";

import { useState, useEffect, useCallback } from "react";
import UsersTable from "./UsersTable";
import UserEditDialog from "./UserEditDialog";
import ManagePointsDialog from "./ManagePointsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  phone?: string;
  totalReferrals: number;
  createdAt: string;
  updatedAt: string;
}

export default function UsersClient() {
  // State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalUsers: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter state
  const [filters, setFilters] = useState({
    role: null as string | null,
    search: null as string | null,
    sortBy: "createdAt",
    sortOrder: "desc" as string,
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.role && { role: filters.role }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data.users);
        console.log(result)
        setPagination(result.data.pagination);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Handle filter change
  const handleFilterChange = (newFilters: {
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      ...(newFilters.search !== undefined
        ? { search: newFilters.search || null }
        : {}),
      ...(newFilters.role !== undefined
        ? { role: newFilters.role || null }
        : {}),
    }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  // Handle edit user
  const handleEditUser = async (
    userId: string,
    updates: { role?: string; name?: string; phone?: string }
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, ...updates } : user
          )
        );
        return true;
      } else {
        toast.error(result.error || "Failed to update user");
        return false;
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
      return false;
    }
  };

  // Handle points update
  const handlePointsUpdate = async (
    userId: string,
    action: "add" | "deduct" | "set",
    points: number,
    reason: string
  ) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, points, reason }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, points: result.data.newPoints }
              : user
          )
        );
        return true;
      } else {
        toast.error(result.error || "Failed to update points");
        return false;
      }
    } catch (error) {
      console.error("Error updating points:", error);
      toast.error("Failed to update points");
      return false;
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setUsers((prev) => prev.filter((user) => user._id !== userId));
        toast.success("User deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  // Export users
  const handleExportUsers = async () => {
    try {
      const response = await fetch(
        "/api/admin/users?limit=1000&sortBy=createdAt&sortOrder=desc"
      );
      const result = await response.json();

      if (result.success) {
        const users = result.data.users;
        const csv = [
          [
            "ID",
            "Name",
            "Email",
            "Phone",
            "Role",
            "Points",
            "Referrals",
            "Joined Date",
          ],
          ...users.map((user: UserData) => [
            user._id,
            user.name,
            user.email,
            user.phone || "",
            user.role,
            user.points,
            user.totalReferrals,
            new Date(user.createdAt).toLocaleDateString(),
          ]),
        ]
          .map((row) =>
            row.map((cell: string | number) => `"${cell}"`).join(",")
          )
          .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Users exported successfully");
      } else {
        toast.error("Failed to export users");
      }
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users");
    }
  };
console.log(users)
  // Stats
  const totalUsers = pagination.totalUsers;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalCustomers = users.filter((u) => u.role === "customer").length;
  const totalSupport = users.filter((u) => u.role === "support").length;
  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users, their roles, points, and referral activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleExportUsers}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
            <div className="text-sm text-gray-500 mt-2">
              <div className="flex justify-between">
                <span>Admins:</span>
                <span className="font-medium">{totalAdmins}</span>
              </div>
              <div className="flex justify-between">
                <span>Customers:</span>
                <span className="font-medium">{totalCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span>Support:</span>
                <span className="font-medium">{totalSupport}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Points
            </CardTitle>
            <div className="h-4 w-4 bg-linear-to-br from-[#EAB75F] to-[#A43875] rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Total value: Rs {(totalPoints * 0.1).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {users.reduce((sum, user) => sum + user.totalReferrals, 0)}
            </div>
            <div className="text-sm text-gray-500">
              Users who referred others
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recent Activity
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {users.length > 0
                ? new Date(
                    Math.max(
                      ...users.map((u) => new Date(u.updatedAt).getTime())
                    )
                  ).toLocaleDateString("en-PK", {
                    month: "short",
                    day: "numeric",
                  })
                : "--"}
            </div>
            <div className="text-sm text-gray-500">Last updated</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {loading && users.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C2C78] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <UsersTable
              users={users}
              pagination={pagination}
              filters={filters}
              onPageChange={handlePageChange}
              onFilterChange={handleFilterChange}
              onViewUser={() => {
                // Navigate to user details page or open modal
                toast.info("View user details - Feature coming soon");
              }}
              onEditUser={(user) => {
                setSelectedUser(user);
                setEditDialogOpen(true);
              }}
              onManagePoints={(user) => {
                setSelectedUser(user);
                setPointsDialogOpen(true);
              }}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UserEditDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={async (id, updates) => {
          await handleEditUser(id, updates);
        }}
      />

      <ManagePointsDialog
        user={selectedUser}
        open={pointsDialogOpen}
        onOpenChange={setPointsDialogOpen}
        onPointsUpdate={async (userId, action, points, reason) => {
          await handlePointsUpdate(userId, action, points, reason);
        }}
      />
    </div>
  );
}
