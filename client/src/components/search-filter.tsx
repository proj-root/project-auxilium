import { useAppDispatch } from "@/hooks/redux-hooks";
import { cn } from "@/lib/utils";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";

export function SearchFilter({
  setSearchCb,
  className,
}: {
  setSearchCb: ActionCreatorWithPayload<any, string>;
  className?: string;
}) {
  const dispatch = useAppDispatch();

  const handleSearchChange = (value: string) => {
    dispatch(setSearchCb(value));
  };

  return (
    <input
      type='text'
      placeholder='Search...'
      className={cn('rounded-md border outline-0 p-2 text-sm md:w-1/4', className)}
      onChange={(e) => handleSearchChange(e.target.value)}
    />
  );
}