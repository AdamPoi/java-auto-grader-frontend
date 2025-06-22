import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Assignment } from "@/features/assignments/data/types";
import type { Rubric } from "@/features/rubrics/data/types";

interface RubricViewProps {
    assignment: Assignment;
    rubrics: Rubric[];
}

export function RubricView({ assignment, rubrics }: RubricViewProps) {
    return (
        <div className="bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-y-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <main className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">{assignment.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Deskripsi Proyek</h3>
                            <div className="prose max-w-none text-slate-600 space-y-4">
                                <p>{assignment.description && assignment.description.replaceAll('\n', '<br />')}</p>
                                {/* <p>Aplikasi harus memungkinkan pengguna untuk:</p> */}
                                {/* <ul className="list-disc list-inside space-y-2">
                                    {assignment.description.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul> */}
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <aside>
                    <Card>
                        <CardHeader>
                            <CardTitle>Rubrik Penilaian</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kriteria</TableHead>
                                        <TableHead className="text-right">Poin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rubrics && rubrics.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{item.points}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}