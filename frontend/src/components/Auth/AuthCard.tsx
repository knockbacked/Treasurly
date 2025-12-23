export default function AuthCard({ children }: { children: React.ReactNode }) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-line bg-panel/80 p-8 md:p-10 shadow-card backdrop-blur-md">
        {children}
      </div>
    );
  }
  