"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  FileText,
  DollarSign,
  Coins,
  TrendingUp,
  Package,
  AlertTriangle,
} from "lucide-react";
import { dashboardAPI } from "../services/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalInvoices: 0,
    pendingDues: 0,
    goldLoanSummary: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, salesRes, stockRes, loanRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getSalesOverview(),
        dashboardAPI.getStockLevels(),
        dashboardAPI.getLoanRepayments(),
      ]);

      setStats(statsRes.data);
      setSalesData(salesRes.data);
      setStockData(stockRes.data);
      setLoanData(loanRes.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      // Mock data for demo
      setStats({
        totalCustomers: 1250,
        totalInvoices: 3420,
        pendingDues: 125000,
        goldLoanSummary: 850000,
      });
      setSalesData([
        { month: "Jan", sales: 45000 },
        { month: "Feb", sales: 52000 },
        { month: "Mar", sales: 48000 },
        { month: "Apr", sales: 61000 },
        { month: "May", sales: 55000 },
        { month: "Jun", sales: 67000 },
      ]);
      setStockData([
        { name: "Gold Jewelry", value: 45, color: "#FFD700" },
        { name: "Silver Jewelry", value: 30, color: "#C0C0C0" },
        { name: "Diamond Jewelry", value: 15, color: "#B9F2FF" },
        { name: "Gemstone Jewelry", value: 10, color: "#FF6B6B" },
      ]);
      setLoanData([
        { month: "Jan", repayments: 25000 },
        { month: "Feb", repayments: 32000 },
        { month: "Mar", repayments: 28000 },
        { month: "Apr", repayments: 35000 },
        { month: "May", repayments: 30000 },
        { month: "Jun", repayments: 38000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {trend && (
            <span className="text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your jewelry shop management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
          description="Active customers"
          trend="+12% from last month"
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices.toLocaleString()}
          icon={FileText}
          description="All time invoices"
          trend="+8% from last month"
        />
        <StatCard
          title="Pending Dues"
          value={`₹${stats.pendingDues.toLocaleString()}`}
          icon={DollarSign}
          description="Outstanding payments"
        />
        <StatCard
          title="Gold Loans"
          value={`₹${stats.goldLoanSummary.toLocaleString()}`}
          icon={Coins}
          description="Active loan amount"
          trend="+5% from last month"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Overview */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Sales"]}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Stock Distribution</CardTitle>
            <CardDescription>Current inventory breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Stock"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {stockData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    {item.name}
                  </div>
                  <span>{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Repayments */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Repayments</CardTitle>
          <CardDescription>Monthly loan repayment trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={loanData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `₹${value.toLocaleString()}`,
                  "Repayments",
                ]}
              />
              <Line
                type="monotone"
                dataKey="repayments"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <span className="text-sm">Gold Chains (22K)</span>
                <span className="text-sm font-medium text-yellow-600">
                  5 left
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <span className="text-sm">Diamond Rings</span>
                <span className="text-sm font-medium text-yellow-600">
                  3 left
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <span className="text-sm">Silver Bracelets</span>
                <span className="text-sm font-medium text-yellow-600">
                  8 left
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm p-2 border-l-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                New customer "John Doe" registered
              </div>
              <div className="text-sm p-2 border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                Invoice #INV-001234 generated
              </div>
              <div className="text-sm p-2 border-l-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                Gold loan repayment received
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
