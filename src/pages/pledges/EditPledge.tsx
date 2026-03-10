import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { pledgesApi } from '@/api/pledges';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EditPledge: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    alt_phone_number: '',
    email: '',
    promised_amount: '',
    currency: 'ETB',
    contribution_type: 'oneTime',
    material_type: '',
    material_quantity: '',
    other_description: '',
    promised_start_date: '',
    promised_end_date: '',
    notes: '',
  });

  // Fetch pledge data
  const { data: pledge, isLoading } = useQuery({
    queryKey: ['pledge', id],
    queryFn: () => pledgesApi.getById(id!),
    enabled: !!id,
  });

  // Populate form when pledge data is loaded
  useEffect(() => {
    if (pledge) {
      // Helper function to format date safely
      const formatDate = (dateValue: any) => {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        // Check if date is valid and not epoch (1970)
        if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
          return '';
        }
        return date.toISOString().split('T')[0];
      };

      setFormData({
        full_name: pledge.full_name || '',
        phone_number: pledge.phone_number || '',
        alt_phone_number: pledge.alt_phone_number || '',
        email: pledge.email || '',
        promised_amount: pledge.promised_amount?.toString() || '',
        currency: pledge.currency || 'ETB',
        contribution_type: pledge.contribution_type || 'oneTime',
        material_type: pledge.material_type || '',
        material_quantity: pledge.material_quantity?.toString() || '',
        other_description: pledge.other_description || '',
        promised_start_date: formatDate(pledge.promised_start_date),
        promised_end_date: formatDate(pledge.promised_end_date),
        notes: pledge.notes || '',
      });
    }
  }, [pledge]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => pledgesApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledge', id] });
      queryClient.invalidateQueries({ queryKey: ['allPledges'] });
      toast({
        title: 'Success',
        description: 'Pledge updated successfully.',
      });
      navigate(`/pledges/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update pledge.',
        variant: 'destructive',
      });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name || !formData.promised_amount || !formData.contribution_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      ...formData,
      promised_amount: parseFloat(formData.promised_amount),
      material_quantity: formData.material_quantity ? parseFloat(formData.material_quantity) : undefined,
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Pledge</h2>
          <p className="text-muted-foreground">Update pledge information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="stat-card space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt_phone_number">Alternative Phone</Label>
              <Input
                id="alt_phone_number"
                value={formData.alt_phone_number}
                onChange={(e) => handleChange('alt_phone_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Pledge Details */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Pledge Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contribution_type">Contribution Type *</Label>
              <Select
                value={formData.contribution_type}
                onValueChange={(value) => handleChange('contribution_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oneTime">One Time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETB">ETB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promised_amount">Promised Amount *</Label>
              <Input
                id="promised_amount"
                type="number"
                value={formData.promised_amount}
                onChange={(e) => handleChange('promised_amount', e.target.value)}
                required
              />
            </div>

            {formData.contribution_type === 'material' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="material_type">Material Type</Label>
                  <Input
                    id="material_type"
                    value={formData.material_type}
                    onChange={(e) => handleChange('material_type', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material_quantity">Material Quantity</Label>
                  <Input
                    id="material_quantity"
                    type="number"
                    value={formData.material_quantity}
                    onChange={(e) => handleChange('material_quantity', e.target.value)}
                  />
                </div>
              </>
            )}

            {formData.contribution_type === 'other' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="other_description">Other Description</Label>
                <Textarea
                  id="other_description"
                  value={formData.other_description}
                  onChange={(e) => handleChange('other_description', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="promised_start_date">Start Date</Label>
              <Input
                id="promised_start_date"
                type="date"
                value={formData.promised_start_date}
                onChange={(e) => handleChange('promised_start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promised_end_date">End Date</Label>
              <Input
                id="promised_end_date"
                type="date"
                value={formData.promised_end_date}
                onChange={(e) => handleChange('promised_end_date', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update Pledge'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPledge;
