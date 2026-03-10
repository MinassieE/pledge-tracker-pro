import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { pledgesApi } from '@/api/pledges';
import * as XLSX from 'xlsx';

interface ParsedPledge {
  full_name: string;
  phone_number: string;
  promised_amount: number;
  currency: 'ETB' | 'USD';
  contribution_type: 'oneTime' | 'monthly' | 'material' | 'other';
  promised_start_date: string;
  promised_end_date: string;
  amount_paid?: number;
  email?: string;
  alt_phone_number?: string;
  material_type?: string;
  material_quantity?: number;
  other_description?: string;
  remark?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const BulkImport: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedPledge[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const importMutation = useMutation({
    mutationFn: async (pledges: ParsedPledge[]) => {
      // Call bulk import endpoint
      const response = await pledgesApi.bulkImport(pledges);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Successfully imported ${data.count} pledges.`,
      });
      navigate('/pledges');
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to import pledges. Please try again.';
      const errorDetails = error?.response?.data?.details || '';
      
      toast({
        title: 'Import Failed',
        description: errorDetails ? `${errorMessage}\n\nDetails: ${errorDetails}` : errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData([]);
      setValidationErrors([]);
    }
  };

  const parseFile = async () => {
    if (!file) return;

    setIsValidating(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const errors: ValidationError[] = [];
        const pledges: ParsedPledge[] = [];

        jsonData.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because index starts at 0 and row 1 is header

          // Validate required fields
          if (!row.full_name) {
            errors.push({ row: rowNumber, field: 'full_name', message: 'Full name is required' });
          }
          if (row.promised_amount === undefined || row.promised_amount === null) {
            errors.push({ row: rowNumber, field: 'promised_amount', message: 'Promised amount is required' });
          }
          if (!row.contribution_type) {
            errors.push({ row: rowNumber, field: 'contribution_type', message: 'Contribution type is required' });
          }

          // Validate contribution_type enum
          if (row.contribution_type && !['oneTime', 'monthly', 'material', 'other'].includes(row.contribution_type)) {
            errors.push({ 
              row: rowNumber, 
              field: 'contribution_type', 
              message: 'Must be oneTime, monthly, material, or other (case-sensitive)' 
            });
          }

          // Validate currency enum
          if (row.currency && !['ETB', 'USD'].includes(row.currency)) {
            errors.push({ row: rowNumber, field: 'currency', message: 'Currency must be ETB or USD (case-sensitive)' });
          }

          // If no errors for this row, add to pledges
          if (errors.filter(e => e.row === rowNumber).length === 0) {
            // Clean and parse the amount (remove commas)
            const cleanAmount = String(row.promised_amount).replace(/,/g, '');
            const cleanPaidAmount = row.amount_paid ? String(row.amount_paid).replace(/,/g, '') : '0';
            
            pledges.push({
              full_name: String(row.full_name).trim(),
              phone_number: row.phone_number ? String(row.phone_number).trim() : '',
              promised_amount: Number(cleanAmount),
              currency: row.currency || 'ETB',
              contribution_type: row.contribution_type, // Keep exact value from Excel
              promised_start_date: row.promised_start_date || '',
              promised_end_date: row.promised_end_date || '',
              amount_paid: Number(cleanPaidAmount),
              email: row.email ? String(row.email).trim() : '',
              alt_phone_number: row.alt_phone_number ? String(row.alt_phone_number).trim() : '',
              material_type: row.material_type ? String(row.material_type).trim() : '',
              material_quantity: row.material_quantity ? Number(row.material_quantity) : undefined,
              other_description: row.other_description ? String(row.other_description).trim() : '',
              remark: row.remark ? String(row.remark).trim() : '',
            });
          }
        });

        setValidationErrors(errors);
        setParsedData(pledges);
        setIsValidating(false);

        if (errors.length === 0) {
          toast({
            title: 'Validation Passed',
            description: `${pledges.length} pledges ready to import.`,
          });
        } else {
          toast({
            title: 'Validation Failed',
            description: `Found ${errors.length} errors. Please fix them before importing.`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        setIsValidating(false);
        toast({
          title: 'Parse Error',
          description: 'Failed to parse file. Please check the format.',
          variant: 'destructive',
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (validationErrors.length > 0) {
      toast({
        title: 'Cannot Import',
        description: 'Please fix all validation errors first.',
        variant: 'destructive',
      });
      return;
    }

    if (parsedData.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please parse the file first.',
        variant: 'destructive',
      });
      return;
    }

    importMutation.mutate(parsedData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bulk Import Pledges</h2>
          <p className="text-muted-foreground">Import multiple pledges from Excel or CSV file</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-3">File Format Requirements</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Your Excel/CSV file must include the following columns:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><span className="font-medium text-foreground">full_name</span> - Full name (required)</li>
            <li><span className="font-medium text-foreground">phone_number</span> - Phone number (optional)</li>
            <li><span className="font-medium text-foreground">promised_amount</span> - Amount pledged (required, use 0 for material)</li>
            <li><span className="font-medium text-foreground">currency</span> - ETB or USD (optional, defaults to ETB)</li>
            <li><span className="font-medium text-foreground">contribution_type</span> - oneTime, monthly, material, or other (required)</li>
            <li><span className="font-medium text-foreground">promised_start_date</span> - Start date YYYY-MM-DD (optional, defaults to today)</li>
            <li><span className="font-medium text-foreground">promised_end_date</span> - End date YYYY-MM-DD (optional, defaults to 3 months from now)</li>
            <li><span className="font-medium text-foreground">amount_paid</span> - Amount already paid (optional, defaults to 0)</li>
            <li><span className="font-medium text-foreground">email</span> - Email address (optional)</li>
            <li><span className="font-medium text-foreground">alt_phone_number</span> - Alternative phone (optional)</li>
            <li><span className="font-medium text-foreground">material_type</span> - Type of material (for material pledges)</li>
            <li><span className="font-medium text-foreground">material_quantity</span> - Quantity (for material pledges)</li>
            <li><span className="font-medium text-foreground">other_description</span> - Description (for other type)</li>
            <li><span className="font-medium text-foreground">remark</span> - Initial note/remark (optional, e.g., "Phone not working", "Needs follow-up")</li>
          </ul>
          <p className="mt-3 text-warning">⚠️ All-or-Nothing: If any row has errors, no pledges will be imported.</p>
          <p className="mt-2 text-info">💡 Status Auto-Calculation: The system will automatically set status to "paid" (if amount_paid {'>='} promised_amount), "partial" (if 0 {'<'} amount_paid {'<'} promised_amount), or "notPaid" (if amount_paid = 0).</p>
        </div>
      </div>

      {/* File Upload */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upload File</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild>
                <span>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Choose File
                </span>
              </Button>
            </label>
            {file && (
              <span className="text-sm text-muted-foreground">{file.name}</span>
            )}
          </div>

          {file && (
            <Button onClick={parseFile} disabled={isValidating}>
              {isValidating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Validate File
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {parsedData.length > 0 && validationErrors.length === 0 && (
        <div className="stat-card bg-success/10 border-success/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">Validation Passed</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {parsedData.length} pledges are ready to import. Click "Import Pledges" to proceed.
              </p>
              <Button onClick={handleImport} disabled={importMutation.isPending}>
                {importMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Importing...
                  </>
                ) : (
                  'Import Pledges'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="stat-card bg-destructive/10 border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">Validation Errors</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Found {validationErrors.length} errors. Please fix them in your file and try again.
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-sm p-2 rounded bg-destructive/5">
                    <span className="font-medium">Row {error.row}</span> - {error.field}: {error.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImport;
