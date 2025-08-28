import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  GraduationCap, 
  Filter, 
  Search, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Weight
} from 'lucide-react';
import { useEventsStore } from '@/features/events/store';
import { formatDate, formatTime } from '@/lib/time';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Event } from '@/features/events/types';

interface WeightedModulesViewProps {
  className?: string;
}

export default function WeightedModulesView({ className }: WeightedModulesViewProps) {
  const { events, getWeightedEvents, getEventsByCourse } = useEventsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'weight' | 'course'>('dueDate');
  const [filterBy, setFilterBy] = useState<'all' | 'weighted' | 'upcoming' | 'overdue'>('all');

  // Get all Canvas events
  const canvasEvents = useMemo(() => 
    events.filter(event => event.canvasId), 
    [events]
  );

  // Get unique courses
  const courses = useMemo(() => {
    const courseMap = new Map();
    canvasEvents.forEach(event => {
      if (event.canvasCourseId && !courseMap.has(event.canvasCourseId)) {
        courseMap.set(event.canvasCourseId, {
          id: event.canvasCourseId,
          name: event.location?.replace(/Canvas Course: /, '') || 'Unknown Course'
        });
      }
    });
    return Array.from(courseMap.values());
  }, [canvasEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = canvasEvents;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }

    // Apply course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(event => event.canvasCourseId === selectedCourse);
    }

    // Apply type filter
    const now = new Date();
    switch (filterBy) {
      case 'weighted':
        filtered = filtered.filter(event => event.isWeighted);
        break;
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.start) > now);
        break;
      case 'overdue':
        filtered = filtered.filter(event => 
          new Date(event.start) < now && event.canvasType === 'assignment'
        );
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        case 'weight':
          return (b.weight || 0) - (a.weight || 0);
        case 'course':
          return (a.location || '').localeCompare(b.location || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [canvasEvents, searchQuery, selectedCourse, sortBy, filterBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const weighted = canvasEvents.filter(event => event.isWeighted);
    const totalWeight = weighted.reduce((sum, event) => sum + (event.weight || 0), 0);
    const avgWeight = weighted.length > 0 ? totalWeight / weighted.length : 0;
    
    const now = new Date();
    const upcoming = canvasEvents.filter(event => new Date(event.start) > now);
    const overdue = canvasEvents.filter(event => 
      new Date(event.start) < now && event.canvasType === 'assignment'
    );

    return {
      totalAssignments: canvasEvents.length,
      weightedAssignments: weighted.length,
      averageWeight: avgWeight,
      upcomingCount: upcoming.length,
      overdueCount: overdue.length,
      coursesCount: courses.length
    };
  }, [canvasEvents, courses]);

  const getWeightBadgeVariant = (weight?: number) => {
    if (!weight) return 'secondary';
    if (weight >= 30) return 'destructive';
    if (weight >= 15) return 'default';
    return 'secondary';
  };

  const getStatusIcon = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.start);
    
    if (event.canvasType === 'assignment' && eventDate < now) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (event.isWeighted) {
      return <Weight className="h-4 w-4 text-primary" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.coursesCount}</div>
                <div className="text-sm text-muted-foreground">Active Courses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Weight className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.weightedAssignments}</div>
                <div className="text-sm text-muted-foreground">Weighted Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.upcomingCount}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">{stats.overdueCount}</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="course">Course</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="weighted">Weighted Only</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Canvas Assignments & Due Dates
          </CardTitle>
          <CardDescription>
            {filteredEvents.length} of {canvasEvents.length} assignments shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assignments found</p>
              <p className="text-sm mt-1">
                {canvasEvents.length === 0 
                  ? 'Import your Canvas data to see assignments here'
                  : 'Try adjusting your filters'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.canvasId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(event)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{event.title}</h3>
                                {event.isWeighted && (
                                  <Badge variant={getWeightBadgeVariant(event.weight)}>
                                    {event.weight}% weight
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {event.canvasType}
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-muted-foreground mb-2">
                                {event.location}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Due: {formatDate(event.start)} at {formatTime(event.start)}</span>
                                </div>
                                
                                {event.pointsPossible && event.pointsPossible > 0 && (
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{event.pointsPossible} points</span>
                                  </div>
                                )}
                              </div>

                              {event.submissionTypes && event.submissionTypes.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-muted-foreground mb-1">Submission Types:</div>
                                  <div className="flex gap-1 flex-wrap">
                                    {event.submissionTypes.map(type => (
                                      <Badge key={type} variant="secondary" className="text-xs">
                                        {type.replace('_', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: event.color || '#3B82F6' }}
                            />
                            {new Date(event.start) < new Date() && event.canvasType === 'assignment' && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Breakdown */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Breakdown</CardTitle>
            <CardDescription>
              Assignment distribution across your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map(course => {
                const courseEvents = getEventsByCourse(course.id);
                const weightedCount = courseEvents.filter(e => e.isWeighted).length;
                const totalWeight = courseEvents
                  .filter(e => e.isWeighted)
                  .reduce((sum, e) => sum + (e.weight || 0), 0);

                return (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {courseEvents.length} assignments • {weightedCount} weighted
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{totalWeight.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Total Weight</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}