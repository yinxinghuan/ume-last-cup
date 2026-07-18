import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from './i18n';
import { playAllReady, playComplete, playFinish, playTap } from './sounds';
import './LastCupRun.less';

type ClipId = 'melon' | 'lemon' | 'guac' | 'mango' | 'pearl';
type Phase = 'idle' | 'playing' | 'holding' | 'climaxReady' | 'climaxPlaying' | 'revelation' | 'done';

interface Clip {
  id: ClipId;
  top: number;
  left: number;
  width: number;
  height: number;
  video: string;
  endFrame: string;
  labelKey: string;
  subtitleKey: string;
  dotColor: string;
}

const CLIPS: Clip[] = [
  { id: 'melon', top: 24, left: 2, width: 30, height: 35, video: 'clip_01_melon.mp4', endFrame: 'end_melon.png', labelKey: 'hotspot.melon', subtitleKey: 'sub.melon', dotColor: '#ee3d36' },
  { id: 'lemon', top: 35, left: 78, width: 22, height: 25, video: 'clip_02_lemon.mp4', endFrame: 'end_lemon.png', labelKey: 'hotspot.lemon', subtitleKey: 'sub.lemon', dotColor: '#ffd332' },
  { id: 'guac', top: 65, left: 0, width: 31, height: 24, video: 'clip_03_guac.mp4', endFrame: 'end_guac.png', labelKey: 'hotspot.guac', subtitleKey: 'sub.guac', dotColor: '#096b3b' },
  { id: 'mango', top: 68, left: 70, width: 30, height: 23, video: 'clip_04_mango.mp4', endFrame: 'end_mango.png', labelKey: 'hotspot.mango', subtitleKey: 'sub.mango', dotColor: '#ff9f24' },
  { id: 'pearl', top: 14, left: 74, width: 26, height: 23, video: 'clip_05_pearl.mp4', endFrame: 'end_pearl.png', labelKey: 'hotspot.pearl', subtitleKey: 'sub.pearl', dotColor: '#3a1d12' },
];

const SUBTITLE_DELAY_MS = 700;
const HOLD_AFTER_END_MS = 1500;
const VIDEO_FADE_MS = 450;
const FALLBACK_DURATION_MS = 3200;
const CLIMAX_SUBTITLE_DELAY_MS = 2800;
const REVELATION_HOLD_MS = 2800;

const mediaUrl = (folder: 'videos' | 'frames', name: string) => `${import.meta.env.BASE_URL}${folder}/${name}`;

function SoundIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m17 9 4 6m0-6-4 6" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9.5a4 4 0 0 1 0 5m2.5-7.5a7 7 0 0 1 0 10" /></svg>
  );
}

export default function LastCupRun() {
  const [seen, setSeen] = useState<Set<ClipId>>(new Set());
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [videoFallback, setVideoFallback] = useState(false);
  const [videoExiting, setVideoExiting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [justCompleted, setJustCompleted] = useState<ClipId | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const later = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
    return timer;
  }, []);

  const playClip = useCallback((clip: Clip) => {
    if (phase !== 'idle') return;
    clearTimers();
    playTap(!muted);
    setCurrentClip(clip);
    setSubtitleVisible(false);
    setVideoFallback(false);
    setVideoExiting(false);
    setJustCompleted(null);
    setPhase('playing');
    later(() => setSubtitleVisible(true), SUBTITLE_DELAY_MS);
  }, [clearTimers, later, muted, phase]);

  const finishClip = useCallback(() => {
    if (!currentClip || phase === 'holding') return;
    setPhase('holding');
    setSubtitleVisible(true);
    later(() => {
      setVideoExiting(true);
      setSubtitleVisible(false);
    }, HOLD_AFTER_END_MS - VIDEO_FADE_MS);
    later(() => {
      const firstView = !seen.has(currentClip.id);
      const next = new Set(seen);
      next.add(currentClip.id);
      const allReady = firstView && next.size === CLIPS.length;
      setSeen(next);
      if (firstView) {
        playComplete(!muted);
        setJustCompleted(currentClip.id);
        later(() => setJustCompleted(null), 700);
      }
      setCurrentClip(null);
      setVideoExiting(false);
      if (allReady) {
        later(() => {
          setPhase('climaxReady');
          playAllReady(!muted);
        }, 500);
      } else {
        setPhase('idle');
      }
    }, HOLD_AFTER_END_MS);
  }, [currentClip, later, muted, phase, seen]);

  const playClimax = useCallback(() => {
    if (phase !== 'climaxReady') return;
    clearTimers();
    playTap(!muted);
    setVideoFallback(false);
    setVideoExiting(false);
    setSubtitleVisible(false);
    setPhase('climaxPlaying');
    later(() => setSubtitleVisible(true), CLIMAX_SUBTITLE_DELAY_MS);
  }, [clearTimers, later, muted, phase]);

  const finishClimax = useCallback(() => {
    if (phase === 'revelation' || phase === 'done') return;
    setPhase('revelation');
    setSubtitleVisible(true);
    playFinish(!muted);
    later(() => {
      setSubtitleVisible(false);
      setPhase('done');
    }, REVELATION_HOLD_MS);
  }, [later, muted, phase]);

  const reset = useCallback(() => {
    clearTimers();
    playTap(!muted);
    setSeen(new Set());
    setPhase('idle');
    setCurrentClip(null);
    setSubtitleVisible(false);
    setVideoFallback(false);
    setVideoExiting(false);
    setJustCompleted(null);
  }, [clearTimers, muted]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    CLIPS.forEach((clip) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = mediaUrl('videos', clip.video);
    });
  }, []);

  useEffect(() => {
    if (!videoFallback) return;
    if (phase === 'playing') {
      const timer = window.setTimeout(finishClip, FALLBACK_DURATION_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === 'climaxPlaying') {
      const timer = window.setTimeout(finishClimax, FALLBACK_DURATION_MS + 900);
      return () => window.clearTimeout(timer);
    }
  }, [finishClimax, finishClip, phase, videoFallback]);

  const showingClip = (phase === 'playing' || phase === 'holding') && currentClip !== null;
  const showingClimax = phase === 'climaxPlaying' || phase === 'revelation';
  const activeVideo = showingClip && currentClip
    ? mediaUrl('videos', currentClip.video)
    : showingClimax
      ? mediaUrl('videos', 'clip_06_climax.mp4')
      : null;
  const activeFrame = showingClip && currentClip
    ? mediaUrl('frames', currentClip.endFrame)
    : showingClimax
      ? mediaUrl('frames', 'end_climax.png')
      : null;
  const activeSubtitle = subtitleVisible && currentClip
    ? t(currentClip.subtitleKey)
    : subtitleVisible && showingClimax
      ? t('sub.climax')
      : null;

  const progressLabel = useMemo(() => t('progress', { n: seen.size }), [seen.size]);

  return (
    <main className={`ulc ulc--${phase}`}>
      <section className="ulc-stage" aria-label={t('title.main')}>
        <img className="ulc-hero" src={`${import.meta.env.BASE_URL}hero.png`} alt="" draggable={false} />

        {activeVideo && !videoFallback && (
          <video
            key={activeVideo}
            className={`ulc-video ${videoExiting ? 'is-exiting' : ''}`}
            src={activeVideo}
            poster={`${import.meta.env.BASE_URL}hero.png`}
            playsInline
            autoPlay
            preload="auto"
            muted={muted}
            onEnded={showingClimax ? finishClimax : finishClip}
            onError={() => setVideoFallback(true)}
          />
        )}

        {videoFallback && activeFrame && (
          <img className={`ulc-video ulc-video--fallback ${videoExiting ? 'is-exiting' : ''}`} src={activeFrame} alt="" draggable={false} />
        )}

        <header className="ulc-brandbar">
          <div className="ulc-brandmark" aria-label="UMe">UMe</div>
          <button
            type="button"
            className="ulc-iconbtn"
            onClick={() => setMuted((value) => !value)}
            aria-label={muted ? t('sound.off') : t('sound.on')}
          >
            <SoundIcon muted={muted} />
          </button>
        </header>

        {phase === 'idle' && seen.size === 0 && (
          <div className="ulc-title">
            <span>{t('title.eyebrow')}</span>
            <h1>{t('title.main')}</h1>
            <p>{t('hint.first')}</p>
          </div>
        )}

        {phase === 'idle' && CLIPS.map((clip, index) => {
          const completed = seen.has(clip.id);
          return (
            <div
              key={clip.id}
              className={`ulc-hotspot-wrap ${completed ? 'is-complete' : ''}`}
              style={{ top: `${clip.top}%`, left: `${clip.left}%`, width: `${clip.width}%`, height: `${clip.height}%` }}
            >
              <span className="ulc-ripple" style={{ '--dot-color': clip.dotColor } as React.CSSProperties}><i /></span>
              <button
                type="button"
                className="ulc-hotspot"
                aria-label={t(clip.labelKey)}
                onPointerDown={(event) => {
                  event.preventDefault();
                  playClip(clip);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    playClip(clip);
                  }
                }}
              />
              {completed && <span className="ulc-check" aria-hidden="true">{index + 1}</span>}
            </div>
          );
        })}

        {phase === 'climaxReady' && (
          <div className="ulc-climax">
            <span>{t('climax.ready')}</span>
            <button type="button" onPointerDown={playClimax} onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                playClimax();
              }
            }}>{t('climax.button')}</button>
          </div>
        )}

        {videoFallback && showingClip && (
          <div className="ulc-fallback-note" role="status">{t('video.fallback')}</div>
        )}

        {activeSubtitle && <div className="ulc-subtitle" role="status">{activeSubtitle}</div>}

        {justCompleted && <div className="ulc-pearls" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>}

        {phase === 'done' && (
          <div className="ulc-result">
            <img className="ulc-result__bg" src={mediaUrl('frames', 'result_delivered.png')} alt="" draggable={false} />
            <span>{t('done.eyebrow')}</span>
            <h2>{t('done.title')}</h2>
            <p>{t('done.body')}</p>
            <button type="button" onPointerDown={reset} onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                reset();
              }
            }}>{t('done.again')}</button>
          </div>
        )}

        {phase !== 'done' && (
          <footer className="ulc-progress" aria-label={progressLabel}>
            <span>{progressLabel}</span>
            <div>
              {CLIPS.map((clip) => <i key={clip.id} className={seen.has(clip.id) ? 'is-lit' : ''} style={{ '--dot-color': clip.dotColor } as React.CSSProperties} />)}
            </div>
          </footer>
        )}
      </section>
    </main>
  );
}
