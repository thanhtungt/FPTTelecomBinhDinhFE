import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Package } from '../../types/package';
import type { Registration } from '../../types/registration';
import { RegistrationAPI } from '../../api/registrations';
import { useAuth } from '../../hooks/useAuth';
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
  const [serverMessage, setServerMessage] = useState<string | null>(null);
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

  useEffect(() => {
    if (selectedPackageId) {
      setValue('packageId', String(selectedPackageId));
    }
  }, [selectedPackageId, setValue]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerMessage(null);
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
      setServerMessage('Registration created successfully. Our staff will call you soon.');
      reset();
      onSuccess?.(result);
    } catch (error) {
      setServerMessage('Unable to submit right now. Please try again later.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="quick-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="quick-form__header">
        <h3>Book Installation</h3>
        <p>Leave your contact and we will arrange the fastest installation slot.</p>
      </div>
      <div className="form-grid">
        <label>
          <span>Full Name</span>
          <input type="text" placeholder="Nguyen Van A" {...register('fullName')} />
          {errors.fullName && <small>{errors.fullName.message}</small>}
        </label>
        <label>
          <span>Phone</span>
          <input type="tel" placeholder="0912 345 678" {...register('phone')} />
          {errors.phone && <small>{errors.phone.message}</small>}
        </label>
        <label className="full">
          <span>Address</span>
          <input type="text" placeholder="123 Le Loi, Quy Nhon" {...register('address')} />
          {errors.address && <small>{errors.address.message}</small>}
        </label>
        <label>
          <span>Package</span>
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
        <label className="full">
          <span>Note</span>
          <textarea rows={3} placeholder="Preferred time, floors, mesh nodes..." {...register('note')} />
        </label>
      </div>
      {serverMessage && <p className="form-alert">{serverMessage}</p>}
      <button type="submit" className="primary-btn" disabled={submitting}>
        {submitting ? 'Sending...' : 'Request a Call' }
      </button>
    </form>
  );
};

export default QuickRegistrationForm;
