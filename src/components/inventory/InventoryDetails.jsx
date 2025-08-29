import React from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Package,
  DollarSign,
  Calendar,
  TrendingUp,
  Gem,
  MapPin,
  User,
  FileText,
  Activity,
} from "lucide-react";

const InventoryDetails = ({ item, onClose }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      "in-stock": { label: "In Stock", variant: "default" },
      "low-stock": { label: "Low Stock", variant: "secondary" },
      "out-of-stock": { label: "Out of Stock", variant: "destructive" },
      ordered: { label: "Ordered", variant: "outline" },
    };
    return statusMap[status] || { label: status, variant: "default" };
  };

  const getPurityDisplay = (purity, itemType) => {
    if (itemType === "Gold" || itemType === "Platinum") {
      return `${purity}K`;
    } else if (itemType === "Silver") {
      return `${purity}%`;
    }
    return purity;
  };

  const getTransactionTypeColor = (type) => {
    const typeMap = {
      purchase: "text-blue-600",
      sale: "text-green-600",
      return: "text-orange-600",
      adjustment: "text-purple-600",
    };
    return typeMap[type] || "text-gray-600";
  };

  const statusBadge = getStatusBadge(item.status);
  const profitAmount =
    item.sellingPrice - item.purchasePrice - (item.makingCharges || 0);
  const profitMargin = ((profitAmount / item.purchasePrice) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Item Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="text-muted-foreground">
                {item.itemType} • {item.category}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {item.itemCode}
              </p>
              <Badge variant={statusBadge.variant} className="mt-2">
                {statusBadge.label}
              </Badge>
            </div>
          </div>

          {item.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Item Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight:</span>
                <span>
                  {item.weight} {item.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purity:</span>
                <span>{getPurityDisplay(item.purity, item.itemType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {item.location}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit:</span>
                <span>{item.unit}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Purchase Price
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{item.purchasePrice.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">per {item.unit}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selling Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{item.sellingPrice.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">per {item.unit}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Making Charges
            </CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(item.makingCharges || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">additional cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {profitMargin}%
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{profitAmount.toLocaleString()} profit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.quantity}</div>
            <p className="text-xs text-muted-foreground">
              {item.unit}s available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Level</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.reorderLevel}</div>
            <p className="text-xs text-muted-foreground">minimum stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(item.sellingPrice * item.quantity).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              current inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier and Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {item.supplier?.name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier:</span>
                <span>{item.supplier.name}</span>
              </div>
            )}
            {item.supplier?.contact && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span>{item.supplier.contact}</span>
              </div>
            )}
            {item.supplier?.invoiceNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice No:</span>
                <span className="font-mono">{item.supplier.invoiceNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Added On:</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            {item.updatedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Item Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span>{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item Type:</span>
              <span>{item.itemType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={statusBadge.variant} className="text-xs">
                {statusBadge.label}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Images:</span>
              <span>{item.images?.length || 0} image(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cost:</span>
              <span>
                ₹
                {(
                  (item.purchasePrice + (item.makingCharges || 0)) *
                  item.quantity
                ).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      {item.transactions && item.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.transactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`capitalize font-medium ${getTransactionTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transaction.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        ₹{transaction.price?.toLocaleString() || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.reference || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryDetails;
