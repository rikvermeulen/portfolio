'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PropsShows } from '@/types';

import { ButtonPrimary } from '@/components/Button';
import Icon from '@/components/Icons/Icon';
import Modal from '@/components/Shows/Modal';
import WatchList from '@/components/Shows/WatchList';

import { hasEnoughText, isValidEmail } from '@/utils/validation';

import Bento from '../Bento';

const imageURL = 'https://image.tmdb.org/t/p/original';

export default function Shows({ current, shows, movies }: PropsShows) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    recommendation: '',
  });
  const [isListVisible, setListVisible] = useState(false);
  const [filter, setFilter] = useState('Shows');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSubmit = async () => {
    let isValid = true;

    if (!isValidEmail(formData.email)) {
      alert('Invalid email format');
      isValid = false;
    }

    if (!hasEnoughText(formData.recommendation)) {
      alert('Recommendation must have at least 2 characters');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

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
        <p className="text-lg font-bold text-white">Watching now</p>
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
            loading="lazy"
          />
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-white">
            <p className="font-bold">{current?.name}</p>
            <p className="relative -top-1 text-white/70">
              Last seen - {`S${current?.season_number}, E${current.episode_number}`}
            </p>
          </div>
          <Icon
            type="list"
            className="w-5 cursor-pointer fill-white"
            onClick={() => setListVisible(!isListVisible)}
          />
        </div>
      </div>
      <footer>
        <ButtonPrimary
          label="Your picks"
          className="border-[#4E5152] bg-[#1F2324] text-white backdrop-blur-xl hover:bg-[#2b3031]"
          onClick={toggleModal}
        />
      </footer>
      <Modal
        isVisible={isModalVisible}
        toggleModal={toggleModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />
      <WatchList
        isListVisible={isListVisible}
        toggleListVisibility={() => setListVisible(!isListVisible)}
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        movies={movies}
        shows={shows}
      />
    </Bento>
  );
}
