import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  
  // Create a spring configuration for super smooth motion
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-red-600 origin-left z-[100] shadow-[0_0_10px_rgba(255,0,0,0.5)]"
      style={{ scaleX }}
    />
  );
};
