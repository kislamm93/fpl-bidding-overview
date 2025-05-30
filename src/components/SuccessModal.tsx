import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  teamName: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, playerName, teamName }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transfer Successful</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
            <p className="text-slate-900 dark:text-slate-100 mb-2">
              <span className="font-medium">{playerName}</span> has been transferred to
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">{teamName}</p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessModal; 