import { FaTimes, FaCheck, FaExclamationTriangle } from "react-icons/fa";

export enum ToastType {
  Success,
  danger,
  warning,
}
const Toast = ({
  text,
  type,
  undo,
}: {
  text: string;
  type: ToastType;
  undo?: () => Promise<void>;
}) => {
  const logoClass = "align-middle text-white";
  const logo = [
    <FaCheck key={0} className={logoClass} />,
    <FaTimes key={1} className={logoClass} />,
    <FaExclamationTriangle key={2} className={logoClass} />,
  ];
  const colors = ["bg-green-800", "bg-red-800", "bg-orange-700"];

  return (
    <div
      className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
      role="alert"
    >
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${colors[type]} rounded-lg`}
      >
        {logo[type]}
      </div>
      <div className="ml-3 text-sm font-normal">{text}</div>
      {undo ? (
        <div className="flex items-center ml-auto space-x-2">
          <div className="text-sm font-medium text-blue-600 p-1.5 hover:bg-blue-100 rounded-lg cursor-pointer">
            Undo
          </div>
          <button
            type="button"
            className="items-center justify-center ml-auto bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            data-dismiss-target="#toast-success"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="items-center justify-center ml-auto bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
          data-dismiss-target="#toast-success"
          aria-label="Close"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};
export default Toast;
