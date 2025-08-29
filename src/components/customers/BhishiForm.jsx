"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { bhishiAPI } from "../../services/api";

const schema = yup.object({
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  notes: yup.string(),
});

const BhishiForm = ({ bhishi, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: "",
      notes: "",
    },
  });

  const watchedAmount = watch("amount");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await bhishiAPI.deposit(bhishi.customer._id, {
        amount: Number(data.amount),
        notes: data.notes,
        date: new Date().toISOString(),
      });
      toast.success("Deposit recorded successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to record deposit");
    } finally {
      setLoading(false);
    }
  };

  const futureBalance =
    (bhishi.balance || 0) + (watchedAmount ? Number(watchedAmount) : 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Bhishi Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Bhishi Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">
              {bhishi.customer?.name || "Unknown"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Balance:</span>
            <span className="font-semibold">
              ₹{bhishi.balance.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Deposits:</span>
            <span>{bhishi.transactions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Deposit Amount (₹) *</Label>
          <Input
            id="amount"
            type="number"
            {...register("amount")}
            className={errors.amount ? "border-destructive" : ""}
            placeholder="Enter deposit amount"
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            {...register("notes")}
            placeholder="Optional notes (e.g. via UPI, cash, etc.)"
          />
        </div>
      </div>

      {/* Payment Summary */}
      {watchedAmount && (
        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              Deposit Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Deposit Amount:</span>
              <span className="font-semibold">
                ₹{Number(watchedAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>New Balance:</span>
              <span className="font-semibold">
                ₹{futureBalance.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Record Deposit
        </Button>
      </div>
    </form>
  );
};

export default BhishiForm;
