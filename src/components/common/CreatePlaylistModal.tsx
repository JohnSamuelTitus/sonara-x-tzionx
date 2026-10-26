import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { KeycapButton } from './KeycapButton';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createPlaylist, selectPlaylist } = usePlayer();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPl = createPlaylist(title, description);
    setTitle('');
    setDescription('');
    onClose();
    selectPlaylist(newPl.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-cinema-surface border-2 border-cinema-border/80 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-cinema-border/50">
          <div className="flex items-center gap-2.5">
            <FolderPlus className="w-5 h-5 text-cinema-gold" />
            <h2 className="font-display text-xl tracking-wider uppercase text-cinema-ivory">
              New Cinema Vault
            </h2>
          </div>
          <KeycapButton
            variant="deck"
            shape="circle"
            size="xs"
            onClick={onClose}
            aria-label="Close modal"
            tooltip="Close"
            icon={<X className="w-3.5 h-3.5 text-cinema-ivory" />}
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="playlist-title"
              className="block text-[10px] font-mono font-bold text-cinema-gold uppercase tracking-widest mb-1.5"
            >
              Vault Name <span className="text-cinema-vermilion">*</span>
            </label>
            <input
              id="playlist-title"
              type="text"
              required
              autoFocus
              placeholder="e.g. Mass Telugu Anthems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-panel border border-cinema-border/80 text-cinema-ivory placeholder-cinema-ivoryMuted/50 focus:outline-none focus:border-cinema-gold text-sm font-sans"
            />
          </div>

          <div>
            <label
              htmlFor="playlist-description"
              className="block text-[10px] font-mono font-bold text-cinema-gold uppercase tracking-widest mb-1.5"
            >
              Description (Optional)
            </label>
            <textarea
              id="playlist-description"
              rows={3}
              placeholder="Give your cinema playlist a mood or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-panel border border-cinema-border/80 text-cinema-ivory placeholder-cinema-ivoryMuted/50 focus:outline-none focus:border-cinema-gold text-sm font-sans resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <KeycapButton
              type="button"
              variant="deck"
              shape="pill"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </KeycapButton>
            <KeycapButton
              type="submit"
              variant="primary"
              shape="pill"
              size="sm"
              disabled={!title.trim()}
            >
              Create Vault
            </KeycapButton>
          </div>
        </form>
      </div>
    </div>
  );
};
