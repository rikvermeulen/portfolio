'use client';

import { useState } from 'react';
import Image from 'next/image';

import Button from '@/components/Button';
import Icon from '@/components/Icons/Icon';
import Modal from '@/components/shows/Modal';
import WatchList from '@/components/shows/WatchList';

import Bento from '../Bento';

const imageURL = 'https://image.tmdb.org/t/p/original';

type Episode = {
  still_path: string;
  name: string;
  season_number: number;
  episode_number: number;
};

type ShowOrMovie = {
  backdrop_path: string;
  name?: string;
  title?: string;
  overview: string;
};

type PropsShows = {
  current: Episode;
  movies: ShowOrMovie[];
  shows: ShowOrMovie[];
};

type RecommendationModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  formData: { email: string; recommendation: string };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: () => void;
};

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

  const filteredData = (filter === 'Shows' ? shows : movies).filter(
    (item) => (item.name || item.title)?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-white">
            <p className="font-bold">{current?.name}</p>
            <p className="relative -top-1 text-white/70">
              Last seen - {`S${current?.season_number}, E${current.episode_number}`}
            </p>
          </div>
          <Icon
            type="list"
            className="cursor-pointer fill-white"
            onClick={() => setListVisible(!isListVisible)}
          />
        </div>
      </div>
      <footer>
        <Button
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
