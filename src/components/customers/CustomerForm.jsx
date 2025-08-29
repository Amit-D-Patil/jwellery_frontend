import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";
import { customerAPI } from "../../services/api";
import toast from "react-hot-toast";

const schema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  mobile: yup
    .string()
    .required("Phone is required")
    .matches(/^[+]?[0-9\s-()]{10,}$/, "Invalid phone number"),
  address: yup.string().required("Address is required"),
  dateOfBirth: yup.date().nullable(),
  anniversaryDate: yup.date().nullable(),
});

const CustomerForm = ({ customer, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      mobile: customer?.mobile || "",
      address: customer?.address || "",
      dateOfBirth: customer?.dateOfBirth
        ? new Date(customer.dateOfBirth).toISOString().split("T")[0]
        : "",
      anniversaryDate: customer?.anniversaryDate
        ? new Date(customer.anniversaryDate).toISOString().split("T")[0]
        : "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isEditing) {
        await customerAPI.update(customer._id, data);
        toast.success("Customer updated successfully");
      } else {
        await customerAPI.create(data);
        toast.success("Customer created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error(
        isEditing
          ? "Failed to update customer"
          : "Failed to create customer. " + error.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="mobile"
            {...register("mobile")}
            className={errors.mobile ? "border-destructive" : ""}
          />
          {errors.mobile && (
            <p className="text-sm text-destructive">{errors.mobile.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          {...register("address")}
          className={errors.address ? "border-destructive" : ""}
          rows={3}
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anniversaryDate">Anniversary Date</Label>
          <Input
            id="anniversaryDate"
            type="date"
            {...register("anniversaryDate")}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
