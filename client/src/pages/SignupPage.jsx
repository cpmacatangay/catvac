import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { signupSchema } from '../lib/validators.js'

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit({ email, password }) {
    try {
      await signup(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('root', { message: err.message })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-3xl text-center text-primary mb-8">CatVac</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg p-6 shadow-card space-y-4"
          noValidate
        >
          <h2 className="font-heading text-xl text-gray-800">Sign Up</h2>

          {errors.root && (
            <div className="bg-red-50 text-red-600 text-sm rounded-md px-3 py-2">
              {errors.root.message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`w-full rounded-md px-3 py-2 focus:outline-2 focus:outline-primary focus:outline-offset-2 ${
                errors.email
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className={`w-full rounded-md px-3 py-2 focus:outline-2 focus:outline-primary focus:outline-offset-2 ${
                errors.password
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              At least 8 characters, one uppercase, one lowercase, and one number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={`w-full rounded-md px-3 py-2 focus:outline-2 focus:outline-primary focus:outline-offset-2 ${
                errors.confirmPassword
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white rounded-md px-4 py-2.5 font-semibold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account…' : 'Sign Up'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
