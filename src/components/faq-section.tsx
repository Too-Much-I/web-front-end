import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "토선생은 무료인가요?",
    answer:
      "네, 토선생은 현재 검증(PoC) 단계 서비스로 무료로 이용할 수 있어요. 추후 유료 서비스를 도입하게 되면 내용과 적용일자를 사전에 공지할게요.",
  },
  {
    question: "토선생 채점 결과가 실제 토익 스피킹 성적표인가요?",
    answer:
      "아니에요. 토선생의 채점 결과와 피드백은 AI가 공식 채점 기준을 참고해 산출한 연습용 참고 자료로, 한국토익위원회(YBM)가 발급하는 공식 TOEIC Speaking 성적표나 공인 점수는 아니에요. 실전 감각을 익히는 연습 목적으로 활용해주세요.",
  },
  {
    question: "무엇을 기준으로 채점하나요?",
    answer:
      "발음·유창성·문법·어휘를 공식 채점 기준을 사용해 분석하고, 감점된 부분과 함께 파트별 강점·약점 피드백을 제공해요.",
  },
  {
    question: "문제 유형도 실제 시험과 같나요?",
    answer:
      "네, 실제 토익 스피킹 시험과 동일한 유형의 문제로 모의고사를 구성했어요. 다만 연습 편의를 위해 남은 준비·답변 시간을 기다리지 않고 바로 다음으로 넘어갈 수 있는 기능이 있어서, 진행 방식까지 실제 시험과 완전히 동일하지는 않아요.",
  },
];

export function FaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-20 sm:py-28 lg:max-w-4xl xl:max-w-5xl"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
        자주 묻는 질문
      </h2>
      <Accordion>
        {FAQS.map(({ question, answer }) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger className="text-base text-zinc-900 lg:text-lg">
              {question}
            </AccordionTrigger>
            <AccordionContent className="text-zinc-500 lg:text-base">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
