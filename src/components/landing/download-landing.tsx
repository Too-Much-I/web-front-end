/* Approved presentation crops are served unchanged, including embedded SVG images. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/site-config";
import { JsonLd } from "@/components/json-ld";
import { LandingMotion } from "./landing-motion";
import "./landing.css";

export function DownloadLanding() {
  return (
    <div className="download-landing" id="download-landing">
      <LandingMotion />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "어떤 기기에서 사용할 수 있나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "iPhone과 Android 휴대폰에서 이용할 수 있어요. 기기별 지원 버전과 호환성은 각 스토어의 토선생 앱 페이지에서 확인해 주세요.",
              },
            },
            {
              "@type": "Question",
              name: "AI 예상 점수는 실제 시험 점수인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "AI 분석 결과는 연습을 돕는 예상 점수예요. 실제 토익스피킹 시험 결과를 보장하지 않으며, 부족한 부분과 연습 방향을 확인하는 데 활용할 수 있어요.",
              },
            },
            {
              "@type": "Question",
              name: "피드백을 받은 다음에는 무엇을 하나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "파트별 결과와 문항별 피드백을 살펴본 뒤 다시 답변해 보세요. 이전 답변과 비교하면서 어떤 부분이 달라졌는지 확인할 수 있어요.",
              },
            },
          ],
        }}
      />

      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
      >
        <defs>
          <symbol id="apple" viewBox="0 0 24 24">
            <path d="M17.1 12.3c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.8.9-3.5.9-.8 0-1.9-.9-3.1-.9-1.6 0-3.1 1-3.9 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.1 1.7 2.3 2.9 2.3 1.1-.1 1.6-.8 3-.8 1.4 0 1.8.8 3 .8s2-1.1 2.8-2.2c.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.3-.9-2.3-4.2ZM14.8 5.5c.7-.9 1.2-2.1 1.1-3.3-1 .1-2.3.7-3 1.6-.6.7-1.2 2-1.1 3.1 1.2.1 2.3-.6 3-1.4Z" />
          </symbol>
          <symbol id="play" viewBox="0 0 24 24">
            <path d="m3.7 2.4 10.8 9.5L3.7 21.5c-.4-.3-.7-.8-.7-1.5V4c0-.7.3-1.3.7-1.6ZM15.6 10.9 6 2.4l12.2 6.9-2.6 1.6Zm1.1 1 3.3-1.8c1.5.8 1.5 2.8 0 3.6l-3.3-1.8Zm-1.1 1.1 2.6 1.5L6 21.4l9.6-8.4Z" />
          </symbol>
        </defs>
      </svg>
      <header className="site-header" id="top">
        <div className="header wrap">
          <a className="brand" href="#top" aria-label="토선생 처음으로">
            <img src="/download-landing/logo.png" alt="" />
            토선생
          </a>
          <nav className="nav" aria-label="주 메뉴">
            <a href="#features">서비스 소개</a>
            <a href="#faq">자주 묻는 질문</a>
            <Link href="/guide/toeic-speaking-parts">토익 스피킹 가이드</Link>
            <Link href="/blog">블로그</Link>
            <Link href="/contact">문의하기</Link>
          </nav>
          <a className="nav-cta" href="#download">
            <span>앱 다운로드</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />
            </svg>
          </a>
        </div>
      </header>
      <main>
        <div className="top">
          <section className="hero wrap" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">토익 스피킹 AI 모의고사</p>
              <h1 id="hero-title">
                응시료 84,000원 내기 전에
                <br />
                <em>내 등급</em>부터 확인하세요
              </h1>
              <p className="hero-summary">
                실전처럼 말하고, 예상 점수와 등급을 확인하세요.
                <br />
                AI가 짚어주는 감점 이유로 다음 연습의 방향을 잡아보세요.
              </p>
              <div className="stores" id="hero-stores">
                <a
                  className="store"
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="App Store에서 토선생 다운로드 (새 탭)"
                >
                  <svg aria-hidden="true">
                    <use href="#apple" />
                  </svg>
                  <span>
                    <small>Download on the</small>App Store
                  </span>
                </a>
                <a
                  className="store secondary"
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Play에서 토선생 다운로드 (새 탭)"
                >
                  <svg aria-hidden="true">
                    <use href="#play" />
                  </svg>
                  <span>
                    <small>GET IT ON</small>Google Play
                  </span>
                </a>
              </div>
            </div>
            <div className="hero-art">
              <img
                src="/download-landing/phones-light.svg"
                alt="토선생 앱의 모의고사 홈과 파트별 점수 분석을 보여주는 두 대의 휴대폰"
                width="1030"
                height="1090"
                fetchPriority="high"
              />
            </div>
          </section>
        </div>
        <section className="story-intro wrap" id="features">
          <div className="intro-message">
            <h2>
              <span>점수만 보고 끝내기엔,</span>
              <br />
              <em>내 답변이 아까우니까.</em>
            </h2>
            <p>알고, 고치고, 다시 말하는 연습.</p>
          </div>
        </section>
        <section
          className="story-scene scene-score"
          id="story-score"
          aria-labelledby="title-score"
        >
          <div className="scene-sticky">
            <div className="scene-inner wrap">
              <div className="scene-copy">
                <p className="scene-label">
                  01 <span>내 실력 확인</span>
                </p>
                <h2 id="title-score">
                  <span className="word-line">내 등급과 약점,</span>
                  <span className="word-line">
                    <em>한눈에 확인</em>
                  </span>
                </h2>
                <p className="scene-description">
                  실전처럼 말한 뒤, 예상 점수와 등급, 피드백을 확인하세요.
                  <br />
                  목표 등급에 얼마나 가까이 왔는지 확인하고 다음 학습을
                  결정해요.
                </p>
                <a className="scene-download" href="#download">
                  토선생 앱에서 시작하기 <span aria-hidden="true">↗</span>
                </a>
              </div>
              <figure className="scene-visual">
                <span className="scene-orbit" aria-hidden="true"></span>
                <div className="scene-phone">
                  <img
                    src="/download-landing/score.png"
                    width="780"
                    height="1475"
                    alt="토선생 내 실력 확인 실제 앱 화면"
                    loading="lazy"
                  />
                </div>
                <div className="scene-detail" aria-hidden="true">
                  <img
                    src="/download-landing/score-detail.svg"
                    width="730"
                    height="900"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>
        <section
          className="story-scene scene-feedback"
          id="story-feedback"
          aria-labelledby="title-feedback"
        >
          <div className="scene-sticky">
            <div className="scene-inner wrap">
              <div className="scene-copy">
                <p className="scene-label">
                  02 <span>파트별 피드백</span>
                </p>
                <h2 id="title-feedback">
                  <span className="word-line">어디가 부족한지,</span>
                  <span className="word-line">
                    <em>파트별로 설명.</em>
                  </span>
                </h2>
                <p className="scene-description">
                  총점 하나로는 알 수 없었던 내 답변의 빈틈.
                  <br />
                  파트별 피드백에서 문항별 결과까지, 연습할 곳을 찾아보세요.
                </p>
                <a className="scene-download" href="#download">
                  토선생 앱에서 시작하기 <span aria-hidden="true">↗</span>
                </a>
              </div>
              <figure className="scene-visual">
                <span className="scene-orbit" aria-hidden="true"></span>
                <div className="scene-phone">
                  <img
                    src="/download-landing/feedback.png"
                    width="780"
                    height="1536"
                    alt="토선생 파트별 피드백 실제 앱 화면"
                    loading="lazy"
                  />
                </div>
                <div className="scene-detail" aria-hidden="true">
                  <img
                    src="/download-landing/feedback-detail.svg"
                    width="710"
                    height="425"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>
        <section
          className="story-scene scene-pronunciation"
          id="story-pronunciation"
          aria-labelledby="title-pronunciation"
        >
          <div className="scene-sticky">
            <div className="scene-inner wrap">
              <div className="scene-copy">
                <p className="scene-label">
                  03 <span>발음 분석</span>
                </p>
                <h2 id="title-pronunciation">
                  <span className="word-line">잘못 발음한 단어,</span>
                  <span className="word-line">
                    <em>다시 들어볼까요?</em>
                  </span>
                </h2>
                <p className="scene-description">
                  놓쳤던 발음을 색으로 확인하고, 해당 구간을 다시 들어요.
                  <br />
                  해당 문장을 다음 연습에서 다시 말해봐요.
                </p>
                <a className="scene-download" href="#download">
                  토선생 앱에서 시작하기 <span aria-hidden="true">↗</span>
                </a>
              </div>
              <figure className="scene-visual">
                <span className="scene-orbit" aria-hidden="true"></span>
                <div className="scene-phone">
                  <img
                    src="/download-landing/pronunciation.png"
                    width="780"
                    height="1341"
                    alt="토선생 발음 분석 실제 앱 화면"
                    loading="lazy"
                  />
                </div>
                <div className="scene-detail" aria-hidden="true">
                  <img
                    src="/download-landing/pronunciation-detail.svg"
                    width="627"
                    height="390"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>
        <section
          className="story-scene scene-retry"
          id="story-retry"
          aria-labelledby="title-retry"
        >
          <div className="scene-sticky">
            <div className="scene-inner wrap">
              <div className="scene-copy">
                <p className="scene-label">
                  04 <span>재답변 비교</span>
                </p>
                <h2 id="title-retry">
                  <span className="word-line">한 번 더 말하면,</span>
                  <span className="word-line">
                    <em>변화가 보여요.</em>
                  </span>
                </h2>
                <p className="scene-description">
                  피드백을 읽는 데서 끝내지 마세요.
                  <br />
                  다시 답변하면서 성장해가는 내 모습을 확인할 수 있어요.
                </p>
                <a className="scene-download" href="#download">
                  토선생 앱에서 시작하기 <span aria-hidden="true">↗</span>
                </a>
              </div>
              <figure className="scene-visual">
                <span className="scene-orbit" aria-hidden="true"></span>
                <div className="scene-phone">
                  <img
                    src="/download-landing/retry.png"
                    width="780"
                    height="1454"
                    alt="토선생 재답변 비교 실제 앱 화면"
                    loading="lazy"
                  />
                </div>
                <div className="scene-detail" aria-hidden="true">
                  <img
                    src="/download-landing/retry-detail.svg"
                    width="715"
                    height="330"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>
        <section
          className="story-scene scene-history"
          id="story-history"
          aria-labelledby="title-history"
        >
          <div className="scene-sticky">
            <div className="scene-inner wrap">
              <div className="scene-copy">
                <p className="scene-label">
                  05 <span>모의고사 기록</span>
                </p>
                <h2 id="title-history">
                  <span className="word-line">쌓이는 연습이,</span>
                  <span className="word-line">
                    <em>나의 기록으로.</em>
                  </span>
                </h2>
                <p className="scene-description">
                  흩어져 있던 연습을 한곳에 모아 보세요.
                  <br />
                  회차별 점수 기록을 살펴보며 다음 연습을 이어가세요.
                </p>
                <a className="scene-download" href="#download">
                  토선생 앱에서 시작하기 <span aria-hidden="true">↗</span>
                </a>
              </div>
              <figure className="scene-visual">
                <span className="scene-orbit" aria-hidden="true"></span>
                <div className="scene-phone">
                  <img
                    src="/download-landing/history.png"
                    width="780"
                    height="1475"
                    alt="토선생 모의고사 기록 실제 앱 화면"
                    loading="lazy"
                  />
                </div>
                <div className="scene-detail" aria-hidden="true">
                  <img
                    src="/download-landing/history-detail.svg"
                    width="730"
                    height="470"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>
        <section
          className="download-section"
          id="download"
          aria-labelledby="download-title"
        >
          <div className="cta-block wrap">
            <div className="download-copy">
              <h2 id="download-title">
                다음 답변은,
                <br />
                지금보다 자신 있게.
              </h2>
              <p>
                내 손안의 토익스피킹 선생님, 토선생.
                <br />
                지금 앱에서 첫 연습을 시작해 보세요.
              </p>
              <div className="stores">
                <a
                  className="store"
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="App Store에서 토선생 다운로드 (새 탭)"
                >
                  <svg aria-hidden="true">
                    <use href="#apple" />
                  </svg>
                  <span>
                    <small>Download on the</small>App Store
                  </span>
                </a>
                <a
                  className="store"
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Play에서 토선생 다운로드 (새 탭)"
                >
                  <svg aria-hidden="true">
                    <use href="#play" />
                  </svg>
                  <span>
                    <small>GET IT ON</small>Google Play
                  </span>
                </a>
              </div>
            </div>
            <video
              className="download-video"
              id="download-video"
              width="1280"
              height="720"
              loop
              muted
              playsInline
              disablePictureInPicture
              preload="metadata"
              poster="/download-landing/speaking-poster.jpg"
              aria-label="토선생 캐릭터들의 토익스피킹 연습 영상"
            >
              <source src="/hero/speaking.webm" type="video/webm" />
              <source src="/hero/speaking.mp4" type="video/mp4" />
              <Link href="/hero/speaking.mp4">영상 열기</Link>
            </video>
          </div>
        </section>
        <section
          className="faq wrap reveal"
          id="faq"
          aria-labelledby="faq-title"
        >
          <div>
            <p className="section-kicker">자주 묻는 질문</p>
            <h2 id="faq-title">궁금한 점이 있나요?</h2>
          </div>
          <div>
            <details>
              <summary>어떤 기기에서 사용할 수 있나요?</summary>
              <p>
                iPhone과 Android 휴대폰에서 이용할 수 있어요. 기기별 지원 버전과
                호환성은 각 스토어의 토선생 앱 페이지에서 확인해 주세요.
              </p>
            </details>
            <details>
              <summary>AI 예상 점수는 실제 시험 점수인가요?</summary>
              <p>
                AI 분석 결과는 연습을 돕는 예상 점수예요. 실제 토익스피킹 시험
                결과를 보장하지 않으며, 부족한 부분과 연습 방향을 확인하는 데
                활용할 수 있어요.
              </p>
            </details>
            <details>
              <summary>피드백을 받은 다음에는 무엇을 하나요?</summary>
              <p>
                파트별 결과와 문항별 피드백을 살펴본 뒤 다시 답변해 보세요. 이전
                답변과 비교하면서 어떤 부분이 달라졌는지 확인할 수 있어요.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <span>© 2026 토선생. All rights reserved.</span>
          <nav aria-label="하단 메뉴">
            <a href="#features">서비스 소개</a>
            <a href="#download">다운로드</a>
            <a href="#faq">자주 묻는 질문</a>
            <Link href="/terms">이용약관</Link>
            <Link href="/privacy">개인정보처리방침</Link>
            <Link href="/contact">문의하기</Link>
          </nav>
        </div>
      </footer>
      <aside className="mobile-bar" aria-label="앱 다운로드 바로가기" inert>
        <div>
          <strong>토선생과 다음 등급으로</strong>
          <small>내 손안의 토익스피킹 코치</small>
        </div>
        <a href="#download">앱 다운로드 ↗</a>
      </aside>
    </div>
  );
}
