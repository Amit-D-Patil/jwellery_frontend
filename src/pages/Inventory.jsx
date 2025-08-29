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
  Package,
  AlertTriangle,
} from "lucide-react";
import { inventoryAPI } from "../services/api";
import toast from "react-hot-toast";
import InventoryForm from "../components/inventory/InventoryForm";
import InventoryDetails from "../components/inventory/InventoryDetails";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const categories = ["Ornament", "Bullion", "Loose Stone", "Raw Material"];
  const itemTypes = ["Gold", "Silver", "Diamond", "Platinum", "Other"];
  const units = ["gram", "carat", "piece"];
  const locations = ["Main Store", "Display Case", "Vault", "Workshop"];

  useEffect(() => {
    fetchInventory();
  }, [currentPage, searchTerm, categoryFilter, itemTypeFilter, statusFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        itemType: itemTypeFilter !== "all" ? itemTypeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setInventory(response.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch inventory");
      // Mock data for demo with new schema
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await inventoryAPI.delete(itemId);
      toast.success("Item deleted successfully");
      fetchInventory();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleView = async (itemId) => {
    try {
      const response = await inventoryAPI.getById(itemId);
      setSelectedItem(response.data);
      setShowDetails(true);
    } catch (error) {
      toast.error("Failed to fetch item details");
      // Mock detailed data for demo
      const mockItem = inventory.find((item) => item._id === itemId);
      if (mockItem) {
        setSelectedItem({
          ...mockItem,
          transactions: [
            {
              date: "2024-01-10",
              type: "purchase",
              quantity: 10,
              price: mockItem.purchasePrice,
              reference: mockItem.supplier?.invoiceNumber,
              notes: "Initial stock purchase",
            },
            {
              date: "2024-03-01",
              type: "sale",
              quantity: 2,
              price: mockItem.sellingPrice,
              reference: "SALE-001",
              notes: "Walk-in customer",
            },
          ],
        });
        setShowDetails(true);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchInventory();
  };

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

  const filteredInventory = inventory?.length
    ? inventory.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemType.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          categoryFilter === "all" || item.category === categoryFilter;
        const matchesItemType =
          itemTypeFilter === "all" || item.itemType === itemTypeFilter;
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;

        return (
          matchesSearch && matchesCategory && matchesItemType && matchesStatus
        );
      })
    : [];

  const lowStockItems = inventory?.filter(
    (item) => item.status === "low-stock"
  );
  const outOfStockItems = inventory?.filter(
    (item) => item.status === "out-of-stock"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your jewelry inventory and stock levels
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems?.length > 0 || outOfStockItems?.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {lowStockItems?.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>
                  {lowStockItems.length} items running low
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>{item.name}</span>
                      <Badge variant="secondary">{item.quantity} left</Badge>
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{lowStockItems.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {outOfStockItems?.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-red-800 dark:text-red-200">
                  <Package className="h-5 w-5 mr-2" />
                  Out of Stock
                </CardTitle>
                <CardDescription>
                  {outOfStockItems.length} items out of stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>{item.name}</span>
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  ))}
                  {outOfStockItems.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{outOfStockItems.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find items by name, item code, or type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Item Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {itemTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            {filteredInventory?.length} item
            {filteredInventory?.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !inventory?.length ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Package className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-lg font-medium text-gray-600">
                No inventory items found
              </p>
              <p className="text-sm text-gray-500">
                Start by adding some items to your inventory
              </p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Search className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-lg font-medium text-gray-600">
                No matching items found
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table className="w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="w-[250px]">Item</TableHead>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[120px]">Weight/Purity</TableHead>
                    <TableHead className="w-[100px]">Selling Price</TableHead>
                    <TableHead className="w-[80px]">Quantity</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {filteredInventory.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    return (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.itemCode}
                        </TableCell>
                        <TableCell>{item.itemType}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {item.weight} {item.unit}
                            </div>
                            <div className="text-muted-foreground">
                              {getPurityDisplay(item.purity, item.itemType)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ₹{item.sellingPrice.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {item.quantity} {item.unit}
                            </div>
                            <div className="text-muted-foreground">
                              Min: {item.reorderLevel}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(item._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      {/* Inventory Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update inventory item information"
                : "Add a new item to your inventory"}
            </DialogDescription>
          </DialogHeader>
          <InventoryForm
            item={editingItem}
            categories={categories}
            itemTypes={itemTypes}
            units={units}
            locations={locations}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Inventory Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
            <DialogDescription>
              View detailed information about this inventory item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <InventoryDetails
              item={selectedItem}
              onClose={() => setShowDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
