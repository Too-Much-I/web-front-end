export interface ExamPartDirections {
  title: string;
  lines: string[];
  /** Narrated instructions audio. Undefined until the real file is produced. */
  audioUrl?: string;
}

export const EXAM_PART_DIRECTIONS: Record<number, ExamPartDirections> = {
  1: {
    title: "Questions 1–2 : Read a text aloud",
    lines: [
      "Directions: In this part of the test, you will read aloud the text on the screen.",
      "You will have 45 seconds to prepare.",
      "Then you will have 45 seconds to read the text aloud.",
    ],
    audioUrl: "/assets/audio/Part1_Directions.wav",
  },
  2: {
    title: "Questions 3–4 : Describe a picture",
    lines: [
      "Directions: In this part of the test, you will describe the picture on your screen in as much detail as you can. You will have 45 seconds to prepare your response.",
      "Then you will have 30 seconds to speak about the picture.",
    ],
    audioUrl: "/assets/audio/Part2_Directions.wav",
  },
  3: {
    title: "Questions 5-7: Respond to questions",
    lines: [
      "Directions: In this part of the test, you will answer three questions.",
      "You will have three seconds to prepare after you hear each question.",
      "You will have 15 seconds to respond to questions 5 and 6, and 30 seconds to respond to question 7.",
    ],
    audioUrl: "/assets/audio/part3_intro.wav",
  },
  4: {
    title: "Question 8-10: Respond to Questions Using Information Provided",
    lines: [
      "Directions: In this part of the test, you will answer three questions based on the information provided. You will have 45 seconds to read the information before the questions begin. You will have three seconds to prepare and 15 seconds to respond to Question 8 and 9. You will hear Question 10 two times. You will have three seconds to prepare and 30 seconds to respond to question 10.",
    ],
    audioUrl: "/assets/audio/Part4_Directions.wav",
  },
  5: {
    title: "Question 11: Express an Opinion",
    lines: [
      "Directions: In this part of the test, you will give your opinion about a specific topic.",
      "Be sure to say as much as you can in the time allowed.",
      "You will have 45 seconds to prepare. Then you will have 60 seconds to speak.",
    ],
    audioUrl: "/assets/audio/Part5_Directions.wav",
  },
};

export function getExamPartDirections(partNumber: number): ExamPartDirections | undefined {
  return EXAM_PART_DIRECTIONS[partNumber];
}
