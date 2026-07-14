import { cn } from '@/lib/utils';
import { Edit2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface InlineTextEditProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

export function InlineTextEdit({
  value,
  onSave,
  className,
}: InlineTextEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // When value changes externally (e.g. reload) update the input value to that new external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Focus the input automatically when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Callback for when the value is saved
  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setInputValue(value); // Reset if empty or unchanged
    }
    setIsEditing(false);
    setIsHovering(false)
  };

  // Wrapper to handle keybinds for easier editing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setInputValue(value); // Cancel editing
      setIsEditing(false);
      setIsHovering(false);
    }
  };

  if (isEditing) {
    return (
      <div className={cn('flex items-center gap-2 mb-1 ', className)}>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className='border-b outline-0 w-full'
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        'flex flex-row cursor-pointer items-center gap-2',
        className,
      )}
    >
      <span>{inputValue}</span>
      {isHovering && <Edit2 className='size-4 text-muted-foreground'/>}
    </div>
  );
}
