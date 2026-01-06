// src/app/admin/support/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SupportAccountsClient from "@/components/admin/support/SupportAccountsClient";
import { connectToDatabase } from "@/lib/mongodb";

export default async function AdminSupportPage(props: {
  // 2. Update Type: searchParams is now a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {  const session = await auth();

  // Check authentication and admin role
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }
// 3. Await the searchParams before accessing properties
  const searchParams = await props.searchParams;
  // Extract search params
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const limit = 20;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "all";
  const isActive = status === 'active' ? true : status === 'inactive' ? false : undefined;

  // Fetch data server-side
  await connectToDatabase();
  interface SupportUserQuery {
  role: "support";
  isActive?: boolean;
  $or?: Array<
    | { name: { $regex: string; $options: string } }
    | { email: { $regex: string; $options: string } }
    | { phone: { $regex: string; $options: string } }
  >;
}
  // Build query for support accounts only
  const query: SupportUserQuery = { role: "support" };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  // Fetch data
  const [supportAccounts, total] = await Promise.all([
    (await import("@/models/User")).UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    (await import("@/models/User")).UserModel.countDocuments(query),
  ]);

  // Format response
  const formattedAccounts = supportAccounts.map((account) => ({
    id: account._id.toString(),
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role,
    isActive: account.isActive !== false,
    points: account.points || 0,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    lastLogin: account.lastLogin,
  }));

  const initialData = {
    accounts: formattedAccounts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        <main className="p-6">
          <SupportAccountsClient initialData={initialData} />
        </main>
      </div>
    </div>
  );
}