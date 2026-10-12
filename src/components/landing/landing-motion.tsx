"use client";
import { useEffect } from "react";

/** Only the landing owns these observers; route changes release every listener. */
export function LandingMotion() {
  useEffect(() => {
    const element = document.getElementById("download-landing");
    if (!element) return;
    const root: HTMLElement = element;

    const observers: IntersectionObserver[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("waiting");
              revealObserver.unobserve(entry.target);
            }
          }),
        { threshold: 0.08 },
      );
      observers.push(revealObserver);
      root.querySelectorAll<HTMLElement>(".reveal").forEach((section) => {
        section.classList.add("waiting");
        revealObserver.observe(section);
      });
      const mobileBar = root.querySelector<HTMLElement>(".mobile-bar")!;
      let heroVisible = true;
      let downloadVisible = false;
      const updateBar = () => {
        const visible = !heroVisible && !downloadVisible;
        mobileBar.classList.toggle("visible", visible);
        mobileBar.inert = !visible;
      };
      const heroObserver = new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        updateBar();
      });
      heroObserver.observe(root.querySelector<HTMLElement>(".hero")!);
      observers.push(heroObserver);
      const downloadObserver = new IntersectionObserver((entries) => {
        downloadVisible = entries[0].isIntersecting;
        updateBar();
      });
      downloadObserver.observe(root.querySelector<HTMLElement>("#download")!);
      observers.push(downloadObserver);
    }
    const storyScenes = [...root.querySelectorAll<HTMLElement>(".story-scene")];
    const floatingHeadings = [
      ...root.querySelectorAll<HTMLElement>(".download-copy"),
    ];
    const introMessage = root.querySelector<HTMLElement>(".intro-message")!;
    const compactHeight = window.matchMedia("(max-height: 680px)");
    const narrowViewport = window.matchMedia("(max-width: 700px)");
    const clampProgress = (value: number) => Math.max(0, Math.min(1, value));
    const easeProgress = (value: number) =>
      1 - Math.pow(1 - clampProgress(value), 3);
    function introValues(top: number, height: number, narrow = false) {
      const progress = clampProgress((height * 0.9 - top) / (height * 0.6));
      const eased = progress * progress * (3 - 2 * progress);
      return {
        "--intro-y": `${(1 - eased) * (narrow ? 64 : 100)}px`,
        "--intro-scale": 0.68 + eased * 0.32,
        "--intro-opacity": 0.35 + eased * 0.65,
      };
    }
    function sceneValues(rect: DOMRect, height: number, narrow = false) {
      const progress = clampProgress(
        (height * 0.58 - rect.top) / (rect.height - height * 0.42),
      );
      const text = easeProgress(progress / 0.54);
      const drift = clampProgress((progress - 0.35) / 0.65);
      const second = easeProgress((progress - 0.08) / 0.56);
      const detail = easeProgress((progress - 0.3) / 0.38);
      return {
        "--text-opacity": text,
        "--text-y": `${(1 - text) * (narrow ? 64 : 110) - drift * (narrow ? 14 : 24)}px`,
        "--second-opacity": second,
        "--second-y": `${(1 - second) * (narrow ? 76 : 125) - drift * (narrow ? 14 : 24)}px`,
        "--phone-scale": 0.82 + text * 0.18 - detail * 0.1,

        "--phone-x": `${detail * (narrow ? 20 : 38)}px`,
        "--phone-opacity": 1 - detail * 0.27,
        "--detail-opacity": detail,
        "--detail-x": `${(1 - detail) * (narrow ? 36 : 90)}px`,
        "--detail-y": `${(1 - detail) * (narrow ? 40 : 75)}px`,
        "--detail-scale": 0.48 + detail * 0.62,
      };
    }
    let scrollFrame = 0;
    function paintScenes() {
      scrollFrame = 0;
      if (!root.classList.contains("motion-ready")) return;
      const height = window.innerHeight;
      const introRect = introMessage.parentElement!.getBoundingClientRect();
      Object.entries(
        introValues(introRect.top, height, narrowViewport.matches),
      ).forEach(([key, value]) => {
        introMessage.style.setProperty(key, String(value));
      });
      floatingHeadings.forEach((heading) => {
        const rect = heading.parentElement!.getBoundingClientRect();
        const progress = clampProgress(
          (height * 0.9 - rect.top) / (height * 0.7),
        );
        heading.style.setProperty(
          "--heading-y",
          `${(1 - progress) * (narrowViewport.matches ? 56 : 100)}px`,
        );
        heading.style.setProperty(
          "--heading-opacity",
          String(Math.min(1, 0.2 + progress * 1.6)),
        );
      });
      storyScenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom < -height || rect.top > height * 2) return;
        const values = sceneValues(rect, height, narrowViewport.matches);
        Object.entries(values).forEach(([key, value]) =>
          scene.style.setProperty(key, String(value)),
        );
      });
    }
    function queueScenes() {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScenes);
    }
    function syncMotion() {
      root.classList.toggle(
        "motion-ready",
        !reducedMotion.matches && !compactHeight.matches,
      );
      queueScenes();
    }
    window.addEventListener("scroll", queueScenes, { passive: true });
    window.addEventListener("resize", syncMotion, { passive: true });
    window.addEventListener("pageshow", syncMotion);
    reducedMotion.addEventListener("change", syncMotion);
    compactHeight.addEventListener("change", syncMotion);
    narrowViewport.addEventListener("change", syncMotion);
    let disposed = false;
    if (document.fonts)
      void document.fonts.ready.then(() => {
        if (!disposed) syncMotion();
      });
    syncMotion();
    const downloadVideo =
      root.querySelector<HTMLVideoElement>("#download-video")!;
    let videoVisible = false;
    function syncVideoPlayback() {
      if (!videoVisible || document.hidden || reducedMotion.matches) {
        downloadVideo.pause();
        return;
      }
      downloadVideo.play().catch(() => {});
    }
    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(
        ([entry]) => {
          videoVisible =
            entry.isIntersecting && entry.intersectionRatio >= 0.15;
          syncVideoPlayback();
        },
        { threshold: 0.15 },
      );
      videoObserver.observe(downloadVideo);
      observers.push(videoObserver);
    }
    document.addEventListener("visibilitychange", syncVideoPlayback);
    reducedMotion.addEventListener("change", syncVideoPlayback);

    return () => {
      disposed = true;
      cancelAnimationFrame(scrollFrame);
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener("scroll", queueScenes);
      window.removeEventListener("resize", syncMotion);
      window.removeEventListener("pageshow", syncMotion);
      reducedMotion.removeEventListener("change", syncMotion);
      compactHeight.removeEventListener("change", syncMotion);
      narrowViewport.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVideoPlayback);
      reducedMotion.removeEventListener("change", syncVideoPlayback);
      downloadVideo.pause();
      root.classList.remove("motion-ready");
      root
        .querySelectorAll(".waiting")
        .forEach((el) => el.classList.remove("waiting"));
    };
  }, []);
  return null;
}
