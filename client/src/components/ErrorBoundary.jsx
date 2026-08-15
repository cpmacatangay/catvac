import { Component } from 'react'
import { Button } from './Button.jsx'
import { Logo } from './Logo.jsx'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  handleReset() {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-violet-50">
          <div className="bg-white rounded-xl shadow-elevated p-8 max-w-md w-full text-center space-y-4">
            <Logo className="h-12 w-12 mx-auto" />
            <h1 className="font-heading text-h1 text-gray-800">Something went wrong</h1>
            <p className="text-body-sm text-gray-500">
              We couldn't load that screen. Please try again.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="primary" onClick={() => this.handleReset()}>
                Try again
              </Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
