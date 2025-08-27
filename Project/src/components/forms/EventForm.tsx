import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Event } from '@/features/events/types';
import { useEventsStore } from '@/features/events/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EVENT_COLORS } from '@/features/events/utils';
import { formatISO, parseISO } from 'date-fns';
import { toast } from 'sonner';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start: z.string().min(1, 'Start time is required'),
  end: z.string().min(1, 'End time is required'),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.string().default('blue'),
}).refine((data) => {
  if (!data.allDay && data.start && data.end) {
    const start = parseISO(data.start);
    const end = parseISO(data.end);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return diffMinutes >= 5; // At least 5 minutes
  }
  return true;
}, {
  message: 'End time must be at least 5 minutes after start time',
  path: ['end'],
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
  defaultStart?: string;
  defaultEnd?: string;
}

export default function EventForm({ 
  open, 
  onOpenChange, 
  event, 
  defaultStart, 
  defaultEnd 
}: EventFormProps) {
  const { addEvent, updateEvent, deleteEvent } = useEventsStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      start: event?.start || defaultStart || '',
      end: event?.end || defaultEnd || '',
      allDay: event?.allDay || false,
      location: event?.location || '',
      color: event?.color || 'blue',
    },
  });

  const watchAllDay = form.watch('allDay');

  const onSubmit = (data: EventFormData) => {
    try {
      if (event) {
        updateEvent(event.id, data);
        toast.success('Event updated successfully');
      } else {
        addEvent(data);
        toast.success('Event created successfully');
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const handleDelete = () => {
    if (!event) return;
    
    setIsDeleting(true);
    try {
      deleteEvent(event.id);
      toast.success('Event deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Event title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Event description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allDay"
              checked={watchAllDay}
              onCheckedChange={(checked) => form.setValue('allDay', checked)}
            />
            <Label htmlFor="allDay">All day</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Start {!watchAllDay ? 'time' : 'date'} *</Label>
              <Input
                id="start"
                type={watchAllDay ? 'date' : 'datetime-local'}
                {...form.register('start')}
              />
              {form.formState.errors.start && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.start.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="end">End {!watchAllDay ? 'time' : 'date'} *</Label>
              <Input
                id="end"
                type={watchAllDay ? 'date' : 'datetime-local'}
                {...form.register('end')}
              />
              {form.formState.errors.end && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.end.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register('location')}
              placeholder="Event location"
            />
          </div>

          <div>
            <Label>Color</Label>
            <Select
              value={form.watch('color')}
              onValueChange={(value) => form.setValue('color', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_COLORS.map((color) => (
                  <SelectItem key={color.name} value={color.name.toLowerCase()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting 
                  ? (event ? 'Updating...' : 'Creating...') 
                  : (event ? 'Update' : 'Create')
                }
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}