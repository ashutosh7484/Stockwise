import { X, TrendingUp, TrendingDown, Hash } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { InventoryItem } from '../types/inventory';
import Loader from './Loader';

type ModalMode = 'stock-in' | 'stock-out';

interface StockModalProps {
  isOpen: boolean;
  mode: ModalMode;
  item: InventoryItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
}

function buildSchema(mode: ModalMode, currentQty: number) {
  return z.object({
    quantity: z
      .number({ invalid_type_error: 'Enter a valid number' })
      .int('Must be a whole number')
      .min(1, 'Quantity must be at least 1')
      .max(
        mode === 'stock-out' ? currentQty : 999_999,
        mode === 'stock-out'
          ? `Cannot exceed current stock (${currentQty})`
          : 'Value too large',
      ),
  });
}

export default function StockModal({
  isOpen,
  mode,
  item,
  isSubmitting,
  onClose,
  onSubmit,
}: StockModalProps) {
  const schema = buildSchema(mode, item?.quantity ?? 0);
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  });

  useEffect(() => {
    if (!isOpen) reset({ quantity: 1 });
  }, [isOpen, reset]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isIn = mode === 'stock-in';
  const accentClass = isIn
    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
    : 'bg-red-50 border-red-100 text-red-600';
  const btnClass = isIn
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
    : 'bg-red-600 hover:bg-red-700 text-white shadow-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${accentClass}`}>
              {isIn ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900">
                {isIn ? 'Add Stock' : 'Use Stock'}
              </h2>
              <p className="text-xs text-slate-400 max-w-[180px] truncate">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current stock badge */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Current Stock
            </span>
            <span className="font-mono text-sm font-bold text-slate-800">{item.quantity} units</span>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit((data) => onSubmit(data.quantity))}
          className="px-6 py-5 space-y-4"
        >
          <div>
            <label className="label">
              {isIn ? 'Quantity to Add' : 'Quantity to Use'}
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                min="1"
                max={isIn ? undefined : item.quantity}
                autoFocus
                className={`input-field pl-9 ${errors.quantity ? 'input-error' : ''}`}
              />
            </div>
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.quantity.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
            >
              {isSubmitting ? <Loader size="sm" /> : isIn ? 'Add Stock' : 'Confirm Use'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
