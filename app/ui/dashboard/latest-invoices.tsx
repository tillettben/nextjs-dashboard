import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '../fonts';
import { fetchLatestInvoices } from '@/app/lib/data';

export default async function LatestInvoices() {
  const latestInvoices = await fetchLatestInvoices();
  return (
    <div
      className='flex w-full flex-col md:col-span-4'
      data-testid='latest-invoices-container'
    >
      <h2
        className={`${lusitana.className} mb-4 text-xl md:text-2xl`}
        data-testid='latest-invoices-title'
      >
        Latest Invoices
      </h2>
      <div
        className='flex grow flex-col justify-between rounded-xl bg-gray-50 p-4'
        data-testid='latest-invoices-background'
      >
        <div className='bg-white px-6' data-testid='latest-invoices-list'>
          {latestInvoices.map((invoice, i) => {
            return (
              <Link
                key={invoice.id}
                href={`/dashboard/invoices/${invoice.id}/edit`}
                className={clsx(
                  'flex flex-row items-center justify-between py-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                  {
                    'border-t': i !== 0,
                  }
                )}
                data-testid={`invoice-item-${invoice.id}`}
                aria-label={`Edit invoice for ${invoice.name} - ${invoice.amount}`}
              >
                <div
                  className='flex items-center'
                  data-testid={`invoice-customer-${invoice.id}`}
                >
                  <Image
                    src={invoice.image_url}
                    alt={`${invoice.name}'s profile picture`}
                    className='mr-4 rounded-full'
                    width={32}
                    height={32}
                    data-testid={`customer-avatar-${invoice.id}`}
                  />
                  <div className='min-w-0'>
                    <p
                      className='truncate text-sm font-semibold md:text-base'
                      data-testid={`customer-name-${invoice.id}`}
                    >
                      {invoice.name}
                    </p>
                    <p
                      className='hidden text-sm text-gray-500 sm:block'
                      data-testid={`customer-email-${invoice.id}`}
                    >
                      {invoice.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base`}
                  data-testid={`invoice-amount-${invoice.id}`}
                >
                  {invoice.amount}
                </p>
              </Link>
            );
          })}
        </div>
        <div
          className='flex items-center pb-2 pt-6'
          data-testid='latest-invoices-footer'
        >
          <ArrowPathIcon className='h-5 w-5 text-gray-500' />
          <h3
            className='ml-2 text-sm text-gray-500'
            data-testid='latest-invoices-updated'
          >
            Updated just now
          </h3>
        </div>
      </div>
    </div>
  );
}
