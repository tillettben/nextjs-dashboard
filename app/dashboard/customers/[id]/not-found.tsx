import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <main
      className='flex h-full flex-col items-center justify-center gap-2'
      data-testid='customer-not-found'
    >
      <FaceFrownIcon className='w-10 text-gray-400' />
      <h2 className='text-xl font-semibold' data-testid='not-found-title'>
        404 Not Found
      </h2>
      <p data-testid='not-found-message'>
        Could not find the requested customer.
      </p>
      <p className='text-sm text-gray-600'>
        The customer you are looking for does not exist or may have been
        removed.
      </p>
      <Link
        href='/dashboard/customers'
        className='mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400'
        data-testid='not-found-back-link'
      >
        Go Back to Customers
      </Link>
    </main>
  );
}
