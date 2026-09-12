import { useEffect, useMemo, useReducer, useRef } from 'react';
import { BookingContext, loadPersisted, persist, reducer } from './bookingStore';
import { UNAVAILABLE } from '../data/listings';
import { rangesOverlap } from '../lib/dates';

export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersisted);
  const nextId = useRef(0);

  useEffect(() => {
    persist({ bookings: state.bookings, favorites: state.favorites });
  }, [state.bookings, state.favorites]);

  const value = useMemo(() => {
    const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${nextId.current++}`;

    const toast = (message, tone = 'success') =>
      dispatch({ type: 'PUSH_TOAST', toast: { id: uid('toast'), message, tone } });

    const activeBookings = state.bookings.filter((b) => b.status === 'confirmed');

    // Seeded unavailability plus anything this user has already booked.
    const blockedRanges = (listingId) => [
      ...(UNAVAILABLE[listingId] || []),
      ...activeBookings
        .filter((b) => b.listingId === Number(listingId))
        .map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut })),
    ];

    const isRangeAvailable = (listingId, checkIn, checkOut) => {
      if (!checkIn || !checkOut) return false;
      return !blockedRanges(listingId).some((r) =>
        rangesOverlap(checkIn, checkOut, r.checkIn, r.checkOut)
      );
    };

    return {
      ...state,
      activeBookings,
      blockedRanges,
      isRangeAvailable,
      isFavorite: (id) => state.favorites.includes(id),
      toggleFavorite: (id) => dispatch({ type: 'TOGGLE_FAVORITE', id }),
      dismissToast: (id) => dispatch({ type: 'DISMISS_TOAST', id }),
      toast,

      addBooking: (booking) => {
        const record = {
          ...booking,
          id: uid('BK').toUpperCase(),
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_BOOKING', booking: record });
        return record;
      },

      cancelBooking: (id) => {
        dispatch({ type: 'CANCEL_BOOKING', id });
        toast('Booking cancelled. Your dates are free again.', 'info');
      },

      removeBooking: (id) => dispatch({ type: 'REMOVE_BOOKING', id }),
    };
  }, [state]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export default BookingProvider;
