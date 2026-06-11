import { ComingSoonEmpty } from '@/components/misc/empty-screen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDataTable } from '@/features/user/components/user-pagination-table/user-data-table';
import { UserProfileDataTable } from '@/features/user/components/user-profile-pagination-table/user-profile-data-table';
import { SquareUser, Users } from 'lucide-react';

export default function UserManagementPage() {
  return (
    <div className='flex h-full w-full flex-col'>
      <h1 className='text-2xl font-semibold'>All Users</h1>
      {/* Use a tab interface as well to seperate existing users from profiles */}
      {/* Profiles = participants detected via participation records */}
      {/* Users = registered users with a role in the system */}
      <div className='mt-4 flex h-full w-full flex-col'>
        <Tabs defaultValue={'users'} className='flex flex-col gap-4'>
          <div className='w-full border-b bg-transparent'>
            <TabsList className='inline-flex flex-row justify-start gap-2 rounded-none border-0 bg-transparent p-0'>
              <TabsTrigger
                value={'users'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <Users /> Users
              </TabsTrigger>
              <TabsTrigger
                value={'profiles'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <SquareUser /> Profiles
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Users Tab */}
          <TabsContent value={'users'}>
            <div className='flex h-full w-full flex-col gap-4'>
              <UserDataTable />
            </div>
          </TabsContent>
          {/* Profiles Tab */}
          <TabsContent value={'profiles'}>
            <div className='flex h-full w-full flex-col gap-4'>
              <UserProfileDataTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
