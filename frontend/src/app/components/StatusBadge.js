'use client';

const STATUS_STYLES = {
  applied:   'bg-blue-100 text-blue-800',
  interview: 'bg-yellow-100 text-yellow-800',
  offer:     'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}
