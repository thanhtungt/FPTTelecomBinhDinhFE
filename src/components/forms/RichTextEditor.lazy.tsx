import { lazy, Suspense } from 'react';

const RichTextEditorLazy = lazy(() => import('./RichTextEditor'));

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  error?: string;
}

const RichTextEditorWrapper = (props: RichTextEditorProps) => {
  return (
    <Suspense 
      fallback={
        <div className="rich-text-editor-skeleton" style={{ minHeight: '300px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Đang tải trình chỉnh sửa...</p>
        </div>
      }
    >
      <RichTextEditorLazy {...props} />
    </Suspense>
  );
};

export default RichTextEditorWrapper;
