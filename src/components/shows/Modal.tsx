import React from 'react';

import Button from '@/components/Button';
import Icon from '@/components/Icons/Icon';

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
        'absolute left-0 top-0 flex h-full w-full items-center justify-center bg-[#828282]/40 px-5 backdrop-blur-lg transition-[opacity,transform] ease-in-out duration-300',
      )}
    >
      <div
        className={cc(
          isVisible ? 'scale-100' : ' scale-0',
          'rounded-xl bg-black/60 p-4 backdrop-blur-lg',
        )}
      >
        <div className="flex justify-between">
          <h2 className="mb-4 text-base font-bold text-white">Your suggestions 🍿</h2>
          <Icon
            type="close"
            className="h-6 w-6 cursor-pointer rounded-full bg-[#4E5152] fill-white p-2 transition-colors duration-300 ease-in-out hover:bg-[#3d4040]"
            onClick={toggleModal}
          />
        </div>
        <div className="mb-4 rounded-lg bg-[#373b3c] px-3 py-2">
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
        <div className="flex justify-between">
          <Button
            className="border-[#4E5152] bg-[#0F1314] text-white backdrop-blur-xl hover:bg-[#090b0b]"
            label="Submit"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
