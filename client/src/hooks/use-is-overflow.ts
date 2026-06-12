import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';

export function useIsOverflow() {
  const [isOverflow, setIsOverflow] = useState({
    vertical: false,
    horizontal: false,
  });
  const ref = useRef<HTMLElement>(null);

  const checkForOverflow = useCallback(() => {
    // Ensure the ref is attached to an element before checking for overflow
    const element = ref.current;
    if (!element) return;

    const hasVerticalOverflow = element.offsetHeight < element.scrollHeight;
    const hasHorizontalOverflow = element.offsetWidth < element.scrollWidth;

    const newState = {
      vertical: hasVerticalOverflow,
      horizontal: hasHorizontalOverflow,
    };

    // No change in overflow state, skip update
    if (newState === isOverflow) return;

    setIsOverflow(newState);
  }, [ref.current, setIsOverflow, isOverflow]);

  useEffect(() => {
    checkForOverflow();
  });

  // useLayoutEffect(() => {
  //   console.log('Checking for overflow on element:');

  //   const element = ref.current;
  //   if (!element) return;

  //   const checkForOverflow = () => {
  //     const hasVerticalOverflow = element.offsetHeight < element.scrollHeight;
  //     const hasHorizontalOverflow = element.offsetWidth < element.scrollWidth;

  //     setIsOverflow({
  //       vertical: hasVerticalOverflow,
  //       horizontal: hasHorizontalOverflow,
  //     });
  //   };

  //   // Check on initial mount
  //   checkForOverflow();

  //   // Wire up ResizeObserver to handle element or window resizes dynamically
  //   const resizeObserver = new ResizeObserver(() => checkForOverflow());
  //   resizeObserver.observe(element);

  //   return () => resizeObserver.disconnect();
  // }, [ref]);

  return { ...isOverflow, ref };
}
