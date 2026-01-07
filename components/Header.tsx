
import React from 'react';
import { Layout } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGoHome }) => {
  return (
    <header className="w-full bg-slate-950 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
          onClick={onGoHome}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Layout className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            SiteCraft
          </span>
        </div>
        
        <nav className="flex items-center gap-6">
          <button 
            onClick={onGoHome}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            Generator
          </button>
          <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
            Pricing
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
