import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Clock, CheckCircle2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useTasksStore } from '@/features/tasks/store';
import { formatDate, formatTime } from '@/lib/time';
import TaskForm from '@/components/forms/TaskForm';
import { Task } from '@/features/events/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const { 
    getTodayTasks, 
    getOverdueTasks, 
    getUpcomingTasks, 
    getCompletedTasks,
    toggleTask 
  } = useTasksStore();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();
  const upcomingTasks = getUpcomingTasks();
  const completedTasks = getCompletedTasks();

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const TaskList = ({ tasks, showCompleted = false }: { tasks: Task[]; showCompleted?: boolean }) => (
    <div className="space-y-2">
      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className={cn(
                "transition-all hover:shadow-md cursor-pointer",
                task.completed && "opacity-75"
              )}
              onClick={() => handleEditTask(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </div>
                    {task.notes && (
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.notes}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {task.due && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(task.due)}
                        </div>
                      )}
                      <Badge 
                        variant={
                          task.priority === 'high' ? 'destructive' :
                          task.priority === 'med' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      {overdueTasks.some(t => t.id === task.id) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      {tasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tasks in this category</p>
          {!showCompleted && (
            <p className="text-sm mt-1">All caught up! 🎉</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your to-do list and stay organized
          </p>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">{overdueTasks.length}</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{todayTasks.length}</div>
                <div className="text-sm text-muted-foreground">Due Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{upcomingTasks.length}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{completedTasks.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Lists */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today
            {(todayTasks.length > 0 || overdueTasks.length > 0) && (
              <Badge variant="destructive" className="ml-1">
                {todayTasks.length + overdueTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingTasks.length > 0 && (
              <Badge className="ml-1">{upcomingTasks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">{completedTasks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today">
          <div className="space-y-6">
            {overdueTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Overdue ({overdueTasks.length})
                </h3>
                <TaskList tasks={overdueTasks} />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Due Today ({todayTasks.length})
              </h3>
              <TaskList tasks={todayTasks} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <TaskList tasks={upcomingTasks} />
        </TabsContent>
        
        <TabsContent value="completed">
          <TaskList tasks={completedTasks} showCompleted />
        </TabsContent>
        
        <TabsContent value="all">
          <TaskList tasks={[...overdueTasks, ...todayTasks, ...upcomingTasks, ...completedTasks]} />
        </TabsContent>
      </Tabs>

      {/* Task Form */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={handleCloseForm}
        task={editingTask}
      />
    </div>
  );
}