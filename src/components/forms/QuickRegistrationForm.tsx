import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Package } from '../../types/package';
import type { Registration } from '../../types/registration';
import { RegistrationAPI } from '../../api/registrations';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
// cspell:ignore Nhon Mbps

const formSchema = z.object({
  fullName: z.string().min(3, 'Please enter full name'),
  phone: z.string().min(9, 'Phone is required'),
  address: z.string().min(10, 'Address is required'),
  packageId: z.string().min(1, 'Select a package'),
  note: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface QuickRegistrationFormProps {
  packages: Package[];
  selectedPackageId?: number;
  onSuccess?: (registration: Registration) => void;
}

const QuickRegistrationForm = ({ packages, selectedPackageId, onSuccess }: QuickRegistrationFormProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  // Find the selected package
  const selectedPackage = selectedPackageId 
    ? packages.find(pkg => pkg.id === selectedPackageId)
    : undefined;

  useEffect(() => {
    if (selectedPackageId) {
      setValue('packageId', String(selectedPackageId));
    }
  }, [selectedPackageId, setValue]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        packageId: Number(values.packageId),
        note: values.note
      };

      const result = await RegistrationAPI.create(payload);
      showToast('Đăng ký thành công! Nhân viên sẽ liên hệ với bạn trong thời gian sớm nhất.', 'success');
      reset();
      onSuccess?.(result);
    } catch (error) {
      showToast('Không thể gửi đăng ký. Vui lòng thử lại sau.', 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="quick-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="quick-form__header">
        <h3>Đăng ký lắp đặt</h3>
        <p>Để lại thông tin và chúng tôi sẽ sắp xếp thời gian lắp đặt nhanh nhất.</p>
      </div>
      <div className="form-grid">
        <label>
          <span>Họ và tên</span>
          <input type="text" placeholder="Nguyễn Văn A" {...register('fullName')} />
          {errors.fullName && <small>{errors.fullName.message}</small>}
        </label>
        <label>
          <span>Số điện thoại</span>
          <input type="tel" placeholder="0912 345 678" {...register('phone')} />
          {errors.phone && <small>{errors.phone.message}</small>}
        </label>
        <label className="full">
          <span>Địa chỉ</span>
          <input type="text" placeholder="123 Lê Lợi, Quy Nhơn" {...register('address')} />
          {errors.address && <small>{errors.address.message}</small>}
        </label>
        
        {/* Show selected package or dropdown */}
        {selectedPackage ? (
          <div className="full">
            <label>
              <span>Gói đã chọn</span>
              <div className="selected-package-display">
                <div className="selected-package-info">
                  <strong>{selectedPackage.name}</strong>
                  <span className="package-speed">
                    {selectedPackage.speedDown}/{selectedPackage.speedUp} Mbps
                  </span>
                </div>
              </div>
              <input type="hidden" {...register('packageId')} />
            </label>
          </div>
        ) : (
          <label>
            <span>Gói</span>
            <select {...register('packageId')}>
              <option value="">Select</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.speedDown}/{pkg.speedUp} Mbps)
                </option>
              ))}
            </select>
            {errors.packageId && <small>{errors.packageId.message}</small>}
          </label>
        )}
        
        <label className="full">
          <span>Ghi chú</span>
          <textarea rows={3} placeholder="Thời gian, tầng, node..." {...register('note')} />
        </label>
      </div>
      <button type="submit" className="primary-btn" disabled={submitting}>
        {submitting ? 'Đang gửi...' : 'Đăng ký' }
      </button>
    </form>
  );
};

export default QuickRegistrationForm;
