import type { Config } from 'tailwindcss'

// This project uses Tailwind v4, which reads theme tokens from `app/globals.css`
// via `@theme inline {...}` — this file is no longer the build-time source of
// truth. It's kept so that shadcn-cli (`components.json` -> `tailwind.config`)
// can still resolve a config path when running `npx shadcn add ...`. The
// `content` globs point at the real project layout so any tool that does parse
// this file sees the correct file list.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
      },
    },
  },
  plugins: [],
}

export default config