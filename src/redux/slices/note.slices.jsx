/**
 * @file notesSlice.js
 * @module Redux/Slices/Note
 * @description Redux slice for note state: create, fetch, update, delete, restore,
 * pin, archive, and background color updates.
 */

import { createSlice } from '@reduxjs/toolkit';

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const initialState = {
  notes: [],
  archivedNotes: [],
  trashedNotes: [],
  loading: false,
  error: null,
  message: null,
};

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    clearNoteState: state => {
      state.error = null;
      state.message = null;
    },

    // CREATE
    createNote: (state, action) => {
      const newNote = {
        id: generateId(),
        ...action.payload, // title, content, color
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };
      state.notes.unshift(newNote);
      state.message = 'Note created successfully';
    },

    // UPDATE
    updateNote: (state, action) => {
      const { noteId, data } = action.payload;
      const lists = ['notes', 'archivedNotes', 'trashedNotes'];

      lists.forEach(listName => {
        const index = state[listName].findIndex(n => n.id === noteId);
        if (index !== -1) {
          state[listName][index] = { ...state[listName][index], ...data };
        }
      });
    },

    // TOGGLE PIN
    togglePinNote: (state, action) => {
      const noteId = action.payload;
      const note =
        state.notes.find(n => n.id === noteId) ||
        state.archivedNotes.find(n => n.id === noteId);
      if (note) note.isPinned = !note.isPinned;
    },

    // TOGGLE ARCHIVE
    toggleArchiveNote: (state, action) => {
      const noteId = action.payload;
      const activeIndex = state.notes.findIndex(n => n.id === noteId);

      if (activeIndex !== -1) {
        // Move from Notes to Archive
        const [note] = state.notes.splice(activeIndex, 1);
        state.archivedNotes.unshift({
          ...note,
          isArchived: true,
          isPinned: false,
        });
      } else {
        // Move from Archive to Notes
        const archIndex = state.archivedNotes.findIndex(n => n.id === noteId);
        if (archIndex !== -1) {
          const [note] = state.archivedNotes.splice(archIndex, 1);
          state.notes.unshift({ ...note, isArchived: false });
        }
      }
    },

    // MOVE TO TRASH (Soft Delete)
    trashNote: (state, action) => {
      const noteId = action.payload;
      let noteToTrash = null;

      // Check both lists
      const activeIdx = state.notes.findIndex(n => n.id === noteId);
      if (activeIdx !== -1) [noteToTrash] = state.notes.splice(activeIdx, 1);

      const archIdx = state.archivedNotes.findIndex(n => n.id === noteId);
      if (archIdx !== -1)
        [noteToTrash] = state.archivedNotes.splice(archIdx, 1);

      if (noteToTrash) {
        state.trashedNotes.unshift({
          ...noteToTrash,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
        });
      }
    },

    // RESTORE
    restoreNote: (state, action) => {
      const noteId = action.payload;
      const index = state.trashedNotes.findIndex(n => n.id === noteId);
      if (index !== -1) {
        const [note] = state.trashedNotes.splice(index, 1);
        state.notes.unshift({ ...note, isDeleted: false, deletedAt: null });
      }
    },

    // PERMANENT DELETE
    deletePermanently: (state, action) => {
      state.trashedNotes = state.trashedNotes.filter(
        n => n.id !== action.payload,
      );
    },

    // EMPTY TRASH
    emptyTrash: state => {
      state.trashedNotes = [];
      state.message = 'Trash cleared';
    },
  },
});

export const {
  createNote,
  updateNote,
  togglePinNote,
  toggleArchiveNote,
  trashNote,
  restoreNote,
  deletePermanently,
  emptyTrash,
  clearNoteState,
} = noteSlice.actions;

export default noteSlice.reducer;
