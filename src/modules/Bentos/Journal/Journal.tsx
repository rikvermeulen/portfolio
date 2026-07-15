"use client";

import { useState } from "react";

import type { JournalProps } from "./Journal.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { notify } from "@/components/Toast/index.ts";
import { useShare } from "@/hooks/useShare/index.ts";
import classnames from "@/utils/classnames/index.ts";

import { journalQuestions } from "./Journal.const.ts";
import {
  formatQuestionDate,
  getQuestionIndexForDate,
  getRandomQuestionIndex,
} from "./Journal.utils.ts";

const TODAY = new Date();

/** The round copy/shuffle action buttons share one glass treatment. */
const ACTION_GLASS = {
  intensity: 2,
  radius: 18,
  tint: "none" as const,
  className: "bg-white/15",
};

const Journal = ({ sizeKey, className, date }: JournalProps) => {
  const today = date ?? TODAY;
  const [questionIndex, setQuestionIndex] = useState(() =>
    getQuestionIndexForDate(today),
  );
  const { share } = useShare();

  const question = journalQuestions[questionIndex] ?? "";

  async function shareQuestion(): Promise<void> {
    const outcome = await share({
      title: "Today's journal question",
      text: question,
    });

    if (outcome === "shared") {
      notify({
        app: "journal",
        title: "Question shared",
        description: question,
      });
    } else if (outcome === "copied") {
      // No native share sheet — the question landed on the clipboard instead.
      notify({
        app: "journal",
        title: "Copied to share",
        description: question,
      });
    }
  }

  return (
    <Bento
      app="journal"
      sizes={bentos[sizeKey].sizes}
      surfaceClassName="bg-linear-to-br from-ds-journal-from/95 to-ds-journal-to/95"
      className={classnames(
        "flex flex-col justify-between p-5 md:p-6",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -left-14 size-48 rounded-full bg-ds-journal-glow/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 size-52 rounded-full bg-ds-journal-glow-pink/25 blur-3xl"
      />

      <header className="relative z-10 flex items-start justify-between">
        <p className="bento-eyebrow text-ds-journal-date">
          {formatQuestionDate(today)}
        </p>
      </header>

      <h2 className="bento-display relative z-10 max-w-xl bg-linear-to-b from-ds-journal-ink-from to-ds-journal-ink-to bg-clip-text pr-4 text-transparent">
        {question}
      </h2>

      <footer className="relative z-10 flex items-center justify-between">
        <button
          aria-label="Share question"
          onClick={() => void shareQuestion()}
          type="button"
          className="relative z-10 flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full text-white"
        >
          <Glass {...ACTION_GLASS} />
          <Icon iconClassName="relative z-10 size-4" name="share" />
        </button>
        <button
          aria-label="Show another question"
          onClick={() => setQuestionIndex(getRandomQuestionIndex)}
          type="button"
          className="relative z-10 flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full text-white"
        >
          <Glass {...ACTION_GLASS} />
          <Icon iconClassName="relative z-10 size-4" name="refresh" />
        </button>
      </footer>
    </Bento>
  );
};

export default Journal;
