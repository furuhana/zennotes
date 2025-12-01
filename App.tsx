import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, Upload, NotebookPen, Search, FileJson } from 'lucide-react';
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';
import Button from './components/Button';
import { Note, NoteFormData } from './types';

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('zennotes-data');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('zennotes-data', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('确定要删除这条便签吗？')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleSaveNote = (data: NoteFormData) => {
    if (editingNote) {
      // Update existing
      setNotes(prev => prev.map(n => 
        n.id === editingNote.id 
          ? { ...n, ...data, updatedAt: Date.now() } 
          : n
      ));
    } else {
      // Create new
      const newNote: Note = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes(prev => [newNote, ...prev]);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zennotes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = JSON.parse(e.target?.result as string);
        if (Array.isArray(result)) {
            // Validate basic structure
            const validNotes = result.filter(n => n.id && n.title !== undefined && n.content !== undefined);
            if (validNotes.length > 0) {
                 // Option: Merge or Replace. Here we merge and deduplicate by ID if collision, or just regenerate IDs to be safe. 
                 // Let's simply append them as new copies to avoid ID conflicts, but keep original timestamps if valid
                 const importedNotes: Note[] = validNotes.map((n: any) => ({
                    id: crypto.randomUUID(), // New ID to ensure no conflicts
                    title: n.title || '',
                    content: n.content || '',
                    createdAt: n.createdAt || Date.now(),
                    updatedAt: n.updatedAt || Date.now()
                 }));
                 
                 setNotes(prev => [...importedNotes, ...prev]);
                 alert(`成功导入 ${importedNotes.length} 条便签！`);
            } else {
                alert('文件格式正确，但没有发现有效的便签数据。');
            }
        } else {
            alert('文件格式错误：JSON 必须是一个数组。');
        }
      } catch (err) {
        alert('无法解析 JSON 文件，请确保文件内容正确。');
      }
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
                <NotebookPen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                ZenNotes
              </h1>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="搜索便签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportFile} 
                    accept=".json" 
                    className="hidden" 
                />
                
                <Button variant="secondary" onClick={handleImportTrigger} icon={<Upload className="w-4 h-4"/>} title="导入 JSON">
                  导入
                </Button>
                <Button variant="secondary" onClick={handleExport} icon={<Download className="w-4 h-4"/>} title="导出 JSON">
                  导出
                </Button>
                <Button onClick={handleAddNote} icon={<Plus className="w-4 h-4"/>}>
                  新建便签
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
                <FileJson className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">还没有便签</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              点击右上角的"新建便签"按钮开始记录你的想法，或者导入之前的备份。
            </p>
            <Button onClick={handleAddNote} size="lg" className="px-8">
              开始记录
            </Button>
          </div>
        ) : filteredNotes.length === 0 ? (
           <div className="text-center py-20 text-slate-500">
             没有找到包含 "{searchQuery}" 的便签
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </main>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        initialData={editingNote}
      />
    </div>
  );
}

export default App;