import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Permission, type Role, type RoleForm, roleFormSchema } from '@/features/roles/data/schema';
import { type UseMutationResult } from '@tanstack/react-query';
import { useEffect } from 'react';

interface RoleFormProps<TVariables> {
    initialData?: Role;
    onSubmit: (data: Omit<Role, "id" | "createdAt" | "updatedAt">) => void;
    mutation: UseMutationResult<any, Error, TVariables, unknown>;
    isLoadingPermissions: boolean;
    permissions: Permission[];
}

export function RoleForm<TVariables>({
    initialData,
    onSubmit,
    mutation,
    isLoadingPermissions,
    permissions,
}: RoleFormProps<TVariables>) {
    const form = useForm<RoleForm>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: initialData || {
            name: '',
            permissions: [],
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                permissions: initialData.permissions,
            });
        }
    }, [initialData, form]);

    const selectedPermissions = form.watch('permissions');
    const isAllPermissionsSelected = permissions.length > 0 && selectedPermissions?.length === permissions.length;

    const handleCheckAll = (checked: boolean) => {
        if (checked) {
            form.setValue('permissions', permissions);
        } else {
            form.setValue('permissions', []);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>

                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem className='max-w-xs'>
                            <FormLabel>Role Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Enter role name' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormItem>
                    <div className='flex items-center space-x-2 mb-2'>
                        <Checkbox
                            id='checkAllPermissions'
                            checked={isAllPermissionsSelected}
                            onCheckedChange={handleCheckAll}
                            disabled={isLoadingPermissions || permissions.length === 0}
                        />
                        <Label htmlFor='checkAllPermissions'>Select All Permissions</Label>
                    </div>
                    <FormLabel>Permissions</FormLabel>
                    {isLoadingPermissions ? (
                        <p>Loading permissions...</p>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2'>
                            {Object.entries(
                                permissions.reduce((acc, permission) => {
                                    const [module] = permission.name.split(':');
                                    if (!acc[module]) {
                                        acc[module] = [];
                                    }
                                    acc[module].push(permission);
                                    return acc;
                                }, {} as Record<string, Permission[]>)
                            ).map(([module, modulePermissions]) => (
                                <div key={module} className='border p-4 rounded-md grid gap-2'>
                                    <h4 className='text-lg font-semibold capitalize'>{module.replaceAll('_', ' ').toLocaleLowerCase()}</h4>
                                    <div className='grid grid-cols-1 gap-2'>
                                        {modulePermissions.map((permission: Permission) => (
                                            <FormField
                                                key={permission.id}
                                                control={form.control}
                                                name='permissions'
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={permission.id}
                                                            className='flex flex-row items-start space-x-3 space-y-0'
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.some((p: Permission) => p.id === permission.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            field.onChange([...field.value, permission]);
                                                                        } else {
                                                                            field.onChange(
                                                                                field.value?.filter(
                                                                                    (p: Permission) => p.id !== permission.id
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className='font-normal capitalize'>
                                                                {permission.name.split(':')[1]?.replaceAll('_', ' ').toLocaleLowerCase() || permission.name.replaceAll('_', ' ').toLocaleLowerCase()}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <FormMessage />
                </FormItem>
                <div className="flex justify-end items-center mt-4" >
                    <Button type='submit' disabled={mutation.status === 'pending' || isLoadingPermissions}>
                        {mutation.status === 'pending'
                            ? initialData
                                ? 'Saving...'
                                : 'Creating...'
                            : initialData
                                ? 'Save Changes'
                                : 'Create Role'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
