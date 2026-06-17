import { BackButton } from '@/components/misc/back-button';
import { ComingSoonEmpty } from '@/components/misc/empty-screen';
import { LoadingComponent } from '@/components/misc/loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetSingleUserQuery } from '@/features/user/state/user-api-slice';
import { RolesConfig } from '@auxilium/configs/roles';
import { BadgeCheck, Shield, ShieldUser, User, UserX } from 'lucide-react';
import { useParams } from 'react-router';

export default function SingleUserPage() {
  const { userProfileId } = useParams();
  const { data, isLoading } = useGetSingleUserQuery({
    userProfileId: userProfileId ?? '',
  });

  if (isLoading) {
    // TODO: Add skeleton loading state here
    return <LoadingComponent />;
  }

  if (!data?.data) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        {/* TODO: Add Sede empty state */}
        <h1 className='text-4xl font-bold'>Where is my user???</h1>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full flex-col'>
      <BackButton />
      {/* <h1 className='text-xl text-muted-foreground'>User Statistics</h1> */}
      {/* Main Profile */}
      <div className='flex w-full flex-col gap-4 p-4 md:w-1/2'>
        <div className='flex w-full flex-row items-center'>
          <Avatar className='size-24'>
            <AvatarImage src={data.data.image} />
            <AvatarFallback>
              <p className='text-2xl font-bold'>
                {data.data.firstName.charAt(0)}
              </p>
            </AvatarFallback>
          </Avatar>
          {/* User Info */}
          <div className='ml-8 flex w-full flex-col justify-center gap-1'>
            {/* Name & Role */}
            <div className='flex flex-row items-center gap-2'>
              <h1 className='text-2xl'>
                {data.data.firstName} {data.data.lastName}
              </h1>
              {!data.data.role.roleId && <UserX className='size-5' />}
              {data.data.role.roleId === RolesConfig.USER && (
                <User className='size-5' />
              )}
              {data.data.role.roleId === RolesConfig.ADMIN && (
                <Shield className='size-5' />
              )}
              {data.data.role.roleId === RolesConfig.SUPERADMIN && (
                <ShieldUser className='size-5' />
              )}
            </div>
            {/* Email */}
            {data.data.email ? (
              <p className='flex flex-row items-center gap-1.5'>
                {data.data.email}{' '}
                {data.data.emailVerified && (
                  <BadgeCheck className='text-primary size-4' />
                )}
              </p>
            ) : (
              <p className='text-muted-foreground italic'>No email provided</p>
            )}
            {/* Department badges */}
            <div className='flex flex-row gap-1 pt-1'>
              {data.data.departments &&
                data.data.role.roleId !== RolesConfig.USER &&
                data.data.departments.map((dept) => (
                  <Badge key={dept.departmentId} variant='secondary'>
                    {dept.name}
                  </Badge>
                ))}
            </div>
          </div>
        </div>
        {/* User Profile */}
        <div className='flex w-full flex-row justify-between'>
          <div className='flex flex-col'>
            <span className='text-muted-foreground w-full'>Admin Number</span>{' '}
            <span className='w-full'>{data.data.adminNumber}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-muted-foreground w-full'>Class</span>{' '}
            <span className='w-full'>{data.data.studentClass}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-muted-foreground w-full'>Course</span>{' '}
            <span className='w-full'>{data.data.course}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-muted-foreground w-full'>iChat</span>{' '}
            <span className='w-full'>{data.data.ichat}</span>
          </div>
        </div>
      </div>
      {/* User Activity Graph */}
      <div className='flex h-full w-full flex-col p-4'>
        <h1 className='mb-4 text-2xl font-semibold'>User Activity</h1>
        <div className='flex h-full flex-col items-center justify-center rounded-xl outline outline-dashed'>
          <ComingSoonEmpty />
        </div>
      </div>
    </div>
  );
}
