import { mapExamGradingResult } from "@/features/exam/map-exam-grading-result";
import type { RawExamGradingResult } from "@/types/exam";

export const MOCK_EXAM_GRADING_RESULT_RAW: RawExamGradingResult = {
  _id: "local_full_test_mock_001_summary",
  user_id: "local_full_test",
  mock_exam_id: "mock_001",
  item_count: 11,
  expected_item_count: 11,
  source_evaluation_item_ids: [
    "local_full_test_mock_001_part1_q1",
    "local_full_test_mock_001_part1_q2",
    "local_full_test_mock_001_part2_q3",
    "local_full_test_mock_001_part2_q4",
    "local_full_test_mock_001_part3_q5",
    "local_full_test_mock_001_part3_q6",
    "local_full_test_mock_001_part3_q7",
    "local_full_test_mock_001_part4_q8",
    "local_full_test_mock_001_part4_q9",
    "local_full_test_mock_001_part4_q10",
    "local_full_test_mock_001_part5_q11",
  ],
  suggested_total_score: 143,
  score_scale: "0-200",
  level_estimate: "중상 (TOEIC Speaking 130~150 수준)",
  summary:
    "전반적으로 Part 1은 무난~양호, Part 3와 Part 4는 강점이 있었고, Part 2와 Part 5에서 표현 정확도와 문법 안정성이 조금 약했습니다. 내용 전달은 대부분 가능했지만, 일부 문항에서는 발음·강세·문장 자연스러움 때문에 감점이 있었습니다.",
  overall_feedback:
    "전체적으로 답변 구조를 만들고 핵심 정보에 반응하는 능력은 좋습니다. 특히 Part 3, Part 4에서 직접 답변을 잘했고, Part 5도 입장-이유-예시 구조를 갖추려는 시도가 좋았습니다. 다만 Part 1에서는 핵심 단어 발음과 끊어 읽기, Part 2에서는 이미지와 더 정확히 맞는 표현 선택, Part 4에서는 표의 정보 정확도, Part 5에서는 문법과 예시의 구체성이 더 필요합니다. 다음 학습에서는 '정확한 정보 + 자연스러운 문장 + 또렷한 발음' 3가지를 동시에 관리하는 연습이 중요합니다.",
  part_feedback: {
    part1:
      "대체로 원문을 잘 따라 읽었지만, 핵심 단어의 발음과 강세가 흔들려 2점~1점 수준이었습니다. 의미는 전달되지만 pause가 많아 문장 단위가 아니라 단어 단위로 끊겨 들리는 경향이 있습니다. 앞으로는 어려운 단어를 미리 연습하고, 의미 덩어리로 묶어서 읽는 방식이 필요합니다.",
    part2:
      "두 사진 설명 모두 핵심 요소를 일부 맞췄지만, 이미지와 정확히 일치하지 않는 표현이 있었습니다. 특히 장소 표현, 동작 표현, 수일치, 관사 사용에서 감점이 있었습니다. Part 2는 '보이는 것만' 짧고 정확하게 말하는 것이 중요하므로, 추측 표현을 줄이고 위치+행동 중심으로 말하는 연습이 필요합니다.",
    part3:
      "Q5, Q6는 매우 좋았고, Q7도 입장과 이유, 예시를 제시해 전체적으로 안정적이었습니다. 다만 Q7에서 문법적으로 자연스럽지 않은 표현이 있었고, 일부 답변은 이유가 다소 일반적이었습니다. 지금처럼 질문에 바로 답하는 습관은 유지하되, 이유를 한 문장 더 구체적으로 확장하면 더 높은 점수를 받을 수 있습니다.",
    part4:
      "Q8, Q9는 매우 정확했고 간결하게 핵심 정보를 전달했습니다. Q10은 장비 관련 세션을 잘 골랐지만, 발표자 이름과 시간 표현이 완전히 정확하지는 않았습니다. Part 4는 '무엇이 맞는지'가 가장 중요하므로, 표의 숫자·이름·시간을 정확히 읽는 훈련이 필요합니다.",
    part5:
      "입장은 분명했고 개인 경험까지 연결한 점은 좋았습니다. 다만 문법 오류, 어색한 비교 표현, 반복적인 연결이 있어 설득력이 다소 약해졌습니다. Part 5에서는 긴 말을 많이 하는 것보다 '명확한 입장 + 구체적 이유 1~2개 + 짧은 예시'로 정리해서 말하는 것이 더 효과적입니다.",
  },
  strengths: [
    "Part 3에서 질문에 바로 답하고 이유를 붙이는 능력이 좋음",
    "Part 4의 쉬운 정보 문항은 정확도가 높음",
    "Part 5에서 입장과 경험을 연결하려는 시도가 있음",
    "전체적으로 응답 길이를 채우는 능력이 있음",
    "핵심 정보 자체를 놓치지 않으려는 태도가 좋음",
  ],
  weaknesses: [
    "Part 1에서 핵심 단어 발음과 강세가 불안정함",
    "Part 2에서 이미지와 정확히 맞는 동작/장소 표현이 부족함",
    "Part 4에서 고유명사, 시간, 이름을 정확히 말하지 못한 문항이 있음",
    "Part 5에서 문법 오류와 어색한 표현이 반복됨",
    "pause가 많아 말의 흐름이 끊겨 들리는 경향이 있음",
  ],
  recommended_practice: [
    "Part 1: 어려운 단어(예: community, professional, February, equipment)를 음절별로 먼저 연습한 뒤 문장으로 읽기",
    "Part 2: 한 장면을 '왼쪽-가운데-오른쪽' 순서로 3문장만 말하는 훈련하기",
    "Part 4: 숫자, 시간, 이름을 받아 적고 그대로 말하는 정보 복창 훈련하기",
    "Part 5: 'Opinion -> Reason -> Example -> Result' 4단계 템플릿으로 45~60초 말하기 연습하기",
    "녹음 후 pause가 많은 구간을 확인하고, 의미 단위로 끊어 읽는 연습하기",
  ],
  missing_questions: [],
  model_reasoning_summary:
    "점수는 각 파트의 공식형 채점 기준을 바탕으로, 내용 정확도와 발음/유창성을 함께 반영해 추정했습니다. Part 3와 Part 4의 강점을 반영해 점수를 올렸고, Part 1·2·5의 발음/문법 감점을 반영해 총점을 산정했습니다.",
  created_at: "2026-07-03T02:26:19.811309+00:00",
  updated_at: "2026-07-03T02:26:19.811309+00:00",
};

export const MOCK_EXAM_GRADING_RESULT = mapExamGradingResult(MOCK_EXAM_GRADING_RESULT_RAW);
