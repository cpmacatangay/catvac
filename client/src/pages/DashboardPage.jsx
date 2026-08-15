import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDashboard } from '../hooks/useDashboard.js'
import { useCreateCat } from '../hooks/useCats.js'
import { useToast } from '../context/ToastContext.jsx'
import { catSchema } from '../lib/validators.js'
import { Button } from '../components/Button.jsx'
import { CatCard } from '../components/CatCard.jsx'
import { CatCardSkeleton } from '../components/Skeletons.jsx'
import { Modal } from '../components/Modal.jsx'
import { Field } from '../components/Field.jsx'
import { Input } from '../components/Input.jsx'
import { Select } from '../components/Select.jsx'
import { Textarea } from '../components/Textarea.jsx'
import { Logo } from '../components/Logo.jsx'

export function DashboardPage() {
  const { data: cats, isLoading, error } = useDashboard()
  const navigate = useNavigate()
  const createCat = useCreateCat()
  const { addToast } = useToast()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(catSchema),
  })

  async function onSubmit(data) {
    try {
      await createCat.mutateAsync({
        name: data.name,
        breed: data.breed || null,
        sex: data.sex || null,
        notes: data.notes || null,
      })
      addToast('Cat added', 'success')
      setShowForm(false)
      reset()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-28 motion-safe:animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-40 motion-safe:animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CatCardSkeleton />
          <CatCardSkeleton />
          <CatCardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="bg-red-100 text-red-700 p-5 rounded-lg">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6 md:space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-h1 text-gray-800">My Cats</h1>
          <p className="text-subtitle text-gray-500">Never miss a jab.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setShowForm(true); reset() }}
        >
          <PlusIcon className="h-5 w-5" aria-hidden /> Add Cat
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cats?.map(({ cat, vaccines }) => (
          <CatCard
            key={cat._id}
            cat={cat}
            vaccines={vaccines}
            onClick={() => navigate(`/cats/${cat._id}`)}
          />
        ))}
      </div>

      {(!cats || cats.length === 0) && (
        <div className="flex flex-col items-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-5">
            <Logo className="h-9 w-9" />
          </div>
          <h2 className="font-heading text-h2 text-gray-800 mb-2">No cats yet</h2>
          <p className="text-body-sm text-gray-500 max-w-sm mb-6">
            Add your first cat and we'll track every vaccine and remind you before it's due.
          </p>
          <Button variant="primary" onClick={() => { setShowForm(true); reset() }}>
            <PlusIcon className="h-5 w-5" aria-hidden /> Add your first cat
          </Button>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Cat">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name *" htmlFor="cat-name" error={errors.name?.message}>
            <Input id="cat-name" {...register('name')} error={errors.name} required />
          </Field>
          <Field label="Breed" htmlFor="cat-breed" error={errors.breed?.message}>
            <Input id="cat-breed" {...register('breed')} error={errors.breed} />
          </Field>
          <Field label="Sex" htmlFor="cat-sex" error={errors.sex?.message}>
            <Select id="cat-sex" {...register('sex')} error={errors.sex}>
              <option value="">—</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </Select>
          </Field>
          <Field label="Notes" htmlFor="cat-notes" error={errors.notes?.message}>
            <Textarea id="cat-notes" {...register('notes')} error={errors.notes} maxLength={500} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Add Cat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
