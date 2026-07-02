import { mapExamSession } from "@/features/exam/map-exam-session";
import type { RawExamSession } from "@/types/exam";

const HIKING_CONFERENCE_TABLE = {
  title: "Regional Conference of the Urban Hiking Association",
  location: "Hilltop Convention Center",
  date: "March 15th",
  fee: "$50",
  items: [
    { time: "10:00–10:30 A.M.", session_title: "Registration", speaker: null },
    {
      time: "10:30–11:00 A.M.",
      session_title: "Getting Started with Hiking",
      speaker: "Laura Kim",
    },
    {
      time: "11:00 A.M.–noon",
      session_title: "Hiking for Health",
      speaker: "David Chen",
    },
    {
      time: "Noon–1:00 P.M.",
      session_title: "Lunch",
      note: "provided by Green Trail Café",
      speaker: null,
    },
    {
      time: "1:00–2:00 P.M.",
      session_title: "Choosing the Best Equipment",
      speaker: "Sophia Lee",
    },
    {
      time: "2:00–3:00 P.M.",
      session_title: "Finding the Right Trails",
      speaker: "Michael Park",
    },
    {
      time: "3:00–5:00 P.M.",
      session_title: "Using Equipment for Safe Hiking",
      speaker: "Ethan Johnson",
    },
  ],
};

export const MOCK_EXAM_SESSION_RAW: RawExamSession = {
  mock_exam_id: "mock_exam_001",
  title: "토선생 모의고사 1회",
  questions: [
    {
      part_number: 1,
      question_number: 1,
      reference_text:
        "The Kingswood Community Center is recruiting volunteers. If you are looking for a way to get more involved in the community, now is your chance. This year, volunteers will be asked to tutor students, assist the elderly, and help organize social events and special projects. Visit our office today to fill out a volunteer form.",
    },
    {
      part_number: 1,
      question_number: 2,
      reference_text:
        "Garden Gate Magazine is pleased to announce its spring landscaping contest. It is open to beginner, experienced, and professional gardeners. To enter, please submit three photographs of your recent landscaping project. Also, write a brief description of each photograph and send them to us along with the completed entry form by February 14th.",
    },
    {
      part_number: 2,
      question_number: 3,
      image_url: "https://images.pexels.com/photos/5864293/pexels-photo-5864293.jpeg",
    },
    {
      part_number: 2,
      question_number: 4,
      image_url: "https://images.pexels.com/photos/7972311/pexels-photo-7972311.jpeg",
    },
    {
      part_number: 3,
      question_number: 5,
      question: "When was the last time you cooked, and what did you make?",
      audio_url: "/assets/audio/Part3_Q5.wav",
    },
    {
      part_number: 3,
      question_number: 6,
      question: "Do you plan to buy a new cooking tool in the near future? Why or why not?",
      audio_url: "/assets/audio/Part3_Q6.wav",
    },
    {
      part_number: 3,
      question_number: 7,
      question:
        "Do you think reading a cookbook is a good way to learn how to cook? Why or why not?",
      audio_url: "/assets/audio/Part3_Q7.wav",
    },
    {
      part_number: 4,
      question_number: 8,
      question: "Where will the conference be held, and how much is the participation fee?",
      table_context: HIKING_CONFERENCE_TABLE,
      audio_url: "/assets/audio/Part4_Q8.wav",
    },
    {
      part_number: 4,
      question_number: 9,
      question: "What should I do about lunch? Do I need to prepare my own meal?",
      table_context: HIKING_CONFERENCE_TABLE,
      audio_url: "/assets/audio/Part4_Q9.wav",
    },
    {
      part_number: 4,
      question_number: 10,
      question:
        "I am very interested in hiking equipment. Could you provide more detailed information about the session related to equipment?",
      table_context: HIKING_CONFERENCE_TABLE,
      audio_url: "/assets/audio/Part4_Q10.wav",
    },
    {
      part_number: 5,
      question_number: 11,
      question:
        "If you receive a gift that you don't really want to keep, do you think it's okay to give it to someone else? Why or why not? Give reasons or examples to support your opinion.",
      audio_url: "/assets/audio/Part5_Q11.wav",
    },
  ],
};

export const MOCK_EXAM_SESSION = mapExamSession(MOCK_EXAM_SESSION_RAW);
