// ...
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IconChalkboardTeacher } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react'; // Import useState and useEffect
import type { Course } from '../data/types';

interface CourseCardProps {
    course: Course
}

export function CourseCard({ course }: CourseCardProps) {
    const navigate = useNavigate()
    const [gradient, setGradient] = useState('');

    useEffect(() => {
        const gradients = [
            'from-purple-500 to-pink-500',
            'from-blue-500 to-green-500',
            'from-yellow-500 to-orange-500',
            'from-red-500 to-purple-600',
            'from-green-400 to-blue-500'
        ];
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        setGradient(randomGradient);
    }, []);

    return (
        <Card className="flex flex-col gap-4 overflow-hidden py-0 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="p-0">
                <div className={`w-full h-48 bg-gradient-to-r ${gradient} flex items-center justify-center`}>
                    <h3 className="text-white text-2xl font-bold text-center">{course.name}</h3>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-0 px-4 pb-2 flex flex-col justify-start">
                <CardTitle className="mb-2 text-xl font-bold tracking-tight">{course.name}</CardTitle>
                <span className="flex gap-2">
                    <IconChalkboardTeacher className="w-5 h-5 text-primary" />
                    <CardDescription className="text-md text-muted-foreground">{course.teacher?.firstName} {course.teacher?.lastName}</CardDescription>
                </span>
                <CardDescription className="text-md mt-2">{course.description}</CardDescription>

                {/* <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-semibold text-muted-foreground">Progress</p>
                        <p className={`text-xs font-bold ${course.progress === 100 ? 'text-green-400' : 'text-primary'}`}>{course.progress}%</p>
                    </div>
                    <Progress value={course.progress} />
                </div> */}
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full" variant="outline" size="sm" onClick={() => navigate({
                    to: `/app/courses/${course.id}`
                })}>
                    {/* {course.progress === 100 ? <Star className="mr-2 h-4 w-4 text-yellow-400" /> : null} */}
                    {/* {course.progress === 100 ? 'Completed' : 'View Course'} */}
                    View Course
                </Button>
            </CardFooter>
        </Card >
    );
}
