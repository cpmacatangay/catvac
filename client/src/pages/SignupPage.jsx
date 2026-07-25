import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { Button } from '../components/Button.jsx'
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
        <h1 className="font-heading text-hero text-center text-primary mb-8">CatVac</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg p-6 shadow-card space-y-4"
          noValidate
        >
          <h2 className="font-heading text-h1 text-gray-800">Sign Up</h2>

          {errors.root && (
            <div className="bg-red-50 text-red-600 text-body rounded-lg px-4 py-3">
              {errors.root.message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`w-full text-body rounded-lg px-4 py-3 focus:outline-2 focus:outline-primary focus:outline-offset-2 ${
                errors.email
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-body-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className={`w-full text-body rounded-lg px-4 py-3 focus:outline-2 focus:outline-primary focus:outline-offset-2 ${
                errors.password
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.password && (
              <p className="text-red-600 text-body-sm mt-1">{errors.password.message}</p>
            )}
            <p className="text-caption text-gray-400 mt-1">
              At least 8 characters, one uppercase, one lowercase, and one number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block font-semibold text-caption text-gray-700 mb-1 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={`w-full text-body rounded-lg px-4 py-3 focus:outline-2 focus:outline-primary focus:outline-offset-2 ${
                errors.confirmPassword
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-body-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating account…' : 'Sign Up'}
          </Button>

          <p className="text-body-sm text-gray-500 text-center">
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
