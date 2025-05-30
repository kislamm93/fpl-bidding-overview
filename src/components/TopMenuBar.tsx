import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Trophy } from 'lucide-react';

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
            <img
              src="/tam.png"
              alt="FPL Logo"
              className="w-8 h-8"
            />
            <span className="text-lg font-semibold text-slate-900">FPL 2025</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>Teams</span>
            </Link>
            <Link
              to="/players"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/players')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Players</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TopMenuBar; 