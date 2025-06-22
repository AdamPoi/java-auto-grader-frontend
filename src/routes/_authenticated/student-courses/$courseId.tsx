import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/student-courses/$courseId',
)({
  component: StudentCourseDetailPage,
})

'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StudentCourseDetailSkeleton } from '@/features/courses/components/student-course-detail-skjeleton';
import { useCourseById } from '@/features/courses/hooks/use-course';
import { AlertTriangle, BookOpen, CheckCircle2, Star } from 'lucide-react';

export default function StudentCourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams({ from: '/_authenticated/student-courses/$courseId' });

  const { data: course, isLoading, isError, error } = useCourseById(courseId)


  if (isLoading) {
    return <StudentCourseDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to Load Course</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // After loading, if no course is found, show a 404-like message
  if (!course) {
    // In a real app, you might use the `notFound()` function from Next.js
    // but this requires the page to be a server component or handled differently.
    // For a client component, displaying a message is a good approach.
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground">Sorry, we couldn't find the course you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/40">
      {/* --- Hero Section --- */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {/* <Badge>{course.category}</Badge> */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">{course.name}</h1>
              <p className="text-lg text-muted-foreground">{course.description}</p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1">
                  {/* <span className="font-bold text-lg">{course.rating}</span> */}
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  {/* <span className="text-sm text-muted-foreground">({course.reviewsCount} reviews)</span> */}
                </div>
                <span className="text-sm text-muted-foreground">By {course.teacher?.firstName} {course.teacher?.lastName}</span>
              </div>
            </div>
            <div>
              {/* Sticky Enroll Card */}
              <Card className="sticky top-24 shadow-lg">
                <CardHeader className="p-0">
                  {/* <img src={course.imageUrl} alt={course.title} className="w-full h-56 object-cover rounded-t-lg" /> */}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* <div className="text-3xl font-bold">{priceFormatter.format(course.price)}</div> */}
                  <Button size="lg" className="w-full">Add to Cart</Button>
                  <Button size="lg" variant="outline" className="w-full">Buy Now</Button>
                  <ul className="space-y-2 text-sm text-muted-foreground pt-4">
                    {/* <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> <span>{course.duration} of content</span></li>
                    <li className="flex items-center gap-2"><BarChart className="w-4 h-4" /> <span>{course.level} Level</span></li> */}
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span>Lifetime access</span></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* --- Main Content Section --- */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* What You'll Learn */}
            <div className="mb-12 p-6 border rounded-lg bg-background">
              <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {/* {course.whatYoullLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))} */}
              </ul>
            </div>

            {/* Course Content */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Course content</h2>
              <Accordion type="single" collapsible className="w-full">
                {course?.assignments && course?.assignments.map((assignment, i) => (
                  <AccordionItem value={`item-${i}`} key={i}>
                    <AccordionTrigger className="font-bold text-base">{assignment.title}
                      <span className="text-sm font-normal text-muted-foreground ml-auto pr-4">
                        {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span></AccordionTrigger>
                    <AccordionContent>
                      <p>
                        {assignment.description}
                      </p>
                      <Button onClick={() => navigate({ to: `/student-assignments/${assignment.id}` })} className="mt-4" variant="secondary">
                        View Assignment
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Requirements */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 pl-2 text-muted-foreground">
                {/* {course.requirements.map((req, i) => <li key={i}>{req}</li>)} */}
              </ul>
            </div>

            {/* Instructor */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About the instructor</h2>
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-background">
                <Avatar className="w-20 h-20">
                  {/* <AvatarImage src={course.author.avatarUrl} /> */}
                  <AvatarFallback>{course.teacher?.firstName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{course.teacher?.firstName}</h3>
                  {/* <p className="text-sm text-primary">{course.teacher?.title}</p> */}
                  <p className="mt-2 text-muted-foreground text-sm">A passionate instructor with over a decade of experience in software development and teaching. Known for clear explanations and hands-on teaching style.</p>
                </div>
              </div>
            </div>
          </div>
          {/* The right column is empty on larger screens, as the enroll card is in the hero */}
        </div>
      </section >
    </div >
  );
}