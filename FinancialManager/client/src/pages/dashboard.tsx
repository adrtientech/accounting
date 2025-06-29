import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Users, Receipt, Undo2 } from "lucide-react";
import type { BalanceSheet, AccountingStats } from "../../../shared/schema";

export default function Dashboard() {
  const { data: balanceSheet, isLoading: balanceLoading } = useQuery<BalanceSheet>({
    queryKey: ["/api/balance-sheet"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AccountingStats>({
    queryKey: ["/api/stats"],
  });

  if (balanceLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Sales",
      value: formatCurrency(stats?.totalSales || 0),
      icon: Receipt,
      description: "Total sales revenue",
      trend: stats?.totalSales && stats.totalSales > 0 ? "up" : "neutral",
    },
    {
      title: "Collections",
      value: formatCurrency(stats?.totalCollections || 0),
      icon: DollarSign,
      description: "Total payments collected",
      trend: stats?.totalCollections && stats.totalCollections > 0 ? "up" : "neutral",
    },
    {
      title: "Outstanding Receivables",
      value: formatCurrency(stats?.outstandingReceivables || 0),
      icon: Users,
      description: "Pending payments",
      trend: stats?.outstandingReceivables && stats.outstandingReceivables > 0 ? "down" : "neutral",
    },
    {
      title: "Returns",
      value: formatCurrency(stats?.totalReturns || 0),
      icon: Undo2,
      description: "Total returns processed",
      trend: "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to AccountingDrien - Professional Accounting System
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === "up" ? TrendingUp : card.trend === "down" ? TrendingDown : null;
          
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {TrendIcon && <TrendIcon className="h-3 w-3" />}
                  <span>{card.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Balance Sheet */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>Current asset balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Cash</span>
              <span className="text-sm font-mono">{formatCurrency(balanceSheet?.cash || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Accounts Receivable</span>
              <span className="text-sm font-mono">{formatCurrency(balanceSheet?.accountsReceivable || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Inventory</span>
              <span className="text-sm font-mono">{formatCurrency(balanceSheet?.inventory || 0)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Assets</span>
                <span className="font-mono">{formatCurrency(balanceSheet?.totalAssets || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liabilities & Equity</CardTitle>
            <CardDescription>Current liabilities and equity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Accounts Payable</span>
              <span className="text-sm font-mono">{formatCurrency(balanceSheet?.accountsPayable || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Liabilities</span>
              <span className="text-sm font-mono">{formatCurrency(balanceSheet?.totalLiabilities || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Share Capital</span>
              <span className="text-sm font-mono">{formatCurrency(balanceSheet?.shareCapital || 0)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Liab. & Equity</span>
                <span className="font-mono">{formatCurrency(balanceSheet?.totalLiabEquity || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Performance</CardTitle>
          <CardDescription>Key financial metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Gross Profit</span>
                <span className="text-sm font-mono">{formatCurrency(stats?.grossProfit || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Net Income</span>
                <span className="text-sm font-mono">{formatCurrency(stats?.netIncome || 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Collection Rate</span>
                <span className="text-sm font-mono">
                  {stats?.totalSales ? 
                    `${Math.round((stats.totalCollections / stats.totalSales) * 100)}%` : 
                    "0%"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Return Rate</span>
                <span className="text-sm font-mono">
                  {stats?.totalSales ? 
                    `${Math.round((stats.totalReturns / stats.totalSales) * 100)}%` : 
                    "0%"
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}