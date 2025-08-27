import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventForm from '@/components/forms/EventForm';
import { useEventsStore } from '@/features/events/store';

// Mock the store
vi.mock('@/features/events/store');

const mockAddEvent = vi.fn();
const mockUpdateEvent = vi.fn();
const mockDeleteEvent = vi.fn();

vi.mocked(useEventsStore).mockReturnValue({
  events: [],
  view: 'week',
  selectedDate: '2023-01-01',
  isLoading: false,
  addEvent: mockAddEvent,
  updateEvent: mockUpdateEvent,
  deleteEvent: mockDeleteEvent,
  setView: vi.fn(),
  setSelectedDate: vi.fn(),
  getEventById: vi.fn(),
  getEventsByDate: vi.fn(),
  getEventsInRange: vi.fn(),
  getUpcomingEvents: vi.fn(),
  searchEvents: vi.fn(),
});

describe('EventForm', () => {
  it('renders create form correctly', () => {
    render(<EventForm open={true} onOpenChange={() => {}} />);
    
    expect(screen.getByText('Create Event')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<EventForm open={true} onOpenChange={() => {}} />);
    
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('calls addEvent when form is submitted with valid data', async () => {
    const onOpenChange = vi.fn();
    render(<EventForm open={true} onOpenChange={onOpenChange} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Event' }
    });
    fireEvent.change(screen.getByLabelText(/start/i), {
      target: { value: '2023-01-01T10:00' }
    });
    fireEvent.change(screen.getByLabelText(/end/i), {
      target: { value: '2023-01-01T11:00' }
    });
    
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledWith({
        title: 'Test Event',
        description: '',
        start: '2023-01-01T10:00',
        end: '2023-01-01T11:00',
        allDay: false,
        location: '',
        color: 'blue',
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});