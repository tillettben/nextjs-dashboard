import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCustomerById } from '@/app/lib/data';
import { CustomerCard } from '@/app/ui/customers/customer-card';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const customer = await fetchCustomerById(id);

  if (!customer) {
    return {
      title: 'Customer Not Found',
    };
  }

  return {
    title: `${customer.name} - Customer Details`,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const customer = await fetchCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className='space-y-6' data-testid='customer-detail-page'>
      <div className='flex items-center gap-4'>
        <Link
          href='/dashboard/customers'
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors'
          data-testid='back-to-customers'
        >
          <ArrowLeftIcon className='w-4 h-4' />
          Back to Customers
        </Link>
      </div>

      <div>
        <h1
          className='text-2xl font-bold text-gray-900 mb-2'
          data-testid='customer-detail-title'
        >
          Customer Details
        </h1>
        <p className='text-gray-600'>
          View detailed information for {customer.name}.
        </p>
      </div>

      <div className='max-w-md' data-testid='customer-detail-card'>
        <CustomerCard customer={customer} clickable={false} />
      </div>
    </div>
  );
}
