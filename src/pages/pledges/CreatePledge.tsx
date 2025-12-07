import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const pledgeSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().optional(),
  pledgeType: z.enum(['cash', 'material']),
  amount: z.number().optional(),
  currency: z.enum(['ETB', 'USD']).optional(),
  materialType: z.string().optional(),
  promisedDate: z.string().min(1, 'Please select a promised date'),
  assignedFollowUp: z.string().optional(),
  notes: z.string().optional(),
});

type PledgeFormData = z.infer<typeof pledgeSchema>;

const CreatePledge: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pledgeType, setPledgeType] = useState<'cash' | 'material'>('cash');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PledgeFormData>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      pledgeType: 'cash',
      currency: 'ETB',
    },
  });

  // Mock follow-up users
  const followUpUsers = [
    { _id: '1', name: 'Marta Solomon' },
    { _id: '2', name: 'Dawit Hailu' },
    { _id: '3', name: 'Sara Tadesse' },
    { _id: '4', name: 'Yonas Berhane' },
  ];

  const onSubmit = async (data: PledgeFormData) => {
    setIsLoading(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Pledge created',
        description: 'The pledge has been created successfully.',
      });
      navigate('/pledges');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create pledge. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="+251..."
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter address"
              {...register('address')}
            />
          </div>
        </div>

        <div className="stat-card space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Pledge Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pledge Type *</Label>
              <Select
                defaultValue="cash"
                onValueChange={(value: 'cash' | 'material') => {
                  setPledgeType(value);
                  setValue('pledgeType', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promisedDate">Promised Date *</Label>
              <Input
                id="promisedDate"
                type="date"
                {...register('promisedDate')}
              />
              {errors.promisedDate && (
                <p className="text-sm text-destructive">{errors.promisedDate.message}</p>
              )}
            </div>
          </div>

          {pledgeType === 'cash' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select
                  defaultValue="ETB"
                  onValueChange={(value: 'ETB' | 'USD') => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETB">ETB (Birr)</SelectItem>
                    <SelectItem value="USD">USD (Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="materialType">Material Type *</Label>
              <Input
                id="materialType"
                placeholder="e.g., Construction Materials, Equipment"
                {...register('materialType')}
              />
            </div>
          )}
        </div>

        <div className="stat-card space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Assignment
          </h3>

          <div className="space-y-2">
            <Label>Assign Follow-Up</Label>
            <Select onValueChange={(value) => setValue('assignedFollowUp', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a follow-up user" />
              </SelectTrigger>
              <SelectContent>
                {followUpUsers.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              rows={4}
              {...register('notes')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
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
