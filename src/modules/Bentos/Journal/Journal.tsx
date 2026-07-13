"use client";

import { useState } from "react";

import type { JournalProps } from "./Journal.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { notify } from "@/components/Toast/index.ts";
import { useClipboard } from "@/hooks/useClipboard/index.ts";
import classnames from "@/utils/classnames/index.ts";

import { journalQuestions } from "./Journal.questions.ts";
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
  const { copy } = useClipboard();

  const question = journalQuestions[questionIndex] ?? "";

  async function copyQuestion(): Promise<void> {
    const ok = await copy(question);
    if (ok) {
      notify({
        app: "journal",
        title: "Question copied",
        description: question,
      });
    }
  }

  return (
    <Bento
      app="journal"
      sizes={bentos[sizeKey].sizes}
      className={classnames(
        "flex flex-col justify-between p-5 md:p-6",
        className,
      )}
    >
      <Glass
        intensity={1}
        radius={16}
        tint="none"
        className="bg-linear-to-br from-ds-journal-from/95 to-ds-journal-to/95"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -left-14 size-48 rounded-full bg-ds-journal-glow/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 size-52 rounded-full bg-ds-journal-glow-pink/25 blur-3xl"
      />

      <header className="relative z-10 flex items-start justify-between">
        <p className="text-sm font-semibold text-ds-journal-date">
          {formatQuestionDate(today)}
        </p>
      </header>

      <h2 className="relative z-10 max-w-xl bg-linear-to-b from-ds-journal-ink-from to-ds-journal-ink-to bg-clip-text pr-4 text-3xl leading-tight font-bold tracking-tight text-transparent md:text-4xl">
        {question}
      </h2>

      <footer className="relative z-10 flex items-center justify-between">
        <button
          aria-label="Copy question"
          onClick={() => void copyQuestion()}
          type="button"
          className="relative z-10 flex size-9 items-center justify-center overflow-hidden rounded-full text-white"
        >
          <Glass {...ACTION_GLASS} />
          <Icon iconClassName="relative z-10 size-4" name="plus" />
        </button>
        <button
          aria-label="Show another question"
          onClick={() => setQuestionIndex(getRandomQuestionIndex)}
          type="button"
          className="relative z-10 flex size-9 items-center justify-center overflow-hidden rounded-full text-white"
        >
          <Glass {...ACTION_GLASS} />
          <Icon iconClassName="relative z-10 size-4" name="refresh" />
        </button>
      </footer>
    </Bento>
  );
};

export default Journal;
