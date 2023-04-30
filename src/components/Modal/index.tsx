import { motion } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <motion.div
            animate={{ opacity: 0.6 }}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={"fixed inset-0 bg-black"}
            onClick={onClose}
          />
          <motion.div
            animate={{ scale: 1 }}
            initial={{ scale: 0 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.1 }}
            className={
              "bg-white absolute rounded-lg p-6 duration-500 modal-scaleIn modal-scaleOut"
            }
          >
            {children}
          </motion.div>
        </div>
      )}
    </>
  );
};
export default Modal;
