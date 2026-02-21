import { ReactNode } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";

interface MaximizableModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    headerIcon?: ReactNode;
    headerActions?: ReactNode;
    maxWidthClass?: string;
    isMaximized: boolean;
    setIsMaximized: (maximized: boolean) => void;
}

export default function MaximizableModal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    headerIcon,
    headerActions,
    maxWidthClass = "max-w-4xl",
    isMaximized,
    setIsMaximized,
}: MaximizableModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className={`bg-white dark:bg-gray-800 shadow-xl flex flex-col animate-in zoom-in-95 duration-200 transition-all ${isMaximized
                    ? "fixed inset-0 w-full h-full rounded-none"
                    : `rounded-xl w-full ${maxWidthClass} max-h-[90vh]`
                    }`}
            >
                <div
                    className={`flex items-center justify-between px-6 py-4 bg-[#2F4269] border-b border-gray-800 transition-all ${isMaximized ? "rounded-none" : "rounded-t-xl"
                        }`}
                >
                    <div className="text-lg font-semibold text-white flex items-center gap-2">
                        {headerIcon}
                        {title}
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        {headerActions && (
                            <div className="flex items-center gap-3">
                                {headerActions}
                                <div className="h-4 w-px bg-white/20 ml-1" />
                            </div>
                        )}
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            className="text-white/70 hover:text-white transition-colors focus:outline-none"
                            title={isMaximized ? "Restore down" : "Maximize"}
                        >
                            {isMaximized ? (
                                <Minimize2 className="w-5 h-5" />
                            ) : (
                                <Maximize2 className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white transition-colors focus:outline-none"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">{children}</div>

                {footer && (
                    <div
                        className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all ${isMaximized ? "rounded-none" : "rounded-b-xl"
                            }`}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
