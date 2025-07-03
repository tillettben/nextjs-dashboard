'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CustomerAvatarProps {
  customer: {
    id: string;
    name: string;
    image_url: string;
  };
}

export default function CustomerAvatar({ customer }: CustomerAvatarProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    const initials = customer.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];

    const colorIndex = customer.name.length % colors.length;
    const bgColor = colors[colorIndex];

    return (
      <div
        className={`${bgColor} flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium`}
        data-testid={`customer-avatar-fallback-${customer.id}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={customer.image_url}
      alt={`${customer.name}'s profile picture`}
      className='rounded-full'
      width={32}
      height={32}
      onError={() => setImageError(true)}
      data-testid={`customer-avatar-${customer.id}`}
    />
  );
}
