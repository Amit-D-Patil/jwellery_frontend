"use client";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Phone, Mail, MapPin, Calendar, Gift, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import CustomerBhishi from "./CustomerBhishi";

const CustomerDetails = ({ customer, onClose }) => {
  return (
    <div className="space-y-6 overflow-y-auto max-h-[80vh]">
      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">
                Customer ID: {customer._id}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {customer.mobile}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                {customer.email}
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                {customer.address}
              </div>
              <div className="flex items-center text-sm">
                <Gift className="h-4 w-4 mr-2 text-muted-foreground" />
                Loyality Points: {customer.loyaltyPoints}
              </div>
            </div>

            {customer.dateOfBirth && (
              <div className="space-y-2">
                <Separator />
                {customer.dateOfBirth && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    DOB: {new Date(customer.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  ₹
                  {Number(
                    customer.history
                      ?.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
                      .toFixed(2)
                  ).toLocaleString("en-IN") || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Purchases
                </div>
              </div>
              <div className="text-center p-3 bg-secondary/10 rounded-lg">
                <div className="text-2xl font-bold text-secondary-foreground">
                  {customer.totalDue.toLocaleString("en-IN") || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Due</div>
              </div>
            </div>

            <div className="text-center">
              <Badge
                variant={customer.loyaltyPoints > 200 ? "default" : "secondary"}
              >
                {customer.loyaltyPoints > 200 ? "Gold Member" : "Silver Member"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase History and Bhishi Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Purchase History</TabsTrigger>
          <TabsTrigger value="bhishi">Bhishi</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>
                Recent transactions and purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.history && customer.history.length > 0 ? (
                <div className="space-y-3">
                  {customer.history.map((purchase, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {purchase.invoiceNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {purchase.items}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(purchase.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ₹{purchase.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: ₹{purchase.dueAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">
                          Paid: ₹
                          {(
                            purchase.totalAmount - purchase.dueAmount
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No purchase history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bhishi">
          <CustomerBhishi customerId={customer._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
