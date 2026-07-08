"use client";

import { Volume2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SOUND_CHECK_SRC = "/assets/audio/sound_check.wav";

export function SoundCheckPanel({ onCompleted }: { onCompleted: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(SOUND_CHECK_SRC);
    audioRef.current = audio;

    const handleEnded = () => {
      setIsPlaying(false);
      setHasPlayed(true);
    };
    const handleError = () => {
      setIsPlaying(false);
      setError("소리를 재생할 수 없어요. 기기의 음량을 확인해주세요.");
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    audio.currentTime = 0;
    setIsPlaying(true);
    audio.play().catch(() => {
      setIsPlaying(false);
      setError("소리를 재생할 수 없어요. 브라우저 설정을 확인해주세요.");
      toast.error("오디오를 재생할 수 없어요");
    });
  };

  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-base font-bold text-orange-500">사운드 체크</h2>
        <p
          className={cn(
            "text-sm",
            error ? "text-orange-500" : "text-zinc-500",
          )}
        >
          {error ?? (hasPlayed ? "소리가 잘 들렸나요?" : "재생 버튼을 눌러 소리를 확인해보세요.")}
        </p>
      </div>

      <div className="flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={handlePlay}
          disabled={isPlaying}
          className="flex items-center justify-center"
        >
          <Image
            src="/mascots/sound_check.png"
            alt="사운드 체크"
            width={400}
            height={208}
            className={cn(
              "w-64 transition-transform duration-150 sm:w-72",
              isPlaying && "scale-105",
            )}
            priority
          />
        </button>

        <Button
          variant="outline"
          size="lg"
          onClick={handlePlay}
          disabled={isPlaying}
          className="h-12 w-full border-orange-300 text-base text-orange-600 hover:bg-orange-50"
        >
          <Volume2 className="size-4" />
          {isPlaying ? "재생 중..." : hasPlayed ? "다시 듣기" : "소리 재생하기"}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          onClick={onCompleted}
          disabled={!hasPlayed}
          className="h-14 w-full flex-col gap-0.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40"
        >
          <span className="text-base font-semibold">모의고사 시작하기</span>
          <span className="text-xs font-normal opacity-80">
            Start Test Now
          </span>
        </Button>
        <p className="text-center text-xs text-zinc-400">
          {hasPlayed
            ? "클릭 시 약 20분간의 모의고사가 즉시 시작됩니다."
            : "소리를 재생해서 확인하면 모의고사를 시작할 수 있어요."}
        </p>
      </div>
    </section>
  );
}
