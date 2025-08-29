"use client";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Info, Loader2, Plus, Trash2 } from "lucide-react";
import { invoiceAPI, customerAPI, inventoryAPI } from "../../services/api";
import toast from "react-hot-toast";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const schema = yup.object({
  customer: yup.string().required("Customer is required"),
  items: yup
    .array()
    .of(
      yup.object({
        itemId: yup.string().required("Item is required"),
        quantity: yup
          .number()
          .required("Quantity is required")
          .positive("Quantity must be positive")
          .min(1, "Quantity must be at least 1"),
        weight: yup
          .number()
          .required("Weight is required")
          .positive("Weight must be positive"),
        pricePerGram: yup
          .number()
          .required("Price per gram is required")
          .positive("Price per gram must be positive"),
        makingCharge: yup
          .number()
          .required("Making charge is required")
          .min(0, "Making charge cannot be negative"),
      })
    )
    .min(1, "At least one item is required"),
  paymentMethod: yup.string().required("Payment method is required"),
  // --- CHANGE 1: Add custom validation for amountPaid ---
  paidAmount: yup
    .number()
    .typeError("Amount must be a number")
    .min(0, "Amount paid cannot be negative")
    .required("Amount paid is required")
    .test(
      "is-less-than-total",
      "Amount paid cannot exceed the total amount",
      function (value) {
        const { items } = this.parent;
        if (!items || items.length === 0) return true;

        const subtotal = items.reduce((sum, item) => {
          const quantity = Number.parseFloat(item.quantity) || 0;
          const weight = Number.parseFloat(item.weight) || 0;
          const pricePerGram = Number.parseFloat(item.pricePerGram) || 0;
          const makingCharge = Number.parseFloat(item.makingCharge) || 0;
          const unitPrice = weight * pricePerGram + makingCharge;
          return sum + quantity * unitPrice;
        }, 0);

        const totalAmount = subtotal * 1.03; // Add 3% GST
        return value <= totalAmount;
      }
    ),
  dueDate: yup.date().required("Due date is required"),
});

const InvoiceForm = ({ invoice, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const isEditing = !!invoice;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customer: invoice?.customer?._id || "",
      items: invoice?.items?.map((item) => ({
        itemId: item.itemId?._id || item.itemId,
        quantity: item.quantity || 1,
        weight: item.weight || 0,
        pricePerGram: item.pricePerGram || 0,
        makingCharge: item.makingCharge || 0,
      })) || [{ itemId: "", quantity: 1, unitPrice: 0 }],
      paymentMethod: invoice?.paymentMethod || "",
      paidAmount: invoice?.paidAmount || 0, // Set default to existing amount or 0
      dueDate: invoice?.dueDate
        ? new Date(invoice.dueDate).toISOString().split("T")[0]
        : "",
      notes: invoice?.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedAmountPaid = watch("paidAmount"); // Watch the new field for summary updates

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const [customersRes, inventoryRes] = await Promise.all([
        customerAPI.getAll({ limit: 100 }),
        inventoryAPI.getAll({ limit: 100 }),
      ]);
      setCustomers(customersRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (error) {
      toast.error("Failed to load data");
      // Mock data for demo
      setCustomers([
        { _id: "c1", name: "John Doe", email: "john@example.com" },
        { _id: "c2", name: "Jane Smith", email: "jane@example.com" },
        { _id: "c3", name: "Mike Johnson", email: "mike@example.com" },
      ]);
      setInventory([
        { _id: "i1", name: "Gold Chain 22K", price: 85000, stock: 5 },
        { _id: "i2", name: "Diamond Ring", price: 125000, stock: 3 },
        { _id: "i3", name: "Silver Bracelet", price: 8500, stock: 15 },
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    if (field === "itemId") {
      const selectedItem = inventory.find((item) => item._id === value);
      if (selectedItem) {
        setValue(`items.${index}.unitPrice`, selectedItem.price);
      }
    }
  };

  const calculateSubtotal = () => {
    return watchedItems.reduce((sum, item) => {
      const quantity = Number.parseFloat(item.quantity) || 0;
      const weight = Number.parseFloat(item.weight) || 0;
      const pricePerGram = Number.parseFloat(item.pricePerGram) || 0;
      const makingCharge = Number.parseFloat(item.makingCharge) || 0;
      const unitPrice = weight * pricePerGram + makingCharge;
      return sum + quantity * unitPrice;
    }, 0);
  };

  const calculateGST = (subtotal) => {
    return subtotal * 0.03; // 3% GST
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const gst = calculateGST(subtotal);
    return subtotal + gst;
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // --- CHANGE 5: Added amountPaid to the data sent to the backend ---
      const invoiceData = {
        customer: data.customer,
        items: data.items.map((item) => ({
          itemId: item.itemId,
          quantity: Number(item.quantity),
          weight: Number(item.weight),
          pricePerGram: Number(item.pricePerGram),
          makingCharge: Number(item.makingCharge),
        })),
        dueDate: new Date(data.dueDate),
        paymentMethod: data.paymentMethod,
        paidAmount: Number(data.paidAmount), // Include amountPaid
        notes: data.notes || "",
      };

      if (isEditing) {
        await invoiceAPI.update(invoice._id, invoiceData);
        toast.success("Invoice updated successfully");
      } else {
        await invoiceAPI.create(invoiceData);
        toast.success("Invoice created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Invoice submission error:", error);
      toast.error(
        error.response?.data?.message ||
          (isEditing ? "Failed to update invoice" : "Failed to create invoice")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate totals for the summary card
  const subtotal = calculateSubtotal();
  const gst = calculateGST(subtotal);
  const total = subtotal + gst;
  const amountPaid = Number.parseFloat(watchedAmountPaid) || 0;
  const balanceDue = total - amountPaid;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer *</Label>
          <Select
            value={watch("customer")}
            onValueChange={(value) => setValue("customer", value)}
          >
            <SelectTrigger
              className={errors.customer ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer._id} value={customer._id}>
                  {customer.name} - {customer.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customer && (
            <p className="text-sm text-destructive">
              {errors.customer.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            {...register("dueDate")}
            className={errors.dueDate ? "border-destructive" : ""}
          />
          {errors.dueDate && (
            <p className="text-sm text-destructive">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Invoice Items
            {isEditing && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Items cannot be changed after an invoice is created.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ itemId: "", quantity: 1, unitPrice: 0 })}
              disabled={isEditing}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-md space-y-4 relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
                {/* Item Select */}
                <div className="space-y-1 col-span-1 md:col-span-3 lg:col-span-2">
                  <Label>Item</Label>
                  <Select
                    value={watch(`items.${index}.itemId`)}
                    onValueChange={(value) => {
                      setValue(`items.${index}.itemId`, value);
                      handleItemChange(index, "itemId", value);
                    }}
                    disabled={isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory?.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.name} (Stock: {item.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.items?.[index]?.itemId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.items[index].itemId.message}
                    </p>
                  )}
                </div>

                {/* Other Inputs */}
                <div className="space-y-1">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`)}
                    className={
                      errors.items?.[index]?.quantity
                        ? "border-destructive"
                        : ""
                    }
                    disabled={isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Weight (g)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.weight`)}
                    className={
                      errors.items?.[index]?.weight ? "border-destructive" : ""
                    }
                    disabled={isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Price/Gram</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.pricePerGram`)}
                    className={
                      errors.items?.[index]?.pricePerGram
                        ? "border-destructive"
                        : ""
                    }
                    disabled={isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Making (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.makingCharge`)}
                    className={
                      errors.items?.[index]?.makingCharge
                        ? "border-destructive"
                        : ""
                    }
                    disabled={isEditing}
                  />
                </div>
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          {errors.items && typeof errors.items.message === "string" && (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Payment and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select
              value={watch("paymentMethod")}
              onValueChange={(value) => setValue("paymentMethod", value)}
            >
              <SelectTrigger
                className={errors.paymentMethod ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* --- CHANGE 3: Added the UI input for Amount Paid --- */}
          <div className="space-y-2">
            <Label htmlFor="paidAmount">Amount Paid (₹) *</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              {...register("paidAmount")}
              placeholder="0.00"
              className={errors.paidAmount ? "border-destructive" : ""}
            />
            {errors.paidAmount && (
              <p className="text-sm text-destructive">
                {errors.paidAmount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              {...register("notes")}
              placeholder="Additional notes..."
              maxLength={500}
            />
          </div>
        </div>

        {/* --- CHANGE 4: Updated Invoice Summary Card --- */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (3%):</span>
              <span>₹{gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
              <span>Total:</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Amount Paid:</span>
              <span>- ₹{amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-destructive border-t pt-2 mt-2">
              <span>Balance Due:</span>
              <span>₹{balanceDue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
