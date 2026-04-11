'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Wallet,
  Banknote,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorEarningsPage() {
  const [earnings, setEarnings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    setIsLoading(true)
    try {
      const response = await doctorAPI.getEarnings()
      if (response.success) {
        setEarnings(response.data)
      }
    } catch (error) {
      showToast.error('Failed to load earnings')
    } finally {
      setIsLoading(false)
    }
  }

  const requestWithdrawal = async () => {
    const amount = parseInt(withdrawAmount)
    if (isNaN(amount) || amount < 100) {
      showToast.error('Minimum withdrawal amount is 100 BDT')
      return
    }
    
    if (amount > earnings?.summary?.availableForWithdrawal) {
      showToast.error('Insufficient balance')
      return
    }

    setIsWithdrawing(true)
    try {
      const response = await doctorAPI.requestWithdrawal({
        amount,
        paymentMethod
      })
      if (response.success) {
        showToast.success('Withdrawal request submitted successfully')
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        fetchEarnings()
      }
    } catch (error) {
      showToast.error('Failed to submit withdrawal request')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 mt-1">Track your earnings and withdraw funds</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={!earnings?.summary?.availableForWithdrawal || earnings.summary.availableForWithdrawal < 100}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Request Withdrawal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings?.summary?.totalEarnings || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Platform Fee</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings?.summary?.totalPlatformFee || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(earnings?.summary?.availableForWithdrawal || 0)}</p>
            </div>
            <Wallet className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Withdrawal</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(earnings?.summary?.pendingWithdrawal || 0)}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform Fee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">You Get</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {earnings?.payments?.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    Appointment #{payment.appointment?._id?.slice(-6)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(payment.platformFee)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(payment.doctorAmount)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {earnings?.payments?.length === 0 && (
          <div className="p-8 text-center text-gray-500">No transactions yet</div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl w-full max-w-md"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Request Withdrawal</h2>
              <p className="text-gray-500 mt-1">Available: {formatCurrency(earnings?.summary?.availableForWithdrawal || 0)}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (BDT)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: 100 BDT</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'bank' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <Banknote className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'bKash' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bKash"
                      checked={paymentMethod === 'bKash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>bKash</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={requestWithdrawal}
                disabled={isWithdrawing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isWithdrawing ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}