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
import { Plus, Undo2, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SalesReturn, SalesInvoice, InsertSalesReturn } from "../../../shared/schema";

const returnSchema = z.object({
  invoiceId: z.number().min(1, "Please select an invoice"),
  returnType: z.enum(["return", "allowance"]),
  reason: z.string().min(1, "Reason is required"),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.string().min(1, "Quantity is required"),
    unitPrice: z.string().min(1, "Unit price is required"),
    cogsUnit: z.string().min(1, "COGS unit is required"),
  })).min(1, "At least one item is required"),
});

type ReturnFormData = z.infer<typeof returnSchema>;

export default function Returns() {
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);

  const { data: salesReturns, isLoading: returnsLoading } = useQuery<SalesReturn[]>({
    queryKey: ["/api/returns"],
  });

  const { data: paidInvoices, isLoading: invoicesLoading } = useQuery<SalesInvoice[]>({
    queryKey: ["/api/sales/paid"],
  });

  const form = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      invoiceId: 0,
      returnType: "return",
      reason: "",
      items: [{ description: "", quantity: "", unitPrice: "", cogsUnit: "" }],
    },
  });

  const createReturnMutation = useMutation({
    mutationFn: (data: InsertSalesReturn & { items: any[] }) =>
      apiRequest("/api/returns", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance-sheet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowForm(false);
      form.reset();
      toast({
        title: "Return processed",
        description: "The sales return has been processed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process sales return.",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, { description: "", quantity: "", unitPrice: "", cogsUnit: "" }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    }
  };

  const onSubmit = (data: ReturnFormData) => {
    const totalAmount = data.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
    }, 0);

    const returnNumber = `RET-${Date.now()}`;

    const returnData: InsertSalesReturn & { items: any[] } = {
      invoiceId: data.invoiceId,
      date: new Date(),
      returnNumber,
      returnType: data.returnType,
      reason: data.reason,
      totalAmount: totalAmount.toString(),
      items: data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        cogsUnit: item.cogsUnit,
        totalAmount: (parseFloat(item.quantity) * parseFloat(item.unitPrice)).toString(),
      })),
    };

    createReturnMutation.mutate(returnData);
  };

  if (returnsLoading || invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Sales Returns</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">Sales Returns</h1>
        <Button onClick={() => setShowForm(true)} disabled={!paidInvoices?.length}>
          <Plus className="w-4 h-4 mr-2" />
          Process Return
        </Button>
      </div>

      {!paidInvoices?.length && (
        <Card>
          <CardContent className="p-6 text-center">
            <Undo2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Paid Invoices</h3>
            <p className="text-muted-foreground">
              Returns can only be processed for paid invoices. Complete some sales first.
            </p>
          </CardContent>
        </Card>
      )}

      {showForm && paidInvoices?.length && (
        <Card>
          <CardHeader>
            <CardTitle>Process Sales Return</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="invoiceId">Original Invoice</Label>
                  <Select
                    value={form.watch("invoiceId")?.toString()}
                    onValueChange={(value) => form.setValue("invoiceId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {paidInvoices?.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id.toString()}>
                          {invoice.invoiceNumber} - {invoice.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.invoiceId && (
                    <p className="text-sm text-red-600">{form.formState.errors.invoiceId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnType">Return Type</Label>
                  <Select
                    value={form.watch("returnType")}
                    onValueChange={(value) => form.setValue("returnType", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select return type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="return">Product Return</SelectItem>
                      <SelectItem value="allowance">Sales Allowance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    {...form.register("reason")}
                    placeholder="Reason for return"
                  />
                  {form.formState.errors.reason && (
                    <p className="text-sm text-red-600">{form.formState.errors.reason.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Return Items</h3>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {form.watch("items").map((_, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-5 items-end">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        {...form.register(`items.${index}.description`)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.quantity`)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.unitPrice`)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>COGS Unit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.cogsUnit`)}
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="outline"
                      size="sm"
                      disabled={form.watch("items").length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createReturnMutation.isPending}>
                  {createReturnMutation.isPending ? "Processing..." : "Process Return"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Available Invoices for Returns */}
      {paidInvoices?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Available Invoices for Returns
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
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Returns History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Undo2 className="w-5 h-5" />
            Returns History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesReturns?.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell className="font-medium">{returnItem.returnNumber}</TableCell>
                  <TableCell>{formatDate(returnItem.date)}</TableCell>
                  <TableCell className="capitalize">{returnItem.returnType}</TableCell>
                  <TableCell>{returnItem.reason}</TableCell>
                  <TableCell className="font-medium text-red-600">
                    -{formatCurrency(returnItem.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
              {!salesReturns?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No returns processed yet
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