import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  DollarSign,
} from "lucide-react";
import { invoiceAPI } from "../services/api";
import toast from "react-hot-toast";
import InvoiceForm from "../components/invoices/InvoiceForm";
import InvoiceDetails from "../components/invoices/InvoiceDetails";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setInvoices(response.data.invoices);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error("Failed to fetch invoices");
      // Mock data for demo - updated to match new schema
      setInvoices([
        {
          _id: "1",
          invoiceNumber: "INV-2024-001",
          customer: {
            _id: "c1",
            name: "John Doe",
            email: "john@example.com",
            phone: "+91 9876543210",
          },
          items: [
            {
              itemId: {
                _id: "i1",
                name: "Gold Chain 22K",
                price: 85000,
              },
              quantity: 1,
              unitPrice: 85000,
              total: 85000,
            },
          ],
          subtotal: 85000,
          gstAmount: 2550,
          totalPrice: 87550,
          paidAmount: 87550,
          dueAmount: 0,
          status: "paid",
          paymentMethod: "cash",
          createdAt: "2024-03-15",
          dueDate: "2024-03-30",
        },
        {
          _id: "2",
          invoiceNumber: "INV-2024-002",
          customer: {
            _id: "c2",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+91 9876543211",
          },
          items: [
            {
              itemId: {
                _id: "i2",
                name: "Diamond Ring",
                price: 125000,
              },
              quantity: 1,
              unitPrice: 125000,
              total: 125000,
            },
            {
              itemId: {
                _id: "i3",
                name: "Silver Bracelet",
                price: 8500,
              },
              quantity: 2,
              unitPrice: 8500,
              total: 17000,
            },
          ],
          subtotal: 142000,
          gstAmount: 4260,
          totalPrice: 146260,
          paidAmount: 0,
          dueAmount: 146260,
          status: "pending",
          paymentMethod: "card",
          createdAt: "2024-03-10",
          dueDate: "2024-03-25",
        },
        {
          _id: "3",
          invoiceNumber: "INV-2024-003",
          customer: {
            _id: "c3",
            name: "Mike Johnson",
            email: "mike@example.com",
            phone: "+91 9876543212",
          },
          items: [
            {
              itemId: {
                _id: "i4",
                name: "Gold Earrings",
                price: 45000,
              },
              quantity: 1,
              unitPrice: 45000,
              total: 45000,
            },
          ],
          subtotal: 45000,
          gstAmount: 1350,
          totalPrice: 46350,
          paidAmount: 20000,
          dueAmount: 26350,
          status: "partial",
          paymentMethod: "upi",
          createdAt: "2024-03-05",
          dueDate: "2024-03-20",
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;

    try {
      await invoiceAPI.delete(invoiceId);
      toast.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleView = async (invoiceId) => {
    try {
      const response = await invoiceAPI.getById(invoiceId);
      setSelectedInvoice(response.data);
      setShowDetails(true);
    } catch (error) {
      toast.error("Failed to fetch invoice details");
      // Mock detailed data for demo
      const mockInvoice = invoices.find((inv) => inv._id === invoiceId);
      if (mockInvoice) {
        setSelectedInvoice(mockInvoice);
        setShowDetails(true);
      }
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const response = await invoiceAPI.downloadPDF(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const invoice = invoices.find((inv) => inv._id === invoiceId);
      link.setAttribute(
        "download",
        `${invoice?.invoiceNumber || invoiceId}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingInvoice(null);
    fetchInvoices();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500">
            Paid
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "partial":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Partial
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber == searchTerm.toLowerCase() ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.mobile.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate revenue based on actual paid amounts
  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + (invoice.paidAmount || 0),
    0
  );

  // Calculate pending amount from dueAmount field
  const pendingAmount = invoices.reduce(
    (sum, invoice) => sum + (invoice.dueAmount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your sales invoices and payments
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">All time invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find invoices by number, customer name, or phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice
            {filteredInvoices.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invoice.customer.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {new Date(invoice.date).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">
                            Due:{" "}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            ₹{invoice.totalAmount.toLocaleString()}
                          </div>
                          {invoice.status === "partial" && (
                            <div className="text-muted-foreground">
                              Paid: ₹
                              {(invoice.paidAmount || 0).toLocaleString()}
                            </div>
                          )}
                          {invoice.dueAmount > 0 && (
                            <div className="text-red-600 text-xs">
                              Due: ₹{invoice.dueAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {invoice.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(invoice._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice._id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
            </DialogTitle>
            <DialogDescription>
              {editingInvoice
                ? "Update invoice information"
                : "Create a new sales invoice"}
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            invoice={editingInvoice}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingInvoice(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View detailed invoice information
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceDetails
              invoice={selectedInvoice}
              onClose={() => setShowDetails(false)}
              onDownload={() => handleDownloadPDF(selectedInvoice._id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
