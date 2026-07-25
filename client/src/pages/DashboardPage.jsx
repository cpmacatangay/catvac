import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useDashboard } from '../hooks/useDashboard.js'
import { useCreateCat } from '../hooks/useCats.js'
import { useAuth } from '../hooks/useAuth.js'
import { Button } from '../components/Button.jsx'
import { CatCard } from '../components/CatCard.jsx'

const EMPTY_FORM = { name: '', breed: '', sex: '', notes: '' }

export function DashboardPage() {
  const { data: cats, isLoading, error } = useDashboard()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const createCat = useCreateCat()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  async function handleAddCat(e) {
    e.preventDefault()
    setFormError('')
    try {
      await createCat.mutateAsync({
        name: form.name,
        breed: form.breed || null,
        sex: form.sex || null,
        notes: form.notes || null,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      setFormError(err.message)
    }
  }

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-500 text-body">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-red-100 text-red-700 p-5 rounded-lg w-full max-w-md">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6 md:space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-h1 text-gray-800">My Cats</h1>
          <p className="text-subtitle text-gray-500">Vaccine dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => { setShowForm(true); setForm(EMPTY_FORM) }}
          >
            <PlusIcon className="h-5 w-5" aria-hidden /> Add Cat
          </Button>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      {showForm && (
        <form
          onSubmit={handleAddCat}
          className="bg-white rounded-lg p-4 md:p-6 shadow-card space-y-4"
        >
          <h3 className="font-heading text-h2 text-gray-800">New Cat</h3>
          {formError && <div className="text-red-600 text-body-sm">{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                className="w-full text-body border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Breed</label>
              <input
                type="text"
                value={form.breed}
                onChange={set('breed')}
                className="w-full text-body border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Sex</label>
              <select
                value={form.sex}
                onChange={set('sex')}
                className="w-full text-body border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">—</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={set('notes')}
                className="w-full text-body border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
                maxLength={500}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" variant="primary" disabled={createCat.isPending} className="w-full sm:w-auto">
              {createCat.isPending ? 'Adding...' : 'Add Cat'}
            </Button>
            <Button variant="secondary" onClick={() => setShowForm(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      )}

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
        <div className="text-center py-12 text-gray-400">
          <p className="text-h2">No cats yet</p>
          <p className="text-body-sm">Add a cat to get started</p>
        </div>
      )}
    </div>
  )
}
