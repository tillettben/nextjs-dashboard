import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import TopCustomersCardWrapper from '@/app/ui/dashboard/top-customers';
import CardWrapper from '@/app/ui/dashboard/cards';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import {
  RevenueChartSkeleton,
  CardsSkeleton,
  LatestInvoicesSkeleton,
  TopCustomersCardSkeleton,
} from '@/app/ui/skeletons';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <main data-testid='dashboard-main'>
      <h1
        className={`${lusitana.className} mb-4 text-xl md:text-2xl`}
        data-testid='dashboard-title'
      >
        Dashboard
      </h1>
      <div
        className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'
        data-testid='summary-cards-container'
      >
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div
        className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'
        data-testid='dashboard-charts-container'
      >
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
      <div
        className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'
        data-testid='dashboard-customers-container'
      >
        <Suspense fallback={<TopCustomersCardSkeleton />}>
          <TopCustomersCardWrapper />
        </Suspense>
      </div>
    </main>
  );
}
