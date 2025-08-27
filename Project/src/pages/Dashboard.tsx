import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, CheckCircle2, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { useEventsStore } from '@/features/events/store';
import { useTasksStore } from '@/features/tasks/store';
import { formatTime, formatDate } from '@/lib/time';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import EventForm from '@/components/forms/EventForm';
import TaskForm from '@/components/forms/TaskForm';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { getEventsByDate, getUpcomingEvents } = useEventsStore();
  const { getTodayTasks, getOverdueTasks, getCompletedTasks, toggleTask } = useTasksStore();
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = getEventsByDate(today);
  const upcomingEvents = getUpcomingEvents(5);
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();
  const allTasks = [...todayTasks, ...overdueTasks];
  const completedTasks = getCompletedTasks();
  
  const totalTasks = allTasks.length + completedTasks.length;
  const completedPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold">Good morning! 👋</h1>
        <p className="text-muted-foreground mt-1">
          {formatDate(today)} • Here's what you have planned today
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="flex gap-2 mb-8" variants={itemVariants}>
        <Button onClick={() => setShowEventForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
        <Button variant="outline" onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
        <Button variant="outline" asChild>
          <Link to="/calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            View Calendar
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Agenda */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Events</CardTitle>
                <CardDescription>
                  {todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''} scheduled
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/calendar">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled for today</p>
                  <p className="text-sm mt-1">Enjoy your free day!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.slice(0, 5).map((event) => (
                    <motion.div
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color || '#3B82F6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {event.allDay ? 'All day' : formatTime(event.start)}
                          {event.location && (
                            <>
                              <span>•</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {todayEvents.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/calendar">
                          +{todayEvents.length - 5} more events
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks Overview */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Task Progress</CardTitle>
                <CardDescription>
                  {completedTasks.length} of {totalTasks} completed
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tasks">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(completedPercentage)}%</span>
                  </div>
                  <Progress value={completedPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-accent/50">
                    <div className="text-2xl font-bold text-primary">{todayTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Due Today</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/10">
                    <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Overdue</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today & Overdue Tasks */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Priority Tasks
              </CardTitle>
              <CardDescription>
                Tasks due today and overdue items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>All caught up!</p>
                  <p className="text-sm mt-1">No urgent tasks to complete</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allTasks.slice(0, 8).map((task) => (
                    <motion.div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 w-4 h-4 border-2 rounded border-primary hover:bg-primary/10 transition-colors"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {task.due && (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(task.due)}</span>
                            </>
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
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Coming Up
              </CardTitle>
              <CardDescription>
                Your next upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming events</p>
                  <p className="text-sm mt-1">Your calendar is clear ahead</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color || '#3B82F6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(event.start)} • {formatTime(event.start)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Forms */}
      <EventForm
        open={showEventForm}
        onOpenChange={setShowEventForm}
      />
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
      />
    </motion.div>
  );
}