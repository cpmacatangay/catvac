import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  handleReset() {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-violet-50">
          <div className="bg-white rounded-xl shadow-elevated p-8 max-w-md w-full text-center space-y-4">
            <h1 className="font-heading text-h1 text-gray-800">Something went wrong</h1>
            <p className="text-body-sm text-gray-600">{this.state.error.message}</p>
            <button
              onClick={() => this.handleReset()}
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 min-h-[48px] font-semibold text-button bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
