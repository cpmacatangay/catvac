import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon, PlusIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DatePicker,
  DateInput,
  DateSegment,
  Group,
  Popover,
  Button as AriaButton,
  Calendar,
  CalendarGrid,
  CalendarCell,
  Heading,
} from 'react-aria-components'
import { parseDate } from '@internationalized/date'
import { useCat, useUpdateCat, useDeleteCat } from '../hooks/useCats.js'
import { useVaccines, useCreateVaccine } from '../hooks/useVaccines.js'
import { useToast } from '../context/ToastContext.jsx'
import { catSchema, vaccineSchema } from '../lib/validators.js'
import { Button } from '../components/Button.jsx'
import { VaccineRow } from '../components/VaccineRow.jsx'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { Modal } from '../components/Modal.jsx'
import { DetailSkeleton } from '../components/Skeletons.jsx'
import { Field } from '../components/Field.jsx'
import { Input } from '../components/Input.jsx'
import { Select } from '../components/Select.jsx'
import { Textarea } from '../components/Textarea.jsx'

export function CatDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: cat, isLoading: catLoading } = useCat(id)
  const { data: vaccines, isLoading: vaxLoading } = useVaccines(id)
  const updateCat = useUpdateCat()
  const deleteCat = useDeleteCat()
  const createVaccine = useCreateVaccine()
  const { addToast } = useToast()

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showVaxModal, setShowVaxModal] = useState(false)

  const editForm = useForm({ resolver: zodResolver(catSchema) })
  const vaxForm = useForm({
    resolver: zodResolver(vaccineSchema),
    defaultValues: { name: '', dueDate: '', intervalMonths: null, notes: '' },
  })

  useEffect(() => {
    if (cat && showEditModal) {
      editForm.reset({
        name: cat.name,
        breed: cat.breed || '',
        sex: cat.sex || '',
        notes: cat.notes || '',
      })
    }
  }, [cat, showEditModal, editForm])

  async function handleUpdate(data) {
    try {
      await updateCat.mutateAsync({
        id,
        name: data.name,
        breed: data.breed || null,
        sex: data.sex || null,
        notes: data.notes || null,
      })
      addToast('Cat updated', 'success')
      setShowEditModal(false)
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  async function handleDelete() {
    try {
      await deleteCat.mutateAsync(id)
      addToast('Cat deleted', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  async function handleAddVaccine(data) {
    try {
      await createVaccine.mutateAsync({
        catId: id,
        name: data.name,
        dueDate: new Date(data.dueDate).toISOString(),
        intervalMonths: data.intervalMonths ?? null,
        notes: data.notes || undefined,
      })
      addToast('Vaccine added', 'success')
      setShowVaxModal(false)
      vaxForm.reset()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  if (catLoading || vaxLoading) {
    return <DetailSkeleton />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="self-start sm:self-auto">
          <ArrowLeftIcon className="h-5 w-5" aria-hidden /> Back
        </Button>
        {cat && (
          <div className="flex items-center justify-between sm:flex-1 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-h3 shrink-0">
                {cat.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-h2 text-gray-800 truncate">{cat.name}</h1>
                <p className="text-body-sm text-gray-400 truncate">
                  {[cat.breed, cat.sex].filter(Boolean).join(' · ') || 'Cat'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" onClick={() => setShowEditModal(true)}>
                <PencilSquareIcon className="h-5 w-5" aria-hidden /> Edit
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                <TrashIcon className="h-5 w-5" aria-hidden /> Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-h2 text-gray-800">Vaccines</h2>
        {vaccines?.map((v) => (
          <VaccineRow key={v._id} vaccine={v} />
        ))}
        {vaccines?.length === 0 && (
          <p className="text-gray-400 text-body text-center py-8">No vaccines yet</p>
        )}
      </div>

      <Button variant="secondary" onClick={() => { setShowVaxModal(true); vaxForm.reset() }} className="w-full sm:w-auto">
        <PlusIcon className="h-5 w-5" aria-hidden /> Add Vaccine
      </Button>

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit ${cat?.name}`}>
        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
          <Field label="Name *" htmlFor="edit-name" error={editForm.formState.errors.name?.message}>
            <Input id="edit-name" {...editForm.register('name')} error={editForm.formState.errors.name} required />
          </Field>
          <Field label="Breed" htmlFor="edit-breed" error={editForm.formState.errors.breed?.message}>
            <Input id="edit-breed" {...editForm.register('breed')} error={editForm.formState.errors.breed} />
          </Field>
          <Field label="Sex" htmlFor="edit-sex" error={editForm.formState.errors.sex?.message}>
            <Select id="edit-sex" {...editForm.register('sex')} error={editForm.formState.errors.sex}>
              <option value="">—</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </Select>
          </Field>
          <Field label="Notes" htmlFor="edit-notes" error={editForm.formState.errors.notes?.message}>
            <Textarea id="edit-notes" {...editForm.register('notes')} error={editForm.formState.errors.notes} maxLength={500} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={editForm.formState.isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showVaxModal} onClose={() => setShowVaxModal(false)} title="Add Vaccine">
        <form onSubmit={vaxForm.handleSubmit(handleAddVaccine)} className="space-y-4">
          <Field label="Vaccine Name" htmlFor="vax-name" error={vaxForm.formState.errors.name?.message}>
            <Input id="vax-name" {...vaxForm.register('name')} error={vaxForm.formState.errors.name} required />
          </Field>
          <Field label="Due Date" htmlFor="vax-due" error={vaxForm.formState.errors.dueDate?.message}>
            <Controller
              name="dueDate"
              control={vaxForm.control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? parseDate(field.value.split('T')[0]) : undefined}
                  onChange={(value) => {
                    if (value) {
                      const iso = value.toDate('UTC').toISOString()
                      field.onChange(iso)
                    }
                  }}
                  isRequired
                  granularity="day"
                  className="w-full min-w-0"
                >
                  <Group className="flex items-center w-full text-body border border-gray-300 rounded-lg px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-white gap-1">
                    <DateInput className="flex-1 flex gap-1 items-center min-w-0">
                      {(segment) => (
                        <DateSegment
                          segment={segment}
                          className="focus:outline-none focus:bg-primary-light focus:text-primary rounded px-1 py-0.5 text-center box-content"
                        />
                      )}
                    </DateInput>
                    <AriaButton>
                      <CalendarDaysIcon className="h-5 w-5 text-gray-400" aria-hidden />
                    </AriaButton>
                  </Group>
                  <Popover>
                    <Calendar className="bg-white shadow-elevated rounded-lg p-4 min-w-[260px]">
                      <header className="flex items-center justify-between mb-2">
                        <AriaButton slot="previous" className="text-primary hover:text-primary-hover text-lg">◀</AriaButton>
                        <Heading className="font-heading text-subtitle text-gray-800" />
                        <AriaButton slot="next" className="text-primary hover:text-primary-hover text-lg">▶</AriaButton>
                      </header>
                      <CalendarGrid className="w-full">
                        {(date) => (
                          <CalendarCell
                            date={date}
                            className="text-center py-1.5 rounded hover:bg-primary-light hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary aria-selected:bg-primary aria-selected:text-white text-body-sm"
                          />
                        )}
                      </CalendarGrid>
                    </Calendar>
                  </Popover>
                </DatePicker>
              )}
            />
          </Field>
          <Field label="Interval (months)" htmlFor="vax-interval" error={vaxForm.formState.errors.intervalMonths?.message}>
            <Controller
              name="intervalMonths"
              control={vaxForm.control}
              render={({ field }) => (
                <Input
                  id="vax-interval"
                  type="number"
                  placeholder="e.g. 12"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={vaxForm.formState.errors.intervalMonths}
                  min={1}
                  max={120}
                />
              )}
            />
          </Field>
          <Field label="Notes (optional)" htmlFor="vax-notes" error={vaxForm.formState.errors.notes?.message}>
            <Textarea id="vax-notes" {...vaxForm.register('notes')} error={vaxForm.formState.errors.notes} maxLength={500} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowVaxModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={vaxForm.formState.isSubmitting}>Add Vaccine</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Cat?"
        message={`Remove ${cat?.name} and all associated vaccines? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setShowDeleteConfirm(false); handleDelete() }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
