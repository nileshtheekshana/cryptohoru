'use client';

import { useState } from 'react';
import { FaInfoCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  label,
  required = false,
  rows = 15,
  placeholder = 'Enter content here...'
}: MarkdownEditorProps) {
  const [showHelp, setShowHelp] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertImageTemplate = () => {
    insertMarkdown('\n![Image description](YOUR_IMAGE_URL_HERE)\n');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
        >
          <FaInfoCircle /> {showHelp ? 'Hide' : 'Show'} Markdown Guide
        </button>
      </div>

      {/* Markdown Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg border border-gray-300 dark:border-gray-700">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="px-3 py-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 text-sm font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="px-3 py-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 text-sm italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('\n## ')}
          className="px-3 py-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 text-sm"
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('\n### ')}
          className="px-3 py-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 text-sm"
          title="Heading"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('[Link text](', ')')}
          className="px-3 py-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 text-sm"
          title="Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={insertImageTemplate}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-semibold"
          title="Insert Image"
        >
          📷 Image
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('\n- ')}
          className="px-3 py-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 text-sm"
          title="List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('\n> ')}
          className="px-3 py-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 text-sm"
          title="Quote"
        >
          " Quote
        </button>
      </div>

      {/* Markdown Help Guide */}
      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Markdown Syntax Guide:</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">**bold text**</code> → <strong>bold text</strong></div>
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">*italic text*</code> → <em>italic text</em></div>
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded"># Heading 1</code> → Large heading</div>
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">## Heading 2</code> → Medium heading</div>
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">### Heading 3</code> → Small heading</div>
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">[Link text](URL)</code> → Clickable link</div>
            <div className="font-semibold text-blue-700 dark:text-blue-300">
              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">![Alt text](IMAGE_URL)</code> → Insert image
            </div>
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">- List item</code> → Bullet point</div>
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">1. Item</code> → Numbered list</div>
            <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">&gt; Quote</code> → Blockquote</div>
          </div>
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">📌 How to add images from Google Drive:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-yellow-800 dark:text-yellow-200">
              <li>Upload image to Google Drive</li>
              <li>Right-click → Share → "Anyone with the link"</li>
              <li>Copy the file ID from URL: <code className="bg-white dark:bg-gray-800 px-1 rounded text-xs">drive.google.com/file/d/<strong>FILE_ID</strong>/view</code></li>
              <li>Use format: <code className="bg-white dark:bg-gray-800 px-1 rounded text-xs">https://drive.google.com/uc?export=view&id=FILE_ID</code></li>
            </ol>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        id="markdown-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
      />

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Supports Markdown formatting. Click the 📷 Image button to insert image template.
      </p>
    </div>
  );
}
