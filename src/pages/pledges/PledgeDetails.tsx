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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] = useState(false);
  const [isDeleteRemarkModalOpen, setIsDeleteRemarkModalOpen] = useState(false);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [isEditRemarkModalOpen, setIsEditRemarkModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [remarkComment, setRemarkComment] = useState('');
  const [standaloneRemark, setStandaloneRemark] = useState('');
  const [selectedFollowUp, setSelectedFollowUp] = useState('');
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);
  const [remarkToDelete, setRemarkToDelete] = useState<number | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<number | null>(null);
  const [remarkToEdit, setRemarkToEdit] = useState<number | null>(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('cash');
  const [editRemarkComment, setEditRemarkComment] = useState('');

  // Fetch pledge based on role
  const { data: pledge, isLoading, error } = useQuery({
    queryKey: ['pledge', id],
    queryFn: () => isFollowUp ? pledgesApi.getMyPledgeById(id!) : pledgesApi.getById(id!),
    enabled: !!id,
  });

  // Fetch follow-ups for assignment (only for admin/superAdmin)
  const { data: followUps = [] } = useQuery({
    queryKey: ['allFollowUps'],
    queryFn: async () => {
      const { followUpsApi } = await import('@/api/followUps');
      return followUpsApi.getAll();
    },
    enabled: !isFollowUp,
  });

  // Update mutation - use different endpoint based on role
  const updateMutation = useMutation({
    mutationFn: (data: UpdatePledgePayload) => 
      isFollowUp 
        ? pledgesApi.updateMyPledge(id!, data)
        : pledgesApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledge', id] });
      queryClient.invalidateQueries({ queryKey: ['myPledges'] });
      queryClient.invalidateQueries({ queryKey: ['allPledges'] });
      queryClient.invalidateQueries({ queryKey: ['overduePledges'] });
      toast({
        title: 'Success',
        description: 'Pledge updated successfully.',
      });
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setRemarkComment('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update pledge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: (followUpId: string) => pledgesApi.assignToFollowUp(id!, followUpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledge', id] });
      queryClient.invalidateQueries({ queryKey: ['allPledges'] });
      toast({
        title: 'Success',
        description: 'Pledge assigned successfully.',
      });
      setIsAssignModalOpen(false);
      setSelectedFollowUp('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to assign pledge.',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => pledgesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPledges'] });
      queryClient.invalidateQueries({ queryKey: ['myPledges'] });
      queryClient.invalidateQueries({ queryKey: ['overduePledges'] });
      toast({
        title: 'Success',
        description: 'Pledge deleted successfully.',
      });
      navigate('/pledges');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete pledge.',
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

  const handleAddRemark = () => {
    if (!standaloneRemark.trim()) {
      toast({
        title: 'Invalid remark',
        description: 'Please enter a remark.',
        variant: 'destructive',
      });
      return;
    }

    const payload: UpdatePledgePayload = {
      remark: { comment: standaloneRemark.trim() },
    };

    updateMutation.mutate(payload);
    setIsRemarkModalOpen(false);
    setStandaloneRemark('');
  };

  const isWithin24Hours = (date: Date | string) => {
    const entryDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const canEditOrDelete = (entryUserId?: string) => {
    // Super admin can edit/delete everything
    if (user?.role === 'superAdmin') return true;
    
    // Others can only edit/delete their own entries
    return entryUserId === user?.id;
  };

  const handleEditPayment = (index: number) => {
    const payment = payments[index];
    setPaymentToEdit(index);
    setEditPaymentAmount(payment.amount.toString());
    setEditPaymentMethod(payment.method || 'cash');
    setIsEditPaymentModalOpen(true);
  };

  const confirmEditPayment = () => {
    if (paymentToEdit === null || !pledge) return;
    
    if (!editPaymentAmount || parseFloat(editPaymentAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedPayments = [...payments];
    updatedPayments[paymentToEdit] = {
      ...updatedPayments[paymentToEdit],
      amount: parseFloat(editPaymentAmount),
      method: editPaymentMethod,
    };
    
    const payload: any = {
      payment_history: updatedPayments
    };
    
    updateMutation.mutate(payload);
    setIsEditPaymentModalOpen(false);
    setPaymentToEdit(null);
    setEditPaymentAmount('');
    setEditPaymentMethod('cash');
  };

  const handleDeletePayment = (index: number) => {
    setPaymentToDelete(index);
    setIsDeletePaymentModalOpen(true);
  };

  const confirmDeletePayment = () => {
    if (paymentToDelete === null || !pledge) return;
    
    const updatedPayments = [...payments];
    updatedPayments.splice(paymentToDelete, 1);
    
    const payload: any = {
      payment_history: updatedPayments
    };
    
    updateMutation.mutate(payload);
    setIsDeletePaymentModalOpen(false);
    setPaymentToDelete(null);
  };

  const handleEditRemark = (index: number) => {
    const remark = remarks[index];
    setRemarkToEdit(index);
    setEditRemarkComment(remark.comment);
    setIsEditRemarkModalOpen(true);
  };

  const confirmEditRemark = () => {
    if (remarkToEdit === null || !pledge) return;
    
    if (!editRemarkComment.trim()) {
      toast({
        title: 'Invalid remark',
        description: 'Please enter a remark.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedRemarks = [...remarks];
    updatedRemarks[remarkToEdit] = {
      ...updatedRemarks[remarkToEdit],
      comment: editRemarkComment.trim(),
    };
    
    const payload: any = {
      remarks: updatedRemarks
    };
    
    updateMutation.mutate(payload);
    setIsEditRemarkModalOpen(false);
    setRemarkToEdit(null);
    setEditRemarkComment('');
  };

  const handleDeleteRemark = (index: number) => {
    setRemarkToDelete(index);
    setIsDeleteRemarkModalOpen(true);
  };

  const confirmDeleteRemark = () => {
    if (remarkToDelete === null || !pledge) return;
    
    const updatedRemarks = [...remarks];
    updatedRemarks.splice(remarkToDelete, 1);
    
    const payload: any = {
      remarks: updatedRemarks
    };
    
    updateMutation.mutate(payload);
    setIsDeleteRemarkModalOpen(false);
    setRemarkToDelete(null);
  };

  const handleAssign = () => {
    if (!selectedFollowUp) {
      toast({
        title: 'Validation Error',
        description: 'Please select a follow-up user.',
        variant: 'destructive',
      });
      return;
    }
    assignMutation.mutate(selectedFollowUp);
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
  const fullName = pledge.full_name || pledge.fullName || 'N/A';
  const phone = pledge.phone_number || pledge.phone || 'N/A';
  const address = pledge.address || 'N/A';
  const contributionType = pledge.contribution_type || pledge.contributionType || 'oneTime';
  const amount = pledge.promised_amount || pledge.amount || 0;
  const currency = pledge.currency || 'ETB';
  const promisedDate = pledge.promised_end_date || pledge.promised_date || pledge.promisedDate;
  const materialType = pledge.material_type || pledge.materialType;
  const totalPaid = pledge.amount_paid || pledge.total_paid || pledge.totalPaid || 0;
  const payments = pledge.payment_history || pledge.payments || [];
  const notes = pledge.notes || '';
  const remarks = pledge.remarks || [];

  const remainingBalance = amount - totalPaid;
  const progressPercentage = amount > 0 ? (totalPaid / amount) * 100 : 0;
  const isCashPledge = contributionType !== 'material';

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
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => setIsDeleteModalOpen(true)}
            >
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
                  <p className="font-medium text-foreground capitalize">{contributionType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pledged Amount</p>
                  <p className="font-medium text-foreground">
                    {isCashPledge
                      ? formatCurrency(amount, currency)
                      : `${formatCurrency(amount, currency)} - ${materialType || 'Material'}`
                  }
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
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Assigned Follow-Up</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {typeof pledge.assigned_followup === 'object' && pledge.assigned_followup
                        ? `${pledge.assigned_followup.first_name || ''} ${pledge.assigned_followup.middle_name || ''}`.trim()
                        : pledge.assigned_followup
                        ? 'Assigned'
                        : 'Not assigned'}
                    </p>
                    {!isFollowUp && !pledge.assigned_followup && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsAssignModalOpen(true)}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
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
              <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>

            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment: Payment, index: number) => {
                  const paymentDate = payment.date || payment.paidAt;
                  const canDelete = paymentDate && isWithin24Hours(paymentDate) && canEditOrDelete(payment.added_by);
                  
                  return (
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {paymentDate ? new Date(paymentDate).toLocaleDateString() : 'N/A'}
                        </p>
                        {canDelete && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary"
                              onClick={() => handleEditPayment(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeletePayment(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No payments recorded yet.</p>
            )}
          </div>

          {/* Remarks History */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Remarks</h3>
              <Button size="sm" variant="outline" onClick={() => setIsRemarkModalOpen(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Add Remark
              </Button>
            </div>
            {remarks.length > 0 ? (
              <div className="space-y-3">
                {remarks.map((remark: any, index: number) => {
                  const author = remark.followup_id 
                    ? (typeof remark.followup_id === 'object' 
                        ? `${remark.followup_id.first_name || ''} ${remark.followup_id.middle_name || ''}`.trim() 
                        : 'Follow-up User')
                    : 'System';
                  
                  const remarkUserId = remark.followup_id 
                    ? (typeof remark.followup_id === 'object' ? remark.followup_id._id : remark.followup_id)
                    : undefined;
                  
                  const remarkDate = remark.date ? new Date(remark.date) : null;
                  const formattedDate = remarkDate ? remarkDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : '';
                  const formattedTime = remarkDate ? remarkDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : '';
                  const canDelete = remarkDate && isWithin24Hours(remarkDate) && canEditOrDelete(remarkUserId);
                  
                  return (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-muted/50 border border-muted"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-foreground mb-2 flex-1">{remark.comment}</p>
                        {canDelete && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-primary hover:text-primary"
                              onClick={() => handleEditRemark(index)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteRemark(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{author}</span>
                        </div>
                        {remarkDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formattedDate} at {formattedTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No remarks yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          {isCashPledge && (
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
                    <span className="text-sm font-medium text-foreground">
                      {remainingBalance < 0 ? 'Overpaid' : 'Remaining'}
                    </span>
                    <span className={`font-bold ${remainingBalance < 0 ? 'text-warning' : 'text-destructive'}`}>
                      {formatCurrency(Math.abs(remainingBalance), currency)}
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

      {/* Assign Follow-Up Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedFollowUp('');
        }}
        title="Assign Follow-Up"
        description="Select a follow-up user to assign this pledge to."
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedFollowUp('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assignMutation.isPending}>
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="followUpSelect">Follow-Up User</Label>
            <Select value={selectedFollowUp} onValueChange={setSelectedFollowUp}>
              <SelectTrigger>
                <SelectValue placeholder="Select a follow-up user" />
              </SelectTrigger>
              <SelectContent>
                {followUps.map((followUp) => (
                  <SelectItem key={followUp._id} value={followUp._id}>
                    {`${followUp.first_name || ''} ${followUp.middle_name || ''}`.trim() || followUp.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {followUps.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No follow-up users available. Please create one first.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Pledge"
        description="Are you sure you want to delete this pledge? This action cannot be undone."
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-foreground">
              <strong>Pledge:</strong> {fullName}
            </p>
            <p className="text-sm text-foreground mt-1">
              <strong>Amount:</strong> {currency} {amount.toLocaleString()}
            </p>
            <p className="text-sm text-foreground mt-1">
              <strong>Status:</strong> {pledge.status}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the pledge and remove it from any assigned follow-up users.
          </p>
        </div>
      </Modal>

      {/* Add Remark Modal */}
      <Modal
        isOpen={isRemarkModalOpen}
        onClose={() => {
          setIsRemarkModalOpen(false);
          setStandaloneRemark('');
        }}
        title="Add Remark"
        description="Add a note or comment about this pledge (e.g., phone not working, follow-up needed, etc.)"
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRemarkModalOpen(false);
                setStandaloneRemark('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRemark} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Adding...' : 'Add Remark'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="standaloneRemark">Remark</Label>
            <Textarea
              id="standaloneRemark"
              placeholder="Enter your remark here (e.g., Phone number not working, needs follow-up, etc.)"
              value={standaloneRemark}
              onChange={(e) => setStandaloneRemark(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Payment Confirmation Modal */}
      <Modal
        isOpen={isDeletePaymentModalOpen}
        onClose={() => {
          setIsDeletePaymentModalOpen(false);
          setPaymentToDelete(null);
        }}
        title="Delete Payment"
        description="Are you sure you want to delete this payment? This action cannot be undone."
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeletePaymentModalOpen(false);
                setPaymentToDelete(null);
              }}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePayment}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Payment
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {paymentToDelete !== null && payments[paymentToDelete] && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-foreground">
                <strong>Amount:</strong> {formatCurrency(payments[paymentToDelete].amount, payments[paymentToDelete].currency || currency)}
              </p>
              <p className="text-sm text-foreground mt-1">
                <strong>Method:</strong> {payments[paymentToDelete].method || 'N/A'}
              </p>
              <p className="text-sm text-foreground mt-1">
                <strong>Date:</strong> {payments[paymentToDelete].date ? new Date(payments[paymentToDelete].date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            This will permanently remove this payment from the pledge history. The pledge status and balance will be recalculated.
          </p>
        </div>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        isOpen={isEditPaymentModalOpen}
        onClose={() => {
          setIsEditPaymentModalOpen(false);
          setPaymentToEdit(null);
          setEditPaymentAmount('');
          setEditPaymentMethod('cash');
        }}
        title="Edit Payment"
        description="Update the payment details."
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditPaymentModalOpen(false);
                setPaymentToEdit(null);
                setEditPaymentAmount('');
                setEditPaymentMethod('cash');
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditPayment} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Payment'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editPaymentAmount">Amount ({currency})</Label>
            <Input
              id="editPaymentAmount"
              type="number"
              placeholder="Enter payment amount"
              value={editPaymentAmount}
              onChange={(e) => setEditPaymentAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editPaymentMethod">Payment Method</Label>
            <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod}>
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
        </div>
      </Modal>

      {/* Delete Remark Confirmation Modal */}
      <Modal
        isOpen={isDeleteRemarkModalOpen}
        onClose={() => {
          setIsDeleteRemarkModalOpen(false);
          setRemarkToDelete(null);
        }}
        title="Delete Remark"
        description="Are you sure you want to delete this remark? This action cannot be undone."
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteRemarkModalOpen(false);
                setRemarkToDelete(null);
              }}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRemark}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Remark
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {remarkToDelete !== null && remarks[remarkToDelete] && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-foreground">
                <strong>Remark:</strong> {remarks[remarkToDelete].comment}
              </p>
              <p className="text-sm text-foreground mt-1">
                <strong>Date:</strong> {remarks[remarkToDelete].date ? new Date(remarks[remarkToDelete].date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            This will permanently remove this remark from the pledge.
          </p>
        </div>
      </Modal>

      {/* Edit Remark Modal */}
      <Modal
        isOpen={isEditRemarkModalOpen}
        onClose={() => {
          setIsEditRemarkModalOpen(false);
          setRemarkToEdit(null);
          setEditRemarkComment('');
        }}
        title="Edit Remark"
        description="Update the remark text."
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditRemarkModalOpen(false);
                setRemarkToEdit(null);
                setEditRemarkComment('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditRemark} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Remark'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editRemarkComment">Remark</Label>
            <Textarea
              id="editRemarkComment"
              placeholder="Enter your remark here"
              value={editRemarkComment}
              onChange={(e) => setEditRemarkComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PledgeDetails;
