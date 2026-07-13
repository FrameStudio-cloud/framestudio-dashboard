import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  useEffect(() => {
    if (show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    }
  }, [show]);

  return (
    <>
      <div ref={ref} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="flex">
        {children}
      </div>
      {show && createPortal(
        <div
          className="fixed z-[9999] whitespace-nowrap bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg px-2.5 py-1.5 shadow-lg pointer-events-none"
          style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
        >
          {label}
        </div>,
        document.body
      )}
    </>
  );
}
