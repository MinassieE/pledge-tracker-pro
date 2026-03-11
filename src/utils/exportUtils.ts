import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pledge } from '@/types';

/**
 * Format currency for display
 */
const formatCurrency = (value: number, currency: string = 'ETB') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Format date for display
 */
const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

/**
 * Export pledges to Excel
 */
export const exportPledgesToExcel = (pledges: Pledge[], filename: string = 'pledges') => {
  const data = pledges.map(pledge => ({
    'Full Name': pledge.full_name || pledge.fullName || 'N/A',
    'Phone Number': pledge.phone_number || pledge.phone || 'N/A',
    'Email': pledge.email || 'N/A',
    'Type': pledge.contribution_type || pledge.contributionType || 'N/A',
    'Promised Amount': pledge.contribution_type === 'material' 
      ? pledge.material_type || 'N/A'
      : formatCurrency(pledge.promised_amount || pledge.amount || 0, pledge.currency),
    'Amount Paid': pledge.contribution_type === 'material'
      ? 'N/A'
      : formatCurrency(pledge.amount_paid || pledge.total_paid || pledge.totalPaid || 0, pledge.currency),
    'Status': pledge.status || 'N/A',
    'Promised Date': formatDate(pledge.promised_start_date || pledge.promised_date),
    'Due Date': formatDate(pledge.promised_end_date),
    'Assigned Follow-Up': typeof pledge.assigned_followup === 'object' 
      ? pledge.assigned_followup?.first_name || 'N/A'
      : 'N/A',
    'Remark': pledge.remark || 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pledges');

  // Auto-size columns
  const maxWidth = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
  worksheet['!cols'] = Array(maxWidth).fill({ wch: 15 });

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export pledges to PDF
 */
export const exportPledgesToPDF = (pledges: Pledge[], filename: string = 'pledges', projectName?: string) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Pledge Report', 14, 20);

  if (projectName) {
    doc.setFontSize(12);
    doc.text(`Project: ${projectName}`, 14, 28);
  }

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, projectName ? 34 : 28);

  // Prepare table data
  const tableData = pledges.map(pledge => [
    pledge.full_name || pledge.fullName || 'N/A',
    pledge.phone_number || pledge.phone || 'N/A',
    pledge.contribution_type === 'material'
      ? pledge.material_type || 'N/A'
      : formatCurrency(pledge.promised_amount || pledge.amount || 0, pledge.currency),
    pledge.contribution_type === 'material'
      ? 'N/A'
      : formatCurrency(pledge.amount_paid || pledge.total_paid || pledge.totalPaid || 0, pledge.currency),
    pledge.status || 'N/A',
    formatDate(pledge.promised_end_date),
  ]);

  autoTable(doc, {
    startY: projectName ? 40 : 34,
    head: [['Name', 'Phone', 'Promised', 'Paid', 'Status', 'Due Date']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [76, 175, 80] },
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export report data to Excel
 */
export const exportReportToExcel = (
  data: any[],
  headers: string[],
  filename: string = 'report'
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  // Auto-size columns
  worksheet['!cols'] = headers.map(() => ({ wch: 15 }));

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export report data to PDF
 */
export const exportReportToPDF = (
  data: any[][],
  headers: string[],
  title: string,
  filename: string = 'report',
  projectName?: string
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  if (projectName) {
    doc.setFontSize(12);
    doc.text(`Project: ${projectName}`, 14, 28);
  }

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, projectName ? 34 : 28);

  autoTable(doc, {
    startY: projectName ? 40 : 34,
    head: [headers],
    body: data,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [76, 175, 80] },
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
