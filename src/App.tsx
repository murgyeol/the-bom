import {
  ArrowLeft,
  AudioLines,
  Copyright,
  Mail,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import trackData from "./data/tracks.json";
import type { PublicTrack, Track } from "./types";

const localTracks = (trackData as Track[]).map(({ objectKey: _objectKey, ...track }) => ({
  ...track,
  streamUrl: `/media/${encodeURIComponent(track.id)}`
}));

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function useAudioPlayer(tracks: PublicTrack[]) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.duration ?? 0);
  const [volume, setVolume] = useState(0.85);
  const [error, setError] = useState<string | null>(null);
  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    setDuration(currentTrack?.duration ?? 0);
    setCurrentTime(0);
    setError(null);
  }, [currentTrack]);

  const playAt = async (index: number) => {
    const audio = audioRef.current;
    if (!audio || !tracks[index]) return;

    if (index !== currentIndex) {
      setCurrentIndex(index);
      audio.src = tracks[index].streamUrl;
      audio.load();
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setError("음원을 불러오지 못했습니다. R2 업로드 상태를 확인해 주세요.");
    }
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) await playAt(currentIndex);
    else audio.pause();
  };

  const move = (step: number) => {
    if (!tracks.length) return;
    const nextIndex = (currentIndex + step + tracks.length) % tracks.length;
    void playAt(nextIndex);
  };

  return {
    audioRef,
    currentIndex,
    currentTrack,
    currentTime,
    duration,
    error,
    isPlaying,
    volume,
    move,
    playAt,
    setCurrentTime,
    setDuration,
    setError,
    setIsPlaying,
    setVolume,
    toggle
  };
}

function HomePage() {
  const [query, setQuery] = useState("");
  const player = useAudioPlayer(localTracks);
  const filteredTracks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    if (!normalized) return localTracks;
    return localTracks.filter((track) => track.title.toLocaleLowerCase("ko").includes(normalized));
  }, [query]);

  const seek = (value: number) => {
    if (!player.audioRef.current) return;
    player.audioRef.current.currentTime = value;
    player.setCurrentTime(value);
  };

  const changeVolume = (value: number) => {
    if (player.audioRef.current) player.audioRef.current.volume = value;
    player.setVolume(value);
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#track-list">곡 목록으로 건너뛰기</a>
      <main className="home" id="main-content">
        <header className="hero-copy">
          <p className="eyebrow">A private spring collection</p>
          <h1>그대를 바라 봄</h1>
          <p className="subtitle">우리들의 사랑이 봄처럼 머무는 곳</p>
        </header>

        <section className="turntable" aria-label="현재 재생 중인 곡">
          <div className={`record-stage ${player.isPlaying ? "is-playing" : ""}`}>
            <div className="record" aria-hidden="true">
              <div className="record-label">
                <span>THE BOM</span>
                <i />
                <small>SPRING ARCHIVE</small>
              </div>
            </div>
            <div className="record-shadow" />
          </div>

          <div className="now-playing-copy" aria-live="polite">
            <span>{player.isPlaying ? "지금 재생 중" : "선택된 곡"}</span>
            <strong>{player.currentTrack?.title ?? "재생할 곡을 선택하세요"}</strong>
          </div>

          <div className="transport-controls">
            <button type="button" onClick={() => player.move(-1)} aria-label="이전 곡">
              <SkipBack aria-hidden="true" />
            </button>
            <button className="primary-control" type="button" onClick={() => void player.toggle()} aria-label={player.isPlaying ? "일시 정지" : "재생"}>
              {player.isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => player.move(1)} aria-label="다음 곡">
              <SkipForward aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="collection" id="track-list" aria-labelledby="collection-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 id="collection-title">봄의 노래들</h2>
              <p>{localTracks.length}곡 · WAV &amp; MP3 고음질 스트리밍</p>
            </div>
            <label className="search-field">
              <Search aria-hidden="true" />
              <span className="sr-only">곡 검색</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="노래 제목 검색" type="search" />
            </label>
          </div>

          {player.error && <p className="error-message" role="alert">{player.error}</p>}

          <ol className="track-list">
            {filteredTracks.map((track) => {
              const actualIndex = localTracks.findIndex((item) => item.id === track.id);
              const isActive = actualIndex === player.currentIndex;
              return (
                <li key={track.id}>
                  <button className={`track-row ${isActive ? "is-active" : ""}`} type="button" onClick={() => void player.playAt(actualIndex)} aria-label={`${track.title} 재생`}>
                    <span className="track-number" aria-hidden="true">
                      {isActive && player.isPlaying ? <AudioLines /> : String(track.order).padStart(2, "0")}
                    </span>
                    <span className="track-copy">
                      <strong>{track.title}</strong>
                      <small>{track.artist} · {track.format.toUpperCase()}</small>
                    </span>
                    <span className="track-duration">{formatTime(track.duration)}</span>
                    <span className="row-play" aria-hidden="true">{isActive && player.isPlaying ? <Pause /> : <Play />}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {!filteredTracks.length && <p className="empty-message">검색 결과가 없습니다.</p>}
        </section>
      </main>

      <footer className="site-footer">
        <p>음악으로 기록한 한 사람의 봄.</p>
        <a href="/copyright">저작권 및 음원 사용 안내</a>
        <small>© 2026 정성원. All rights reserved.</small>
      </footer>

      <aside className={`player-dock ${player.currentTrack ? "is-visible" : ""}`} aria-label="오디오 플레이어">
        <audio
          ref={player.audioRef}
          src={player.currentTrack?.streamUrl}
          preload="metadata"
          onTimeUpdate={(event) => player.setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => player.setDuration(event.currentTarget.duration)}
          onPlay={() => player.setIsPlaying(true)}
          onPause={() => player.setIsPlaying(false)}
          onEnded={() => player.move(1)}
          onError={() => player.setError("음원을 재생할 수 없습니다. R2에 파일이 업로드되었는지 확인해 주세요.")}
        />
        <div className="dock-track">
          <span className="dock-art" aria-hidden="true"><i /></span>
          <span>
            <strong>{player.currentTrack?.title}</strong>
            <small>{player.currentTrack?.artist}</small>
          </span>
        </div>
        <div className="dock-controls">
          <button type="button" onClick={() => player.move(-1)} aria-label="이전 곡"><SkipBack /></button>
          <button className="dock-play" type="button" onClick={() => void player.toggle()} aria-label={player.isPlaying ? "일시 정지" : "재생"}>
            {player.isPlaying ? <Pause /> : <Play />}
          </button>
          <button type="button" onClick={() => player.move(1)} aria-label="다음 곡"><SkipForward /></button>
        </div>
        <div className="dock-progress">
          <span>{formatTime(player.currentTime)}</span>
          <input
            aria-label="재생 위치"
            type="range"
            min="0"
            max={player.duration || 0}
            step="0.1"
            value={Math.min(player.currentTime, player.duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            style={{ "--progress": `${player.duration ? (player.currentTime / player.duration) * 100 : 0}%` } as CSSProperties}
          />
          <span>{formatTime(player.duration)}</span>
        </div>
        <div className="volume-control">
          <button type="button" onClick={() => changeVolume(player.volume > 0 ? 0 : 0.85)} aria-label={player.volume > 0 ? "음소거" : "음소거 해제"}>
            {player.volume > 0 ? <Volume2 /> : <VolumeX />}
          </button>
          <input aria-label="음량" type="range" min="0" max="1" step="0.05" value={player.volume} onChange={(event) => changeVolume(Number(event.target.value))} />
        </div>
      </aside>
    </div>
  );
}

function CopyrightPage() {
  return (
    <div className="legal-page">
      <header className="legal-nav">
        <a className="wordmark" href="/">그대를 바라 봄</a>
        <a className="back-link" href="/"><ArrowLeft aria-hidden="true" /> 홈으로</a>
      </header>
      <main>
        <article className="legal-card">
          <header className="legal-title">
            <Copyright aria-hidden="true" />
            <p className="eyebrow">Copyright &amp; terms</p>
            <h1>저작권 및 음원 사용 안내</h1>
            <p>그대를 바라 봄의 음악과 기록을 소중히 지키기 위한 안내입니다.</p>
          </header>

          <section>
            <h2>Korean Notice</h2>
            <p>본 사이트에서 스트리밍되는 모든 음악(음원, 멜로디, 편곡, 가사 등)의 저작권은 <strong>정성원</strong>에게 있으며, 저작권법의 보호를 받습니다.</p>
            <ul>
              <li><strong>무단 배포 및 공유:</strong> 음원의 무단 다운로드, 타 사이트 재업로드 및 공유</li>
              <li><strong>2차적 저작물 작성:</strong> 가사 일부 또는 전체의 무단 도용, 무단 샘플링, 리믹스 및 편곡</li>
              <li><strong>상업적 이용:</strong> 허가받지 않은 배경음악 사용과 영상 매체에서의 수익 창출 목적 사용</li>
            </ul>
            <p className="legal-warning">위반 시 저작권법에 따라 민·형사상의 법적 책임을 질 수 있습니다.</p>
            <p>협업, 커버 곡 작업 또는 상업적 사용에 관한 문의는 아래 연락처로 부탁드립니다.</p>
            <a className="contact-link" href="mailto:murgyeol@gmail.com"><Mail aria-hidden="true" /> murgyeol@gmail.com</a>
          </section>

          <section lang="en">
            <h2>English Notice</h2>
            <p>All music, including audio tracks, melodies, arrangements, and lyrics streamed on this website, is the exclusive property of <strong>Jeong Seong-won</strong> and is protected by copyright laws.</p>
            <ul>
              <li><strong>Unauthorized distribution:</strong> Downloading, re-uploading, or sharing audio files on other platforms.</li>
              <li><strong>Derivative works:</strong> Unauthorized use of lyrics, sampling, remixing, or rearranging.</li>
              <li><strong>Commercial use:</strong> Using tracks as background music or in monetized media without a license.</li>
            </ul>
            <p className="legal-warning">Any violation may result in civil and criminal penalties under applicable copyright laws.</p>
            <p>For licensing, business inquiries, or collaborations, please contact:</p>
            <a className="contact-link" href="mailto:murgyeol@gmail.com"><Mail aria-hidden="true" /> murgyeol@gmail.com</a>
          </section>

          <footer>© 2026 정성원. All rights reserved.</footer>
        </article>
      </main>
    </div>
  );
}

export function App() {
  return window.location.pathname === "/copyright" ? <CopyrightPage /> : <HomePage />;
}

export { CopyrightPage, HomePage, formatTime };
