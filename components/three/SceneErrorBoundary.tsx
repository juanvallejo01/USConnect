"use client"

import { Component, type ReactNode } from "react"

// El fondo 3D es puramente decorativo — si WebGL falla (contexto perdido,
// GPU sin soporte, etc.) no debe poder tumbar el resto de la app.
export class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error("Scene3D error (ignorado, es solo decorativo):", error)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
