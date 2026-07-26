import { EXAM_PART_DIRECTIONS } from "@/features/exam/part-directions";

/**
 * 가이드 페이지에서만 쓰는 한국어 해설 카피.
 * 실제 시험 안내문(영어 원문)은 EXAM_PART_DIRECTIONS를 단일 출처로 참조한다.
 */
interface PartGuideCopy {
  questionRange: string;
  typeNameKo: string;
  prepTimeLabel: string;
  answerTimeLabel: string;
  summary: string;
  tip: string;
}

const PART_GUIDE_COPY: Record<number, PartGuideCopy> = {
  1: {
    questionRange: "1–2번",
    typeNameKo: "지문 소리 내어 읽기",
    prepTimeLabel: "45초",
    answerTimeLabel: "45초",
    summary:
      "화면에 나오는 짧은 영어 지문을 소리 내어 읽어요. 광고나 안내 방송 같은 실용문이 주로 나오고, 내용을 새로 만들어낼 필요가 없어서 다섯 파트 중 부담이 가장 적은 편이에요.",
    tip: "발음·억양·강세만 평가하니, 빠르게 읽기보다 끊어 읽기와 문장 끝 억양에 집중하세요.",
  },
  2: {
    questionRange: "3–4번",
    typeNameKo: "사진 묘사하기",
    prepTimeLabel: "45초",
    answerTimeLabel: "30초",
    summary:
      "화면의 사진 한 장을 보고 영어로 묘사해요. 인물의 동작, 주변 배경, 눈에 띄는 사물 순서로 말하면 30초를 채우기 수월합니다.",
    tip: "확신 없는 세부 묘사에 매달리기보다, 문장을 이어 붙일 수 있는 부분부터 말하는 게 유리해요.",
  },
  3: {
    questionRange: "5–7번",
    typeNameKo: "듣고 질문에 답하기",
    prepTimeLabel: "3초",
    answerTimeLabel: "15초 (5·6번) · 30초 (7번)",
    summary:
      "하나의 주제에 대한 질문 세 개에 연달아 답해요. 준비 시간이 3초뿐이라 질문을 듣자마자 바로 말을 시작해야 합니다.",
    tip: "5·6번은 한두 문장으로 짧게, 7번은 이유와 예시를 붙여 30초를 채우는 구성이 무난해요.",
  },
  4: {
    questionRange: "8–10번",
    typeNameKo: "제공된 정보로 답하기",
    prepTimeLabel: "45초 (자료 읽기) + 3초",
    answerTimeLabel: "15초 (8·9번) · 30초 (10번)",
    summary:
      "일정표나 안내문 같은 자료를 45초 동안 읽고, 그 내용을 근거로 세 개의 질문에 답해요. 10번 문제는 질문을 두 번 들려줍니다.",
    tip: "45초 동안 자료 전체를 외우려 하지 말고, 날짜·시간·발표자처럼 질문에 자주 나오는 항목부터 확인하세요.",
  },
  5: {
    questionRange: "11번",
    typeNameKo: "의견 말하기",
    prepTimeLabel: "45초",
    answerTimeLabel: "60초",
    summary:
      "주어진 주제에 대해 자신의 의견을 60초 동안 말해요. 답변 시간이 가장 길고 비중도 커서 등급을 가르는 파트로 꼽힙니다.",
    tip: "입장을 먼저 밝히고 이유 두 가지와 예시를 붙이는 틀을 익혀두면 60초를 안정적으로 채울 수 있어요.",
  },
};

export interface PartGuideEntry extends PartGuideCopy {
  partNumber: number;
  /** 시험 안내문 제목에서 뽑아낸 영문 유형명. 예: "Read a text aloud" */
  typeNameEn: string;
  /** 실제 시험에서 들려주는 영어 안내문 원문 */
  directionsLines: string[];
}

function extractTypeNameEn(title: string): string {
  const [, typeName] = title.split(/\s*:\s*/);
  return typeName ?? title;
}

export const PART_GUIDE_ENTRIES: PartGuideEntry[] = Object.entries(
  PART_GUIDE_COPY,
).map(([partNumber, copy]) => {
  const directions = EXAM_PART_DIRECTIONS[Number(partNumber)];

  return {
    ...copy,
    partNumber: Number(partNumber),
    typeNameEn: extractTypeNameEn(directions.title),
    directionsLines: directions.lines,
  };
});

export const TOTAL_QUESTION_COUNT = 11;
export const TOTAL_DURATION_LABEL = "약 20분";
