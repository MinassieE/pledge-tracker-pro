import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { pledgesApi } from '@/api/pledges';
import { projectsApi } from '@/api/projects';
import { useProject } from '@/context/ProjectContext';
import { exportPledgesToExcel, exportPledgesToPDF, exportReportToExcel, exportReportToPDF } from '@/utils/exportUtils';
import { Pledge } from '@/types';

const CustomReports: React.FC = () => {
  const { selectedProjectId } = useProject();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<'pledges' | 'collection' | 'performance'>('pledges');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'partial'>('all');

  // Fetch selected project
  const { data: selectedProject } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () => projectsApi.getById(selectedProjectId!),
    enabled: !!selectedProjectId,
  });

  // Fetch all pledges
  const { data: allPledges = [], isLoading } = useQuery({
    queryKey: ['allPledges', selectedProjectId],
    queryFn: pledgesApi.getAll,
    enabled: !!selectedProjectId,
  });

  // Filter pledges by date range and status
  const filteredPledges = allPledges.filter((pledge: Pledge) => {
    const pledgeDate = new Date(pledge.promised_end_date || pledge.promised_date || '');
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateMatch = (!start || pledgeDate >= start) && (!end || pledgeDate <= end);
    const statusMatch = statusFilter === 'all' || pledge.status === statusFilter;

    return dateMatch && statusMatch;
  });

  // Calculate statistics
  const stats = {
    total: filteredPledges.length,
    paid: filteredPledges.filter((p: Pledge) => p.status === 'paid').length,
    pending: filteredPledges.filter((p: Pledge) => p.status === 'pending').length,
    partial: filteredPledges.filter((p: Pledge) => p.status === 'partial').length,
    totalPromised: filteredPledges.reduce((sum: number, p: Pledge) => {
      if (p.contribution_type === 'material') return sum;
      return sum + (p.promised_amount || p.amount || 0);
    }, 0),
    totalCollected: filteredPledges.reduce((sum: number, p: Pledge) => {
      if (p.contribution_type === 'material') return sum;
      return sum + (p.amount_paid || p.total_paid || p.totalPaid || 0);
    }, 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExportExcel = () => {
    if (filteredPledges.length === 0) {
      toast({
        title: 'No Data',
        description: 'No pledges found for the selected criteria.',
        variant: 'destructive',
      });
      return;
    }

    const filename = `${reportType}_report_${startDate || 'all'}_to_${endDate || 'all'}`;
    
    if (reportType === 'pledges') {
      exportPledgesToExcel(filteredPledges, filename);
    } else if (reportType === 'collection') {
      const data = [{
        'Total Pledges': stats.total,
        'Paid': stats.paid,
        'Pending': stats.pending,
        'Partial': stats.partial,
        'Total Promised': formatCurrency(stats.totalPromised),
        'Total Collected': formatCurrency(stats.totalCollected),
        'Collection Rate': `${((stats.totalCollected / stats.totalPromised) * 100).toFixed(2)}%`,
      }];
      exportReportToExcel(data, Object.keys(data[0]), filename);
    }

    toast({
      title: 'Success',
      description: 'Report exported to Excel successfully.',
    });
  };

  const handleExportPDF = () => {
    if (filteredPledges.length === 0) {
      toast({
        title: 'No Data',
        description: 'No pledges found for the selected criteria.',
        variant: 'destructive',
      });
      return;
    }

    const filename = `${reportType}_report_${startDate || 'all'}_to_${endDate || 'all'}`;
    
    if (reportType === 'pledges') {
      exportPledgesToPDF(filteredPledges, filename, selectedProject?.name);
    } else if (reportType === 'collection') {
      const data = [
        ['Total Pledges', stats.total.toString()],
        ['Paid', stats.paid.toString()],
        ['Pending', stats.pending.toString()],
        ['Partial', stats.partial.toString()],
        ['Total Promised', formatCurrency(stats.totalPromised)],
        ['Total Collected', formatCurrency(stats.totalCollected)],
        ['Collection Rate', `${((stats.totalCollected / stats.totalPromised) * 100).toFixed(2)}%`],
      ];
      exportReportToPDF(data, ['Metric', 'Value'], 'Collection Report', filename, selectedProject?.name);
    }

    toast({
      title: 'Success',
      description: 'Report exported to PDF successfully.',
    });
  };

  if (!selectedProjectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a project to generate reports</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Custom Reports</h2>
        <p className="text-muted-foreground">Generate custom reports with date ranges and filters</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Report Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pledges">Pledges List</SelectItem>
                <SelectItem value="collection">Collection Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status Filter</Label>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleExportExcel} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </Card>

      {/* Statistics Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Pledges</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{stats.paid}</p>
            <p className="text-sm text-muted-foreground">Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.partial}</p>
            <p className="text-sm text-muted-foreground">Partial</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalPromised)}</p>
            <p className="text-sm text-muted-foreground">Promised</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalCollected)}</p>
            <p className="text-sm text-muted-foreground">Collected</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomReports;
