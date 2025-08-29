"use client";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Download, Phone, Mail, MapPin, Calendar } from "lucide-react";

const InvoiceDetails = ({ invoice, onClose, onDownload }) => {
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
  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
          <p className="text-muted-foreground">Invoice Details</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(invoice.status)}
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Customer and Invoice Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{invoice.customer.name}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {invoice.customer.mobile}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                {invoice.customer.email}
              </div>
              {invoice.customer.address && (
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  {invoice.customer.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice Date:</span>
              <span>{new Date(invoice.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date:</span>
              <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <Badge variant="outline" className="capitalize">
                {invoice.paymentMethod}
              </Badge>
            </div>
            {invoice.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="text-sm mt-1">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoice.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">
                    {item.itemId?.name || item.itemId || "Unknown Item"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × ₹
                    {((item.pricePerGram || 0) * (item.weight || 0) +
                      (item.makingCharge || 0)) *
                      item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ₹{item.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (3%):</span>
              <span>₹{invoice.gstAmount.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount:</span>
              <span>₹{invoice.totalAmount.toLocaleString()}</span>
            </div>

            {/* Payment Status Details */}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-green-600">
                <span>Amount Paid:</span>
                <span>₹{(invoice.paidAmount || 0).toLocaleString()}</span>
              </div>

              {invoice.dueAmount > 0 && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Balance Due:</span>
                  <span>₹{invoice.dueAmount.toLocaleString()}</span>
                </div>
              )}

              {invoice.status === "paid" && invoice.dueAmount === 0 && (
                <div className="flex justify-center">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Fully Paid
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Current Status:</span>
                {getStatusBadge(invoice.status)}
              </div>

              {invoice.status === "pending" && (
                <p className="text-sm text-muted-foreground">
                  Payment is due by{" "}
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              )}

              {invoice.status === "partial" && (
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    Partial payment received: ₹
                    {(invoice.paidAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-red-600">
                    Remaining balance: ₹{invoice.dueAmount.toLocaleString()}
                  </p>
                </div>
              )}

              {invoice.status === "paid" && (
                <p className="text-sm text-green-600">
                  Payment completed successfully
                </p>
              )}

              {invoice.status === "overdue" && (
                <div className="text-sm space-y-1">
                  <p className="text-red-600">
                    Payment is overdue since{" "}
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">
                    Outstanding amount: ₹{invoice.dueAmount.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Payment progress indicator */}
              {invoice.status !== "paid" && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Payment Progress</span>
                    <span>
                      {Math.round(
                        ((invoice.paidAmount || 0) / invoice.totalAmount) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((invoice.paidAmount || 0) / invoice.totalAmount) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetails;
