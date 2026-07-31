import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppQuestionFeedbackLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="font-jua min-h-dvh">{children}</div>;
}
