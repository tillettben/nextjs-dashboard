import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { FormattedCustomersTable } from '@/app/lib/definitions';

interface CustomerCardProps {
  customer: FormattedCustomersTable;
  clickable?: boolean;
}

export function CustomerCard({
  customer,
  clickable = true,
}: CustomerCardProps) {
  const cardContent = (
    <Card
      className='hover:shadow-lg transition-shadow duration-200 cursor-pointer'
      data-testid='customer-card'
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Image
              src={customer.image_url}
              alt={`${customer.name}'s profile picture`}
              className='rounded-full ring-2 ring-gray-100'
              width={48}
              height={48}
            />
          </div>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-lg font-semibold text-gray-900 truncate'>
              {customer.name}
            </CardTitle>
            <p className='text-sm text-gray-500 truncate'>{customer.email}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='space-y-3'>
          <div className='flex justify-between items-center py-2 border-b border-gray-100'>
            <span className='text-sm font-medium text-gray-600'>
              Total Invoices
            </span>
            <span className='text-sm font-semibold text-gray-900'>
              {customer.total_invoices}
            </span>
          </div>

          <div className='flex justify-between items-center py-2 border-b border-gray-100'>
            <span className='text-sm font-medium text-gray-600'>
              Total Paid
            </span>
            <span className='text-sm font-semibold text-green-600'>
              {customer.total_paid}
            </span>
          </div>

          <div className='flex justify-between items-center py-2'>
            <span className='text-sm font-medium text-gray-600'>
              Total Pending
            </span>
            <span className='text-sm font-semibold text-amber-600'>
              {customer.total_pending}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (clickable) {
    return (
      <Link href={`/dashboard/customers/${customer.id}`} className='block'>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
