"use client";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Coins,
  DollarSign,
  Calendar,
  TrendingUp,
  Scale,
  Phone,
  Mail,
} from "lucide-react";

const GoldLoanDetails = ({ loan, onClose }) => {
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

  const calculateLTV = () => {
    return (
      (loan.loanAmount / loan.collateralDetails.marketValue) *
      100
    ).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Loan Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{loan.loanNumber}</h2>
          <p className="text-muted-foreground">Gold Loan Details</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(loan.status)}
        </div>
      </div>

      {/* Customer and Loan Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{loan.customer.name}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {loan.customer.mobile}
              </div>
              {loan.customer.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  {loan.customer.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Loan Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Disbursed Date:</span>
              <span>{new Date(loan.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maturity Date:</span>
              <span>{new Date(loan.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tenure:</span>
              <span>{loan.tenure} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span>{loan.interestRate}% p.a.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collateral Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="h-5 w-5 mr-2" />
            Collateral Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">
                  {loan.collateralDetails.collateralType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight:</span>
                <span>{loan.collateralDetails.weight}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purity:</span>
                <span>{loan.collateralDetails.purity}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Value:</span>
                <span className="font-semibold">
                  ₹{loan.collateralDetails.marketValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LTV Ratio:</span>
                <span className="font-medium">{calculateLTV()}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{loan.loanAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Principal amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{loan.remainingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Remaining balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{loan.totalRepaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Amount paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly EMI</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{loan.emi.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Repayment History */}
      <Card>
        <CardHeader>
          <CardTitle>Repayment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loan.repayments && loan.repayments.length > 0 ? (
            <div className="space-y-3">
              {loan.repayments.map((repayment, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      ₹{repayment.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {repayment.type} -{" "}
                      {new Date(repayment.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Balance</div>
                    <div className="font-medium">
                      ₹{repayment.remainingBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No repayment history available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Due Date */}
      {loan.nextDueDate && loan.status === "active" && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
              <Calendar className="h-5 w-5 mr-2" />
              Next Payment Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">
                  {new Date(loan.nextDueDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Due date</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  ₹{loan.emi.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">EMI amount</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoldLoanDetails;
