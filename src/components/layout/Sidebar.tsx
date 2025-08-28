{
  name: 'Tasks',
  href: '/tasks',
  icon: CheckSquare,
  current: location.pathname === '/tasks',
  badge: todayTasksCount + overdueTasksCount,
},
{
  name: 'Canvas LMS',
  href: '/canvas',
  icon: GraduationCap,
  current: location.pathname === '/canvas',
},
{
  name: 'Settings',
  href: '/settings',