export function AccessRestricted() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center text-amber-900">
      <h2 className="text-2xl font-semibold">Access restricted for your role</h2>
      <p className="mt-2 max-w-md text-sm text-amber-800/80">
        This section is not available to the currently selected persona. Please switch roles to continue.
      </p>
    </div>
  )
}
