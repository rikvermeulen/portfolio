import Icon from "@/components/Icons/Icon.tsx";
import cc from "@/lib/cc.ts";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface CustomImageProps {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export default function CustomImage({
  src,
  width,
  height,
  alt,
}: CustomImageProps) {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const handleCloseModal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (modalRef.current) {
      const imageElement = modalRef.current.querySelector("img");
      if (imageElement && !imageElement.contains(e.target as Node)) {
        setShowModal(false);
      }
    }
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bento mt-6 bg-gray-100 p-6"
      >
        <Image
          alt={alt}
          height={height}
          src={src}
          width={width}
          className="w-full"
        />
      </div>

      {showModal && (
        <div
          onClick={handleCloseModal}
          className={cc(
            showModal ? "opacity-100" : "opacity-0",
            "fixed inset-0 z-40 bg-black/80 transition-opacity",
          )}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute right-0 top-0 z-50 m-4"
          >
            <Icon type="close" className="h-4 w-4 fill-white" />
          </button>
          <div
            ref={modalRef}
            className="flex h-full w-full items-center justify-center rounded p-4"
          >
            <Image
              alt={alt}
              height={height * 1.2}
              src={src}
              width={width * 1.2}
              className="w-1/2"
            />
          </div>
        </div>
      )}
    </>
  );
}
