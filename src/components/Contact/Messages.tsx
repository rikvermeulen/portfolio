'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { IMessage } from '@/types/types';

import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';

export const AdminMessage = ({
  message,
  isSameSender,
}: {
  message: IMessage;
  isSameSender: boolean;
}) => (
  <div className="flex w-full gap-2">
    {!isSameSender && (
      <Image
        src="/images/profile.png"
        alt="Me"
        width={40}
        height={40}
        className="mt-4 w-8 self-start rounded-full md:w-10"
      />
    )}
    <div>
      {!isSameSender && <p className="ml-3 text-xs text-[#8D8D93]">Rik</p>}
      <div
        className={cc(
          isSameSender && 'ml-10 md:ml-12 relative -top-3',
          'relative w-fit max-w-[220px] rounded-3xl bg-[#E9E9EB] px-3 py-2 md:max-w-xs',
        )}
      >
        {!isSameSender && (
          <Icon
            type="tail"
            className="absolute -left-1 bottom-0.5 h-4 w-4 -scale-x-100 fill-[#E9E9EB]"
          />
        )}
        {message.text}
      </div>
    </div>
  </div>
);

export const UserMessage = ({ message, index }: { message: IMessage; index: number }) => {
  const [isDelivered, setIsDelivered] = useState(false);

  useEffect(() => {
    if (index === 1) return;
    const timer = setTimeout(() => {
      setIsDelivered(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="flex w-full flex-col">
      <div className="relative w-fit max-w-xs self-end rounded-3xl bg-[#007AFF] px-3 py-2 text-white">
        <Icon type="tail" className="absolute -right-1 bottom-0.5 h-4 w-4 fill-[#007AFF]" />
        {message.text}
      </div>
      <div
        className={cc(
          isDelivered ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
          'mt-1 self-end text-xs text-gray-400 transition-[opacity,transform] duration-200',
        )}
      >
        Delivered
      </div>
    </div>
  );
};
