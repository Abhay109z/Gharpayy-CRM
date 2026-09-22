import React from 'react';
import {
  PhoneCall,
  CalendarCheck,
  SplitSquareVertical,
  Layers,
  ShieldCheck,
  Building2,
  History,
  User
} from 'lucide-react';
import { MongoDbStatus } from '../types.js';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  activeOperator: string;
  onOperatorChange: (operator: string) => void;
  overdueCount?: number;
  totalLeads?: number;
  toursCount?: number;
  onOpenAudit: () => void;
  onOpenWalkthrough?: () => void;
  onResetDemo?: () => void;
  isResetting?: boolean;
  dbStatus?: MongoDbStatus | null;
}

const OPERATORS = [
  { name: 'Aarav Sharma', role: 'Lead Qualification', initials: 'AS', color: 'bg-emerald-500 text-white' },
  { name: 'Pooja Hegde', role: 'Tour Coordinator', initials: 'PH', color: 'bg-violet-500 text-white' },
  { name: 'Rohan Mehta', role: 'Deal Closer', initials: 'RM', color: 'bg-sky-500 text-white' },
  { name: 'Sneha Rao', role: 'Deposit & Check-in', initials: 'SR', color: 'bg-amber-500 text-white' }
];

export const NavigationHeader: React.FC<Props> = ({
  currentPath,
  onNavigate,
  activeOperator,
  onOperatorChange,
  onOpenAudit
}) => {
  const currentOperatorObj = OPERATORS.find((op) => op.name === activeOperator) || OPERATORS[0];

  const navItems = [
    {
      path: '/leads',
      label: 'M-POWER Call',
      icon: PhoneCall,
      color: 'text-emerald-600',
      activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs shadow-emerald-600/30'
    },
    {
      path: '/booking-flow-split',
      label: 'Booking Flow Split',
      icon: SplitSquareVertical,
      color: 'text-indigo-600',
      activeBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs shadow-indigo-600/30'
    },
    {
      path: '/movement-care',
      label: 'Movement CARE',
      icon: CalendarCheck,
      color: 'text-amber-600',
      activeBg: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs shadow-amber-600/30'
    },
    {
      path: '/movement-os',
      label: 'Movement OS',
      icon: Layers,
      color: 'text-sky-600',
      activeBg: 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-xs shadow-sky-600/30'
    },
    {
      path: '/closing',
      label: 'Closing Desk',
      icon: Building2,
      color: 'text-rose-600',
      activeBg: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs shadow-rose-600/30'
    },
    {
      path: '/admin',
      label: 'Admin',
      icon: ShieldCheck,
      color: 'text-purple-600',
      activeBg: 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs shadow-purple-600/30'
    }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand & Module Navigation */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onNavigate('/leads')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xs shadow-emerald-500/20 text-white font-bold text-sm">
              G
            </div>
            <div>
              <span className="font-bold text-zinc-900 tracking-tight text-sm flex items-center gap-1.5">
                <span>Gharpayy</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">
                  CRM
                </span>
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? item.activeBg
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Controls: Operator & Audit */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100/70 transition-colors border border-zinc-200/90 pl-1.5 pr-2.5 py-1 rounded-lg text-xs shadow-2xs">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentOperatorObj.color}`}>
              {currentOperatorObj.initials}
            </span>
            <span className="text-zinc-400 hidden sm:inline text-[11px]">Operator:</span>
            <select
              value={activeOperator}
              onChange={(e) => onOperatorChange(e.target.value)}
              className="bg-transparent text-zinc-800 font-semibold text-xs focus:outline-hidden cursor-pointer"
            >
              {OPERATORS.map((op) => (
                <option key={op.name} value={op.name} className="bg-white text-zinc-900 font-medium">
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50/80 hover:border-indigo-200 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            title="View system audit log"
          >
            <History className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-600" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};
