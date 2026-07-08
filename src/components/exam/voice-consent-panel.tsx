"use client";

import { Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getOrCreateAnonymousId } from "@/features/consent/anonymous-id";
import { submitVoiceConsent } from "@/features/consent/api/submit-voice-consent";
import {
  VOICE_CONSENT_DETAILS,
  VOICE_CONSENT_ITEM,
  VOICE_CONSENT_SUMMARY,
  VOICE_CONSENT_VERSION,
} from "@/features/consent/consent-content";
import { cn } from "@/lib/utils";

export function VoiceConsentPanel({ onAgreed }: { onAgreed: () => void }) {
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitVoiceConsent({
        anonymousId: getOrCreateAnonymousId(),
        consentItem: VOICE_CONSENT_ITEM,
        consentVersion: VOICE_CONSENT_VERSION,
        consentedAt: new Date().toISOString(),
        method: "web_checkbox",
      });
    } catch {
      toast.error("동의 기록 저장에 실패했어요. (QA 모드: 저장 실패해도 계속 진행합니다)");
    } finally {
      setSubmitting(false);
      onAgreed();
    }
  };

  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
      <div className="flex flex-col items-center gap-1 text-center">
        <ShieldCheck className="mb-1 size-8 text-orange-500" />
        <h2 className="text-base font-bold text-orange-500">
          음성 데이터 수집 및 이용 동의
        </h2>
        <p className="text-sm whitespace-nowrap text-zinc-500">
          {VOICE_CONSENT_SUMMARY}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
        {VOICE_CONSENT_DETAILS.map((detail) => (
          <div key={detail.title} className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-zinc-500">
              {detail.title}
            </span>
            <p className="leading-relaxed">{detail.body}</p>
          </div>
        ))}
      </div>

      <label
        className={cn(
          "flex cursor-pointer items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50/60 p-4 text-sm text-zinc-700",
          submitting && "pointer-events-none opacity-60",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
            checked
              ? "border-orange-500 bg-orange-500"
              : "border-zinc-300 bg-white",
          )}
        >
          {checked && <Check className="size-3 text-white" strokeWidth={3} />}
        </span>
        <span>
          <span className="font-semibold text-orange-600">[필수]</span>{" "}
          {VOICE_CONSENT_ITEM}에 동의합니다.
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!checked || submitting}
          className="h-14 w-full rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40"
        >
          {submitting ? "저장 중..." : "동의하고 계속하기"}
        </Button>
        <p className="text-center text-xs text-zinc-400">
          동의하지 않을 경우 음성 답변 채점이 불가능해 모의고사를 진행할 수 없어요.
        </p>
      </div>
    </section>
  );
}
