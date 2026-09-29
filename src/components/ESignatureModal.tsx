import React, { useState } from 'react'
import { FileCheck, Lock, UserCheck, AlertCircle, X } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export interface ESignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { password: string; statement: string; timestamp: string; reason: string }) => Promise<void> | void
  title?: string
  entityName?: string
  recordId?: string
  defaultReason?: string
}

export function ESignatureModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Electronic Signature Authorization',
  entityName = 'Clinical Trial Record',
  recordId,
  defaultReason = 'Confirming clinical accuracy and regulatory compliance',
}: ESignatureModalProps) {
  const activeRole = useAppStore((state) => state.activeRole)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const users = useAppStore((state) => state.users)
  const logESignature = useAppStore((state) => state.logESignature)

  const [password, setPassword] = useState('')
  const [reason, setReason] = useState(defaultReason)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fixedTimestamp] = useState(() => new Date().toISOString())

  if (!isOpen) return null

  const currentUser = users.find((u) => u.id === activeUserId)
  const signerName = currentUser ? currentUser.name : activeRole
  const confirmationStatement = `By signing, I confirm this record is accurate as of ${fixedTimestamp}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Password re-entry is required to confirm electronic signature.')
      return
    }
    if (!reason.trim()) {
      setError('A reason for signature is required.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      if (recordId) {
        await logESignature(
          entityName,
          recordId,
          confirmationStatement,
          reason.trim()
        )
      }
      await onConfirm({
        password: password.trim(),
        statement: confirmationStatement,
        timestamp: fixedTimestamp,
        reason: reason.trim(),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply electronic signature.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="esign-title"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              <FileCheck size={20} />
            </div>
            <div>
              <h2 id="esign-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Standards-aligned 21 CFR Part 11 / NDCT e-signature capture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {recordId && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Target Record</div>
              <div className="font-mono font-semibold text-teal-700 dark:text-teal-300 mt-0.5">
                {entityName}: {recordId}
              </div>
            </div>
          )}

          {/* Signer Identity and Statement */}
          <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/60 dark:bg-teal-950/30">
            <div className="flex items-start gap-3">
              <UserCheck size={18} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Signer: <span className="text-teal-700 dark:text-teal-300">{signerName}</span> ({activeRole})
                </div>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  Timestamp: {fixedTimestamp}
                </div>
                <div className="mt-2 pt-2 border-t border-teal-200/80 dark:border-teal-900/40 text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">
                  "{confirmationStatement}"
                </div>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label htmlFor="esign-reason" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Signature Reason / Intent
            </label>
            <input
              id="esign-reason"
              type="text"
              aria-label="Signature reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. SAE Clinical Verification & Finalization"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label htmlFor="esign-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock size={13} className="text-slate-500" />
              <span>Re-enter Password to Authenticate</span>
            </label>
            <input
              id="esign-password"
              type="password"
              aria-label="Confirm password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password (mock acceptance enabled)"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Prototype demo note: Any password string is accepted for verification.
            </p>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck size={14} />
              <span>{isSubmitting ? 'Signing...' : 'Sign and Finalize Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
