import cc from "@/lib/cc.ts";
import React from "react";

interface RecommendationModalProps {
  isVisible: boolean;
  toggleModal: () => void;
  formData: { email: string; recommendation: string };
  setFormData: React.Dispatch<
    React.SetStateAction<{ email: string; recommendation: string }>
  >;
  handleSubmit: () => void;
}

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
        isVisible ? "opacity-100" : "-z-10 opacity-0",
        "absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center bg-[#828282]/60 px-5 backdrop-blur-lg transition-opacity duration-200 ease-in-out",
      )}
    >
      <div
        className={cc(
          isVisible ? "scale-100" : "scale-50",
          "transition-transform duration-300",
        )}
      >
        <div className="rounded-t-xl border-b border-solid border-[#38393a] bg-black/70 p-4">
          <h2 className="mb-4 text-base font-bold text-white">
            Your suggestions 🍿
          </h2>
          <div className="rounded-lg bg-[#373b3c] px-3 py-2">
            <input
              onChange={(e) =>
                setFormData(
                  (prev: { email: string; recommendation: string }) => ({
                    ...prev,
                    email: e.target.value,
                  }),
                )
              }
              placeholder="Email"
              type="email"
              value={formData.email}
              className="w-full rounded-none border-b-[0.2px] border-solid border-[#4E5152] bg-transparent px-1 pt-1 pb-2 text-base text-white outline-hidden sm:text-sm"
            />
            <input
              onChange={(e) =>
                setFormData(
                  (prev: { email: string; recommendation: string }) => ({
                    ...prev,
                    recommendation: e.target.value,
                  }),
                )
              }
              placeholder="Your recommendation"
              type="text"
              value={formData.recommendation}
              className="w-full resize-none rounded-none border-none bg-transparent px-1 pt-2 pb-1 text-base text-white outline-hidden sm:text-sm"
            ></input>
          </div>
        </div>
        <div className="flex w-full cursor-pointer overflow-hidden rounded-b-xl bg-black/70 text-sm text-white">
          <div
            onClick={toggleModal}
            className="flex w-1/2 items-center justify-center border-r border-solid border-[#38393a] py-2.5 transition-colors hover:bg-black/20"
          >
            <p>Close</p>
          </div>
          <div
            onClick={handleSubmit}
            className="flex w-1/2 items-center justify-center py-2.5 transition-colors hover:bg-black/20"
          >
            <p>Submit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
