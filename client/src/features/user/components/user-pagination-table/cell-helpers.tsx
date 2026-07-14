import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { UserRoleBadge } from '../role-badge';
import type { RoleDTO } from '../../user.dto';
import {
  useGetAllRolesQuery,
  useUpdateUserByIdMutation,
} from '../../state/user-api-slice';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { RolesConfig } from '@auxilium/configs/roles';

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
      <PopoverContent align='start' className='w-45 px-1 py-2'>
        <PopoverHeader className='px-1.5'>
          <PopoverTitle>Update Role</PopoverTitle>
        </PopoverHeader>
        <div className='mt-2 flex flex-col'>
          {data?.data &&
            data?.data.length > 0 &&
            data?.data.map((role) => {
              if (role.roleId === RolesConfig.SUPERADMIN) return <></>;
              return (
                <div
                  onClick={() => handleUpdate(role.roleId as number)}
                  className='hover:bg-muted flex cursor-pointer flex-row items-center justify-between rounded-md px-1 py-1.5'
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
