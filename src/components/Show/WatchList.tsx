import cc from "@/lib/cc.ts";
import truncateText from "@/utils/truncateText.tsx";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import type { TMovieListProps } from "@/types/types";
import type { RefObject } from "react";

import Icon from "../Icons/Icon.tsx";
import { Indicator } from "../Indicator.tsx";

const imageURL = "https://image.tmdb.org/t/p/original";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) => (
  <div className="flex h-8 w-3/4 items-center rounded-xl bg-[#1C1C1E]">
    <Icon type="loop" className="mx-3 w-3 fill-[#98989F]" />
    <input
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
      type="text"
      value={searchTerm}
      className="bg-transparent p-0 text-sm text-white outline-hidden"
    />
  </div>
);

const FilterButtons = ({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (term: string) => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef(
    ["Shows", "Movies"].map(() => createRef<HTMLButtonElement>()),
  );

  useEffect(() => {
    setActiveIndex(filter === "Shows" ? 0 : 1);
  }, [filter]);

  return (
    <ul className="relative my-2 flex gap-2 text-xs font-medium text-white">
      <Indicator
        activeIndex={activeIndex}
        itemRefs={buttonRefs.current}
        className="bg-blue-600"
      />
      {["Shows", "Movies"].map((term, index) => (
        <li key={term}>
          <button
            ref={
              buttonRefs.current[index] as RefObject<HTMLButtonElement | null>
            }
            onClick={() => setFilter(term)}
            className="rounded-full px-3 py-1"
          >
            {term === "Shows" ? "Series" : "Movies"}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default function WatchList({
  isListVisible,
  toggleListVisibility,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  movies,
  shows,
}: TMovieListProps) {
  const filteredData = useMemo(() => {
    const data = filter === "Shows" ? shows : movies;
    return data.filter((item) =>
      (item.name || item.title)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [filter, searchTerm, movies, shows]);

  return (
    <div
      className={cc(
        isListVisible ? "translate-x-0" : "translate-x-96",
        "absolute top-0 left-0 z-50 h-full w-full bg-linear-to-b from-[#2B3833] to-[#0F1314] px-5 transition-transform duration-300",
      )}
    >
      <header className="mt-5 flex items-center justify-between">
        <div
          aria-label="Close watch list"
          onClick={toggleListVisibility}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleListVisibility();
            }
          }}
          role="button"
          tabIndex={0}
          className="flex cursor-pointer items-center gap-2"
        >
          <Icon type="chevron" className="w-1.5 fill-blue-600" />
          <p className="text-sm text-blue-600">Back</p>
        </div>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </header>
      <FilterButtons filter={filter} setFilter={setFilter} />
      <div
        style={{ overflowY: "scroll", height: "100%" }}
        className="no-scrollbar max-h-[250px]"
      >
        <p className="pb-1 text-sm font-bold text-white">What I watched</p>
        {filteredData.map((show) => (
          <div
            key={`watchlist-${show.name || show.title}`}
            className="flex gap-3 border-b-[0.5px] border-solid border-[#484848] py-2"
          >
            <Image
              alt={show.name || show.title || "media"}
              height={40}
              loading="lazy"
              src={`${imageURL}${show.backdrop_path}`}
              width={70}
              className="rounded-sm"
            />
            <div className="flex flex-col justify-center">
              <p className="text-xs font-medium text-white">
                {show.name || show.title}
              </p>
              <p className="text-2xs text-[#8a8a8a]">
                {truncateText(show.overview, 40)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
