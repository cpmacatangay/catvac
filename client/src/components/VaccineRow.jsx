import { useState } from 'react'
import { CheckCircleIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StatusPill } from './StatusPill.jsx'
import { Button } from './Button.jsx'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAdministerVaccine, useSnoozeVaccine, useDeleteVaccine } from '../hooks/useVaccines.js'

export function VaccineRow({ vaccine }) {
  const administer = useAdministerVaccine()
  const snooze = useSnoozeVaccine()
  const remove = useDeleteVaccine()
  const { addToast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="bg-white rounded-lg p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <p className="text-body font-semibold text-gray-800 truncate">{vaccine.name}</p>
        <p className="text-body-sm text-gray-400">
          Due: {new Date(vaccine.dueDate).toLocaleDateString()}
          {vaccine.intervalMonths && ` · Every ${vaccine.intervalMonths}mo`}
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <StatusPill status={vaccine.status} dueDate={vaccine.dueDate} />

        {!vaccine.administered && (
          <>
            <Button
              variant="icon"
              tone="success"
              disabled={administer.isPending}
              onClick={async () => {
                try {
                  await administer.mutateAsync({ id: vaccine._id, catId: vaccine.catId })
                  addToast(`${vaccine.name} marked administered`, 'success')
                } catch (err) {
                  addToast(err.message, 'error')
                }
              }}
              title="Mark administered"
              aria-label="Mark administered"
            >
              <CheckCircleIcon className="h-6 w-6" aria-hidden />
            </Button>
            <Button
              variant="icon"
              tone="warning"
              disabled={snooze.isPending}
              onClick={async () => {
                try {
                  await snooze.mutateAsync({ id: vaccine._id, catId: vaccine.catId, days: 30 })
                  addToast(`${vaccine.name} snoozed 30 days`, 'success')
                } catch (err) {
                  addToast(err.message, 'error')
                }
              }}
              title="Snooze 30 days"
              aria-label="Snooze 30 days"
            >
              <ArrowPathIcon className="h-6 w-6" aria-hidden />
            </Button>
          </>
        )}

        <Button
          variant="icon"
          tone="danger"
          onClick={() => setConfirmDelete(true)}
          title="Delete"
          aria-label="Delete vaccine"
        >
          <XMarkIcon className="h-6 w-6" aria-hidden />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${vaccine.name}?`}
        message="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          setConfirmDelete(false)
          try {
            await remove.mutateAsync({ id: vaccine._id, catId: vaccine.catId })
            addToast('Vaccine deleted', 'success')
          } catch (err) {
            addToast(err.message, 'error')
          }
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
