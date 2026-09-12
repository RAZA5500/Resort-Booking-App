import { createContext, useContext } from 'react';

// Non-component half of the booking store: context, hook, reducer and the
// localStorage bridge. BookingProvider.jsx holds the component.

export const STORAGE_KEY = 'stayscape.v1';

export const BookingContext = createContext(null);

export const initialState = { bookings: [], favorites: [], toasts: [] };

export const loadPersisted = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw);
    return {
      ...initialState,
      bookings: Array.isArray(saved.bookings) ? saved.bookings : [],
      favorites: Array.isArray(saved.favorites) ? saved.favorites : [],
    };
  } catch {
    // Corrupt or unavailable storage should never block the app from rendering.
    return initialState;
  }
};

export const persist = (state) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ bookings: state.bookings, favorites: state.favorites })
    );
  } catch {
    // Private-mode browsers can refuse writes; the session still works in memory.
  }
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.booking, ...state.bookings] };

    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.id ? { ...b, status: 'cancelled' } : b
        ),
      };

    case 'REMOVE_BOOKING':
      return { ...state, bookings: state.bookings.filter((b) => b.id !== action.id) };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((id) => id !== action.id)
          : [...state.favorites, action.id],
      };

    case 'PUSH_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
};
