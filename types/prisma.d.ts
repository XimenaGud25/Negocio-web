declare module 'prisma' {
  export function defineConfig<T = any>(config: T): T
  const _default: { defineConfig: <T = any>(config: T) => T }
  export default _default
}
