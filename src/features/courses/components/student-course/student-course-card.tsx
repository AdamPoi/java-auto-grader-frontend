import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import type { Course } from "../../data/types";

interface CourseCardProps {
    course: Course;
}

export function StudentCourseCard({ course }: CourseCardProps) {
    const navigate = useNavigate();
    return (
        <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0">
                <img
                    alt={course.name}
                    className="object-cover w-full h-48"
                    height={225}
                    // src={course.imageUrl}
                    // style={{
                    //     aspectRatio: "400/225",
                    //     objectFit: "cover",
                    // }}
                    width={400}
                />
            </CardHeader>
            <CardContent className="flex-1 p-6">
                {/* <Badge variant="outline" className="mb-4">{course.category}</Badge> */}
                <CardTitle className="mb-2 text-xl font-bold">{course.name}</CardTitle>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {course.description}
                </p>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Avatar>
                        {/* <AvatarImage src={course.author.avatarUrl} /> */}
                        <AvatarFallback>{`${course.teacher?.firstName.charAt(0)}${course.teacher?.lastName.charAt(0)}`}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{`${course.teacher?.firstName} ${course.teacher?.lastName}`}</span>
                </div>
                <div className="text-lg font-semibold">
                    {/* {priceFormatter.format(course.price)} */}
                </div>
            </CardFooter>
            <div className="p-6 pt-0">
                <Button type="button" size="lg" className="w-full" onClick={() => navigate({ to: `/student-courses/${course.id}` })}
                >Enroll Now</Button>
            </div>
        </Card>
    );
}