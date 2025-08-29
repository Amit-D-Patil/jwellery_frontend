import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";
import { inventoryAPI } from "../../services/api";
import toast from "react-hot-toast";

// Validation Schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  category: yup.string().required("Category is required"),
  itemType: yup.string().required("Item type is required"),
  weight: yup
    .number()
    .required("Weight is required")
    .positive("Weight must be positive"),
  unit: yup.string().required("Unit is required"),
  purity: yup.number().required("Purity is required").min(0).max(100),
  purchasePrice: yup.number().required("Purchase price is required").positive(),
  sellingPrice: yup.number().required("Selling price is required").positive(),
  makingCharges: yup.number().min(0).default(0),
  quantity: yup.number().required("Quantity is required").min(0),
  reorderLevel: yup.number().required("Reorder level is required").min(0),
  location: yup.string().required("Location is required"),
  description: yup.string(),
  supplierName: yup.string(),
  supplierContact: yup.string(),
  supplierInvoice: yup.string(),
});

const InventoryForm = ({ item, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!item;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: item?.name || "",
      category: item?.category || "",
      itemType: item?.itemType || "",
      weight: item?.weight || "",
      unit: item?.unit || "",
      purity: item?.purity || "",
      purchasePrice: item?.purchasePrice || "",
      sellingPrice: item?.sellingPrice || "",
      makingCharges: item?.makingCharges || 0,
      quantity: item?.quantity || "",
      reorderLevel: item?.reorderLevel || "",
      location: item?.location || "",
      description: item?.description || "",
      supplierName: item?.supplier?.name || "",
      supplierContact: item?.supplier?.contact || "",
      supplierInvoice: item?.supplier?.invoiceNumber || "",
    },
  });

  const watchedCategory = watch("category");
  const watchedItemType = watch("itemType");
  const watchedUnit = watch("unit");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let response;

      // Prepare payload
      const payload = {
        ...data,
        supplier: {
          name: data.supplierName,
          contact: data.supplierContact,
          invoiceNumber: data.supplierInvoice,
        },
      };

      if (isEditing) {
        response = await inventoryAPI.update(item._id, payload);
        toast.success("Item updated successfully");
      } else {
        response = await inventoryAPI.create(payload);
        toast.success("Item created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update item" : "Failed to create item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name, Type, Category */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Item Name *</Label>
          <Input
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Item Type *</Label>
          <Select
            value={watchedItemType}
            onValueChange={(v) => setValue("itemType", v)}
          >
            <SelectTrigger
              className={errors.itemType ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {["Gold", "Silver", "Diamond", "Platinum", "Other"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.itemType && (
            <p className="text-sm text-destructive">
              {errors.itemType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={watchedCategory}
            onValueChange={(v) => setValue("category", v)}
          >
            <SelectTrigger
              className={errors.category ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {["Ornament", "Bullion", "Loose Stone", "Raw Material"].map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* Weight, Unit, Purity */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Weight *</Label>
          <Input
            type="number"
            step="0.01"
            {...register("weight")}
            className={errors.weight ? "border-destructive" : ""}
          />
          {errors.weight && (
            <p className="text-sm text-destructive">{errors.weight.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Unit *</Label>
          <Select
            value={watchedUnit}
            onValueChange={(v) => setValue("unit", v)}
          >
            <SelectTrigger className={errors.unit ? "border-destructive" : ""}>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {["gram", "carat", "piece"].map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit && (
            <p className="text-sm text-destructive">{errors.unit.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Purity *</Label>
          <Input
            type="number"
            {...register("purity")}
            className={errors.purity ? "border-destructive" : ""}
          />
          {errors.purity && (
            <p className="text-sm text-destructive">{errors.purity.message}</p>
          )}
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Purchase Price *</Label>
          <Input
            type="number"
            {...register("purchasePrice")}
            className={errors.purchasePrice ? "border-destructive" : ""}
          />
          {errors.purchasePrice && (
            <p className="text-sm text-destructive">
              {errors.purchasePrice.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Selling Price *</Label>
          <Input
            type="number"
            {...register("sellingPrice")}
            className={errors.sellingPrice ? "border-destructive" : ""}
          />
          {errors.sellingPrice && (
            <p className="text-sm text-destructive">
              {errors.sellingPrice.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Making Charges</Label>
          <Input type="number" {...register("makingCharges")} />
        </div>

        <div className="space-y-2">
          <Label>Quantity *</Label>
          <Input
            type="number"
            {...register("quantity")}
            className={errors.quantity ? "border-destructive" : ""}
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">
              {errors.quantity.message}
            </p>
          )}
        </div>
      </div>

      {/* Reorder Level & Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Reorder Level *</Label>
          <Input
            type="number"
            {...register("reorderLevel")}
            className={errors.reorderLevel ? "border-destructive" : ""}
          />
          {errors.reorderLevel && (
            <p className="text-sm text-destructive">
              {errors.reorderLevel.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Location *</Label>
          <Input
            {...register("location")}
            className={errors.location ? "border-destructive" : ""}
          />
          {errors.location && (
            <p className="text-sm text-destructive">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>

      {/* Supplier */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Supplier Name</Label>
          <Input {...register("supplierName")} />
        </div>

        <div className="space-y-2">
          <Label>Supplier Contact</Label>
          <Input {...register("supplierContact")} />
        </div>

        <div className="space-y-2">
          <Label>Invoice Number</Label>
          <Input {...register("supplierInvoice")} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={3}
          {...register("description")}
          placeholder="Enter item description..."
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;
