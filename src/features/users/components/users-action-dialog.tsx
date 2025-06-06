'use client'

import { MultiSelect } from '@/components/multi-select';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { queryClient } from '@/lib/query-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { userTypes } from '../data/data';
import { userFormSchema, type User, type UserFormValues } from '../data/schema';
import { getQueryKey, useCreateUser, useUpdateUser } from '../hooks/use-user';


interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const form = useForm<UserFormValues>({
    resolver: zodResolver<UserFormValues, any, UserFormValues>(userFormSchema),
    defaultValues: isEdit
      ? {
        firstName: currentRow.firstName,
        lastName: currentRow.lastName,
        email: currentRow.email,
        roles: (currentRow?.roles ?? ["student"]) as ("admin" | "student" | "teacher")[],
        permissions: Array.isArray(currentRow.permissions) ? currentRow.permissions : [],
        isActive: currentRow.isActive,
        password: '',
        confirmPassword: '',
      }
      : {
        firstName: '',
        lastName: '',
        email: '',
        roles: ["student"],
        permissions: [],
        isActive: true,
        password: '',
        confirmPassword: '',
      },
  })


  const onSuccess = () => {
    toast.success(`User ${isEdit ? 'updated' : 'created'} successfully.`);
    form.reset();
    onOpenChange(false);
    queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
  };

  const onError = (error: Error) => {
    toast.error(`Failed to ${isEdit ? 'update' : 'create'} user.`, {
      description: error.message,
    });
  };

  const createUserMutation = useCreateUser(onSuccess, onError);
  const updateUserMutation = useUpdateUser(onSuccess, onError);


  const onSubmit = (values: UserFormValues) => {
    if (isEdit && currentRow?.id) {
      const updateUserData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        roles: values.roles,
        permissions: values.permissions,
        isActive: values.isActive,
        password: values.password,
      };
      updateUserMutation.mutate({ userId: currentRow.id, userData: updateUserData });

    } else {
      const createUserData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        roles: values.roles || [],
        permissions: values.permissions || null,
        isActive: values.isActive,
        password: values.password,
      };
      createUserMutation.mutate(createUserData);
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password


  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='roles'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Role
                    </FormLabel>
                    <FormControl className='col-span-4'>
                      <MultiSelect
                        items={userTypes.map(({ label, value }) => ({ label, value }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select roles..."
                        className="col-span-4"
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Active
                    </FormLabel>
                    <FormControl className='col-span-4'>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
