import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard.js'
import { useAuth } from '../hooks/useAuth.js'
import { CatCard } from '../components/CatCard.jsx'

export function DashboardPage() {
  const { data: cats, isLoading, error } = useDashboard()
  const { logout } = useAuth()
  const navigate = useNavigate()

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
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Log out
        </button>
      </header>

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
