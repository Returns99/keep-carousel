import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Grid, 
  LayoutList, 
  Search, 
  Pin, 
  Trash2, 
  Archive, 
  Palette, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, ViewMode } from './types';

const COLORS = [
  { name: 'White', value: 'bg-white' },
  { name: 'Red', value: 'bg-red-100' },
  { name: 'Orange', value: 'bg-orange-100' },
  { name: 'Yellow', value: 'bg-yellow-100' },
  { name: 'Green', value: 'bg-green-100' },
  { name: 'Teal', value: 'bg-teal-100' },
  { name: 'Blue', value: 'bg-blue-100' },
  { name: 'Dark Blue', value: 'bg-indigo-100' },
  { name: 'Purple', value: 'bg-purple-100' },
  { name: 'Pink', value: 'bg-pink-100' },
  { name: 'Brown', value: 'bg-stone-200' },
  { name: 'Gray', value: 'bg-gray-200' },
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'bg-white', is_pinned: 0 });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(3); // Default 3 seconds

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    const saved = localStorage.getItem('keep_notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title && !newNote.content) {
      setIsCreating(false);
      return;
    }
    const id = crypto.randomUUID();
    const noteToAdd: Note = { 
      ...newNote, 
      id, 
      is_archived: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    };
    
    const updatedNotes = [noteToAdd, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('keep_notes', JSON.stringify(updatedNotes));
    
    setNewNote({ title: '', content: '', color: 'bg-white', is_pinned: 0 });
    setIsCreating(false);
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
    );
    setNotes(updatedNotes);
    localStorage.setItem('keep_notes', JSON.stringify(updatedNotes));
  };

  const handleDeleteNote = async (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('keep_notes', JSON.stringify(updatedNotes));
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned === 1);
  const otherNotes = filteredNotes.filter(n => n.is_pinned === 0);

  const nextCarousel = () => {
    setCarouselIndex((prev) => (prev + 1) % filteredNotes.length);
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => (prev - 1 + filteredNotes.length) % filteredNotes.length);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay && viewMode === 'carousel' && filteredNotes.length > 0) {
      interval = setInterval(() => {
        nextCarousel();
      }, autoPlayInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlay, viewMode, autoPlayInterval, filteredNotes.length, carouselIndex]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-yellow-400 p-2">
            <LayoutList className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-medium text-gray-700 hidden sm:block">Keep Carousel</h1>
        </div>

        <div className="flex flex-1 max-w-2xl mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full rounded-lg bg-gray-100 py-2 pl-10 pr-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'carousel' : 'grid')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={viewMode === 'grid' ? 'Carousel View' : 'Grid View'}
          >
            {viewMode === 'grid' ? <ChevronRight className="h-6 w-6" /> : <Grid className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Create Note Area */}
        <div className="mb-12 flex justify-center">
          <div className={`w-full max-w-xl rounded-xl shadow-lg border border-gray-200 transition-all duration-300 ${isCreating ? 'bg-white' : 'bg-white/50 hover:bg-white'}`}>
            {!isCreating ? (
              <div 
                className="flex items-center gap-4 p-3 cursor-text text-gray-500"
                onClick={() => setIsCreating(true)}
              >
                <span className="flex-1 font-medium">Take a note...</span>
                <Plus className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Title"
                  className="w-full text-lg font-semibold mb-2 focus:outline-none"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                <textarea
                  placeholder="Take a note..."
                  className="w-full resize-none focus:outline-none min-h-[100px]"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    {COLORS.slice(0, 6).map(c => (
                      <button
                        key={c.value}
                        onClick={() => setNewNote({ ...newNote, color: c.value })}
                        className={`h-6 w-6 rounded-full border border-gray-300 ${c.value} ${newNote.color === c.value ? 'ring-2 ring-yellow-400' : ''}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateNote}
                      className="px-4 py-2 text-sm font-medium bg-yellow-400 text-white hover:bg-yellow-500 rounded-lg shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes Display */}
        {viewMode === 'grid' ? (
          <div className="space-y-8">
            {pinnedNotes.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Pinned</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedNotes.map(note => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onUpdate={handleUpdateNote} 
                      onDelete={handleDeleteNote}
                      onEdit={() => setEditingNote(note)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              {pinnedNotes.length > 0 && <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Others</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {otherNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onUpdate={handleUpdateNote} 
                    onDelete={handleDeleteNote}
                    onEdit={() => setEditingNote(note)}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Carousel Controls */}
            <div className="flex flex-wrap items-center justify-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Auto-play</span>
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAutoPlay ? 'bg-yellow-400' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoPlay ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Interval (s)</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={autoPlayInterval}
                  onChange={(e) => setAutoPlayInterval(parseInt(e.target.value))}
                  className="w-32 accent-yellow-400"
                />
                <span className="text-sm font-bold text-yellow-600 w-4">{autoPlayInterval}s</span>
              </div>
            </div>

            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
            {filteredNotes.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={filteredNotes[carouselIndex].id}
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full max-w-2xl"
                  >
                    <div className={`p-8 rounded-3xl shadow-2xl border border-gray-100 min-h-[400px] flex flex-col ${filteredNotes[carouselIndex].color}`}>
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">{filteredNotes[carouselIndex].title || 'Untitled'}</h2>
                        <button 
                          onClick={() => handleUpdateNote(filteredNotes[carouselIndex].id, { is_pinned: filteredNotes[carouselIndex].is_pinned ? 0 : 1 })}
                          className={`p-2 rounded-full transition-colors ${filteredNotes[carouselIndex].is_pinned ? 'bg-yellow-400 text-white' : 'hover:bg-black/5'}`}
                        >
                          <Pin className="h-6 w-6" />
                        </button>
                      </div>
                      <p className="text-xl text-gray-700 flex-1 whitespace-pre-wrap leading-relaxed">
                        {filteredNotes[carouselIndex].content}
                      </p>
                      <div className="mt-8 pt-6 border-t border-black/5 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {new Date(filteredNotes[carouselIndex].updated_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => handleDeleteNote(filteredNotes[carouselIndex].id)} className="p-3 hover:bg-red-500/10 rounded-full text-red-500 transition-colors">
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button
                  onClick={prevCarousel}
                  className="absolute left-4 p-4 bg-white/80 backdrop-blur shadow-lg rounded-full hover:bg-white transition-all z-10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextCarousel}
                  className="absolute right-4 p-4 bg-white/80 backdrop-blur shadow-lg rounded-full hover:bg-white transition-all z-10"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                <div className="absolute bottom-4 flex gap-2">
                  {filteredNotes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`h-2 rounded-full transition-all ${i === carouselIndex ? 'w-8 bg-yellow-400' : 'w-2 bg-gray-300'}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">
                <LayoutList className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl">No notes found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingNote(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`note-${editingNote.id}`}
              className={`relative w-full max-w-2xl rounded-2xl shadow-2xl p-6 ${editingNote.color}`}
            >
              <input
                type="text"
                className="w-full text-2xl font-bold mb-4 bg-transparent focus:outline-none"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              />
              <textarea
                className="w-full min-h-[300px] text-lg bg-transparent focus:outline-none resize-none"
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              />
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5">
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setEditingNote({ ...editingNote, color: c.value })}
                      className={`h-8 w-8 rounded-full border border-black/10 ${c.value} ${editingNote.color === c.value ? 'ring-2 ring-yellow-400' : ''}`}
                    />
                  ))}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      handleUpdateNote(editingNote.id, editingNote);
                      setEditingNote(null);
                    }}
                    className="px-6 py-2 bg-yellow-400 text-white font-bold rounded-xl shadow-lg hover:bg-yellow-500 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteCard({ note, onUpdate, onDelete, onEdit }: { 
  note: Note; 
  onUpdate: (id: string, updates: Partial<Note>) => void | Promise<void>; 
  onDelete: (id: string) => void | Promise<void>;
  onEdit: () => void;
  key?: string | number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layoutId={`note-${note.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${note.color}`}
      onClick={onEdit}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 line-clamp-2">{note.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(note.id, { is_pinned: note.is_pinned ? 0 : 1 });
          }}
          className={`p-1.5 rounded-full transition-opacity ${note.is_pinned ? 'bg-yellow-400 text-white opacity-100' : 'opacity-0 group-hover:opacity-100 hover:bg-black/5'}`}
        >
          <Pin className="h-4 w-4" />
        </button>
      </div>
      <p className="text-gray-600 text-sm line-clamp-6 whitespace-pre-wrap">{note.content}</p>
      
      <div className={`absolute bottom-2 right-2 flex gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
