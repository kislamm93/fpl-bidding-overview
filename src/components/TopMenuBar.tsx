import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, CalendarDays } from 'lucide-react';

const TopMenuBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full bg-emerald-600 opacity-20"></div>
            <img
              src="/FPL.png"
              alt="FPL Logo"
              className="relative w-8 h-8"
            />
          </div>
          <span className="text-lg font-semibold text-slate-900 hidden sm:inline">Frankfurt Premier League 2025</span>
        </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="Teams"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isActive('/')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="hidden sm:inline">Teams</span>
            </Link>
            <Link
              to="/players"
              aria-label="Players"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isActive('/players')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="hidden sm:inline">Players</span>
            </Link>
            <Link
              to="/fixtures"
              aria-label="Fixtures"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isActive('/fixtures')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600'
              } relative`}
            >
              <CalendarDays className="w-6 h-6 animate-pulse" />
              <span className="hidden sm:inline">Fixtures</span>

              {/* Subtle dot with pulse animation */}
              <span
                className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"
                aria-label="New fixture"
              ></span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TopMenuBar; 