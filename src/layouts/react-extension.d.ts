declare global {
  namespace React {
    interface CSSProperties {
      // Allow writing CSS Variables
      [key: `--${string}`]: string | number | null | undefined
    }
  }
}

export { }
