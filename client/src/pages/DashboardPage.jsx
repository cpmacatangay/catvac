import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard.js'
import { useCreateCat } from '../hooks/useCats.js'
import { useAuth } from '../hooks/useAuth.js'
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-gray-800">My Cats</h1>
          <p className="text-sm text-gray-500">Vaccine dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowForm(true); setForm(EMPTY_FORM) }}
            className="text-sm text-primary hover:text-primary-hover font-semibold"
          >
            + Add Cat
          </button>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
            Log out
          </button>
        </div>
      </header>

      {showForm && (
        <form
          onSubmit={handleAddCat}
          className="bg-white rounded-lg p-6 shadow-card space-y-4"
        >
          <h3 className="font-heading text-lg text-gray-800">New Cat</h3>
          {formError && <div className="text-red-600 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Breed</label>
              <input
                type="text"
                value={form.breed}
                onChange={set('breed')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sex</label>
              <select
                value={form.sex}
                onChange={set('sex')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">—</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={set('notes')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                maxLength={500}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-white rounded-md px-4 py-2 font-semibold hover:bg-primary-hover"
              disabled={createCat.isPending}
            >
              {createCat.isPending ? 'Adding...' : 'Add Cat'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p className="text-lg">No cats yet</p>
          <p className="text-sm">Add a cat to get started</p>
        </div>
      )}
    </div>
  )
}
