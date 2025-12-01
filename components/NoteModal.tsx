import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Note, NoteFormData } from '../types';
import Button from './Button';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NoteFormData) => void;
  initialData?: Note | null;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setContent(initialData?.content || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onSave({ title, content });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? '编辑便签' : '新建便签'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold text-slate-800 placeholder:text-slate-400 border-none outline-none bg-transparent"
              autoFocus
            />
          </div>
          
          <div className="mb-6">
            <textarea
              placeholder="开始记录你的想法..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 resize-none text-slate-600 placeholder:text-slate-400 border-none outline-none bg-transparent leading-relaxed custom-scrollbar"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" icon={<Save className="w-4 h-4" />}>
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;