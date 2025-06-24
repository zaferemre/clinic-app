import { motion } from "framer-motion";

export default function AnimatedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, type: "spring" }}
      className="pt-8 pb-2 flex justify-center"
    >
      <span className="text-white text-3xl md:text-4xl font-extrabold drop-shadow-lg select-none">
        randevy
      </span>
    </motion.div>
  );
}
