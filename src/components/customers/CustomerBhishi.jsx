import React, { useState, useEffect } from 'react';
import { bhishiAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Badge } from '../ui/badge';

const transactionSchema = yup.object().shape({
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  notes: yup.string().max(100, 'Notes must be at most 100 characters'),
});

const TransactionDialog = ({ open, setOpen, customerId, type, onTransactionSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(transactionSchema),
  });

  const onSubmit = async (data) => {
    try {
      const apiCall = type === 'deposit' ? bhishiAPI.deposit : bhishiAPI.redeem;
      await apiCall(customerId, data);
      toast.success(`Transaction successful!`);
      onTransactionSuccess();
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'deposit' ? 'Make a Deposit' : 'Redeem Amount'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" {...register('amount')} />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} />
            {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CustomerBhishi = ({ customerId }) => {
  const [bhishi, setBhishi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setDepositOpen] = useState(false);
  const [isRedeemOpen, setRedeemOpen] = useState(false);

  const fetchBhishi = async () => {
    try {
      const response = await bhishiAPI.get(customerId);
      setBhishi(response.data);
    } catch (error) {
      toast.error('Failed to fetch Bhishi details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBhishi();
  }, [customerId]);

  if (loading) {
    return <p>Loading Bhishi details...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bhishi (Piggybank)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-lg font-semibold">Current Balance:</p>
            <p className="text-2xl">₹{bhishi?.balance.toFixed(2)}</p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => setDepositOpen(true)}>Deposit</Button>
            <Button onClick={() => setRedeemOpen(true)} variant="outline">Redeem</Button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bhishi?.transactions?.map((tx, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={tx.type === 'deposit' ? 'default' : 'destructive'}>
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell>₹{tx.amount.toFixed(2)}</TableCell>
                <TableCell>{tx.notes}</TableCell>
              </TableRow>
            ))}
             {!bhishi?.transactions?.length && (
                <TableRow>
                    <TableCell colSpan="4" className="text-center">No transactions yet.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>

        <TransactionDialog
          open={isDepositOpen}
          setOpen={setDepositOpen}
          customerId={customerId}
          type="deposit"
          onTransactionSuccess={fetchBhishi}
        />
        <TransactionDialog
          open={isRedeemOpen}
          setOpen={setRedeemOpen}
          customerId={customerId}
          type="redeem"
          onTransactionSuccess={fetchBhishi}
        />
      </CardContent>
    </Card>
  );
};

export default CustomerBhishi;