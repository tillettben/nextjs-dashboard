import { generateYAxis } from '@/app/lib/utils';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchRevenue } from '@/app/lib/data';

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/

export default async function RevenueChart() {
  const revenue = await fetchRevenue();
  const chartHeight = 350;
  // NOTE: Uncomment this code in Chapter 7

  const { yAxisLabels, topLabel } = generateYAxis(revenue);

  if (!revenue || revenue.length === 0) {
    return <p className='mt-4 text-gray-400'>No data available.</p>;
  }

  return (
    <div className='w-full md:col-span-4' data-testid='revenue-chart-container'>
      <h2
        className={`${lusitana.className} mb-4 text-xl md:text-2xl`}
        data-testid='revenue-chart-title'
      >
        Recent Revenue
      </h2>

      <div
        className='rounded-xl bg-gray-50 p-4'
        data-testid='revenue-chart-background'
      >
        <div
          className='sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4'
          data-testid='revenue-chart-grid'
        >
          <div
            className='mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex'
            style={{ height: `${chartHeight}px` }}
            data-testid='revenue-chart-y-axis'
          >
            {yAxisLabels.map(label => (
              <p key={label} data-testid={`y-axis-label-${label}`}>
                {label}
              </p>
            ))}
          </div>

          {revenue.map(month => (
            <div
              key={month.month}
              className='flex flex-col items-center gap-2'
              data-testid={`revenue-bar-${month.month}`}
            >
              <div
                className='w-full rounded-md bg-blue-300'
                style={{
                  height: `${(chartHeight / topLabel) * month.revenue}px`,
                }}
                data-testid={`revenue-bar-value-${month.month}`}
              ></div>
              <p
                className='-rotate-90 text-sm text-gray-400 sm:rotate-0'
                data-testid={`revenue-month-label-${month.month}`}
              >
                {month.month}
              </p>
            </div>
          ))}
        </div>
        <div
          className='flex items-center pb-2 pt-6'
          data-testid='revenue-chart-footer'
        >
          <CalendarIcon className='h-5 w-5 text-gray-500' />
          <h3
            className='ml-2 text-sm text-gray-500'
            data-testid='revenue-chart-period'
          >
            Last 12 months
          </h3>
        </div>
      </div>
    </div>
  );
}
