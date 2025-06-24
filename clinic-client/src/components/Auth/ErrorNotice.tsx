import { motion } from "framer-motion";

export default function ErrorNotice({ message }: { message: string }) {
  if (!message) return null;
  return (
    <motion.div
      className="w-full bg-red-100 text-red-700 text-sm rounded-lg px-4 py-2 mb-2 text-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {message}
    </motion.div>
  );
}
