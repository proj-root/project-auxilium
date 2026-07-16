import { motion, stagger, type Variants } from 'motion/react';

interface TypewriterEffectProps {
  /** The text to be typed */
  text: string;
  /** The interval in seconds between each letter */
  interval?: number;
  onAnimationComplete?: () => void;
  className?: string;
}

export default function TypewriterEffect({
  text,
  interval,
  onAnimationComplete,
  className,
}: TypewriterEffectProps) {
  // Split the text
  const letters = Array.from(text);

  // Handle the staggering of children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: stagger(interval || 0.2, { startDelay: 0.2 }),
      },
    },
  };

  // Child variants for each individual letter
  const childVariants: Variants = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      x: -2,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.h1
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      onAnimationComplete={onAnimationComplete}
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span variants={childVariants} key={index}>
          {/* Handle spaces properly so layout doesn't collapse */}
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
}
