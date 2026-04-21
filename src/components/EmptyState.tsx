import { Package } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'No items yet',
  description = 'Get started by creating your first inventory item.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
          <Package className="w-9 h-9 text-brand-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-100 border-2 border-white" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-brand-100 border-2 border-white" />
      </div>
      <h3 className="font-display text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
