import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false
  }
};

export default function HiddenAdminPage() {
  return <AdminDashboard />;
}
