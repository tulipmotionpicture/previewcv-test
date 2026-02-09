"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Code,
    Quote,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-all ${isActive
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
        {children}
    </button>
);

export default function RichTextEditor({
    value,
    onChange,
    placeholder,
}: RichTextEditorProps) {
    const [isSourceView, setIsSourceView] = useState(false);
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-500 hover:underline cursor-pointer",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full rounded-lg",
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: placeholder || "Write something...",
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3 text-gray-700 dark:text-gray-200",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update editor content if value changes externally (and not just by the editor itself to avoid cursor jumps / loops)
    // We need to be careful here. A simple useEffect will cause cursor jumps.
    // Usually, for a controlled component with Tiptap, we only set content if it's different and focused is false, or use a specific comparison.
    // For this use case (simple form), we might accept that it's mostly one-way into the parent state.
    // But if we want to support external updates (like loading a draft), we need this.
    useEffect(() => {
        if (editor && value !== editor.getHTML() && !isSourceView) {
            // Only update editor if not in source view
            if (!editor.isFocused) {
                editor.commands.setContent(value);
            }
        } else if (editor && isSourceView && value !== editor.getHTML()) {
            // If in source view, we don't update editor immediately to avoid re-parsing while typing
            // But valid flow is: Edit Textarea -> Update Prop Value.
            // We only sync back to editor when leaving source view?
            // Actually, when leaving source view, isSourceView becomes false, so the first block runs.
        }

    }, [value, editor, isSourceView]);

    // When switching OFF source view, we must ensure editor is up to date
    useEffect(() => {
        if (!isSourceView && editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [isSourceView, editor, value]);


    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt("URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-[#282727] shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
                    <MenuButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-700 ml-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive("bold")}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive("italic")}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive("underline")}
                        title="Underline"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive("strike")}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-700 ml-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive("heading", { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive("heading", { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-700 ml-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        isActive={editor.isActive({ textAlign: "left" })}
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        isActive={editor.isActive({ textAlign: "center" })}
                        title="Align Center"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        isActive={editor.isActive({ textAlign: "right" })}
                        title="Align Right"
                    >
                        <AlignRight className="w-4 h-4" />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 ml-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive("orderedList")}
                        title="Ordered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={setLink}
                        isActive={editor.isActive("link")}
                        title="Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={addImage}
                        title="Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => setIsSourceView(!isSourceView)}
                        isActive={isSourceView}
                        title="HTML View"
                    >
                        <Code className="w-4 h-4" />
                    </MenuButton>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-[#282727]">
                {isSourceView ? (
                    <textarea
                        className="w-full min-h-[150px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-y focus:outline-none border-0"
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                        }}
                    />
                ) : (
                    <EditorContent editor={editor} className="min-h-[150px]" />
                )}
            </div>
        </div>
    );
}
