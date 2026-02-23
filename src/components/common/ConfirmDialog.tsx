import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const messageLines = message.split('\n');

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p>
            {messageLines.map((line, index) => (
              <span key={index}>
                {line}
                {index < messageLines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
        <div className="confirm-dialog-footer">
          <button className="confirm-dialog-btn cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-dialog-btn confirm-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
