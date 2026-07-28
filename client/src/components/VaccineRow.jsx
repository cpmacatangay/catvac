import { useState } from 'react'
import { CheckCircleIcon, ArrowPathIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { StatusPill } from './StatusPill.jsx'
import { Button } from './Button.jsx'
import { Modal } from './Modal.jsx'
import { Field } from './Field.jsx'
import { Input } from './Input.jsx'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAdministerVaccine, useSnoozeVaccine, useUpdateVaccine, useDeleteVaccine } from '../hooks/useVaccines.js'

export function VaccineRow({ vaccine }) {
  const administer = useAdministerVaccine()
  const snooze = useSnoozeVaccine()
  const update = useUpdateVaccine()
  const remove = useDeleteVaccine()
  const { addToast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState(vaccine.name)
  const [editDueDate, setEditDueDate] = useState(vaccine.dueDate.split('T')[0])
  const [editInterval, setEditInterval] = useState(vaccine.intervalMonths?.toString() ?? '')

  async function handleEdit(e) {
    e.preventDefault()
    if (!editName.trim()) return
    try {
      await update.mutateAsync({
        id: vaccine._id,
        catId: vaccine.catId,
        name: editName.trim(),
        dueDate: new Date(editDueDate + 'T00:00:00.000Z').toISOString(),
        intervalMonths: parseEditInt(editInterval),
      })
      addToast('Vaccine updated', 'success')
      setShowEdit(false)
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  function parseEditInt(v) {
  if (v === '' || v === null || v === undefined) return null
  const n = parseInt(v, 10)
  return Number.isNaN(n) || n <= 0 ? null : n
}

function openEdit() {
    setEditName(vaccine.name)
    setEditDueDate(vaccine.dueDate.split('T')[0])
    setEditInterval(vaccine.intervalMonths?.toString() ?? '')
    setShowEdit(true)
  }

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

        <Button
          variant="icon"
          onClick={openEdit}
          title="Edit"
          aria-label="Edit vaccine"
        >
          <PencilSquareIcon className="h-5 w-5" aria-hidden />
        </Button>

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
          <TrashIcon className="h-6 w-6" aria-hidden />
        </Button>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Vaccine">
        <form onSubmit={handleEdit} className="space-y-4">
          <Field label="Name *" htmlFor="edit-vax-name">
            <Input id="edit-vax-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </Field>
          <Field label="Due Date *" htmlFor="edit-vax-due">
            <Input id="edit-vax-due" type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} required />
          </Field>
          <Field label="Interval (months)" htmlFor="edit-vax-interval">
            <Input id="edit-vax-interval" type="number" placeholder="e.g. 12" value={editInterval} onChange={(e) => setEditInterval(e.target.value)} min={1} max={120} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={update.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

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
