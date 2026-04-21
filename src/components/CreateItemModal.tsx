import { X, Package, Hash } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Loader from './Loader';

const schema = z.object({
  name: z.string().min(1, 'Item name is required').max(100, 'Name too long'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
});

type FormValues = z.infer<typeof schema>;

interface CreateItemModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
}

export default function CreateItemModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateItemModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', quantity: 0 },
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900">New Item</h2>
              <p className="text-xs text-slate-400">Add to inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="label">Item Name</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('name')}
                type="text"
                placeholder="e.g. Wireless Mouse"
                autoFocus
                className={`input-field pl-9 ${errors.name ? 'input-error' : ''}`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="label">Initial Quantity</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
                className={`input-field pl-9 ${errors.quantity ? 'input-error' : ''}`}
              />
            </div>
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.quantity.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? <Loader size="sm" /> : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
