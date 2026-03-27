'use client'

import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  icon,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={[
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
            icon ? 'pl-10' : '',
            error 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500',
            className
          ].filter(Boolean).join(' ')}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input