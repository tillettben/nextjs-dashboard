import { UsersIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '../fonts';
import { fetchTopCustomers } from '@/app/lib/data';
import CustomerAvatar from './customer-avatar';

interface TopCustomer {
  id: string;
  name: string;
  image_url: string;
  total_amount: string;
  total_pending: string;
  total_paid: string;
  total_invoices: number;
}

interface TopCustomersCardProps {
  customers: TopCustomer[];
}

export default async function TopCustomersCardWrapper() {
  const topCustomers = await fetchTopCustomers();
  return <TopCustomersCard customers={topCustomers} />;
}

function TopCustomersCard({ customers }: TopCustomersCardProps) {
  if (customers.length === 0) {
    return (
      <div
        className='flex w-full flex-col md:col-span-4'
        data-testid='top-customers-container'
      >
        <h2
          className={`${lusitana.className} mb-4 text-xl md:text-2xl`}
          data-testid='top-customers-title'
        >
          Top Customers
        </h2>
        <div
          className='flex grow flex-col items-center justify-center rounded-xl bg-gray-50 p-8'
          data-testid='top-customers-empty-state'
        >
          <UsersIcon className='h-12 w-12 text-gray-300 mb-4' />
          <p className='text-gray-500 text-center'>
            No customers found. Start by adding your first customer!
          </p>
        </div>
      </div>
    );
  }

  const displayTitle =
    customers.length < 5
      ? `Top Customers (${customers.length})`
      : 'Top Customers';

  return (
    <div
      className='flex w-full flex-col md:col-span-4'
      data-testid='top-customers-container'
    >
      <h2
        className={`${lusitana.className} mb-4 text-xl md:text-2xl`}
        data-testid='top-customers-title'
      >
        {displayTitle}
      </h2>
      <div
        className='flex grow flex-col justify-between rounded-xl bg-gray-50 p-4'
        data-testid='top-customers-background'
      >
        <div className='bg-white px-6' data-testid='top-customers-list'>
          {customers.map((customer, i) => {
            return (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
                className={`flex flex-row items-center justify-between py-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  i !== 0 ? 'border-t' : ''
                }`}
                data-testid={`customer-item-${customer.id}`}
                aria-label={`View details for ${customer.name} - Total: ${customer.total_amount}`}
              >
                <div
                  className='flex items-center'
                  data-testid={`customer-info-${customer.id}`}
                >
                  <CustomerAvatar customer={customer} />
                  <div className='ml-4 min-w-0'>
                    <p
                      className='truncate text-sm font-semibold md:text-base'
                      data-testid={`customer-name-${customer.id}`}
                    >
                      {customer.name}
                    </p>
                    <p
                      className='hidden text-sm text-gray-500 sm:block'
                      data-testid={`customer-invoice-count-${customer.id}`}
                    >
                      {customer.total_invoices}{' '}
                      {customer.total_invoices === 1 ? 'invoice' : 'invoices'}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p
                    className={`${lusitana.className} truncate text-sm font-medium md:text-base`}
                    data-testid={`customer-total-${customer.id}`}
                  >
                    {customer.total_amount}
                  </p>
                  <div className='flex space-x-2 text-xs text-gray-500'>
                    <span
                      className='text-green-600'
                      data-testid={`customer-paid-${customer.id}`}
                    >
                      {customer.total_paid}
                    </span>
                    <span>|</span>
                    <span
                      className='text-amber-600'
                      data-testid={`customer-pending-${customer.id}`}
                    >
                      {customer.total_pending}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div
          className='flex items-center pb-2 pt-6'
          data-testid='top-customers-footer'
        >
          <UsersIcon className='h-5 w-5 text-gray-500' />
          <h3
            className='ml-2 text-sm text-gray-500'
            data-testid='top-customers-updated'
          >
            Sorted by total invoice value
          </h3>
        </div>
      </div>
    </div>
  );
}
