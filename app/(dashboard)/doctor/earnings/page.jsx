// app/(dashboard)/doctor/earnings/page.jsx

'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Wallet,
  Clock,
  RefreshCw,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Receipt,
  X,
  Hourglass,
  Timer
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'
import { useAuth } from '@/app/lib/hooks/useAuth'

// Chart components
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// ==================== SEPARATE MODAL COMPONENTS ====================

// Success Modal Component
const SuccessModal = memo(({ isOpen, onClose, amount, transactionId }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Request Submitted!</h2>
          <p className="text-gray-500 mb-4">
            Your withdrawal request of {amount} has been successfully submitted.
          </p>
          
          {transactionId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500">Transaction ID</p>
              <p className="text-sm font-mono font-medium">{transactionId}</p>
            </div>
          )}
          
          <div className="bg-blue-50 rounded-lg p-3 mb-6 text-left">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">What happens next?</p>
                <p className="mt-1">Your request will be processed within 24-48 hours.</p>
                <p>You will receive a confirmation email once completed.</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
})

SuccessModal.displayName = 'SuccessModal'

// Withdrawal Modal
const WithdrawModal = memo(({ 
  isOpen, 
  onClose, 
  onSuccess,
  availableBalance,
  formatCurrencyFn,
  lastWithdrawalDate,
  canWithdraw,
  remainingHours
}) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setError('')
      setPaymentMethod('bank')
    }
  }, [isOpen])

  const validateAmount = useCallback((value) => {
    const numAmount = parseFloat(value)
    
    if (value === '' || isNaN(numAmount)) {
      setError('Please enter an amount')
      return false
    }
    if (numAmount < 100) {
      setError('Minimum withdrawal amount is 100 BDT')
      return false
    }
    if (numAmount > availableBalance) {
      setError(`Insufficient balance. Available: ${formatCurrencyFn(availableBalance)}`)
      return false
    }
    setError('')
    return true
  }, [availableBalance, formatCurrencyFn])

  const handleAmountChange = useCallback((e) => {
    const rawValue = e.target.value
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      setAmount(rawValue)
      if (rawValue !== '') {
        validateAmount(rawValue)
      } else {
        setError('')
      }
    }
  }, [validateAmount])

  const handleQuickAmount = useCallback((quickAmount) => {
    const amountStr = quickAmount.toString()
    setAmount(amountStr)
    validateAmount(amountStr)
  }, [validateAmount])

  const handleSubmit = useCallback(async () => {
    if (!canWithdraw) {
      showToast.error(`Please wait ${remainingHours} hours before requesting another withdrawal`)
      return
    }
    
    if (!validateAmount(amount)) return
    
    const numAmount = parseFloat(amount)
    setIsLoading(true)
    
    try {
      const response = await doctorAPI.requestWithdrawal({
        amount: numAmount,
        paymentMethod
      })
      
      if (response.success) {
        onSuccess(response.data)
        onClose()
      }
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to submit withdrawal request')
    } finally {
      setIsLoading(false)
    }
  }, [amount, paymentMethod, validateAmount, onSuccess, onClose, canWithdraw, remainingHours])

  const isAmountValid = amount !== '' && !error && parseFloat(amount) >= 100 && parseFloat(amount) <= availableBalance

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Request Withdrawal</h2>
              <p className="text-sm text-gray-500 mt-0.5">Withdraw your earnings</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Cooldown Warning */}
        {!canWithdraw && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Withdrawal Cooldown Active</p>
                <p>Next withdrawal available in <span className="font-bold">{remainingHours}</span> hours</p>
              </div>
            </div>
          </div>
        )}

        {/* Available Balance */}
        <div className="p-5 bg-green-50 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Available Balance</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{formatCurrencyFn(availableBalance)}</span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">৳</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter amount"
                value={amount}
                onChange={handleAmountChange}
                disabled={!canWithdraw}
                className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  !canWithdraw ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                  error
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                }`}
              />
            </div>
            {error ? (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">Minimum withdrawal: 100 BDT</p>
            )}
            
            {/* Quick Amount Buttons */}
            {canWithdraw && (
              <div className="flex gap-2 mt-3">
                {[100, 500, 1000, 5000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    ৳{quickAmount}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bank', label: 'Bank', icon: Building },
                { id: 'bKash', label: 'bKash', icon: Smartphone },
                { id: 'nagad', label: 'Nagad', icon: Smartphone }
              ].map((method) => {
                const Icon = method.icon
                const isSelected = paymentMethod === method.id
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    disabled={!canWithdraw}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                      !canWithdraw ? 'opacity-50 cursor-not-allowed' :
                      isSelected
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{method.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p>Withdrawal requests are processed within 24-48 hours.</p>
                <p className="mt-1">You can request one withdrawal every 24 hours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-gray-200 flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isAmountValid || !canWithdraw}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              'Request Withdrawal'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
})

WithdrawModal.displayName = 'WithdrawModal'

// Withdrawal History Modal
const WithdrawalHistoryModal = memo(({ isOpen, onClose, withdrawals, formatCurrencyFn, formatDateFn }) => {
  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'bank': return <Building className="w-4 h-4" />
      case 'bKash': return <Smartphone className="w-4 h-4" />
      case 'nagad': return <Smartphone className="w-4 h-4" />
      default: return <CreditCard className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
      case 'approved':
      case 'processed':
        return { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle }
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="p-5 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Withdrawal History</h2>
            <p className="text-sm text-gray-500 mt-0.5">Track your withdrawal requests</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No withdrawal history</h3>
              <p className="text-gray-500 text-sm">Your withdrawal requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal, index) => {
                const status = getStatusBadge(withdrawal.status)
                const StatusIcon = status.icon
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{formatCurrencyFn(withdrawal.amount)}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(withdrawal.paymentMethod)}
                          {withdrawal.paymentMethod === 'bank' ? 'Bank Transfer' : withdrawal.paymentMethod}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateFn(withdrawal.requestedAt)}
                        </span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
})

WithdrawalHistoryModal.displayName = 'WithdrawalHistoryModal'

// ==================== MAIN COMPONENT ====================

export default function DoctorEarningsPage() {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [timeRange, setTimeRange] = useState('month')
  const [withdrawals, setWithdrawals] = useState([])
  const [lastWithdrawalDate, setLastWithdrawalDate] = useState(null)
  const [successData, setSuccessData] = useState(null)
  
  // Cooldown state
  const [canWithdraw, setCanWithdraw] = useState(true)
  const [remainingHours, setRemainingHours] = useState(0)
  const [remainingMinutes, setRemainingMinutes] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  // Check cooldown based on last withdrawal
  const checkCooldown = useCallback(() => {
    const lastWithdrawal = localStorage.getItem('lastWithdrawalDate')
    if (lastWithdrawal) {
      const lastDate = new Date(parseInt(lastWithdrawal))
      const now = new Date()
      const hoursDiff = (now - lastDate) / (1000 * 60 * 60)
      
      if (hoursDiff < 24) {
        setCanWithdraw(false)
        const remainingMs = (24 * 60 * 60 * 1000) - (now - lastDate)
        setRemainingHours(Math.floor(remainingMs / (1000 * 60 * 60)))
        setRemainingMinutes(Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)))
        setRemainingSeconds(Math.floor((remainingMs % (1000 * 60)) / 1000))
        return false
      }
    }
    setCanWithdraw(true)
    setRemainingHours(0)
    setRemainingMinutes(0)
    setRemainingSeconds(0)
    return true
  }, [])

  // Update cooldown timer every second
  useEffect(() => {
    checkCooldown()
    const interval = setInterval(() => {
      checkCooldown()
    }, 1000)
    return () => clearInterval(interval)
  }, [checkCooldown])

  // Memoized fetch functions
  const fetchEarnings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await doctorAPI.getEarnings({ groupBy: timeRange === 'year' ? 'month' : 'day' })
      
      let earningsData = null
      if (response?.success) {
        earningsData = response.data
      } else if (response?.data?.success) {
        earningsData = response.data.data
      }
      
      setEarnings(earningsData)
    } catch (error) {
      console.error('Failed to load earnings:', error)
      showToast.error('Failed to load earnings')
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  const fetchWithdrawalHistory = useCallback(async () => {
    try {
      const response = await doctorAPI.getWithdrawalHistory()
      if (response?.success) {
        setWithdrawals(response.data || [])
        
        // Check last withdrawal date for cooldown
        if (response.data && response.data.length > 0) {
          const lastWithdrawal = response.data[0]
          if (lastWithdrawal.requestedAt) {
            setLastWithdrawalDate(new Date(lastWithdrawal.requestedAt))
            localStorage.setItem('lastWithdrawalDate', new Date(lastWithdrawal.requestedAt).getTime().toString())
            checkCooldown()
          }
        }
      }
    } catch (error) {
      console.error('Failed to load withdrawal history:', error)
    }
  }, [checkCooldown])

  useEffect(() => {
    fetchEarnings()
    fetchWithdrawalHistory()
  }, [fetchEarnings, fetchWithdrawalHistory])

  const refreshData = useCallback(() => {
    fetchEarnings()
    fetchWithdrawalHistory()
  }, [fetchEarnings, fetchWithdrawalHistory])

  const handleWithdrawalSuccess = useCallback((data) => {
    setSuccessData(data)
    setShowSuccessModal(true)
    refreshData()
    checkCooldown()
  }, [refreshData, checkCooldown])

  const formatCurrency = useCallback((amount) => {
    if (!amount && amount !== 0) return '৳0'
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }, [])

  const formatDate = useCallback((date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  // Memoized chart data
  const chartData = useMemo(() => {
    if (earnings?.groupedData && earnings.groupedData.length > 0) {
      return earnings.groupedData.map(item => ({
        date: item.date || item.month || Object.values(item)[0],
        amount: item.earnings || item.amount || 0
      }))
    }
    return [
      { date: 'Jan', amount: 0 },
      { date: 'Feb', amount: 0 },
      { date: 'Mar', amount: 0 },
      { date: 'Apr', amount: 0 },
      { date: 'May', amount: 0 },
      { date: 'Jun', amount: 0 }
    ]
  }, [earnings])

  // Memoized payment method distribution
  const paymentMethodData = useMemo(() => {
    const payments = earnings?.payments || []
    const methodMap = new Map()
    
    payments.forEach(payment => {
      const method = payment.paymentMethod || 'unknown'
      const current = methodMap.get(method) || { count: 0, amount: 0 }
      methodMap.set(method, {
        count: current.count + 1,
        amount: current.amount + (payment.amount || 0)
      })
    })
    
    const totalAmount = Array.from(methodMap.values()).reduce((sum, m) => sum + m.amount, 0)
    
    return Array.from(methodMap.entries()).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
      amount: data.amount,
      count: data.count
    }))
  }, [earnings])

  const hasRealData = useMemo(() => {
    return paymentMethodData.length > 0 && paymentMethodData.some(p => p.value > 0)
  }, [paymentMethodData])

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={refreshData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Cooldown Banner */}
      {!canWithdraw && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Timer className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Withdrawal Cooldown Active</p>
              <p className="text-sm text-yellow-700">
                You can request your next withdrawal in{' '}
                <span className="font-bold">
                  {remainingHours}h {remainingMinutes}m {remainingSeconds}s
                </span>
              </p>
            </div>
            <Hourglass className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings?.summary?.totalEarnings || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Platform Fee</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings?.summary?.totalPlatformFee || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(earnings?.summary?.availableForWithdrawal || 0)}</p>
            </div>
            <Wallet className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!earnings?.summary?.availableForWithdrawal || earnings.summary.availableForWithdrawal < 100}
            className="mt-3 w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Withdraw Now
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Withdrawal</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(earnings?.summary?.pendingWithdrawal || 0)}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-300 w-fit">
        {['week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
        {chartData.some(d => d.amount > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                formatter={(value) => [`${formatCurrency(value)}`, 'Amount']}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
            <DollarSign className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No earnings data available</p>
            <p className="text-xs">Complete appointments to see earnings</p>
          </div>
        )}
      </div>

      {/* Payment Methods & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
          {hasRealData ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${formatCurrency(props.payload.amount)}`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {paymentMethodData.map((method, index) => (
                  <div key={method.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-sm text-gray-600">{method.name}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(method.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <CreditCard className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No payment data available</p>
              <p className="text-xs">Complete transactions to see payment methods</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="space-y-3">
            {earnings?.payments && earnings.payments.length > 0 ? (
              earnings.payments.slice(0, 5).map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">+{formatCurrency(payment.doctorAmount)}</p>
                    <p className="text-xs text-gray-400">Fee: {formatCurrency(payment.platformFee)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawalSuccess}
          availableBalance={earnings?.summary?.availableForWithdrawal || 0}
          formatCurrencyFn={formatCurrency}
          lastWithdrawalDate={lastWithdrawalDate}
          canWithdraw={canWithdraw}
          remainingHours={remainingHours}
        />
        
        <WithdrawalHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          withdrawals={withdrawals}
          formatCurrencyFn={formatCurrency}
          formatDateFn={formatDate}
        />

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          amount={successData?.amount ? formatCurrency(successData.amount) : formatCurrency(0)}
          transactionId={successData?.transactionId}
        />
      </AnimatePresence>
    </div>
  )
}