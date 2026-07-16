import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVaccines, useCreateVaccine } from '../hooks/useVaccines.js'
import { VaccineRow } from '../components/VaccineRow.jsx'

export function CatDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: vaccines, isLoading } = useVaccines(id)
  const createVaccine = useCreateVaccine()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [intervalMonths, setIntervalMonths] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  async function handleAddVaccine(e) {
    e.preventDefault()
    setError('')
    try {
      await createVaccine.mutateAsync({
        catId: id,
        name,
        dueDate: new Date(dueDate).toISOString(),
        intervalMonths: intervalMonths ? parseInt(intervalMonths) : null,
        notes: notes || undefined,
      })
      setName('')
      setDueDate('')
      setIntervalMonths('')
      setNotes('')
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
        <h1 className="font-heading text-2xl text-gray-800">Vaccines</h1>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}

      {vaccines && (
        <div className="space-y-3">
          {vaccines.map((v) => (
            <VaccineRow key={v._id} vaccine={v} catId={id} />
          ))}
          {vaccines.length === 0 && (
            <p className="text-gray-400 text-center py-8">No vaccines yet</p>
          )}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleAddVaccine} className="bg-white rounded-lg p-6 shadow-card space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vaccine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
              value={intervalMonths}
              onChange={(e) => setIntervalMonths(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              min={1}
              max={120}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-primary hover:text-primary-hover font-semibold"
        >
          + Add Vaccine
        </button>
      )}
    </div>
  )
}
