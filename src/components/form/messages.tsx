import { useEffect } from 'react';
import Image from 'next/image';
import { IMessage } from '@/types';

import cc from '@/lib/cc';
import Icon from '@/components/Icons/Icon';

export const AdminMessage = ({
  message,
  isSameSender,
}: {
  message: IMessage;
  isSameSender: boolean;
}) => (
  <div className="flex gap-2">
    {!isSameSender && (
      <Image
        src="/images/profile.jpg"
        alt="Me"
        width={40}
        height={40}
        className="mt-4 w-8 self-start rounded-full md:w-10"
      />
    )}
    <div>
      {!isSameSender && <p className="text-xs text-[#8D8D93]">Rik</p>}
      <div
        className={cc(
          isSameSender && 'ml-10 md:ml-12 relative -top-3',
          'relative w-fit max-w-[220px] rounded-2xl bg-[#E9E9EB] px-3 py-2 md:max-w-xs',
        )}
      >
        {!isSameSender && (
          <Icon
            type="tail"
            className="absolute -left-1 bottom-0 h-4 w-4 -scale-x-100 fill-[#E9E9EB]"
          />
        )}
        {message.text}
      </div>
    </div>
  </div>
);

export const UserMessage = ({ message }: { message: IMessage }) => {
  //   const uniqueID = `status-${message.text}-${Date.now()}`;

  //   useEffect(() => {
  //     const uniqueID = `status-${message.text}-${Date.now()}`;
  //     const statusElement = document.getElementById(uniqueID);
  //     const date = new Date().toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: false,
  //     });

  //     let readTimer: NodeJS.Timeout | null = null;

  //     if (statusElement) {
  //       statusElement.innerText = `${date} Delivered`;

  //       readTimer = setTimeout(() => {
  //         statusElement.innerText = `${date} Read`;
  //       }, 1000);
  //     }

  //     return () => {
  //       if (readTimer) {
  //         clearTimeout(readTimer);
  //       }
  //     };
  //   }, [message.text]);

  return (
    <div className="flex flex-col">
      <div className="relative w-fit max-w-xs self-end rounded-2xl bg-[#007AFF] px-3 py-2 text-white">
        <Icon type="tail" className="absolute -right-1 bottom-0 h-4 w-4 fill-[#007AFF]" />
        {message.text}
      </div>
      {/* <div className="mt-1 text-xs text-dark_grey" id={uniqueID}></div> */}
    </div>
  );
};
