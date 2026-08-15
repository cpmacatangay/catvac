import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { Button } from '../components/Button.jsx'
import { Field } from '../components/Field.jsx'
import { Input } from '../components/Input.jsx'
import { PasswordInput } from '../components/PasswordInput.jsx'
import { loginSchema } from '../lib/validators.js'
import { LogoWordmark, Logo } from '../components/Logo.jsx'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

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
        <div className="text-center mb-2">
          <Logo className="h-14 w-14 mx-auto mb-3" />
          <LogoWordmark size="text-hero" />
          <p className="text-body-sm text-gray-600 mt-1">Never miss a jab.</p>
        </div>

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

          <Field label="Email" htmlFor="login-email" error={errors.email?.message}>
            <Input id="login-email" type="email" autoComplete="email" {...register('email')} error={errors.email} />
          </Field>

          <Field label="Password" htmlFor="login-password" error={errors.password?.message}>
            <PasswordInput id="login-password" autoComplete="current-password" {...register('password')} error={errors.password} />
          </Field>

          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
            Log In
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
