"use client";
import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { goldLoanAPI, customerAPI } from "../../services/api";
import toast from "react-hot-toast";

const schema = yup.object({
  customerId: yup.string().required("Customer is required"),
  collateralType: yup.string().required("Collateral type is required"),
  weight: yup
    .number()
    .required("Weight is required")
    .positive("Weight must be positive"),
  purity: yup.string().required("Purity is required"),
  marketValue: yup
    .number()
    .required("Market value is required")
    .positive("Market value must be positive"),
  loanAmount: yup
    .number()
    .required("Loan amount is required")
    .positive("Loan amount must be positive")
    .test(
      "ltv-ratio",
      "Loan amount exceeds 80% of market value",
      function (value) {
        const marketValue = this.parent.marketValue;
        return !marketValue || !value || value <= marketValue * 0.8;
      }
    ),
  interestRate: yup
    .number()
    .required("Interest rate is required")
    .positive("Interest rate must be positive")
    .max(50, "Interest rate cannot exceed 50%"),
  tenure: yup
    .number()
    .required("Tenure is required")
    .positive("Tenure must be positive")
    .max(60, "Tenure cannot exceed 60 months"),
});

const GoldLoanForm = ({ loan, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const isEditing = !!loan;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customerId: loan?.customer?._id || "",
      collateralType: loan?.collateral?.type || "",
      weight: loan?.collateral?.weight || "",
      purity: loan?.collateral?.purity || "",
      marketValue: loan?.collateral?.marketValue || "",
      loanAmount: loan?.loanAmount || "",
      interestRate: loan?.interestRate || "",
      tenure: loan?.tenure || "",
      description: loan?.description || "",
    },
  });

  const watchedMarketValue = watch("marketValue");
  const watchedLoanAmount = watch("loanAmount");
  const watchedInterestRate = watch("interestRate");
  const watchedTenure = watch("tenure");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoadingData(true);
      const response = await customerAPI.getAll({ limit: 100 });
      setCustomers(response.data || []);
    } catch (error) {
      toast.error("Failed to load customers");
      // Mock data for demo
      setCustomers([
        { _id: "c1", name: "John Doe", phone: "+91 9876543210" },
        { _id: "c2", name: "Jane Smith", phone: "+91 9876543211" },
        { _id: "c3", name: "Mike Johnson", phone: "+91 9876543212" },
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const calculateLTV = () => {
    if (watchedMarketValue && watchedLoanAmount) {
      return ((watchedLoanAmount / watchedMarketValue) * 100).toFixed(1);
    }
    return 0;
  };

  const calculateEMI = () => {
    if (watchedLoanAmount && watchedInterestRate && watchedTenure) {
      const principal = Number.parseFloat(watchedLoanAmount);
      const rate = Number.parseFloat(watchedInterestRate) / 100 / 12;
      const tenure = Number.parseFloat(watchedTenure);

      if (rate === 0) return (principal / tenure).toFixed(0);

      const emi =
        (principal * rate * Math.pow(1 + rate, tenure)) /
        (Math.pow(1 + rate, tenure) - 1);
      return emi.toFixed(0);
    }
    return 0;
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const loanData = {
        ...data,
        collateral: {
          type: data.collateralType,
          weight: data.weight,
          purity: data.purity,
          marketValue: data.marketValue,
        },
        emi: calculateEMI(),
      };

      if (isEditing) {
        await goldLoanAPI.update(loan._id, loanData);
        toast.success("Gold loan updated successfully");
      } else {
        await goldLoanAPI.create(loanData);
        toast.success("Gold loan created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update gold loan" : "Failed to create gold loan"
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

  const ltvRatio = calculateLTV();
  const isLTVExceeded = ltvRatio > 80;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <div className="space-y-2">
        <Label>Customer *</Label>
        <Select
          value={watch("customerId")}
          onValueChange={(value) => setValue("customerId", value)}
        >
          <SelectTrigger
            className={errors.customerId ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer._id} value={customer._id}>
                {customer.name} - {customer.mobile}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && (
          <p className="text-sm text-destructive">
            {errors.customerId.message}
          </p>
        )}
      </div>

      {/* Collateral Details */}
      <Card>
        <CardHeader>
          <CardTitle>Collateral Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Collateral Type *</Label>
              <Select
                value={watch("collateralType")}
                onValueChange={(value) => setValue("collateralType", value)}
              >
                <SelectTrigger
                  className={errors.collateralType ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gold Jewelry">Gold Jewelry</SelectItem>
                  <SelectItem value="Gold Coins">Gold Coins</SelectItem>
                  <SelectItem value="Gold Bars">Gold Bars</SelectItem>
                  <SelectItem value="Gold Ornaments">Gold Ornaments</SelectItem>
                </SelectContent>
              </Select>
              {errors.collateralType && (
                <p className="text-sm text-destructive">
                  {errors.collateralType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purity">Purity *</Label>
              <Select
                value={watch("purity")}
                onValueChange={(value) => setValue("purity", value)}
              >
                <SelectTrigger
                  className={errors.purity ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select purity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24K">24K (99.9%)</SelectItem>
                  <SelectItem value="22K">22K (91.6%)</SelectItem>
                  <SelectItem value="18K">18K (75.0%)</SelectItem>
                  <SelectItem value="14K">14K (58.3%)</SelectItem>
                </SelectContent>
              </Select>
              {errors.purity && (
                <p className="text-sm text-destructive">
                  {errors.purity.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (grams) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register("weight")}
                className={errors.weight ? "border-destructive" : ""}
              />
              {errors.weight && (
                <p className="text-sm text-destructive">
                  {errors.weight.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketValue">Market Value (₹) *</Label>
              <Input
                id="marketValue"
                type="number"
                {...register("marketValue")}
                className={errors.marketValue ? "border-destructive" : ""}
              />
              {errors.marketValue && (
                <p className="text-sm text-destructive">
                  {errors.marketValue.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount (₹) *</Label>
              <Input
                id="loanAmount"
                type="number"
                {...register("loanAmount")}
                className={
                  errors.loanAmount || isLTVExceeded ? "border-destructive" : ""
                }
              />
              {errors.loanAmount && (
                <p className="text-sm text-destructive">
                  {errors.loanAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (% p.a.) *</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                {...register("interestRate")}
                className={errors.interestRate ? "border-destructive" : ""}
              />
              {errors.interestRate && (
                <p className="text-sm text-destructive">
                  {errors.interestRate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure (months) *</Label>
              <Input
                id="tenure"
                type="number"
                {...register("tenure")}
                className={errors.tenure ? "border-destructive" : ""}
              />
              {errors.tenure && (
                <p className="text-sm text-destructive">
                  {errors.tenure.message}
                </p>
              )}
            </div>
          </div>

          {/* LTV Warning */}
          {watchedMarketValue && watchedLoanAmount && (
            <div
              className={`p-3 rounded-md ${
                isLTVExceeded
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <div className="flex items-center">
                {isLTVExceeded && (
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isLTVExceeded ? "text-red-800" : "text-blue-800"
                  }`}
                >
                  Loan-to-Value Ratio: {ltvRatio}%
                </span>
              </div>
              {isLTVExceeded && (
                <p className="text-sm text-red-600 mt-1">
                  Warning: LTV ratio exceeds 80%. Please reduce the loan amount.
                </p>
              )}
            </div>
          )}

          {/* EMI Calculation */}
          {watchedLoanAmount && watchedInterestRate && watchedTenure && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm font-medium text-green-800">
                Calculated EMI: ₹
                {Number.parseInt(calculateEMI()).toLocaleString()}
              </div>
              <p className="text-sm text-green-600 mt-1">
                Monthly repayment amount
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Additional Notes</Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={3}
          placeholder="Any additional information..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || isLTVExceeded}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Loan" : "Create Loan"}
        </Button>
      </div>
    </form>
  );
};

export default GoldLoanForm;
