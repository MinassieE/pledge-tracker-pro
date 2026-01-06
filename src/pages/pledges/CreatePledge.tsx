import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { pledgesApi, CreatePledgePayload } from '@/api/pledges';
import { followUpsApi } from '@/api/followUps';
import { ContributionType } from '@/types';

const pledgeSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  alt_phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  contribution_type: z.enum(['oneTime', 'monthly', 'material']),
  promised_amount: z.number().optional(),
  material_type: z.string().optional(),
  material_quantity: z.number().optional(),
  other_description: z.string().optional(),
  promised_start_date: z.string().min(1, 'Please select a start date'),
  promised_end_date: z.string().optional(),
  assigned_followup: z.string().optional(),
});

type PledgeFormData = z.infer<typeof pledgeSchema>;

const CreatePledge: React.FC = () => {
  const navigate = useNavigate();
  const [contributionType, setContributionType] = useState<ContributionType>('oneTime');

  // Fetch follow-up users from backend
  const { data: followUpUsers = [] } = useQuery({
    queryKey: ['allFollowUps'],
    queryFn: followUpsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePledgePayload) => pledgesApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Pledge created',
        description: 'The pledge has been created successfully.',
      });
      navigate('/pledges');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create pledge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PledgeFormData>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      contribution_type: 'oneTime',
    },
  });

  const onSubmit = async (data: PledgeFormData) => {
    const payload: CreatePledgePayload = {
      full_name: data.full_name,
      phone_number: data.phone_number,
      alt_phone_number: data.alt_phone_number || '',
      email: data.email || '',
      contribution_type: data.contribution_type,
      promised_start_date: data.promised_start_date,
      promised_end_date: data.promised_end_date || '',
      assigned_followup: data.assigned_followup || '',
    };

    if (data.contribution_type === 'material') {
      payload.material_type = data.material_type || '';
      payload.material_quantity = data.material_quantity;
      payload.other_description = data.other_description || '';
    } else {
      payload.promised_amount = data.promised_amount;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create New Pledge</h2>
          <p className="text-muted-foreground">Add a new pledge to the system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="stat-card space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Pledger Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                placeholder="Enter full name"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                placeholder="0911223344"
                {...register('phone_number')}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alt_phone_number">Alt Phone Number</Label>
              <Input
                id="alt_phone_number"
                placeholder="Optional"
                {...register('alt_phone_number')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Optional"
                {...register('email')}
              />
            </div>
          </div>
        </div>

        <div className="stat-card space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Pledge Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contribution Type *</Label>
              <Select
                defaultValue="oneTime"
                onValueChange={(value: ContributionType) => {
                  setContributionType(value);
                  setValue('contribution_type', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oneTime">One Time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promised_start_date">Start Date *</Label>
              <Input
                id="promised_start_date"
                type="date"
                {...register('promised_start_date')}
              />
              {errors.promised_start_date && (
                <p className="text-sm text-destructive">{errors.promised_start_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promised_end_date">End Date</Label>
            <Input
              id="promised_end_date"
              type="date"
              {...register('promised_end_date')}
            />
          </div>

          {contributionType !== 'material' ? (
            <div className="space-y-2">
              <Label htmlFor="promised_amount">Promised Amount (ETB) *</Label>
              <Input
                id="promised_amount"
                type="number"
                placeholder="Enter amount"
                {...register('promised_amount', { valueAsNumber: true })}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material_type">Material Type *</Label>
                  <Input
                    id="material_type"
                    placeholder="e.g., Cement, Steel, etc."
                    {...register('material_type')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material_quantity">Quantity</Label>
                  <Input
                    id="material_quantity"
                    type="number"
                    placeholder="Enter quantity"
                    {...register('material_quantity', { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_description">Description</Label>
                <Textarea
                  id="other_description"
                  placeholder="Additional details about the material"
                  rows={3}
                  {...register('other_description')}
                />
              </div>
            </>
          )}
        </div>

        <div className="stat-card space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Assignment
          </h3>

          <div className="space-y-2">
            <Label>Assign Follow-Up</Label>
            <Select onValueChange={(value) => setValue('assigned_followup', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a follow-up user" />
              </SelectTrigger>
              <SelectContent>
                {followUpUsers.map((user) => (
                  <SelectItem key={user._id || user.id} value={user._id || user.id || ''}>
                    {user.first_name} {user.middle_name || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Pledge
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePledge;
