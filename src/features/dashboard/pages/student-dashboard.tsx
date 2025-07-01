import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowRight, BookOpenCheck, CalendarClock } from 'lucide-react'
import type { StudentDashboard } from '../data/types'

export const StudentDashboardPage = ({ data }: { data: StudentDashboard }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle>Welcome back, {data.welcomeBanner.studentName}!</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                        {data.welcomeBanner.nextAssignmentTitle ? "Here's your next assignment. Let's get it done!" : "You're all caught up!"}
                    </CardDescription>
                </CardHeader>
                {data.welcomeBanner.nextAssignmentTitle && (
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold">{data.welcomeBanner.nextAssignmentTitle}</h3>
                                <p className="text-sm">{data.welcomeBanner.nextAssignmentCourse}</p>
                                <p className="text-sm font-bold mt-1">{data.welcomeBanner.nextAssignmentDueDate}</p>
                            </div>
                            <Button variant="secondary" className="mt-4 sm:mt-0" onClick={() => navigate({ to: `/app/assignments/${data.welcomeBanner.nextAssignmentId}` })}>
                                Start Assignment <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Assignment</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recentGrades.map((g, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium truncate">{g.assignmentTitle}</TableCell>
                                            <TableCell className="truncate">{g.courseName}</TableCell>
                                            <TableCell>
                                                <Badge className={cn('cursor-pointer', g.status === 'COMPLETED' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100')}>
                                                    {g.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* My Courses */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Courses</CardTitle>
                            <CardDescription>Your progress across all enrolled courses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {data.courseProgress.map(c => (
                                        <Card
                                            key={c.courseId}
                                            className="cursor-pointer hover:border-primary transition-colors"
                                            onClick={() => navigate({ to: `/app/courses/${c.courseId}` })}
                                        >
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium truncate">{c.courseName}</CardTitle>
                                                <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{c.average}%</div>
                                                <p className="text-xs text-muted-foreground">Overall Grade</p>
                                                <Progress value={c.average} className="mt-2" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Upcoming Deadlines */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Deadlines</CardTitle>
                            <CardDescription>Stay on top of your due dates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.upcomingDeadlines.length > 0 ? (
                                data.upcomingDeadlines.map(deadline => (
                                    <div key={deadline.assignmentId} className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 flex flex-col items-center justify-center p-2 bg-muted rounded-md w-16 h-16">
                                            <span className="text-sm font-bold">{format(new Date(deadline.dueDate), 'MMM')}</span>
                                            <span className="text-2xl font-bold">{format(new Date(deadline.dueDate), 'd')}</span>
                                        </div>
                                        <div className="flex-grow truncate">
                                            <p className="font-semibold truncate">{deadline.title}</p>
                                            <p className="text-sm text-muted-foreground truncate">{deadline.course}</p>
                                            <p className="text-xs text-primary">{formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true })}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate({ to: `/app/assignments/${deadline.assignmentId}` })}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-4 text-sm">No upcoming deadlines. Great job!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Overall Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-2xl font-bold">{data.overallPerformance.average}%</p>
                                <p className="text-sm text-muted-foreground">Current Average Across All Courses</p>
                            </div>
                            <Progress value={data.overallPerformance.average} />
                            <p className="text-xs text-muted-foreground">This reflects your average grade to date.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
};