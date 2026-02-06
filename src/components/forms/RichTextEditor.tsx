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

const RichTextEditor = ({ value, onChange, placeholder = 'Write your content here...', error }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const [isInitialized, setIsInitialized] = useState(false);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    console.log('[RichTextEditor] Initializing Quill editor');
    
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
    console.log('[RichTextEditor] Quill initialized, ref stored');

    // Handle user changes
    console.log('[RichTextEditor] Binding text-change event');
    quill.on('text-change', () => {
      console.log('[RichTextEditor] text-change event fired!');
      const html = quill.root.innerHTML;
      const text = quill.getText().trim();
      const contentToSend = text.length > 0 ? html : '';
      console.log('[RichTextEditor] Calling onChangeRef with:', contentToSend.substring(0, 50));
      onChangeRef.current(contentToSend);
    });

    setIsInitialized(true);
    console.log('[RichTextEditor] Initialization complete');

    return () => {
      console.log('[RichTextEditor] Cleanup - removing text-change listener');
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
      const selection = quill.getSelection();
      
      if (valueIsEmpty) {
        // Clear the editor
        quill.setText('');
        console.log('[RichTextEditor] Clearing content');
        onChangeRef.current('');
      } else {
        // Set the new content
        const delta = quill.clipboard.convert({ html: value });
        quill.setContents(delta, 'silent');
        // Trigger onChange to sync with form after programmatic update
        const html = quill.root.innerHTML;
        const text = quill.getText().trim();
        const contentToSend = text.length > 0 ? html : '';
        console.log('[RichTextEditor] Syncing content to form:', { text: text.substring(0, 50), html: contentToSend.substring(0, 100) });
        onChangeRef.current(contentToSend);
      }
      
      // Restore selection if it existed
      if (selection) {
        quill.setSelection(selection);
      }
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
