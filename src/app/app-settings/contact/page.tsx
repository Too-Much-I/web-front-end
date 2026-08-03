import Image from "next/image";

export const metadata = {
  title: "문의하기 | 토선생",
};

const CONTACT_EMAIL = "tosunsaeng093@gmail.com";
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(
  CONTACT_EMAIL,
)}&su=${encodeURIComponent("토선생 문의")}`;

export default function AppContactPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="relative h-40 w-40 sm:h-48 sm:w-48">
        <Image
          src="/mascots/mail.png"
          alt="편지를 든 토선생 캐릭터"
          fill
          sizes="200px"
          className="object-contain"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-blue-950 sm:text-3xl">
          문의하기
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
          서비스 이용 중 궁금한 점이나 의견이 있다면
          <br />이 메일로 보내주세요.
        </p>
      </div>

      <div className="rounded-full border border-orange-200 bg-white px-5 py-2 text-sm font-medium text-blue-950 sm:text-base">
        {CONTACT_EMAIL}
      </div>

      {/*
        이 두 링크는 웹뷰 안에서 열리면 안 된다. RN의
        onShouldStartLoadWithRequest가 mail.google.com과 mailto: 스킴을
        Linking.openURL로 넘긴다. docs/app-settings-webview.md 참고.
      */}
      <a
        href={GMAIL_COMPOSE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center rounded-full bg-orange-500 px-8 text-base font-semibold text-white hover:bg-orange-600"
      >
        메일 보내기
      </a>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="text-xs text-zinc-400 hover:text-orange-500"
      >
        다른 메일 앱으로 보내기
      </a>
    </main>
  );
}
