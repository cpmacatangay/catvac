import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCat, useUpdateCat, useDeleteCat } from '../hooks/useCats.js'
import { useVaccines, useCreateVaccine } from '../hooks/useVaccines.js'
import { VaccineRow } from '../components/VaccineRow.jsx'

export function CatDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: cat, isLoading: catLoading } = useCat(id)
  const { data: vaccines, isLoading: vaxLoading } = useVaccines(id)
  const updateCat = useUpdateCat()
  const deleteCat = useDeleteCat()
  const createVaccine = useCreateVaccine()

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBreed, setEditBreed] = useState('')
  const [editSex, setEditSex] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editError, setEditError] = useState('')

  const [confirmDelete, setConfirmDelete] = useState(false)

  const [showVaxForm, setShowVaxForm] = useState(false)
  const [vaxName, setVaxName] = useState('')
  const [vaxDue, setVaxDue] = useState('')
  const [vaxInterval, setVaxInterval] = useState('')
  const [vaxNotes, setVaxNotes] = useState('')
  const [vaxError, setVaxError] = useState('')

  function startEdit() {
    setEditName(cat.name)
    setEditBreed(cat.breed || '')
    setEditSex(cat.sex || '')
    setEditNotes(cat.notes || '')
    setEditError('')
    setEditing(true)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setEditError('')
    try {
      await updateCat.mutateAsync({
        id,
        name: editName,
        breed: editBreed || null,
        sex: editSex || null,
        notes: editNotes || null,
      })
      setEditing(false)
    } catch (err) {
      setEditError(err.message)
    }
  }

  async function handleDelete() {
    try {
      await deleteCat.mutateAsync(id)
      navigate('/dashboard')
    } catch (err) {
      setEditError(err.message)
    }
  }

  async function handleAddVaccine(e) {
    e.preventDefault()
    setVaxError('')
    try {
      await createVaccine.mutateAsync({
        catId: id,
        name: vaxName,
        dueDate: new Date(vaxDue).toISOString(),
        intervalMonths: vaxInterval ? parseInt(vaxInterval) : null,
        notes: vaxNotes || undefined,
      })
      setVaxName('')
      setVaxDue('')
      setVaxInterval('')
      setVaxNotes('')
      setShowVaxForm(false)
    } catch (err) {
      setVaxError(err.message)
    }
  }

  if (catLoading || vaxLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
        {cat && (
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                {cat.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-heading text-xl text-gray-800">{cat.name}</h1>
                <p className="text-xs text-gray-400">
                  {[cat.breed, cat.sex].filter(Boolean).join(' · ') || 'Cat'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={startEdit} className="text-sm text-primary hover:text-primary-hover">
                Edit
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600">Delete?</span>
                  <button
                    onClick={handleDelete}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm text-gray-500"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {editing && (
        <form onSubmit={handleUpdate} className="bg-white rounded-lg p-6 shadow-card space-y-4">
          <h3 className="font-heading text-lg text-gray-800">Edit {cat.name}</h3>
          {editError && <div className="text-red-600 text-sm">{editError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Breed</label>
              <input
                type="text"
                value={editBreed}
                onChange={(e) => setEditBreed(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sex</label>
              <select
                value={editSex}
                onChange={(e) => setEditSex(e.target.value)}
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
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                maxLength={500}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-white rounded-md px-4 py-2 font-semibold hover:bg-primary-hover"
              disabled={updateCat.isPending}
            >
              {updateCat.isPending ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-gray-500 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        <h2 className="font-heading text-lg text-gray-800">Vaccines</h2>
        {vaccines?.map((v) => (
          <VaccineRow key={v._id} vaccine={v} />
        ))}
        {vaccines?.length === 0 && (
          <p className="text-gray-400 text-center py-8">No vaccines yet</p>
        )}
      </div>

      {showVaxForm ? (
        <form onSubmit={handleAddVaccine} className="bg-white rounded-lg p-6 shadow-card space-y-4">
          {vaxError && <div className="text-red-600 text-sm">{vaxError}</div>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vaccine Name</label>
            <input
              type="text"
              value={vaxName}
              onChange={(e) => setVaxName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={vaxDue}
              onChange={(e) => setVaxDue(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Interval (months, optional)
            </label>
            <input
              type="number"
              value={vaxInterval}
              onChange={(e) => setVaxInterval(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              min={1}
              max={120}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={vaxNotes}
              onChange={(e) => setVaxNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              maxLength={500}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-white rounded-md px-4 py-2 font-semibold hover:bg-primary-hover"
              disabled={createVaccine.isPending}
            >
              {createVaccine.isPending ? 'Adding...' : 'Add Vaccine'}
            </button>
            <button type="button" onClick={() => setShowVaxForm(false)} className="text-gray-500 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowVaxForm(true)}
          className="text-primary hover:text-primary-hover font-semibold"
        >
          + Add Vaccine
        </button>
      )}
    </div>
  )
}
