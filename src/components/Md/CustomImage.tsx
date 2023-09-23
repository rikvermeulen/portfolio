import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';

type CustomImageProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export default function CustomImage({ src, width, height, alt }: CustomImageProps) {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const handleCloseModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (modalRef.current) {
      const imageElement = modalRef.current.querySelector('img');
      if (imageElement && !imageElement.contains(e.target as Node)) {
        setShowModal(false);
      }
    }
  };

  return (
    <>
      <div className="bento mt-6 bg-gray-100 p-6" onClick={() => setShowModal(true)}>
        <Image src={src} width={width} height={height} alt={alt} className="w-full" />
      </div>

      {showModal && (
        <div
          className={cc(
            showModal ? 'opacity-100' : 'opacity-0',
            'fixed inset-0 z-40 bg-black/80 transition-opacity',
          )}
          onClick={handleCloseModal}
        >
          <button onClick={() => setShowModal(false)} className="absolute right-0 top-0 z-50 m-4">
            <Icon type="close" className="h-4 w-4 fill-white" />
          </button>
          <div
            ref={modalRef}
            className={'flex h-full w-full items-center justify-center rounded p-4'}
          >
            <Image
              src={src}
              width={width * 1.2}
              height={height * 1.2}
              className="w-1/2"
              alt={alt}
            />
          </div>
        </div>
      )}
    </>
  );
}
