import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, HandCoins, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SalesInvoice, Collection, InsertCollection } from "../../../shared/schema";

const collectionSchema = z.object({
  invoiceId: z.number().min(1, "Please select an invoice"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "check"]),
  reference: z.string().min(1, "Reference is required"),
  notes: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function Collections() {
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);

  const { data: collections, isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: outstandingInvoices, isLoading: invoicesLoading } = useQuery<SalesInvoice[]>({
    queryKey: ["/api/sales/outstanding"],
  });

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      invoiceId: 0,
      amount: 0,
      paymentMethod: "cash",
      reference: "",
      notes: "",
    },
  });

  const createCollectionMutation = useMutation({
    mutationFn: (data: InsertCollection) =>
      apiRequest("/api/collections", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/outstanding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance-sheet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowForm(false);
      form.reset();
      toast({
        title: "Payment collected",
        description: "The payment has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment collection.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CollectionFormData) => {
    const collectionData: InsertCollection = {
      invoiceId: data.invoiceId,
      date: new Date(),
      paymentMethod: data.paymentMethod,
      amount: data.amount.toString(),
      reference: data.reference,
      notes: data.notes || null,
    };

    createCollectionMutation.mutate(collectionData);
  };

  const selectedInvoice = outstandingInvoices?.find(
    (inv) => inv.id === form.watch("invoiceId")
  );

  const maxCollectionAmount = selectedInvoice 
    ? parseFloat(selectedInvoice.outstandingAmount)
    : 0;

  if (collectionsLoading || invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <Button onClick={() => setShowForm(true)} disabled={!outstandingInvoices?.length}>
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {!outstandingInvoices?.length && (
        <Card>
          <CardContent className="p-6 text-center">
            <HandCoins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Outstanding Invoices</h3>
            <p className="text-muted-foreground">
              All invoices have been paid. Great job on collections!
            </p>
          </CardContent>
        </Card>
      )}

      {showForm && outstandingInvoices?.length && (
        <Card>
          <CardHeader>
            <CardTitle>Record Payment Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoiceId">Outstanding Invoice</Label>
                  <Select
                    value={form.watch("invoiceId")?.toString()}
                    onValueChange={(value) => form.setValue("invoiceId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {outstandingInvoices?.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id.toString()}>
                          {invoice.invoiceNumber} - {invoice.customerName} ({formatCurrency(invoice.outstandingAmount)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.invoiceId && (
                    <p className="text-sm text-red-600">{form.formState.errors.invoiceId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={form.watch("paymentMethod")}
                    onValueChange={(value) => form.setValue("paymentMethod", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Collection Amount
                    {selectedInvoice && (
                      <span className="text-muted-foreground ml-2">
                        (Max: {formatCurrency(maxCollectionAmount)})
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    max={maxCollectionAmount}
                    {...form.register("amount", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    {...form.register("reference")}
                    placeholder="Payment reference"
                  />
                  {form.formState.errors.reference && (
                    <p className="text-sm text-red-600">{form.formState.errors.reference.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  {...form.register("notes")}
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createCollectionMutation.isPending}>
                  {createCollectionMutation.isPending ? "Recording..." : "Record Payment"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Outstanding Invoices */}
      {outstandingInvoices?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(invoice.paidAmount || "0")}</TableCell>
                    <TableCell className="font-medium text-red-600">
                      {formatCurrency(invoice.outstandingAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">
                        {invoice.status === "partial" ? "Partial" : "Open"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="w-5 h-5" />
            Payment Collection History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections?.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>{formatDate(collection.date)}</TableCell>
                  <TableCell className="font-medium">{collection.reference}</TableCell>
                  <TableCell className="capitalize">{collection.paymentMethod.replace("_", " ")}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(collection.amount)}
                  </TableCell>
                  <TableCell>{collection.notes || "-"}</TableCell>
                </TableRow>
              ))}
              {!collections?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No payment collections recorded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}