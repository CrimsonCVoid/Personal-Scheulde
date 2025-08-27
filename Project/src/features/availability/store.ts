import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Availability, AvailabilitySlot } from '../events/types';

interface AvailabilityState {
  availability: Availability;
  
  // Actions
  setWeeklyAvailability: (slots: AvailabilitySlot[]) => void;
  addException: (date: string, available: boolean, slots?: AvailabilitySlot[]) => void;
  removeException: (date: string) => void;
  
  // Selectors
  isAvailableAt: (date: string, time: string) => boolean;
  getAvailabilityForDate: (date: string) => AvailabilitySlot[];
}

export const useAvailabilityStore = create<AvailabilityState>()(
  persist(
    (set, get) => ({
      availability: {
        weekly: [
          // Default 9-5 Monday to Friday
          { day: 1, start: '09:00', end: '17:00' }, // Monday
          { day: 2, start: '09:00', end: '17:00' }, // Tuesday
          { day: 3, start: '09:00', end: '17:00' }, // Wednesday
          { day: 4, start: '09:00', end: '17:00' }, // Thursday
          { day: 5, start: '09:00', end: '17:00' }, // Friday
        ],
        exceptions: [],
      },

      setWeeklyAvailability: (slots) => {
        set((state) => ({
          availability: {
            ...state.availability,
            weekly: slots,
          },
        }));
      },

      addException: (date, available, slots) => {
        set((state) => ({
          availability: {
            ...state.availability,
            exceptions: [
              ...state.availability.exceptions.filter((e) => e.date !== date),
              { date, available, slots },
            ],
          },
        }));
      },

      removeException: (date) => {
        set((state) => ({
          availability: {
            ...state.availability,
            exceptions: state.availability.exceptions.filter((e) => e.date !== date),
          },
        }));
      },

      isAvailableAt: (date, time) => {
        const { availability } = get();
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        // Check for exceptions first
        const exception = availability.exceptions.find((e) => e.date === date);
        if (exception) {
          if (!exception.available) return false;
          if (exception.slots) {
            return exception.slots.some((slot) => 
              slot.day === dayOfWeek && time >= slot.start && time < slot.end
            );
          }
        }
        
        // Check weekly availability
        return availability.weekly.some((slot) => 
          slot.day === dayOfWeek && time >= slot.start && time < slot.end
        );
      },

      getAvailabilityForDate: (date) => {
        const { availability } = get();
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        // Check for exceptions first
        const exception = availability.exceptions.find((e) => e.date === date);
        if (exception) {
          if (!exception.available) return [];
          if (exception.slots) {
            return exception.slots.filter((slot) => slot.day === dayOfWeek);
          }
        }
        
        // Return weekly availability for this day
        return availability.weekly.filter((slot) => slot.day === dayOfWeek);
      },
    }),
    {
      name: 'availability-storage',
    }
  )
);