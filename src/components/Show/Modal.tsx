import React from 'react';

import cc from '@/lib/cc';

type RecommendationModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  formData: { email: string; recommendation: string };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: () => void;
};

export default function Modal({
  isVisible,
  toggleModal,
  formData,
  setFormData,
  handleSubmit,
}: RecommendationModalProps) {
  return (
    <div
      className={cc(
        isVisible ? 'opacity-100' : ' opacity-0 -z-10',
        'absolute left-0 top-0 flex flex-col h-full w-full items-center justify-center bg-[#828282]/60 px-5 backdrop-blur-lg transition-opacity ease-in-out duration-200 ',
      )}
    >
      <div
        className={cc(isVisible ? 'scale-100' : ' scale-50', 'transition-transform duration-300')}
      >
        <div className={'rounded-t-xl border-b border-solid border-[#38393a] bg-black/70 p-4'}>
          <h2 className="mb-4 text-base font-bold text-white">Your suggestions 🍿</h2>
          <div className="rounded-lg bg-[#373b3c] px-3 py-2">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
              className="w-full  rounded-none border-b-[0.2px] border-solid border-[#4E5152] bg-transparent px-1 pb-2 pt-1 text-base text-white outline-none sm:text-sm"
            />
            <input
              placeholder="Your recommendation"
              type="text"
              value={formData.recommendation}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, recommendation: e.target.value }))
              }
              className="w-full resize-none rounded-none border-none bg-transparent px-1 pb-1 pt-2 text-base text-white outline-none sm:text-sm"
            ></input>
          </div>
        </div>
        <div className="flex w-full cursor-pointer  overflow-hidden rounded-b-xl bg-black/70 text-sm text-white">
          <div
            className="flex w-1/2 items-center justify-center border-r border-solid border-[#38393a] py-2.5 transition-colors hover:bg-black/20"
            onClick={toggleModal}
          >
            <p>Close</p>
          </div>
          <div
            className="flex w-1/2 items-center justify-center py-2.5 transition-colors hover:bg-black/20"
            onClick={handleSubmit}
          >
            <p>Submit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
