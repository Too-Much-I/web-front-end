/**
 * 앱 설정 화면이 웹뷰로 띄우는 법률 문서용 레이아웃이다.
 *
 * 웹의 LegalPageLayout에서 헤더와 푸터를 걷어낸 것이다. 그쪽에는 로고와
 * "홈으로" 링크가 있어서, 웹뷰에서 그대로 띄우면 사용자가 앱 안에서 마케팅
 * 랜딩으로 빠져나간다. 화면 헤더와 뒤로가기는 RN이 네이티브로 그린다.
 *
 * 조문은 LegalSection을 웹과 그대로 공유한다. 조문 타이포를 고칠 때 한 곳만
 * 고치면 되고, 웹과 앱의 조문 모양이 자동으로 같아진다.
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 py-8 sm:px-6 md:px-8 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-blue-950 sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-zinc-500 sm:text-base">
          {effectiveDateLabel}
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
          {intro}
        </p>
      </div>

      {children}
    </main>
  );
}
