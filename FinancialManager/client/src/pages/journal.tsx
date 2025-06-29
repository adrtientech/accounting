import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { JournalEntry } from "../../../shared/schema";

export default function Journal() {
  const { data: journalEntries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
  });

  const handleExport = () => {
    if (!journalEntries?.length) return;

    const csvContent = [
      "Date,Reference,Description,Account Code,Account Name,Debit,Credit",
      ...journalEntries.map(entry => [
        formatDate(entry.date),
        entry.reference,
        entry.description,
        entry.accountCode,
        entry.accountName,
        entry.debitAmount && entry.debitAmount !== "0" ? entry.debitAmount : "",
        entry.creditAmount && entry.creditAmount !== "0" ? entry.creditAmount : ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-entries-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Group entries by transaction
  const groupedEntries = React.useMemo(() => {
    if (!journalEntries) return [];
    
    const groups: { [key: string]: JournalEntry[] } = {};
    
    journalEntries.forEach(entry => {
      const key = `${entry.reference}-${formatDate(entry.date)}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });
    
    return Object.entries(groups).map(([key, entries]) => ({
      key,
      entries: entries.sort((a, b) => 
        (parseFloat(b.debitAmount || "0") - parseFloat(a.debitAmount || "0"))
      )
    })).sort((a, b) => 
      new Date(b.entries[0].date).getTime() - new Date(a.entries[0].date).getTime()
    );
  }, [journalEntries]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">General Journal</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Journal</h1>
          <p className="text-muted-foreground">
            Complete record of all accounting transactions
          </p>
        </div>
        <Button onClick={handleExport} disabled={!journalEntries?.length}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Journal Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!journalEntries?.length ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Journal Entries</h3>
              <p className="text-muted-foreground">
                Journal entries will appear here as you process transactions.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedEntries.map(({ key, entries }) => {
                const totalDebit = entries.reduce((sum, entry) => 
                  sum + parseFloat(entry.debitAmount || "0"), 0
                );
                const totalCredit = entries.reduce((sum, entry) => 
                  sum + parseFloat(entry.creditAmount || "0"), 0
                );

                return (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{entries[0].reference}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(entries[0].date)} - {entries[0].description}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div>Total: {formatCurrency(totalDebit)}</div>
                        {Math.abs(totalDebit - totalCredit) > 0.01 && (
                          <div className="text-red-600">⚠️ Unbalanced</div>
                        )}
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account Code</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.accountCode}</TableCell>
                            <TableCell>{entry.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              {entry.debitAmount && entry.debitAmount !== "0" 
                                ? formatCurrency(entry.debitAmount)
                                : "-"
                              }
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {entry.creditAmount && entry.creditAmount !== "0"
                                ? formatCurrency(entry.creditAmount)
                                : "-"
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-medium">
                          <TableCell colSpan={2}>Total</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(totalDebit)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(totalCredit)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {journalEntries?.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {groupedEntries.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {journalEntries.length}
              </div>
              <p className="text-sm text-muted-foreground">Journal Entries</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {formatCurrency(
                  journalEntries.reduce((sum, entry) => 
                    sum + parseFloat(entry.debitAmount || "0"), 0
                  )
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total Debits</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}