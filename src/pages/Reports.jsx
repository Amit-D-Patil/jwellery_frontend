import React from "react";
import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  Package,
  CreditCard,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { DatePickerWithRange } from "../components/ui/date-range-picker";
import {
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
import api from "../services/api";

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("sales");
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports", {
        params: {
          type: reportType,
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString(),
        },
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      // Mock data for demo
      setReportData({
        sales: {
          summary: {
            totalRevenue: 450000,
            totalOrders: 125,
            averageOrderValue: 3600,
            growth: 12.5,
          },
          chartData: [
            { month: "Jan", revenue: 65000, orders: 18 },
            { month: "Feb", revenue: 78000, orders: 22 },
            { month: "Mar", revenue: 85000, orders: 25 },
            { month: "Apr", revenue: 92000, orders: 28 },
            { month: "May", revenue: 88000, orders: 24 },
            { month: "Jun", revenue: 95000, orders: 32 },
          ],
          topProducts: [
            { name: "Gold Chain 22K", sales: 45, revenue: 135000 },
            { name: "Diamond Ring", sales: 28, revenue: 168000 },
            { name: "Silver Bracelet", sales: 52, revenue: 78000 },
          ],
        },
        inventory: {
          summary: {
            totalItems: 245,
            lowStockItems: 12,
            outOfStockItems: 3,
            totalValue: 2850000,
          },
          categoryData: [
            { name: "Gold", value: 45, stock: 1250000 },
            { name: "Silver", value: 35, stock: 450000 },
            { name: "Diamond", value: 15, stock: 950000 },
            { name: "Platinum", value: 5, stock: 200000 },
          ],
        },
        customers: {
          summary: {
            totalCustomers: 156,
            newCustomers: 23,
            activeCustomers: 89,
            customerRetention: 78.5,
          },
          segmentData: [
            { segment: "Premium", count: 45, revenue: 285000 },
            { segment: "Regular", count: 78, revenue: 125000 },
            { segment: "New", count: 33, revenue: 40000 },
          ],
        },
        loans: {
          summary: {
            totalLoans: 45,
            activeLoans: 32,
            totalAmount: 1250000,
            overdueLoans: 3,
          },
          statusData: [
            { status: "Active", count: 32, amount: 850000 },
            { status: "Closed", count: 10, amount: 300000 },
            { status: "Overdue", count: 3, amount: 100000 },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    try {
      const response = await api.get("/reports/download", {
        params: {
          type: reportType,
          format,
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString(),
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading report:", error);
      // Mock download for demo
      alert(
        `${reportType} report would be downloaded as ${format.toUpperCase()}`
      );
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{reportData.sales?.summary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{reportData.sales?.summary.growth}% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.sales?.summary.totalOrders}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{reportData.sales?.summary.averageOrderValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.sales?.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.sales?.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.sales} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ₹{product.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.inventory?.summary.totalItems}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reportData.inventory?.summary.lowStockItems}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reportData.inventory?.summary.outOfStockItems}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{reportData.inventory?.summary.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.inventory?.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportData.inventory?.categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (reportType) {
      case "sales":
        return renderSalesReport();
      case "inventory":
        return renderInventoryReport();
      case "customers":
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Customer reports coming soon...
            </p>
          </div>
        );
      case "loans":
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loan reports coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => downloadReport("pdf")} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={() => downloadReport("excel")} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales Report</SelectItem>
            <SelectItem value="inventory">Inventory Report</SelectItem>
            <SelectItem value="customers">Customer Report</SelectItem>
            <SelectItem value="loans">Loan Report</SelectItem>
          </SelectContent>
        </Select>

        <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default Reports;
