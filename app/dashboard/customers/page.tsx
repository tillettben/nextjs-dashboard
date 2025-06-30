import { Metadata } from 'next';
import { fetchFilteredCustomers } from '@/app/lib/data';
import { CustomerCard } from '@/app/ui/customers/customer-card';

export const metadata: Metadata = {
  title: 'Customers',
};

export default async function Page() {
  const customers = await fetchFilteredCustomers('');

  if (customers.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray-500'>No customers found.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6' data-testid='customers-page'>
      <div>
        <h1
          className='text-2xl font-bold text-gray-900 mb-2'
          data-testid='customers-title'
        >
          Customers
        </h1>
        <p className='text-gray-600'>
          Manage your customer relationships and view their invoice details.
        </p>
      </div>

      <div
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        data-testid='customers-grid'
      >
        {customers.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-500'>
          Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
