import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  error?: string;
}

// Debounce helper for onChange
const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Use requestIdleCallback polyfill for older browsers
const scheduleIdleCallback = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 100 });
  } else {
    setTimeout(callback, 0);
  }
};

const RichTextEditor = ({ value, onChange, placeholder = 'Write your content here...', error }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const [isInitialized, setIsInitialized] = useState(false);
  const isUpdatingRef = useRef(false);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;
    
    // Clear any existing content to prevent duplicate toolbars
    editorRef.current.innerHTML = '';
    
    // Initialize Quill editor
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          ['link', 'image'],
          [{ 'align': [] }],
          ['clean']
        ]
      }
    });

    quillRef.current = quill;

    // Debounced onChange to reduce re-renders during typing
    const debouncedOnChange = debounce(() => {
      if (isUpdatingRef.current) return;
      const html = quill.root.innerHTML;
      const text = quill.getText().trim();
      const contentToSend = text.length > 0 ? html : '';
      onChangeRef.current(contentToSend);
    }, 300);

    // Handle user changes
    quill.on('text-change', (_delta, _oldDelta, source) => {
      if (source === 'user') {
        debouncedOnChange();
      }
    });

    setIsInitialized(true);

    return () => {
      quill.off('text-change');
      // Clear DOM to remove Quill-generated elements (toolbar, etc)
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      quillRef.current = null;
      setIsInitialized(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder]);

  // Update editor content when value changes externally
  useEffect(() => {
    if (!quillRef.current || !isInitialized) return;

    const quill = quillRef.current;
    const currentHtml = quill.root.innerHTML;
    const currentText = quill.getText().trim();

    // Normalize both HTML strings for comparison
    const normalizeHtml = (html: string) => html.replace(/\s+/g, ' ').trim();
    const normalizedValue = normalizeHtml(value || '');
    const normalizedCurrent = normalizeHtml(currentHtml);

    // Only update if the content is meaningfully different
    // Check if value is empty and current is empty
    const valueIsEmpty = !value || value === '<p><br></p>' || normalizedValue === '<p></p>';
    const currentIsEmpty = currentText.length === 0;

    if (valueIsEmpty && currentIsEmpty) {
      // Both are empty, no need to update
      return;
    }

    // Update if the normalized HTML is different
    if (normalizedValue !== normalizedCurrent) {
      isUpdatingRef.current = true;
      
      // Use requestIdleCallback for non-blocking updates
      scheduleIdleCallback(() => {
        const selection = quill.getSelection();
        
        if (valueIsEmpty) {
          // Clear the editor
          quill.setText('');
        } else {
          // Set the new content asynchronously
          const delta = quill.clipboard.convert({ html: value });
          quill.setContents(delta, 'silent');
        }
        
        // Restore selection if it existed
        if (selection) {
          quill.setSelection(selection);
        }
        
        isUpdatingRef.current = false;
      });
    }
  }, [value, isInitialized]);

  return (
    <div className="rich-text-editor">
      <div ref={editorRef} className="editor-container" />
      {error && <small className="error-message">{error}</small>}
    </div>
  );
};

export default RichTextEditor;
