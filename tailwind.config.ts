import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--color-page)",
        surface: "var(--color-surface)",
        "surface-soft": "var(--color-surface-soft)",
        "sidebar-soft": "var(--color-sidebar-soft)",
        muted: "var(--color-muted)",
        ink: "var(--color-ink)",
        subtext: "var(--color-subtext)",
        primary: "var(--color-primary)",
        "primary-strong": "var(--color-primary-strong)",
        "primary-soft": "var(--color-primary-soft)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        disabled: "var(--color-disabled)",
        overlay: "var(--color-overlay)",
        success: "var(--color-success)",
        "success-soft": "var(--color-success-soft)",
        "success-border": "var(--color-success-border)",
        "success-text": "var(--color-success-text)",
        warning: "var(--color-warning)",
        "warning-soft": "var(--color-warning-soft)",
        "warning-text": "var(--color-warning-text)",
        "progress-soft": "var(--color-progress-soft)",
        "progress-text": "var(--color-progress-text)",
        "complete-soft": "var(--color-complete-soft)",
        "complete-text": "var(--color-complete-text)",
        "error-soft": "var(--color-error-soft)",
        "error-border": "var(--color-error-border)",
        "error-text": "var(--color-error-text)",
        "danger-soft": "var(--color-danger-soft)",
        "danger-soft-hover": "var(--color-danger-soft-hover)",
        "danger-border": "var(--color-danger-border)",
        "danger-text": "var(--color-danger-text)"
      },
      boxShadow: {
        card: "0 12px 30px -22px rgba(9, 31, 38, 0.38)",
        panel: "0 10px 24px -16px rgba(9, 31, 38, 0.26)"
      }
    }
  },
  plugins: []
};

export default config;
