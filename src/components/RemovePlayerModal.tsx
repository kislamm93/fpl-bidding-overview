import React from 'react';
import { X } from 'lucide-react';
import { api } from '@/services/api';
import { storage } from '@/services/storage';

interface RemovePlayerModalProps {
  player: {
    _id: string;
    name: string;
    team?: {
      name: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RemovePlayerModal: React.FC<RemovePlayerModalProps> = ({
  player,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const handleRemove = async () => {
    try {
      const secretKey = storage.getSecretKey();
      if (!secretKey) {
        throw new Error('No secret key found');
      }

      await api.removePlayer(player._id, secretKey);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error removing player:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Remove Player</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-600 mb-6">
          Are you sure you want to remove {player.name} from {player.team?.name}? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Remove Player
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemovePlayerModal; 