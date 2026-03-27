"use client"

import { gooeyToast } from 'goey-toast'

export const showToast = {
  // Default toast
  default: (message, options = {}) => {
    return gooeyToast(message, options)
  },

  // Success toast
  success: (message, options = {}) => {
    return gooeyToast.success(message, options)
  },

  // Error toast
  error: (message, options = {}) => {
    return gooeyToast.error(message, options)
  },

  // Info toast
  info: (message, options = {}) => {
    return gooeyToast.info(message, options)
  },

  // Warning toast
  warning: (message, options = {}) => {
    return gooeyToast.warning(message, options)
  },

  // Loading toast (returns id for later updates)
  loading: (message, options = {}) => {
    return gooeyToast(message, {
      ...options,
      icon: <span className="animate-spin">⏳</span>
    })
  },

  // Dismiss toast(s)
  dismiss: (id) => {
    return gooeyToast.dismiss(id)
  },

  // Promise toast
  promise: async (promise, messages, options = {}) => {
    return gooeyToast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
      description: messages.description,
      action: messages.action,
      ...options
    })
  },

  // Update existing toast
  update: (id, options) => {
    return gooeyToast.update(id, options)
  },

  // Dismiss by type
  dismissByType: (type) => {
    return gooeyToast.dismiss({ type })
  },

  // Dismiss all
  dismissAll: () => {
    return gooeyToast.dismiss()
  }
}