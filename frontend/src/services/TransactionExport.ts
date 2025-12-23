// src/utils/transactionExport.ts
import { type Transaction } from "./transaction";

interface ExportOptions {
  transactions: Transaction[];
  getCategoryName: (id: string) => string;
  filename?: string;
}

/**
 * Exports transactions to CSV with colored formatting
 * Income = Green, Expense = Red
 */
export const exportTransactionsToCSV = ({
  transactions,
  getCategoryName,
  filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`
}: ExportOptions): void => {
  if (transactions.length === 0) {
    alert("No transactions to export!");
    return;
  }

  // CSV Headers
  const headers = [
    "Date",
    "Type",
    "Target",
    "Description",
    "Amount",
    "Category",
    "Recurring",
    "Recurring Rate"
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map(tx => {
    const date = new Date(tx.created).toLocaleDateString();
    const category = getCategoryName(tx.category ?? "");
    const recurring = tx.recurring ? "Yes" : "No";
    const recurringRate = tx.recurringRate ? `${tx.recurringRate} days` : "-";
    
    return [
      date,
      tx.type,
      tx.target ?? "-",
      tx.description ?? "-",
      tx.amount.toFixed(2),
      category,
      recurring,
      recurringRate
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Exports transactions to Excel-compatible CSV with color formatting
 * Uses Excel's conditional formatting approach
 */
export const exportTransactionsToColoredExcel = ({
  transactions,
  getCategoryName,
  filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`
}: ExportOptions): void => {
  if (transactions.length === 0) {
    alert("No transactions to export!");
    return;
  }

  // Sort transactions by date (newest first)
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );

  // Create HTML table with inline styles for colors
  let html = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th { background-color: #f0f0f0; padding: 8px; border: 1px solid #ddd; font-weight: bold; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          .income { color: #16a34a; font-weight: 600; }
          .expense { color: #dc2626; font-weight: 600; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Target</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Recurring</th>
              <th>Recurring Rate</th>
            </tr>
          </thead>
          <tbody>
  `;

  sortedTx.forEach(tx => {
    const date = new Date(tx.created).toLocaleDateString();
    const category = getCategoryName(tx.category ?? "");
    const recurring = tx.recurring ? "Yes" : "No";
    const recurringRate = tx.recurringRate ? `${tx.recurringRate} days` : "-";
    const colorClass = tx.type === "INCOME" ? "income" : "expense";
    
    html += `
      <tr class="${colorClass}">
        <td>${date}</td>
        <td>${tx.type}</td>
        <td>${tx.target ?? "-"}</td>
        <td>${tx.description ?? "-"}</td>
        <td>$${tx.amount.toFixed(2)}</td>
        <td>${category}</td>
        <td>${recurring}</td>
        <td>${recurringRate}</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Create and download HTML file (opens in Excel with colors preserved)
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename.replace('.csv', '.xls'));
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};