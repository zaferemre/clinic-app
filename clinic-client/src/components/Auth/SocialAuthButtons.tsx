import { FaGoogle, FaApple } from "react-icons/fa";
import { motion } from "framer-motion";

interface Props {
  onGoogle: () => void;
  onApple: () => void;
  disabled?: boolean;
}

export default function SocialAuthButtons({
  onGoogle,
  onApple,
  disabled,
}: Props) {
  return (
    <motion.div
      className="flex justify-center space-x-4 mb-5"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
      }}
    >
      <motion.button
        whileTap={{ scale: 0.92 }}
        className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center border border-gray-200"
        onClick={onGoogle}
        disabled={disabled}
        aria-label="Google ile giriş"
      >
        <FaGoogle className="text-gray-600 text-2xl" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.92 }}
        className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center border border-gray-200"
        onClick={onApple}
        disabled={disabled}
        aria-label="Apple ile giriş"
      >
        <FaApple className="text-gray-600 text-2xl" />
      </motion.button>
    </motion.div>
  );
}
