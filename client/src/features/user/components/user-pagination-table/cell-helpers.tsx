import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { UserRoleBadge } from '../role-badge';
import type { DepartmentDTO, RoleDTO } from '../../user.dto';
import {
  useGetAllDepartmentsQuery,
  useGetAllRolesQuery,
  useUpdateUserByIdMutation,
} from '../../state/user-api-slice';
import { Check, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { RolesConfig } from '@auxilium/configs/roles';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function SelectUserRole({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: RoleDTO;
}) {
  const { data } = useGetAllRolesQuery();
  const [updateUser] = useUpdateUserByIdMutation();

  const [isOpen, setIsOpen] = useState(false);

  const handleUpdate = async (roleId: number) => {
    // If roles match then return early on
    if (roleId === currentRole.roleId) return;
    // Disable SUPERADMIN on the frontend too
    if (roleId === RolesConfig.SUPERADMIN) return;

    try {
      await updateUser({ userId, roleId }).unwrap();
      toast.success('Updated user role successfully.');
    } catch (error: any) {
      console.error(error);
      toast.error(error.data.message);
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className='flex h-full w-full cursor-pointer flex-row items-center gap-1'>
          <UserRoleBadge role={currentRole} />
          {/* <Edit2 className='text-muted-foreground size-3 opacity-0 hover:opacity-100'/> */}
        </div>
      </PopoverTrigger>
      <PopoverContent align='start' className='me-4 max-w-45 px-1 py-2'>
        <div className='flex flex-col gap-1'>
          {data?.data &&
            data?.data.length > 0 &&
            data?.data.map((role) => {
              if (role.roleId === RolesConfig.SUPERADMIN) return;
              return (
                <div
                  onClick={() => handleUpdate(role.roleId as number)}
                  className='hover:bg-muted flex cursor-pointer flex-row items-center justify-between rounded-md px-1.5 py-1'
                >
                  <UserRoleBadge role={role} />
                  {role.roleId === currentRole.roleId && (
                    <Check className='size-4' />
                  )}
                </div>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DepartmentPopover({
  userId,
  profileId,
  departments,
  children,
}: {
  userId: string;
  profileId: string | undefined;
  departments: DepartmentDTO[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Initialise departments state with user's current departments
  // const [selectedDepts, setSelectedDepts] = useState<number[]>(
  //   departments.map((d) => parseInt(d.departmentId as string)),
  // );
  const [updateUser] = useUpdateUserByIdMutation();
  const { data, isLoading } = useGetAllDepartmentsQuery();

  const handleUpdate = async (value: number) => {
    const departmentFound = departments.find((d) => d.departmentId === value);
    let deptArr = departments.map((d) => parseInt(d.departmentId as string));

    if (departmentFound) {
      // If department exists already, remove it from state
      deptArr = departments
        .filter((d) => d.departmentId !== value)
        .map((d) => parseInt(d.departmentId as string));
    } else {
      // Else add it into the state array
      deptArr.push(value);
    }

    console.log('Selected Depts:', deptArr);

    // Finally update user departments based on the above state
    try {
      await updateUser({ userId, departmentIds: deptArr }).unwrap();
      toast.success('Updated user department(s) successfully');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to assign user department');
    } finally {
      // setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger disabled={!profileId} className='cursor-pointer'>
        {profileId ? (
          <>{children}</>
        ) : (
          <Badge variant={'outline'} className='text-amber-500 border-amber-500 border-dashed bg-amber-500/10'>
            <TriangleAlert /> Profile not linked
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className='me-4 max-w-45 px-1 py-2' align='start'>
        <ul className='flex flex-col gap-1'>
          {data?.data &&
            data.data.map((dept) => {
              const selected = departments.find(
                (d) => d.departmentId === dept.departmentId,
              );
              return (
                <li
                  onClick={() => handleUpdate(dept.departmentId as number)}
                  className={cn(
                    'hover:bg-muted flex w-full cursor-pointer flex-row items-center justify-between rounded-md px-1.5 py-1',
                  )}
                  key={dept.departmentId}
                >
                  <Badge variant={'secondary'}>{dept.name}</Badge>
                  {selected && (
                    <Check className='text-muted-foreground size-4' />
                  )}
                </li>
              );
            })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
