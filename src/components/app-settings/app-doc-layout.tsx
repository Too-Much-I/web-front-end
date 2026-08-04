/**
 * 앱 설정 화면이 웹뷰로 띄우는 법률 문서용 레이아웃이다.
 *
 * 웹의 LegalPageLayout에서 헤더와 푸터를 걷어낸 것이다. 그쪽에는 로고와
 * "홈으로" 링크가 있어서, 웹뷰에서 그대로 띄우면 사용자가 앱 안에서 마케팅
 * 랜딩으로 빠져나간다. 화면 헤더와 뒤로가기는 RN이 네이티브로 그린다.
 *
 * 조문은 LegalSection을 웹과 그대로 공유한다. 조문 타이포를 고칠 때 한 곳만
 * 고치면 되고, 웹과 앱의 조문 모양이 자동으로 같아진다.
 *
 * 다만 줄간격만은 여기서 덮어쓴다. 좁은 기기 폭에서 웹과 같은 leading-relaxed로
 * 두면 장문의 조문이 답답해 보였다. LegalSection을 고치면 웹 법률 페이지까지
 * 같이 바뀌므로, 이 레이아웃 안에서만 적용되도록 자손 선택자로 덮어쓴다.
 */
export function AppDocLayout({
  title,
  effectiveDateLabel,
  intro,
  children,
}: {
  title: string;
  effectiveDateLabel: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-6 py-10 sm:px-8 sm:py-12 md:px-10 lg:px-12 [&_li]:leading-[1.85] [&_p]:leading-[1.85]">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-blue-950 sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-zinc-500 sm:text-base">
          {effectiveDateLabel}
        </p>
        <p className="text-sm text-zinc-600 sm:text-base">{intro}</p>
      </div>

      {children}
    </main>
  );
}
