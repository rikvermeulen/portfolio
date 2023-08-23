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
        isVisible ? 'opacity-100 scale-100' : ' opacity-0 scale-0',
        'absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/10 backdrop-blur-lg px-5 transition-[opacity,transform] duration-300',
      )}
    >
      <div className="rounded-xl bg-[#1C1C1E] p-4">
        <div className="flex justify-between">
          <h2 className="mb-4 text-lg font-bold text-white">Suggestions 🎬</h2>
          <Icon
            type="close"
            className="h-6 w-6 cursor-pointer rounded-full bg-[#4E5152] fill-white p-2 transition-colors duration-300 hover:bg-[#3d4040]"
            onClick={toggleModal}
          />
        </div>
        <div className="mb-4 rounded-lg bg-[#282c2d] px-3 py-2">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
            className="w-full  border-b-[0.2px] border-solid border-[#4E5152] bg-transparent px-1 pb-2 pt-1  text-base text-white outline-none sm:text-sm"
          />
          <input
            placeholder="Your recommendation"
            type="text"
            value={formData.recommendation}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, recommendation: e.target.value }))
            }
            className="w-full resize-none border-none bg-transparent px-1 pb-1 pt-2 text-base text-white outline-none sm:text-sm"
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
