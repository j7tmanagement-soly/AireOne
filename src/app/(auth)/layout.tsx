export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-brand-900 to-surface-950 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
