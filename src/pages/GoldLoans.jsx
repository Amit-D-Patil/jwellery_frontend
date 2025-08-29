import React from "react";
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
  DollarSign,
  Coins,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { goldLoanAPI } from "../services/api";
import toast from "react-hot-toast";
import GoldLoanForm from "../components/gold-loans/GoldLoanForm";
import GoldLoanDetails from "../components/gold-loans/GoldLoanDetails";
import RepaymentForm from "../components/gold-loans/RepaymentForm";

const GoldLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showRepayment, setShowRepayment] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await goldLoanAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setLoans(response.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch gold loans");
      // Mock data for demo
      setLoans([
        {
          _id: "1",
          loanNumber: "GL-2024-001",
          customer: {
            _id: "c1",
            name: "John Doe",
            phone: "+91 9876543210",
          },
          collateral: {
            type: "Gold Jewelry",
            weight: 50.5,
            purity: "22K",
            marketValue: 350000,
          },
          loanAmount: 280000,
          interestRate: 12,
          tenure: 12,
          emi: 24833,
          status: "active",
          disbursedDate: "2024-01-15",
          maturityDate: "2025-01-15",
          remainingAmount: 250000,
          totalRepaid: 30000,
          nextDueDate: "2024-04-15",
        },
        {
          _id: "2",
          loanNumber: "GL-2024-002",
          customer: {
            _id: "c2",
            name: "Jane Smith",
            phone: "+91 9876543211",
          },
          collateral: {
            type: "Gold Coins",
            weight: 25.0,
            purity: "24K",
            marketValue: 200000,
          },
          loanAmount: 160000,
          interestRate: 11.5,
          tenure: 6,
          emi: 28267,
          status: "closed",
          disbursedDate: "2024-02-01",
          maturityDate: "2024-08-01",
          remainingAmount: 0,
          totalRepaid: 169600,
          closedDate: "2024-07-28",
        },
        {
          _id: "3",
          loanNumber: "GL-2024-003",
          customer: {
            _id: "c3",
            name: "Mike Johnson",
            phone: "+91 9876543212",
          },
          collateral: {
            type: "Gold Ornaments",
            weight: 75.2,
            purity: "18K",
            marketValue: 420000,
          },
          loanAmount: 336000,
          interestRate: 13,
          tenure: 18,
          emi: 21456,
          status: "renewed",
          disbursedDate: "2023-12-01",
          maturityDate: "2025-06-01",
          remainingAmount: 298000,
          totalRepaid: 38000,
          nextDueDate: "2024-04-01",
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (loanId) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) return;

    try {
      await goldLoanAPI.delete(loanId);
      toast.success("Loan deleted successfully");
      fetchLoans();
    } catch (error) {
      toast.error("Failed to delete loan");
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setShowForm(true);
  };

  const handleView = async (loanId) => {
    try {
      const response = await goldLoanAPI.getById(loanId);
      setSelectedLoan(response.data);
      setShowDetails(true);
    } catch (error) {
      toast.error("Failed to fetch loan details");
      // Mock detailed data for demo
      const mockLoan = loans.find((loan) => loan._id === loanId);
      if (mockLoan) {
        setSelectedLoan({
          ...mockLoan,
          repaymentHistory: [
            { date: "2024-03-15", amount: 15000, type: "EMI", balance: 265000 },
            { date: "2024-02-15", amount: 15000, type: "EMI", balance: 280000 },
          ],
        });
        setShowDetails(true);
      }
    }
  };

  const handleRepayment = (loan) => {
    setSelectedLoan(loan);
    setShowRepayment(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLoan(null);
    fetchLoans();
  };

  const handleRepaymentSuccess = () => {
    setShowRepayment(false);
    setSelectedLoan(null);
    fetchLoans();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "closed":
        return (
          <Badge variant="default" className="bg-green-500">
            Closed
          </Badge>
        );
      case "renewed":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            Renewed
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customer.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
  const totalOutstanding = loans
    .filter((loan) => loan.status === "active" || loan.status === "renewed")
    .reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const activeLoans = loans.filter(
    (loan) => loan.status === "active" || loan.status === "renewed"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gold Loans</h1>
          <p className="text-muted-foreground">
            Manage gold loan applications and repayments
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Loan
        </Button>
      </div>

      {/* Loan Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loans.length}</div>
            <p className="text-xs text-muted-foreground">All time loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Disbursed
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalLoanAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total loan amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pending repayments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find loans by number, customer name, or phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loan Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="renewed">Renewed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan List</CardTitle>
          <CardDescription>
            {filteredLoans.length} loan{filteredLoans.length !== 1 ? "s" : ""}{" "}
            found
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
                    <TableHead>Loan #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Collateral</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell className="font-medium">
                        {loan.loanNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {loan.customer.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {loan.customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{loan.collateralDetails.collateralType}</div>
                          <div className="text-muted-foreground">
                            {loan.collateralDetails.weight}g (
                            {loan.collateralDetails.purity})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            ₹{loan.loanAmount.toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">
                            {loan.interestRate}% p.a.
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ₹{loan.remainingAmount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        {loan.nextPaymentDue && loan.status === "active" ? (
                          <div className="text-sm">
                            <div>
                              {new Date(
                                loan.nextPaymentDue
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-muted-foreground">
                              ₹{loan.emi.toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(loan._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(loan.status === "active" ||
                            loan.status === "renewed") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRepayment(loan)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(loan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(loan._id)}
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

      {/* Gold Loan Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLoan ? "Edit Gold Loan" : "Create New Gold Loan"}
            </DialogTitle>
            <DialogDescription>
              {editingLoan
                ? "Update gold loan information"
                : "Create a new gold loan application"}
            </DialogDescription>
          </DialogHeader>
          <GoldLoanForm
            loan={editingLoan}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingLoan(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Gold Loan Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gold Loan Details</DialogTitle>
            <DialogDescription>
              View detailed gold loan information and repayment history
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <GoldLoanDetails
              loan={selectedLoan}
              onClose={() => setShowDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Repayment Form Dialog */}
      <Dialog open={showRepayment} onOpenChange={setShowRepayment}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Repayment</DialogTitle>
            <DialogDescription>
              Record a loan repayment for {selectedLoan?.customer?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <RepaymentForm
              loan={selectedLoan}
              onSuccess={handleRepaymentSuccess}
              onCancel={() => {
                setShowRepayment(false);
                setSelectedLoan(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoldLoans;
