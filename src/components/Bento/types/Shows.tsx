'use client';

import { useState } from 'react';
import Image from 'next/image';

import Button from '@/components/Button';

import cc from '@/lib/cc';

import Bento from '../Bento';

const imageURL = 'https://image.tmdb.org/t/p/original';

type PropsShows = {
  current: Episode;
};

type Episode = {
  still_path: string;
  name: string;
  season_number: number;
  episode_number: number;
};

export default function Shows({ current }: PropsShows) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    recommendation: '',
  });

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/recommendation`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }

    setFormData({
      email: '',
      recommendation: '',
    });
    toggleModal();
  };

  return (
    <Bento
      size="1x1"
      className="bento relative z-0 flex flex-col justify-between bg-gradient-to-b from-[#2B3833] to-[#0F1314] p-5"
    >
      <header className="flex justify-between">
        <p className="text-lg font-bold text-white">The collection</p>
        <Image
          src="/images/icons/shows.png"
          className={`p-1.5 drop-shadow-md transition-transform duration-300 hover:scale-105`}
          alt="media"
          width={32}
          height={32}
        />
      </header>
      <div className="px-4">
        {current.still_path && (
          <Image
            src={`${imageURL}${current.still_path}`}
            className={`rounded-xl`}
            alt="media"
            width={270}
            height={150}
          />
        )}
        <div className="mt-3 flex flex-col text-sm text-white">
          <p className="font-bold">{current?.name}</p>
          <p className="relative -top-1 text-white/70">
            Last seen - {`S${current?.season_number}, E${current.episode_number}`}
          </p>
        </div>
      </div>
      <footer>
        <Button
          label="Suggestions?"
          className="border-[#4E5152] bg-[#1F2324] text-white backdrop-blur-xl hover:bg-[#2b3031]"
          onClick={toggleModal}
        />
      </footer>

      <div
        className={cc(
          isModalVisible ? 'opacity-100 scale-100' : ' opacity-0 scale-0',
          'absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/60 px-5 transition-[opacity,transform] duration-300',
        )}
      >
        <div className="rounded-xl border border-solid border-[#4E5152] bg-[#1F2324] p-4">
          <h2 className="mb-4 text-lg font-bold text-white">Suggestions 🎬</h2>
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className="mb-2 w-full rounded-md border border-none p-2 text-white outline-none"
          />
          <textarea
            placeholder="Your recommendation"
            value={formData.recommendation}
            onChange={(e) => setFormData((prev) => ({ ...prev, recommendation: e.target.value }))}
            className="mb-2 w-full resize-none rounded-md border border-none p-2 text-white outline-none"
          ></textarea>
          <div className="flex justify-between">
            <Button
              className="border-[#4E5152] bg-[#1F2324] text-white backdrop-blur-xl hover:bg-[#2b3031]"
              label="Submit"
              onClick={handleSubmit}
            />
            <Button
              className="border-[#4E5152] bg-[#1F2324] text-white backdrop-blur-xl hover:bg-[#2b3031]"
              label="Close"
              onClick={toggleModal}
            />
          </div>
        </div>
      </div>
    </Bento>
  );
}
