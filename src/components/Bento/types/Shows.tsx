"use client";

import Bento from "@/components/Bento/Bento.tsx";
import { ButtonPrimary } from "@/components/Button.tsx";
import Icon from "@/components/Icons/Icon.tsx";
import Modal from "@/components/Show/Modal.tsx";
import WatchList from "@/components/Show/WatchList.tsx";
import { hasEnoughText, isValidEmail } from "@/utils/validation.tsx";
import { useState } from "react";
import Image from "next/image";

import type { TPropsShows } from "@/types/types";

const imageURL = "https://image.tmdb.org/t/p/original";

export default function Shows({ current, shows, movies }: TPropsShows) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    recommendation: "",
  });
  const [isListVisible, setListVisible] = useState(false);
  const [filter, setFilter] = useState("Shows");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSubmit = async () => {
    let isValid = true;

    if (!isValidEmail(formData.email)) {
      alert("Invalid email format");
      isValid = false;
    }

    if (!hasEnoughText(formData.recommendation)) {
      alert("Recommendation must have at least 2 characters");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      const res = await fetch(`/api/recommend`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error("Failed to submit recommendation");
      }
    } catch {
      alert("An error occurred. Please try again later.");
    }

    setFormData({
      email: "",
      recommendation: "",
    });
    toggleModal();
  };

  return (
    <Bento
      href={`https://www.themoviedb.org/tv/${current?.show_id}`}
      icon="shows"
      size="1x1"
      className="bento relative z-0 flex flex-col justify-between bg-gradient-to-b from-[#2B3833] to-[#0F1314] p-5"
    >
      <header className="flex justify-between">
        <p className="text-lg font-bold text-white">Watching now</p>
      </header>
      <div className="px-4">
        {current?.still_path && (
          <Image
            alt="media"
            height={150}
            loading="lazy"
            src={`${imageURL}${current?.still_path}`}
            width={270}
            className="rounded-xl"
          />
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-white">
            <p className="font-bold">{current?.name}</p>
            <p className="relative -top-1 text-white/70">
              Last seen -{" "}
              {`S${current?.season_number}, E${current?.episode_number}`}
            </p>
          </div>
          <Icon
            onClick={() => setListVisible(!isListVisible)}
            type="list"
            className="w-5 cursor-pointer fill-white"
          />
        </div>
      </div>
      <footer>
        <ButtonPrimary
          label="Your picks"
          onClick={toggleModal}
          className="border-[#4E5152] bg-[#1F2324] text-white backdrop-blur-xl hover:bg-[#2b3031]"
        />
      </footer>
      <Modal
        formData={formData}
        handleSubmit={handleSubmit}
        isVisible={isModalVisible}
        setFormData={setFormData}
        toggleModal={toggleModal}
      />
      <WatchList
        filter={filter}
        isListVisible={isListVisible}
        movies={movies}
        searchTerm={searchTerm}
        setFilter={setFilter}
        setSearchTerm={setSearchTerm}
        shows={shows}
        toggleListVisibility={() => setListVisible(!isListVisible)}
      />
    </Bento>
  );
}
