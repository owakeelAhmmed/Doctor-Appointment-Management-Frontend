'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, AlertCircle } from 'lucide-react'

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed!</h1>
        <p className="text-gray-500 mb-4">Your payment could not be processed.</p>
        
        {reason && (
          <div className="bg-red-50 rounded-lg p-3 mb-6 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{reason}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Link
            href="/payment"
            className="block w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
          >
            Try Again
          </Link>
          <Link
            href="/doctors"
            className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Choose Another Doctor
          </Link>
        </div>
      </div>
    </div>
  )
}