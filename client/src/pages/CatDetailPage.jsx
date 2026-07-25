import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useCat, useUpdateCat, useDeleteCat } from '../hooks/useCats.js'
import { useVaccines, useCreateVaccine } from '../hooks/useVaccines.js'
import { Button } from '../components/Button.jsx'
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-500 text-body">Loading...</p>
      </div>
    )
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
              <Button variant="secondary" onClick={startEdit}>
                <PencilSquareIcon className="h-5 w-5" aria-hidden /> Edit
              </Button>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-body-sm text-red-600 hidden sm:inline">Delete?</span>
                  <Button variant="danger" onClick={handleDelete}>
                    <TrashIcon className="h-5 w-5" aria-hidden /> Yes
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                    No
                  </Button>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <TrashIcon className="h-5 w-5" aria-hidden /> Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {editing && (
        <form onSubmit={handleUpdate} className="bg-white rounded-lg p-4 md:p-6 shadow-card space-y-4">
          <h3 className="font-heading text-h2 text-gray-800">Edit {cat?.name}</h3>
          {editError && <div className="text-red-600 text-body-sm">{editError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Name *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-body border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Breed</label>
              <input
                type="text"
                value={editBreed}
                onChange={(e) => setEditBreed(e.target.value)}
                className="w-full text-body border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Sex</label>
              <select
                value={editSex}
                onChange={(e) => setEditSex(e.target.value)}
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
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full text-body border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary"
                maxLength={500}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" variant="primary" disabled={updateCat.isPending} className="w-full sm:w-auto">
              {updateCat.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="font-heading text-h2 text-gray-800">Vaccines</h2>
        {vaccines?.map((v) => (
          <VaccineRow key={v._id} vaccine={v} />
        ))}
        {vaccines?.length === 0 && (
          <p className="text-gray-400 text-body text-center py-8">No vaccines yet</p>
        )}
      </div>

      {showVaxForm ? (
        <form onSubmit={handleAddVaccine} className="bg-white rounded-lg p-4 md:p-6 shadow-card space-y-4">
          {vaxError && <div className="text-red-600 text-body-sm">{vaxError}</div>}
          <div>
            <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Vaccine Name</label>
            <input
              type="text"
              value={vaxName}
              onChange={(e) => setVaxName(e.target.value)}
              className="w-full text-body border border-gray-300 rounded-lg px-4 py-3"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              value={vaxDue}
              onChange={(e) => setVaxDue(e.target.value)}
              className="w-full text-body border border-gray-300 rounded-lg px-4 py-3"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">
              Interval (months, optional)
            </label>
            <input
              type="number"
              value={vaxInterval}
              onChange={(e) => setVaxInterval(e.target.value)}
              className="w-full text-body border border-gray-300 rounded-lg px-4 py-3"
              min={1}
              max={120}
            />
          </div>
          <div>
            <label className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">Notes (optional)</label>
            <textarea
              value={vaxNotes}
              onChange={(e) => setVaxNotes(e.target.value)}
              className="w-full text-body border border-gray-300 rounded-lg px-4 py-3"
              maxLength={500}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" variant="primary" disabled={createVaccine.isPending} className="w-full sm:w-auto">
              {createVaccine.isPending ? 'Adding...' : 'Add Vaccine'}
            </Button>
            <Button variant="secondary" onClick={() => setShowVaxForm(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setShowVaxForm(true)} className="w-full sm:w-auto">
          <PlusIcon className="h-5 w-5" aria-hidden /> Add Vaccine
        </Button>
      )}
    </div>
  )
}
