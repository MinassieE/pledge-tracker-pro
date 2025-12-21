import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Plus,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { pledgesApi, UpdatePledgePayload } from '@/api/pledges';
import { useAuth } from '@/context/AuthContext';
import { Pledge, Payment } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PledgeDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isFollowUp = user?.role === 'followUp';

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [remarkComment, setRemarkComment] = useState('');

  // Fetch pledge based on role
  const { data: pledge, isLoading, error } = useQuery({
    queryKey: ['pledge', id],
    queryFn: () => isFollowUp ? pledgesApi.getMyPledgeById(id!) : pledgesApi.getById(id!).then(res => res.data),
    enabled: !!id,
  });

  // Update mutation for follow-up user
  const updateMutation = useMutation({
    mutationFn: (data: UpdatePledgePayload) => pledgesApi.updateMyPledge(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledge', id] });
      queryClient.invalidateQueries({ queryKey: ['myPledges'] });
      queryClient.invalidateQueries({ queryKey: ['overduePledges'] });
      toast({
        title: 'Success',
        description: 'Pledge updated successfully.',
      });
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setRemarkComment('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update pledge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const formatCurrency = (value: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    const payload: UpdatePledgePayload = {
      payment: {
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
      },
    };

    if (remarkComment.trim()) {
      payload.remark = { comment: remarkComment.trim() };
    }

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !pledge) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load pledge details. Please try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  // Handle both camelCase and snake_case from backend
  const fullName = pledge.fullName || pledge.full_name || 'N/A';
  const phone = pledge.phone || pledge.phone_number || 'N/A';
  const address = pledge.address || 'N/A';
  const pledgeType = pledge.pledgeType || pledge.pledge_type || 'cash';
  const amount = pledge.amount || 0;
  const currency = pledge.currency || 'ETB';
  const promisedDate = pledge.promisedDate || pledge.promised_date;
  const materialType = pledge.materialType || pledge.material_type;
  const totalPaid = pledge.totalPaid || pledge.total_paid || 0;
  const payments = pledge.payments || [];
  const notes = pledge.notes || '';
  const remarks = pledge.remarks || [];

  const remainingBalance = amount - totalPaid;
  const progressPercentage = amount > 0 ? (totalPaid / amount) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
              <StatusBadge status={pledge.status || 'pending'} />
            </div>
            <p className="text-muted-foreground">Pledge ID: {pledge._id}</p>
          </div>
        </div>
        {!isFollowUp && (
          <div className="flex items-center gap-2">
            <Link to={`/pledges/${pledge._id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="stat-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{phone}</p>
                </div>
              </div>
              {address !== 'N/A' && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pledge Info */}
          <div className="stat-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Pledge Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <FileText className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground capitalize">{pledgeType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pledged Amount</p>
                  <p className="font-medium text-foreground">
                    {pledgeType === 'cash'
                      ? formatCurrency(amount, currency)
                      : materialType || 'Material'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Calendar className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Promised Date</p>
                  <p className="font-medium text-foreground">
                    {promisedDate ? new Date(promisedDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Follow-Up</p>
                  <p className="font-medium text-foreground">
                    {typeof pledge.assignedFollowUp === 'object'
                      ? (pledge.assignedFollowUp?.first_name || pledge.assignedFollowUp?.name || 'Unknown')
                      : 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            {notes && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-foreground">{notes}</p>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Payment History</h3>
              {pledgeType === 'cash' && (
                <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              )}
            </div>

            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment: Payment, index: number) => (
                  <div
                    key={payment._id || index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {formatCurrency(payment.amount, payment.currency || currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.method && `Method: ${payment.method}`}
                        {payment.notes && ` - ${payment.notes}`}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No payments recorded yet.</p>
            )}
          </div>

          {/* Remarks History */}
          {remarks.length > 0 && (
            <div className="stat-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Remarks</h3>
              <div className="space-y-3">
                {remarks.map((remark: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/50"
                  >
                    <p className="text-foreground">{remark.comment}</p>
                    {remark.createdAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(remark.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          {pledgeType === 'cash' && (
            <div className="stat-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Payment Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium text-foreground">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pledged</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(amount, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Paid</span>
                    <span className="font-medium text-success">
                      {formatCurrency(totalPaid, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Remaining</span>
                    <span className="font-bold text-destructive">
                      {formatCurrency(remainingBalance, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="stat-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {pledge.createdAt ? new Date(pledge.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              {pledge.updatedAt && (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-info" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(pledge.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {promisedDate && (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Due Date</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(promisedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
        description="Add a new payment for this pledge."
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Amount ({currency})</Label>
            <Input
              id="paymentAmount"
              type="number"
              placeholder="Enter payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Remaining balance: {formatCurrency(remainingBalance, currency)}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarkComment">Remark (optional)</Label>
            <Textarea
              id="remarkComment"
              placeholder="Add any notes about this payment..."
              value={remarkComment}
              onChange={(e) => setRemarkComment(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PledgeDetails;
