import { useEffect, useRef } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const Dropdown = ({
  options,
  onSelect,
  isOpen,
  onClose,
  children,
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: DropdownOption) => {
    onSelect(option);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, onClose]);

  return (
    <div
      ref={dropdownRef}
      onClick={(e) => {
        if (isOpen && !dropdownRef.current?.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div>
        {isOpen && (
          <div
            aria-orientation="vertical"
            className="origin-top-right absolute z-20 right-8 top-[52px] mt-2 w-32 rounded-md shadow-lg bg-[#121212] ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
          >
            <div className="py-1" role="none">
              {options.map((option) => (
                <button
                  key={option.value}
                  className="text-gray-300 hover:bg-gray-900 duration-300 block px-4 py-2 text-sm w-full text-left"
                  role="menuitem"
                  onClick={() => handleOptionClick(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};
export default Dropdown;
