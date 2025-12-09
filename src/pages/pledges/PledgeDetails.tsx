import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { toast } from '@/hooks/use-toast';
import { Pledge, Payment } from '@/types';

const PledgeDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Mock pledge data
  const pledge: Pledge = {
    _id: id || '1',
    fullName: 'Abebe Kebede',
    phone: '+251911234567',
    address: 'Bole, Addis Ababa, Ethiopia',
    pledgeType: 'cash',
    amount: 50000,
    currency: 'ETB',
    promisedDate: '2024-01-20',
    status: 'partial',
    notes: 'Committed to pay in two installments. First payment received on January 5th.',
    payments: [
      { _id: '1', amount: 25000, currency: 'ETB', paidAt: '2024-01-05', notes: 'First installment' },
      { _id: '2', amount: 10000, currency: 'ETB', paidAt: '2024-01-12', notes: 'Second payment' },
    ],
    totalPaid: 35000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-12',
  };

  const formatCurrency = (value: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const remainingBalance = (pledge.amount || 0) - pledge.totalPaid;
  const progressPercentage = pledge.amount ? (pledge.totalPaid / pledge.amount) * 100 : 0;

  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    // API call would go here
    toast({
      title: 'Payment recorded',
      description: `Payment of ${formatCurrency(parseFloat(paymentAmount), pledge.currency)} has been recorded.`,
    });
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentNotes('');
  };

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
              <h2 className="text-2xl font-bold text-foreground">{pledge.fullName}</h2>
              <StatusBadge status={pledge.status} />
            </div>
            <p className="text-muted-foreground">Pledge ID: {pledge._id}</p>
          </div>
        </div>
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
                  <p className="font-medium text-foreground">{pledge.phone}</p>
                </div>
              </div>
              {pledge.address && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{pledge.address}</p>
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
                  <p className="font-medium text-foreground capitalize">{pledge.pledgeType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pledged Amount</p>
                  <p className="font-medium text-foreground">
                    {pledge.pledgeType === 'cash'
                      ? formatCurrency(pledge.amount || 0, pledge.currency)
                      : pledge.materialType}
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
                    {new Date(pledge.promisedDate).toLocaleDateString()}
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
                      ? (pledge.assignedFollowUp.first_name || pledge.assignedFollowUp.name || 'Unknown')
                      : 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            {pledge.notes && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-foreground">{pledge.notes}</p>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Payment History</h3>
              {pledge.pledgeType === 'cash' && (
                <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              )}
            </div>

            {pledge.payments.length > 0 ? (
              <div className="space-y-3">
                {pledge.payments.map((payment, index) => (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">{payment.notes}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No payments recorded yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          {pledge.pledgeType === 'cash' && (
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
                      {formatCurrency(pledge.amount || 0, pledge.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Paid</span>
                    <span className="font-medium text-success">
                      {formatCurrency(pledge.totalPaid, pledge.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Remaining</span>
                    <span className="font-bold text-destructive">
                      {formatCurrency(remainingBalance, pledge.currency)}
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
                    {new Date(pledge.createdAt).toLocaleDateString()}
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
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <div>
                  <p className="text-sm font-medium text-foreground">Due Date</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(pledge.promisedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
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
            <Button onClick={handleAddPayment}>Record Payment</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Amount ({pledge.currency})</Label>
            <Input
              id="paymentAmount"
              type="number"
              placeholder="Enter payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Remaining balance: {formatCurrency(remainingBalance, pledge.currency)}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentNotes">Notes (optional)</Label>
            <Textarea
              id="paymentNotes"
              placeholder="Add any notes about this payment..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PledgeDetails;
