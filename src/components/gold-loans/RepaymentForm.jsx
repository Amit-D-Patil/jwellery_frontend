"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { goldLoanAPI } from "../../services/api";
import toast from "react-hot-toast";

const schema = yup.object({
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .test(
      "max-amount",
      "Amount cannot exceed outstanding balance",
      function (value) {
        const outstandingAmount = this.options.context?.outstandingAmount || 0;
        return !value || value <= outstandingAmount;
      }
    ),
  paymentMethod: yup.string().required("Payment method is required"),
  notes: yup.string(),
});

const RepaymentForm = ({ loan, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { outstandingAmount: loan.remainingAmount },
    defaultValues: {
      amount: loan.emi,
      paymentMethod: "",
      notes: "",
    },
  });

  const watchedAmount = watch("amount");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await goldLoanAPI.addRepayment(loan._id, {
        ...data,
        date: new Date().toISOString(),
        type: data.amount >= loan.emi ? "EMI" : "Partial",
      });
      toast.success("Repayment recorded successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to record repayment");
    } finally {
      setLoading(false);
    }
  };

  const remainingBalance = loan.remainingAmount - (watchedAmount || 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Loan Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loan Number:</span>
            <span className="font-medium">{loan.loanNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Outstanding Amount:</span>
            <span className="font-semibold">
              ₹{loan.remainingAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly EMI:</span>
            <span>₹{loan.emi.toLocaleString()}</span>
          </div>
          {loan.nextDueDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Due Date:</span>
              <span>{new Date(loan.nextDueDate).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repayment Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Repayment Amount (₹) *</Label>
          <Input
            id="amount"
            type="float"
            {...register("amount")}
            className={errors.amount ? "border-destructive" : ""}
            placeholder="Enter repayment amount"
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
          <div className="flex justify-between text-sm">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValue("amount", loan.emi)}
            >
              EMI Amount
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValue("amount", loan.remainingAmount)}
            >
              Full Payment
            </Button>
          </div>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            {...register("notes")}
            placeholder="Additional notes (optional)"
          />
        </div>
      </div>

      {/* Payment Summary */}
      {watchedAmount && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Payment Amount:</span>
              <span className="font-semibold">
                ₹{Number.parseInt(watchedAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Balance:</span>
              <span className="font-semibold">
                ₹{Math.max(0, remainingBalance).toLocaleString()}
              </span>
            </div>
            {remainingBalance <= 0 && (
              <div className="text-green-600 font-medium text-center pt-2">
                This payment will close the loan
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Record Payment
        </Button>
      </div>
    </form>
  );
};

export default RepaymentForm;
