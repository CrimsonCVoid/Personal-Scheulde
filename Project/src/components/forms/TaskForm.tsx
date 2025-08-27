import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task } from '@/features/events/types';
import { useTasksStore } from '@/features/tasks/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  due: z.string().optional(),
  priority: z.enum(['low', 'med', 'high']).default('med'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

export default function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const { addTask, updateTask, deleteTask } = useTasksStore();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      notes: task?.notes || '',
      due: task?.due || '',
      priority: task?.priority || 'med',
    },
  });

  const onSubmit = (data: TaskFormData) => {
    try {
      if (task) {
        updateTask(task.id, data);
        toast.success('Task updated successfully');
      } else {
        addTask({ ...data, completed: false });
        toast.success('Task created successfully');
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleDelete = () => {
    if (!task) return;
    
    try {
      deleteTask(task.id);
      toast.success('Task deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Task title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Task notes"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="datetime-local"
                {...form.register('due')}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(value: 'low' | 'med' | 'high') => form.setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="med">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            {task && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting 
                  ? (task ? 'Updating...' : 'Creating...') 
                  : (task ? 'Update' : 'Create')
                }
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}