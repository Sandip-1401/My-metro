import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
            M
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">
            Ahmedabad Metro
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/stations" className="hover:text-white transition-colors">
            Stations
          </Link>
          <Link href="/routes" className="hover:text-white transition-colors">
            Route Planner
          </Link>
          <Link href="/fare" className="hover:text-white transition-colors">
            Fare Info
          </Link>
        </nav>
      </div>
    </header>
  );
}
