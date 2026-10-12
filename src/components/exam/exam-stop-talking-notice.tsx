/**
 * 응답 시간이 끝난 뒤 다음 문제로 넘어가기 전(`stop-talking`)에 띄우는 안내.
 *
 * 실제 TOEIC Speaking 시험 화면에 나오는 문구를 그대로 옮겼다. 시험과 같은 문장을 봐야
 * 실전에서 낯설지 않으므로 번역하지 않는다. 확인 다이얼로그(z-50)가 위에 오도록 z-40을 쓴다.
 */
export function ExamStopTalkingNotice() {
  return (
    <div
      role="alertdialog"
      aria-labelledby="exam-stop-talking-title"
      aria-live="assertive"
      className="animate-in fade-in fixed inset-0 z-40 flex items-center justify-center bg-blue-950/40 p-4 duration-150"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-blue-950 shadow-xl">
        <h2
          id="exam-stop-talking-title"
          className="py-6 text-center text-4xl font-bold text-white md:py-8 md:text-5xl"
        >
          Stop Talking
        </h2>
        <div className="mx-4 mb-4 flex flex-col gap-6 rounded-xl bg-white px-6 py-10 text-center text-lg leading-relaxed text-blue-950 md:mx-6 md:mb-6 md:py-12 md:text-xl">
          <p>
            Your response time has ended.
            <br />
            Stop speaking now.
          </p>
          <p>
            You will automatically proceed to the next question after your
            response has been saved.
          </p>
          <p>This may take several seconds.</p>
        </div>
      </div>
    </div>
  );
}
