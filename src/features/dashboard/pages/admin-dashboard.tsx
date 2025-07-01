import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
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
import { formatDistanceToNow } from 'date-fns'
import { BookOpenCheck, ClipboardList, Users } from 'lucide-react'
import {
    Bar,
    BarChart,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import type { AdminDashboard } from '../data/types'

export const AdminDashboardPage = ({ data }: { data: AdminDashboard }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.kpis.activeAssignments}</div>
                        <p className="text-xs text-muted-foreground">Currently open for submissions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                        <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.kpis.activeCourses}</div>
                        <p className="text-xs text-muted-foreground">Courses this semester</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.kpis.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Across all active courses</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Submissions</CardTitle>
                        <CardDescription>An overview of the latest student submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[25%]">Student</TableHead>
                                    <TableHead className="w-[20%]">Course</TableHead>
                                    <TableHead className="w-[20%]">Assignment</TableHead>
                                    <TableHead className="w-[15%]">Submitted</TableHead>
                                    <TableHead className="w-[10%]">Status</TableHead>
                                    <TableHead className="w-[10%]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.recentSubmissions.map(sub => (
                                    <TableRow key={sub.submissionId}>
                                        <TableCell className="font-medium flex items-center truncate">
                                            <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
                                                <AvatarImage src={sub.studentAvatar} alt={sub.studentName} />
                                                <AvatarFallback>{sub.studentName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">{sub.studentName}</span>
                                        </TableCell>
                                        <TableCell className="truncate">{sub.courseName}</TableCell>
                                        <TableCell className="truncate">{sub.assignmentTitle}</TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}</TableCell>
                                        <TableCell>
                                            <Badge className={cn('cursor-pointer', sub.status === 'COMPLETED' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100')}>
                                                {sub.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell><Button variant="secondary" size="sm" className='cursor-pointer' onClick={() => navigate({ to: `/admin/submissions/${sub.submissionId}` })}>View</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Deadlines</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.upcomingDeadlines.map(d => (
                                <div key={d.title} className="flex items-center justify-between">
                                    <div className="truncate pr-2">
                                        <p className="font-medium truncate">{d.title}</p>
                                        <p className="text-sm text-muted-foreground truncate">{d.course}</p>
                                    </div>
                                    <Badge variant="secondary" className="flex-shrink-0">{formatDistanceToNow(new Date(d.dueDate), { addSuffix: true })}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Class Performance</CardTitle>
                            <CardDescription>Average scores on recent assignments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data.classPerformance}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="averageScore" fill="currentColor" className="text-primary" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>


                </div>
            </div>
        </div>
    )
};