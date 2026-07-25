import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { Button } from '../components/Button.jsx'
import { loginSchema } from '../lib/validators.js'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit({ email, password }) {
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('root', { message: err.message })
    }
  }

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center px-4 pt-12 sm:pt-0">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-hero text-center text-primary mb-8">CatVac</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg p-6 shadow-card space-y-4"
          noValidate
        >
          <h2 className="font-heading text-h1 text-gray-800">Log In</h2>

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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                className={`w-full text-body rounded-lg px-4 py-3 pr-12 focus:outline-2 focus:outline-primary focus:outline-offset-2 ${
                  errors.password
                    ? 'border-red-500 ring-1 ring-red-500'
                    : 'border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-md"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-body-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Logging in…' : 'Log In'}
          </Button>

          <p className="text-body-sm text-gray-500 text-center">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
