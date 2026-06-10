import {
  useState,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import coverImg from "./assets/nana.png";
import backCoverImg from "./assets/kaka.png";
import charChild from "./assets/아이.png";
import charTeen from "./assets/청소년.png";
import charYoung from "./assets/청년.png";
import charMiddle from "./assets/중년.png";
import charOld from "./assets/노인.png";
import charGrandpa from "./assets/할아버지.png";
import vnBg from "./assets/벽돌.jpg";
import sfxHammer from "./assets/망치질.mp3";
import sfxWrong from "./assets/틀림.mp3";
import sfxSelect from "./assets/선택.mp3";
import sfxPageFlip from "./assets/책넘김.mp3";
import sfxCorrect from "./assets/정답.mp3";
import sfxClean from "./assets/닦기.mp3";
import sfxJump from "./assets/점프.mp3";
import bgmSrc from "./assets/브금수정.mp3";
import tree1m from "./assets/1m.png";
import tree3m from "./assets/3m.png";
import tree5m from "./assets/5m.png";
import tree7m from "./assets/7m.png";
import tree9m from "./assets/9m.png";
import tree10m from "./assets/10m.png";
import tree10mAfter from "./assets/10m끝난뒤.png";
import shoeBlack from "./assets/검은구두.png";
import shoeBrown from "./assets/갈색구두.png";
import shoeSneaker from "./assets/운동화.png";
import shoeBasket from "./assets/농구화.png";
import shoeNurse from "./assets/간호사신발.png";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://uvveffiuekvjmbqhlqnt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dmVmZml1ZWt2am1icWhscW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTIwNTgsImV4cCI6MjA5NDI2ODA1OH0.pBKdyDAr_Tb-COFzkGCweyAHVb-VTWJjrQm2Cbmn9Hc"
);

// ==================== AUDIO ====================
let _vol = 1;
let _muted = false;
let _musicOn = true;
let _bgm = null;
let _audioCtx = null;
const _buffers = {};

const syncBgmVolume = () => {
  if (!_bgm) return;
  _bgm.volume = _muted ? 0 : Math.min(1, _vol * 0.7);
};
const startBgm = () => {
  if (!_bgm) return;
  syncBgmVolume();
  _bgm.play().catch(() => {});
};
const stopBgm = () => {
  if (!_bgm) return;
  _bgm.pause();
};

const getCtx = () => {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
};

const loadBuffer = async (src) => {
  if (_buffers[src]) return;
  const res = await fetch(src);
  const ab = await res.arrayBuffer();
  const ctx = getCtx();
  _buffers[src] = await ctx.decodeAudioData(ab);
};

const preloadSounds = (srcs) => srcs.forEach(s => loadBuffer(s).catch(() => {}));

const playSound = (src, rate = 1) => {
  if (_muted) return;
  try {
    const ctx = getCtx();
    const buf = _buffers[src];
    if (buf) {
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.playbackRate.value = rate;
      const gain = ctx.createGain();
      gain.gain.value = _vol * 2.5;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    } else {
      loadBuffer(src).then(() => playSound(src, rate)).catch(() => {});
    }
  } catch {
    const a = new Audio(src);
    a.volume = Math.min(1, _vol);
    a.playbackRate = rate;
    a.play().catch(() => {});
  }
};
const playSelect = () => playSound(sfxSelect, 0.75);

// ==================== FONT ====================
function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");

    link.rel = "stylesheet";

    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=EB+Garamond:wght@400;600&display=swap";

    document.head.appendChild(link);

    return () => document.head.removeChild(link);
  }, []);
}

// ==================== COLORS ====================
const C = {
  bg: "#0d0a06",

  bgGrad:
    "radial-gradient(circle at center, #2b180f 0%, #0d0a06 75%)",

  cover: "#4b1111",
  coverDark: "#1d0606",

  gold: "#c9a84c",
  goldLight: "#ecd07a",

  parchment: "#f5e8cc",
  parchmentDark: "#ead6ad",

  ink: "#2b170f",
};

// ==================== DATA ====================
const SPREADS = [
  {
    left: {
      type: "rules",
      title: "하는 법",
      rules: [
        "벽을 클릭해 못을 박는다",
        "이미 박힌 못 위에는 박을 수 없다",
        "이미 박힌 못을 클릭하면 최종 시간 +0.05초",
        "100개를 박으면 끝난다",
        "제한시간은 40초",
        "가끔 벽이 흔들려 못 위치가 바뀐다",
        "61개부터 골드존과 지뢰존이 나타난다",
        "골드존에 박으면 최종 시간 -0.3초 (골드존 하나당 최대 5개)",
        "지뢰존에 박으면 최종 시간 +0.3초",
      ],
    },

    right: {
      type: "game",
      gameId: "game1",
      label: "게임 시작하기",
      title: "노마처럼 못을 박아보자!",
    },
  },

  {
    left: {
      type: "rules",
      title: "하는법",
      rules: [
        "도전 버튼을 눌러 나무를 넘는다",
        "성공하면 다음 단계로 넘어간다",
        "실패하면 처음부터 다시 시작한다",
        "연습하기 버튼을 누른 후 연습을 누르면 현재 단계 성공 확률이 올라가며 연속으로 누를수록 오르는 확률이 커진다",
        "10m 나무를 넘으면 끝난다",
      ],
    },

    right: {
      type: "game",
      gameId: "ox",
      label: "게임 시작하기",
      title: "포플러 나무를 넘어보자!",
    },
  },

  {
    left: {
      type: "rules",
      title: "하는 법",
      rules: [
        "난이도를 고른다 (쉬움 / 보통 / 어려움 / 헬)",
        "문제를 읽고 4개의 보기 중 하나를 고른다",
        "정답이면 초록색, 오답이면 빨간색으로 표시된다",
        "마지막에 몇 문제를 맞췄는지 확인할 수 있다",
        "다시 도전하려면 다시하기 버튼을 누른다",
        "답이 두개일 경우 둘 중 하나만 고르면 된다"
      ],
    },

    right: {
      type: "game",
      gameId: "memory",
      label: "게임 시작하기",
      title: "책 내용 퀴즈를 풀어보자!",
    },
  },

  {
    left: {
      type: "rules",
      title: "하는 법",
      rules: [
        "닦기 버튼을 누르면 신발 하나가 나온다",
        "꾹 누르고 있으면 닦아진다",
        "신발을 다 닦으면 코인 100개를 얻는다",
        "코인으로 업그레이드를 할 수 있다",
        "업그레이드할수록 편하게 닦을 수 있다",
      ],
    },

    right: {
      type: "game",
      gameId: "word",
      label: "게임 시작하기",
      title: "신발을 닦자!",
    },
  },
];

// ==================== PAGE ====================
const LeftPage = forwardRef(({ data, pageNum, zoom = 1 }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background:
          `linear-gradient(160deg, ${C.parchment}, ${C.parchmentDark})`,
        boxShadow: "inset -14px 0 24px -12px rgba(0,0,0,0.14)",
        padding: `${2.5 * zoom}rem`,
        position: "relative",
        fontFamily: '"EB Garamond", serif',
        color: C.ink,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: '"Playfair Display", serif',
            color: C.cover,
            fontSize: `${2 * zoom}rem`,
            marginBottom: `${1.2 * zoom}rem`,
            margin: 0,
          }}
        >
          {data.title}
        </h2>

        {data.type === "rules" ? (
          <ol style={{ margin: `${1 * zoom}rem 0 0 0`, paddingLeft: `${1.4 * zoom}rem`, display: "flex", flexDirection: "column", gap: `${0.55 * zoom}rem` }}>
            {data.rules.map((rule, i) => (
              <li key={i} style={{ fontSize: `${1.05 * zoom}rem`, lineHeight: 1.6 }}>
                {rule}
              </li>
            ))}
          </ol>
        ) : (
          <p
            style={{
              fontSize: `${1.2 * zoom}rem`,
              lineHeight: 1.9,
              margin: 0,
            }}
          >
            {data.content}
          </p>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          color: "rgba(0,0,0,0.4)",
          fontStyle: "italic",
          fontSize: `${0.9 * zoom}rem`,
        }}
      >
        — {pageNum} —
      </div>
    </div>
  );
});

const RightPage = forwardRef(
  ({ data, pageNum, onStartGame, zoom = 1 }, ref) => {
  return (
    <div
       ref={ref}
       style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background:
          `linear-gradient(200deg, ${C.parchmentDark}, ${C.parchment})`,
        boxShadow: "inset 14px 0 24px -12px rgba(0,0,0,0.14)",
        padding: `${2.5 * zoom}rem`,
        position: "relative",
        fontFamily: '"EB Garamond", serif',
        color: C.ink,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={data.type === "game" ? { flex: 1, display: "flex" } : {}}>
        {data.type === "toc" && (
          <>
            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                color: C.cover,
                fontSize: `${2 * zoom}rem`,
                marginBottom: `${2 * zoom}rem`,
                margin: 0,
              }}
            >
              목차
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${1 * zoom}rem`,
              }}
            >
              {data.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    paddingBottom: `${0.8 * zoom}rem`,
                    borderBottom:
                      "1px solid rgba(0,0,0,0.1)",
                    fontSize: `${1.15 * zoom}rem`,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </>
        )}

        {data.type === "game" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: `${2 * zoom}rem`,
            }}
          >
            {data.title && (
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  color: C.cover,
                  fontSize: `${1.7 * zoom}rem`,
                  fontWeight: 700,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {data.title}
              </h2>
            )}

            <div style={{ fontSize: `${5 * zoom}rem` }}>📖</div>

            <button
              style={{
                padding: `${1 * zoom}rem ${2 * zoom}rem`,
                background:
                  `linear-gradient(135deg, ${C.cover}, ${C.coverDark})`,
                color: C.goldLight,
                border: `1px solid ${C.gold}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: `${1 * zoom}rem`,
                fontFamily: '"Playfair Display", serif',
                WebkitTapHighlightColor: "transparent",
              }}
              onClick={() => { playSelect(); onStartGame(data.gameId); }}
            >
              {data.label}
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          color: "rgba(0,0,0,0.4)",
          fontStyle: "italic",
          fontSize: `${0.9 * zoom}rem`,
        }}
      >
        — {pageNum} —
      </div>
    </div>

  );
});

// ==================== COVER PAGE ====================
const CoverPage = forwardRef((props, ref) => (
  <div
    ref={ref}
    style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}
  >
    <img
      src={coverImg}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  </div>
));

const BackCoverPage = forwardRef((props, ref) => (
  <div
    ref={ref}
    style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", userSelect: "none" }}
  >
    <img
      src={backCoverImg}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
    />
  </div>
));

// ==================== NAIL GAME ====================
function NailGame() {
  const [phase, setPhase] = useState("intro");
  const [nickname, setNickname] = useState("");
  const [nails, setNails] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [shakeDuration, setShakeDuration] = useState(300);
  const [shakeAlert, setShakeAlert] = useState(false);
  const [goldenZone, setGoldenZone] = useState(null);
  const [mineZones, setMineZones] = useState([]);
  const [poppingIdx, setPoppingIdx] = useState(-1);
  const [endingStats, setEndingStats] = useState({ gCount: 0, mCount: 0, missCount: 0, rawTime: 0, finalTime: 0 });
  const [rankings, setRankings] = useState([]);
  const [missCount, setMissCount] = useState(0);

  useEffect(() => {
    supabase
      .from("rankings")
      .select("nickname, time")
      .order("time", { ascending: true })
      .limit(20)
      .then(({ data }) => { if (data) setRankings(data); });
  }, []);

  const NAIL_COUNT = 100;
  const TIME_LIMIT_MS = 40000;
  const NAIL_MIN_DIST = 30;

  const wallRef = useRef(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef(null);
  const nailsRef = useRef([]);
  const goldenZoneRef = useRef(null);
  const mineZoneRef = useRef([]);
  const goldenTimerRef = useRef(null);
  const nailIdRef = useRef(0);
  const missCountRef = useRef(0);

  useEffect(() => { nailsRef.current = nails; }, [nails]);
  useEffect(() => { goldenZoneRef.current = goldenZone; }, [goldenZone]);
  useEffect(() => { mineZoneRef.current = mineZones; }, [mineZones]);

  useEffect(() => {
    if (phase !== "playing") return;
    startTimeRef.current = performance.now();
    const tick = () => {
      const delta = performance.now() - startTimeRef.current;
      if (delta >= TIME_LIMIT_MS) {
        setElapsed(TIME_LIMIT_MS);
        setPhase("gameover");
        return;
      }
      setElapsed(delta);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const SHAKE_LEVELS = [
    { maxDist: 8,  duration: 320 },
    { maxDist: 14, duration: 280 },
    { maxDist: 22, duration: 240 },
    { maxDist: 32, duration: 200 },
    { maxDist: 45, duration: 160 },
    { maxDist: 60, duration: 120 },
    { maxDist: 75, duration: 90 },
  ];

  useEffect(() => {
    if (phase !== "playing") return;

    let shakeTimer;

    const doShake = () => {
      const count = nailsRef.current.length;
      if (count === 0) return;
      const level = Math.min(Math.floor(count / 10), 6);
      const { maxDist, duration } = SHAKE_LEVELS[level];
      const wallEl = wallRef.current;
      const w = wallEl?.clientWidth ?? 820;
      const h = wallEl?.clientHeight ?? 420;

      const moved = nailsRef.current.map((n) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * maxDist;
        const r = NAIL_MIN_DIST / 2;
        return {
          ...n,
          x: Math.max(r, Math.min(w - r, n.x + Math.cos(angle) * dist)),
          y: Math.max(r, Math.min(h - r, n.y + Math.sin(angle) * dist)),
        };
      });

      nailsRef.current = moved;
      setNails(moved);
      setShakeDuration(duration);
      setShaking(true);
      setShakeAlert(true);
      setTimeout(() => setShaking(false), duration + 80);
      setTimeout(() => setShakeAlert(false), 900);
    };

    const schedule = () => {
      const delay = 1500 + Math.random() * 2000;
      shakeTimer = setTimeout(() => { doShake(); schedule(); }, delay);
    };

    schedule();
    return () => clearTimeout(shakeTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    let mineTimer;
    const ZONE_R = 70;

    const getMineCount = () => {
      const c = nailsRef.current.length;
      if (c >= 90) return 4;
      if (c >= 80) return 3;
      if (c >= 70) return 2;
      if (c >= 61) return 1;
      return 0;
    };

    const scheduleMine = (visible) => {
      const delay = visible
        ? 2000 + Math.random() * 1000
        : 1200 + Math.random() * 2000;
      mineTimer = setTimeout(() => {
        if (!visible) {
          const count = getMineCount();
          if (count > 0) {
            const w = wallRef.current?.clientWidth ?? 820;
            const h = wallRef.current?.clientHeight ?? 420;
            const zones = Array.from({ length: count }, () => ({
              x: ZONE_R + Math.random() * (w - ZONE_R * 2),
              y: ZONE_R + Math.random() * (h - ZONE_R * 2),
              r: ZONE_R,
            }));
            setMineZones(zones);
            scheduleMine(true);
          } else {
            scheduleMine(false);
          }
        } else {
          setMineZones([]);
          scheduleMine(false);
        }
      }, delay);
    };
    scheduleMine(false);
    return () => clearTimeout(mineTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "ending") return;
    const specials = nailsRef.current.filter((n) => n.type === "golden" || n.type === "mine");
    nailsRef.current = specials;
    setNails([...specials]);

    let current = specials;
    let timer;
    const removeNext = () => {
      if (current.length === 0) {
        timer = setTimeout(() => setPhase("done"), 300);
        return;
      }
      setPoppingIdx(0);
      timer = setTimeout(() => {
        current = current.slice(1);
        nailsRef.current = [...current];
        setNails([...current]);
        setPoppingIdx(-1);
        timer = setTimeout(removeNext, 80);
      }, 320);
    };
    timer = setTimeout(removeNext, 180);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleWallClick = (e) => {
    if (phase !== "playing") return;
    const rect = wallRef.current.getBoundingClientRect();
    const scale = rect.width / wallRef.current.offsetWidth;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const r = NAIL_MIN_DIST / 2;
    const logicalW = wallRef.current.offsetWidth;
    const logicalH = wallRef.current.offsetHeight;
    if (x < r || y < r || x > logicalW - r || y > logicalH - r) return;

    const cur = nailsRef.current;
    if (cur.some((n) => Math.hypot(n.x - x, n.y - y) < NAIL_MIN_DIST)) {
      if (!shaking) {
        missCountRef.current += 1;
        setMissCount(missCountRef.current);
        playSound(sfxWrong);
      }
      return;
    }

    const inZone = (zone) => zone && Math.hypot(x - zone.x, y - zone.y) < zone.r;
    let type = "normal";
    const gz = goldenZoneRef.current;
    if (mineZoneRef.current.some((z) => inZone(z))) {
      type = "mine";
    } else if (gz && inZone(gz) && (gz.nailsPlaced ?? 0) < 5) {
      type = "golden";
      const updated = { ...gz, nailsPlaced: (gz.nailsPlaced ?? 0) + 1 };
      goldenZoneRef.current = updated;
      setGoldenZone(updated);
    }

    playSound(sfxHammer);
    const updated = [...cur, { x, y, type, id: nailIdRef.current++ }];
    nailsRef.current = updated;
    setNails(updated);

    if (updated.length >= 61) {
      if (Math.random() * 100 < 15) {
        clearTimeout(goldenTimerRef.current);
        const w = wallRef.current?.clientWidth ?? 820;
        const h = wallRef.current?.clientHeight ?? 420;
        const ZONE_R = 105;
        setGoldenZone({
          x: ZONE_R + Math.random() * (w - ZONE_R * 2),
          y: ZONE_R + Math.random() * (h - ZONE_R * 2),
          r: ZONE_R,
          nailsPlaced: 0,
        });
        goldenTimerRef.current = setTimeout(
          () => setGoldenZone(null),
          2000 + Math.random() * 1000
        );
      }
    }

    if (updated.length >= NAIL_COUNT) {
      cancelAnimationFrame(rafRef.current);
      const ft = performance.now() - startTimeRef.current;
      setElapsed(ft);
      const gCount = updated.filter((n) => n.type === "golden").length;
      const mCount = updated.filter((n) => n.type === "mine").length;
      const finalTime = Math.max(0, ft - gCount * 300 + mCount * 300 + missCountRef.current * 50);
      setEndingStats({ gCount, mCount, missCount: missCountRef.current, rawTime: ft, finalTime });
      supabase
        .from("rankings")
        .insert({ nickname, time: finalTime })
        .then(() =>
          supabase
            .from("rankings")
            .select("nickname, time")
            .order("time", { ascending: true })
            .limit(20)
            .then(({ data }) => { if (data) setRankings(data); })
        );
      setPhase("ending");
    }
  };

  const startGame = () => {
    if (!nickname.trim()) return;
    clearTimeout(goldenTimerRef.current);
    nailIdRef.current = 0;
    missCountRef.current = 0;
    nailsRef.current = [];
    setNails([]);
    setMissCount(0);
    setElapsed(0);
    setGoldenZone(null);
    setMineZones([]);
    setPhase("playing");
  };

  const formatTime = (ms) => {
    const totalSec = ms / 1000;
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return min > 0 ? `${min}분 ${sec.toFixed(2)}초` : `${sec.toFixed(2)}초`;
  };

  const remaining = Math.max(0, TIME_LIMIT_MS - elapsed);

  if (phase === "intro") {
    return (
      <div className="nail-screen">
        <div className="nail-intro-title">🔨 못 박기 게임</div>
        <div className="nail-intro-desc">
          40초 안에 벽에 못 100개를 박으세요!<br />
          못끼리는 겹칠 수 없어요.
        </div>
        <input
          className="nail-nickname-input"
          placeholder="닉네임 입력"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startGame()}
          maxLength={12}
          autoFocus
        />
        <button className="nail-btn" onClick={startGame} disabled={!nickname.trim()}>
          게임 시작
        </button>
        {rankings.length > 0 && (
          <div className="nail-ranking-box">
            <div className="nail-ranking-title">🏆 랭킹</div>
            {rankings.slice(0, 10).map((r, i) => (
              <div key={i} className="nail-ranking-row">
                <span className="nail-rank-num">{i + 1}</span>
                <span className="nail-rank-name">{r.nickname}</span>
                <span className="nail-rank-time">{formatTime(r.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (phase === "playing" || phase === "ending") {
    const vignetteOpacity = phase === "ending"
      ? 1
      : nails.length >= 80 ? Math.min(1, (nails.length - 80) / 20) : 0;

    return (
      <div className="nail-playing">
        {phase === "playing" && (
          <div className="nail-hud">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="nail-hud-count">못 {nails.length} / {NAIL_COUNT}</span>
              {nails.some((n) => n.type === "golden") && (
                <span className="nail-hud-badge nail-hud-badge-gold">
                  🥇×{nails.filter((n) => n.type === "golden").length}
                </span>
              )}
              {nails.some((n) => n.type === "mine") && (
                <span className="nail-hud-badge nail-hud-badge-mine">
                  💣×{nails.filter((n) => n.type === "mine").length}
                </span>
              )}
              {missCount > 0 && (
                <span className="nail-hud-badge nail-hud-badge-miss">
                  실수×{missCount}
                </span>
              )}
            </div>
            {shakeAlert && <span className="nail-shake-alert">💥 흔들림!</span>}
            <span className={`nail-hud-timer${remaining < 10000 ? " nail-hud-timer-warn" : ""}`}>
              ⏱ {(remaining / 1000).toFixed(2)}초
            </span>
          </div>
        )}
        <div
          ref={wallRef}
          className={`nail-wall${shaking && phase === "playing" ? " nail-wall-shaking" : ""}`}
          onClick={phase === "playing" ? handleWallClick : undefined}
          style={{ cursor: phase === "ending" ? "default" : "crosshair" }}
        >
          <div className="nail-frame" />
          {phase === "playing" && goldenZone && (
            <div
              className="nail-zone nail-zone-golden"
              style={{
                left: goldenZone.x - goldenZone.r,
                top: goldenZone.y - goldenZone.r,
                width: goldenZone.r * 2,
                height: goldenZone.r * 2,
              }}
            />
          )}
          {phase === "playing" && mineZones.map((z, i) => (
            <div
              key={i}
              className="nail-zone nail-zone-mine"
              style={{
                left: z.x - z.r,
                top: z.y - z.r,
                width: z.r * 2,
                height: z.r * 2,
              }}
            />
          ))}
          {nails.map((n, i) => (
            <div
              key={n.id ?? i}
              className={`nail-head nail-head-${n.type ?? "normal"}${i === poppingIdx ? " nail-popping" : ""}`}
              style={{
                left: n.x,
                top: n.y,
                transition: shaking && phase === "playing"
                  ? `left ${shakeDuration}ms ease-out, top ${shakeDuration}ms ease-out`
                  : "none",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const { gCount, mCount, missCount: endMiss, rawTime, finalTime } = endingStats;
    const myRankIdx = rankings.findIndex(
      (r) => r.nickname === nickname && Math.abs(r.time - finalTime) < 50
    );
    return (
      <div className="nail-screen">
        <div className="nail-result-icon">🎉</div>
        <div className="nail-result-title">완성!</div>
        <div className="nail-result-card">
          <div className="nail-result-row">
            <span className="nail-result-label">걸린 시간</span>
            <span className="nail-result-val">{formatTime(rawTime)}</span>
          </div>
          {gCount > 0 && (
            <div className="nail-result-row">
              <span className="nail-result-label nail-result-gold">골든존 {gCount}개</span>
              <span className="nail-result-val nail-result-gold">−{(gCount * 0.3).toFixed(2)}초</span>
            </div>
          )}
          {mCount > 0 && (
            <div className="nail-result-row">
              <span className="nail-result-label nail-result-mine">지뢰존 {mCount}개</span>
              <span className="nail-result-val nail-result-mine">+{(mCount * 0.3).toFixed(2)}초</span>
            </div>
          )}
          {endMiss > 0 && (
            <div className="nail-result-row">
              <span className="nail-result-label nail-result-miss">실수 {endMiss}회</span>
              <span className="nail-result-val nail-result-miss">+{(endMiss * 0.05).toFixed(2)}초</span>
            </div>
          )}
          <div className="nail-result-divider">──────────────</div>
          <div className="nail-result-row nail-result-final">
            <span className="nail-result-label">최종 시간</span>
            <span className="nail-result-val">{formatTime(finalTime)}</span>
          </div>
        </div>
        <div className="nail-ranking-box">
          <div className="nail-ranking-title">🏆 {nickname}님 랭킹</div>
          {rankings.slice(0, 10).map((r, i) => (
            <div
              key={i}
              className={`nail-ranking-row${i === myRankIdx ? " nail-ranking-row-me" : ""}`}
            >
              <span className="nail-rank-num">{i + 1}</span>
              <span className="nail-rank-name">{r.nickname}</span>
              <span className="nail-rank-time">{formatTime(r.time)}</span>
            </div>
          ))}
        </div>
        <button className="nail-btn" onClick={() => setPhase("intro")}>다시 하기</button>
      </div>
    );
  }

  if (phase === "gameover") {
    return (
      <div className="nail-screen">
        <div className="nail-result-icon">⏰</div>
        <div className="nail-result-title">시간 초과!</div>
        <div className="nail-result-time">{nails.length} / {NAIL_COUNT}개</div>
        <div className="nail-result-sub">40초 안에 100개를 박아야 해요!</div>
        <button className="nail-btn" onClick={() => setPhase("intro")}>다시 하기</button>
      </div>
    );
  }

  return null;
}

// ==================== TREE GAME ====================
function TreeGame() {
  const STAGES = [
    { height: 1,  prob: 0.90, age: "아이",    char: charChild,   tree: tree1m },
    { height: 3,  prob: 0.80, age: "청소년",  char: charTeen,    tree: tree3m },
    { height: 5,  prob: 0.70, age: "청년",    char: charYoung,   tree: tree5m },
    { height: 7,  prob: 0.50, age: "중년",    char: charMiddle,  tree: tree7m },
    { height: 9,  prob: 0.40, age: "노인",    char: charOld,     tree: tree9m },
    { height: 10, prob: 0.30, age: "할아버지", char: charGrandpa, tree: tree10m },
  ];

  const [stage, setStage] = useState(0);
  const [anim, setAnim] = useState("idle");
  const [deadStage, setDeadStage] = useState(null);
  const [practiceCount, setPracticeCount] = useState(0);
  const [practiceBonus, setPracticeBonus] = useState(0);
  const [practiceAnim, setPracticeAnim] = useState(false);
  const [showPracticeBar, setShowPracticeBar] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [endingSeq, setEndingSeq] = useState(0); // 0:landed 1:ascending 2:shoes 3:done
  const [sceneZoom, setSceneZoom] = useState(false);

  const charRef = useRef(null);
  const sceneRef = useRef(null);
  const rafRef = useRef(null);
  const practiceTimeoutRef = useRef(null);
  const endingTimersRef = useRef([]);
  const grandpaAscentRef = useRef(false);
  const practiceOffsetRef = useRef(0);

  const cur = STAGES[stage];
  const treeH = 40 + (cur.height - 1) * 40;
  const renderTreeH = stage >= 5 ? 600 : treeH;
  const PEAK_H = treeH + 55;
  const effectiveProb = Math.min(1.0, cur.prob + practiceBonus / 100);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current);
    endingTimersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (anim !== "cleared") return;
    if (grandpaAscentRef.current) {
      setEndingSeq(1);
      const t2 = setTimeout(() => setEndingSeq(2), 1500);
      const tz = setTimeout(() => setSceneZoom(true), 1700);
      const t3 = setTimeout(() => setEndingSeq(3), 2950);
      endingTimersRef.current = [t2, tz, t3];
      return () => [t2, tz, t3].forEach(clearTimeout);
    }
    const t1 = setTimeout(() => setEndingSeq(1), 500);
    const t2 = setTimeout(() => setEndingSeq(2), 2300);
    const t3 = setTimeout(() => setEndingSeq(3), 3400);
    endingTimersRef.current = [t1, t2, t3];
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [anim]);

  const getPracticeBonus = (n) => Math.ceil(n / 2);

  const doAttempt = () => {
    if (anim !== "idle" || practiceAnim) return;
    const ok = Math.random() < effectiveProb;
    if (ok) {
      setAnim("jumping");
      setDeadStage(null);
      const sceneW = sceneRef.current?.clientWidth ?? 740;
      const t0 = performance.now();
      if (stage >= 5) {
        const travel = sceneW * 0.06;
        const dur = 1050;
        const tick = (now) => {
          const t = Math.min((now - t0) / dur, 1);
          const x = t * travel;
          let y, op;
          if (t <= 0.5) {
            y = -(4 * PEAK_H * t * (1 - t));
            op = 1;
          } else {
            const t2 = (t - 0.5) / 0.5;
            y = -PEAK_H - t2 * PEAK_H * 0.9;
            op = Math.max(0, 1 - t2);
          }
          if (charRef.current) {
            charRef.current.style.transform = `translateX(${x}px) translateY(${y}px)`;
            charRef.current.style.opacity = String(op);
          }
          if (t < 1) { rafRef.current = requestAnimationFrame(tick); return; }
          if (charRef.current) { charRef.current.style.transform = ""; charRef.current.style.opacity = ""; }
          grandpaAscentRef.current = true;
          setAnim("cleared");
        };
        rafRef.current = requestAnimationFrame(tick);
      } else {
        const travel = sceneW * 0.35;
        const dur = 1100;
        const tick = (now) => {
          const t = Math.min((now - t0) / dur, 1);
          const x = t * travel;
          const y = 4 * PEAK_H * t * (t - 1);
          if (charRef.current) charRef.current.style.transform = `translateX(${x}px) translateY(${y}px)`;
          if (t < 1) { rafRef.current = requestAnimationFrame(tick); return; }
          if (charRef.current) charRef.current.style.transform = "";
          setStage(s => s + 1);
          setPracticeCount(0);
          setPracticeBonus(0);
          setAnim("idle");
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    } else {
      setAnim("failing");
      const t0 = performance.now();
      const dur = 1300;
      const tick = (now) => {
        const t = Math.min((now - t0) / dur, 1);
        let y;
        if (t < 0.18) y = -(t / 0.18) * 65;
        else { const t2 = (t - 0.18) / 0.82; y = -65 + t2 * t2 * 560; }
        if (charRef.current) charRef.current.style.transform = `translateY(${y}px)`;
        if (t < 1) { rafRef.current = requestAnimationFrame(tick); return; }
        setDeadStage(stage);
        setStage(0);
        setPracticeCount(0);
        setPracticeBonus(0);
        setAnim("idle");
        if (charRef.current) charRef.current.style.transform = "";
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const enterPractice = () => {
    if (anim !== "idle" || practiceAnim || practiceMode) return;
    const sceneW = sceneRef.current?.clientWidth ?? 740;
    const backDist = sceneW * 0.15;
    setPracticeMode(true);
    setShowPracticeBar(true);
    const t0 = performance.now();
    const dur = 280;
    const tick = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const x = -backDist * ease;
      if (charRef.current) charRef.current.style.transform = `translateX(${x}px)`;
      if (t < 1) { rafRef.current = requestAnimationFrame(tick); return; }
      practiceOffsetRef.current = -backDist;
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const exitPractice = () => {
    if (practiceAnim) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const startX = practiceOffsetRef.current;
    const t0 = performance.now();
    const dur = 280;
    const tick = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const x = startX * (1 - ease);
      if (charRef.current) charRef.current.style.transform = `translateX(${x}px)`;
      if (t < 1) { rafRef.current = requestAnimationFrame(tick); return; }
      practiceOffsetRef.current = 0;
      if (charRef.current) charRef.current.style.transform = "";
      setShowPracticeBar(false);
      setPracticeMode(false);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const doPractice = () => {
    if (anim !== "idle" || practiceAnim || !practiceMode) return;
    setPracticeAnim(true);
    const sceneW = sceneRef.current?.clientWidth ?? 740;
    const startX = practiceOffsetRef.current;
    const travel = sceneW * 0.22;
    const landX = startX + travel;
    const PPEAK = 110;
    const snapCount = practiceCount;

    // 1단계: 앞으로 포물선 점프
    const t0 = performance.now();
    const jumpDur = 800;
    const jumpTick = (now) => {
      const t = Math.min((now - t0) / jumpDur, 1);
      const x = startX + travel * t;
      const y = 4 * PPEAK * t * (t - 1);
      if (charRef.current) charRef.current.style.transform = `translateX(${x}px) translateY(${y}px)`;
      if (t < 1) { rafRef.current = requestAnimationFrame(jumpTick); return; }
      // 2단계: 착지 후 뒤로 이동
      practiceTimeoutRef.current = setTimeout(() => {
        const t1 = performance.now();
        const returnDur = 320;
        const returnTick = (now2) => {
          const t2 = Math.min((now2 - t1) / returnDur, 1);
          const ease = t2 < 0.5 ? 2 * t2 * t2 : -1 + (4 - 2 * t2) * t2;
          const x2 = landX + (startX - landX) * ease;
          if (charRef.current) charRef.current.style.transform = `translateX(${x2}px)`;
          if (t2 < 1) { rafRef.current = requestAnimationFrame(returnTick); return; }
          if (charRef.current) charRef.current.style.transform = `translateX(${startX}px)`;
          setPracticeAnim(false);
          const newCount = snapCount + 1;
          setPracticeCount(newCount);
          setPracticeBonus(prev => Math.min(100, prev + getPracticeBonus(newCount)));
        };
        rafRef.current = requestAnimationFrame(returnTick);
      }, 150);
    };
    rafRef.current = requestAnimationFrame(jumpTick);
  };

  const doRestart = () => {
    setDeadStage(null);
    setPracticeMode(false);
    setShowPracticeBar(false);
    practiceOffsetRef.current = 0;
    if (charRef.current) charRef.current.style.transform = "";
  };

  const doReset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current);
    endingTimersRef.current.forEach(clearTimeout);
    endingTimersRef.current = [];
    setStage(0);
    setPracticeCount(0);
    setPracticeBonus(0);
    setAnim("idle");
    setPracticeAnim(false);
    setPracticeMode(false);
    setDeadStage(null);
    setShowPracticeBar(false);
    setEndingSeq(0);
    setSceneZoom(false);
    grandpaAscentRef.current = false;
    practiceOffsetRef.current = 0;
    if (charRef.current) charRef.current.style.transform = "";
  };

  return (
    <div className="tree-screen">
      <div className="tree-hud">
        <span className="tree-hud-stage">{stage + 1} / 6단계</span>
        <span className="tree-hud-height">🌲 {cur.height}m</span>
        <span className="tree-hud-prob">
          성공률 {Math.round(effectiveProb * 100)}%
          {practiceBonus > 0 && <span className="tree-hud-bonus"> (+{practiceBonus}%)</span>}
        </span>
      </div>
      <div className="tree-main">
        <div className={`tree-scene${sceneZoom ? " tree-scene-zoom" : ""}`} ref={sceneRef}>
          <div className="tree-ground" />
          {showPracticeBar && (
            <div className="pbar-wrap" style={{ left: "25%", bottom: "25px", height: "80px", width: "60px" }}>
              <div className="pbar-stand" style={{ left: 0 }} />
              <div className="pbar-stand" style={{ right: 0 }} />
              <div className="pbar-bar" />
            </div>
          )}
          <div className="tree-poplar" style={{ bottom: "25px", height: `${renderTreeH + 20}px` }}>
            <img
              src={grandpaAscentRef.current && endingSeq >= 1 ? tree10mAfter : cur.tree}
              alt=""
              className={`tree-img${anim === "cleared" && !grandpaAscentRef.current && endingSeq >= 1 ? " tree-canopy-fade" : ""}`}
            />
            {grandpaAscentRef.current && endingSeq >= 1 && (
              <img src={cur.tree} alt="" className="tree-img tree-img-overlay tree-canopy-fade" />
            )}
          </div>
          {anim !== "cleared" ? (
            <div className="tree-char" ref={charRef}><img src={cur.char} alt="" /></div>
          ) : !grandpaAscentRef.current && endingSeq < 2 ? (
            <div className={`tree-char tree-char-clear${endingSeq >= 1 ? " tree-char-ascending" : ""}`}>
              <img src={STAGES[5].char} alt="" />
            </div>
          ) : null}
          {anim === "cleared" && endingSeq >= 2 && (
            <div className="tree-shoes">👟</div>
          )}
          {deadStage !== null && (
            <div className="tree-death-overlay">
              <div className="tree-death-card">
                <div className="tree-death-stage">{deadStage + 1}단계에서 실패!</div>
                <button className="tree-btn" onClick={doRestart}>다시 시작</button>
              </div>
            </div>
          )}
        </div>
        {anim !== "cleared" && (
          <div className="tree-practice-panel">
            <button
              className={`tree-practice-btn${practiceMode ? " active" : ""}`}
              onClick={() => { playSelect(); practiceMode ? exitPractice() : enterPractice(); }}
              disabled={anim !== "idle" || practiceAnim}
            >
              {practiceMode ? "그만하기" : "연습하기"}
            </button>
            {practiceCount > 0 && (
              <>
                <div className="tree-practice-combo">{practiceCount}콤보</div>
                <div className="tree-practice-bonus-disp">+{getPracticeBonus(practiceCount + 1)}%</div>
              </>
            )}
          </div>
        )}
      </div>
      {anim === "cleared" && endingSeq === 3 ? (
        <div className="tree-cleared-area">
          <button className="tree-btn" onClick={doReset}>다시 하기</button>
        </div>
      ) : deadStage !== null ? (
        <div className="tree-dead-msg">💀 실패했다!</div>
      ) : anim === "idle" ? (
        practiceMode ? (
          <button className="tree-btn tree-btn-practice" onClick={() => { playSelect(); doPractice(); }} disabled={practiceAnim}>연습!</button>
        ) : (
          <button className="tree-btn" onClick={() => { playSound(sfxJump); doAttempt(); }}>도전!</button>
        )
      ) : null}
    </div>
  );
}

// ==================== VISUAL NOVEL GAME ====================
const VN_SHOES = [
  { id: "black",   img: shoeBlack,   label: "방금산구두" },
  { id: "brown",   img: shoeBrown,   label: "오래된구두" },
  { id: "nurse",   img: shoeNurse,   label: "이쁜이구두" },
  { id: "sneaker", img: shoeSneaker, label: "멋쟁이운동화" },
  { id: "basket",  img: shoeBasket,  label: "깨끗한농구화" },
];

const POWER_UPGRADES = [
  { label: "닦기 강도 Lv.2", cost: 100,  power: 2  },
  { label: "닦기 강도 Lv.3", cost: 300,  power: 5  },
  { label: "닦기 강도 Lv.4", cost: 700,  power: 12 },
  { label: "닦기 강도 Lv.5", cost: 1500, power: 25 },
];
const AUTO_UNLOCK_COST = 500;
const AUTO_SPEED_UPGRADES = [
  { label: "자동 속도 Lv.2", cost: 400, auto: 15 },
  { label: "자동 속도 Lv.3", cost: 900, auto: 25 },
];
const INCOME_UPGRADES = [
  { label: "수입 Lv.2", cost: 300,  reward: 200 },
  { label: "수입 Lv.3", cost: 800,  reward: 400 },
  { label: "수입 Lv.4", cost: 2000, reward: 800 },
];
const ENDING_COST = 3000;

function CleaningGame() {
  const [phase, setPhase] = useState("idle"); // "idle" | "cleaning" | "done" | "ending"
  const [currentShoe, setCurrentShoe] = useState(null);
  const [dirt, setDirt] = useState(100);
  const [isPointing, setIsPointing] = useState(false);
  const [coins, setCoins] = useState(0);
  const [totalCleaned, setTotalCleaned] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const completedRef = useRef(false);
  const completionTimerRef = useRef(null);

  const [powerLevel, setPowerLevel] = useState(0);
  const [autoUnlocked, setAutoUnlocked] = useState(false);
  const [autoSpeedLevel, setAutoSpeedLevel] = useState(0);
  const [incomeLevel, setIncomeLevel] = useState(0);

  const cleanPower = powerLevel === 0 ? 1 : POWER_UPGRADES[powerLevel - 1].power;
  const autoRate = !autoUnlocked ? 0 : autoSpeedLevel === 0 ? 5 : AUTO_SPEED_UPGRADES[autoSpeedLevel - 1].auto;
  const reward = incomeLevel === 0 ? 100 : INCOME_UPGRADES[incomeLevel - 1].reward;
  const nextPower = powerLevel < POWER_UPGRADES.length ? POWER_UPGRADES[powerLevel] : null;
  const nextAutoSpeed = autoUnlocked && autoSpeedLevel < AUTO_SPEED_UPGRADES.length ? AUTO_SPEED_UPGRADES[autoSpeedLevel] : null;
  const nextIncome = incomeLevel < INCOME_UPGRADES.length ? INCOME_UPGRADES[incomeLevel] : null;

  // 손으로 닦기
  useEffect(() => {
    if (phase !== "cleaning" || !isPointing) return;
    const id = setInterval(() => {
      setDirt(prev => Math.max(0, prev - cleanPower));
    }, 80);
    return () => clearInterval(id);
  }, [phase, isPointing, cleanPower]);

  // 자동 닦기
  useEffect(() => {
    if (phase !== "cleaning" || autoRate === 0) return;
    const id = setInterval(() => {
      setDirt(prev => Math.max(0, prev - autoRate));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, autoRate]);

  // 완료 감지 — ref로 타이머 취소 방지
  useEffect(() => {
    if (dirt > 0 || !currentShoe || completedRef.current) return;
    completedRef.current = true;
    setIsPointing(false);
    setPhase("done");
    setCoins(c => c + reward);
    setTotalCoins(t => t + reward);
    setTotalCleaned(t => t + 1);
    completionTimerRef.current = setTimeout(() => {
      const shoe = VN_SHOES[Math.floor(Math.random() * VN_SHOES.length)];
      completedRef.current = false;
      setCurrentShoe(shoe);
      setDirt(100);
      setIsPointing(false);
      setPhase("cleaning");
    }, 300);
  }, [dirt, currentShoe]);

  useEffect(() => () => { if (completionTimerRef.current) clearTimeout(completionTimerRef.current); }, []);

  const startCleaning = () => {
    completedRef.current = false;
    const shoe = VN_SHOES[Math.floor(Math.random() * VN_SHOES.length)];
    setCurrentShoe(shoe);
    setDirt(100);
    setIsPointing(false);
    setPhase("cleaning");
  };

  const buy = (cost, action) => {
    if (coins < cost) return;
    playSelect();
    setCoins(c => c - cost);
    action();
  };

  const rightPanel = (
    <div className="clean-right">
      <div className="clean-coins">💰 {coins} 코인</div>

      <div className="clean-upgrade-section">
        <div className="clean-upgrade-title">닦기 강도</div>
        {nextPower ? (
          <button className="clean-buy-btn" disabled={coins < nextPower.cost} onClick={() => buy(nextPower.cost, () => setPowerLevel(l => l + 1))}>
            {nextPower.label} ({nextPower.cost}코인)
          </button>
        ) : <div className="clean-maxed">최대 레벨</div>}
      </div>

      <div className="clean-upgrade-section">
        <div className="clean-upgrade-title">자동 닦기</div>
        {!autoUnlocked ? (
          <button className="clean-buy-btn" disabled={coins < AUTO_UNLOCK_COST} onClick={() => buy(AUTO_UNLOCK_COST, () => setAutoUnlocked(true))}>
            자동 닦기 활성화 ({AUTO_UNLOCK_COST}코인)
          </button>
        ) : <div className="clean-maxed">활성화됨</div>}
      </div>

      <div className="clean-upgrade-section">
        <div className={`clean-upgrade-title${!autoUnlocked ? " clean-upgrade-locked" : ""}`}>자동 닦기 속도</div>
        {autoUnlocked ? (
          nextAutoSpeed ? (
            <button className="clean-buy-btn" disabled={coins < nextAutoSpeed.cost} onClick={() => buy(nextAutoSpeed.cost, () => setAutoSpeedLevel(l => l + 1))}>
              {nextAutoSpeed.label} ({nextAutoSpeed.cost}코인)
            </button>
          ) : <div className="clean-maxed">최대 레벨</div>
        ) : <div className="clean-maxed clean-upgrade-locked">자동 닦기 필요</div>}
      </div>

      <div className="clean-upgrade-section">
        <div className="clean-upgrade-title">수입 증가</div>
        {nextIncome ? (
          <button className="clean-buy-btn" disabled={coins < nextIncome.cost} onClick={() => buy(nextIncome.cost, () => setIncomeLevel(l => l + 1))}>
            {nextIncome.label} — {nextIncome.reward}코인/개<br/>({nextIncome.cost}코인)
          </button>
        ) : <div className="clean-maxed">최대 레벨</div>}
      </div>

      <div className="clean-upgrade-section">
        <div className="clean-upgrade-title">엔딩</div>
        <button className="clean-buy-btn clean-ending-btn" disabled={coins < ENDING_COST} onClick={() => buy(ENDING_COST, () => setPhase("ending"))}>
          엔딩 보기 ({ENDING_COST}코인)
        </button>
      </div>
    </div>
  );

  if (phase === "ending") {
    return (
      <div className="vn-end" style={{ backgroundImage: `url(${vnBg})` }}>
        <div className="vn-bg-overlay" />
        <div className="vn-end-icon" style={{ position: "relative", zIndex: 1 }}>✨</div>
        <div className="vn-end-title" style={{ position: "relative", zIndex: 1 }}>END</div>
        <div style={{ position: "relative", zIndex: 1, color: "#ecd07a", fontFamily: "'EB Garamond', serif", fontSize: "1rem" }}>
          총 {totalCleaned}개 완료<br/>💰 총 획득 코인: {totalCoins}
        </div>
        <button className="vn-btn" style={{ position: "relative", zIndex: 1 }} onClick={() => { setPhase("idle"); setCoins(0); setPowerLevel(0); setAutoUnlocked(false); setAutoSpeedLevel(0); setIncomeLevel(0); setTotalCleaned(0); setTotalCoins(0); }}>처음부터</button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="clean-wrap">
        <div className="clean-left">
          <div className="clean-done-screen">
            <div className="clean-done-big">+{reward} 코인</div>
          </div>
        </div>
        {rightPanel}
      </div>
    );
  }

  if (phase === "cleaning" && currentShoe) {
    return (
      <div className="clean-wrap">
        <div className="clean-left">
          <div className="clean-shoe-name">닦자!</div>
          <div className="clean-dirt-label">
            <span>청결도</span>
            <div className="clean-dirt-bar">
              <div className="clean-dirt-fill" style={{ width: `${100 - dirt}%` }} />
            </div>
            <span>{100 - dirt}%</span>
          </div>
          <div
            className={`clean-shoe-wrap${isPointing ? " clean-shoe-active" : ""}`}
            onPointerDown={() => setIsPointing(true)}
            onPointerUp={() => setIsPointing(false)}
            onPointerLeave={() => setIsPointing(false)}
            onPointerCancel={() => setIsPointing(false)}
          >
            <img src={currentShoe.img} alt={currentShoe.label} className="clean-shoe-img" />
            <div className="clean-dirt-overlay" style={{ opacity: dirt / 100 }} />
          </div>
          <div className="clean-hint">{isPointing ? "닦는 중..." : "꾹 눌러서 닦기"}</div>
          {autoRate > 0 && <div className="clean-auto-info">자동 닦기 중 ({autoRate}/초)</div>}
        </div>
        {rightPanel}
      </div>
    );
  }

  // idle
  return (
    <div className="clean-wrap">
      <div className="clean-left">
        <div className="clean-idle-title">신발 닦기</div>
        <div className="clean-idle-sub">총 {totalCleaned}개 완료</div>
        <button className="clean-start-btn" onClick={() => { playSound(sfxClean); startCleaning(); }}>닦기</button>
      </div>
      {rightPanel}
    </div>
  );
}

// ==================== QUIZ GAME ====================
const QUIZ_QUESTIONS = {
  easy: [
    { q: "'이상한 사람들'의 저자는?", options: ["이상혁", "최인호", "이미란 선생님"], answer: 1 },
    { q: "책의 이름은?", options: ["이상한 사람들", "미친놈들", "거지들"], answer: 0 },
    { q: "이 책의 챕터 개수는? (작가의 말 제외)", options: ["3333개", "45개", "3개"], answer: 2 },
    { q: "2챕터의 아저씨의 직업은?", options: ["높이뛰기 국가대표", "백수", "대장장이"], answer: 2 },
    { q: "3챕터의 아저씨는 결혼을 했나요?", options: ["했다", "모르겠다", "안했다"], answer: 0 },
    { q: "이 책의 출판사는?", options: ["맛있는 책", "책읽는섬", "성덕고등학교 빛글동아리"], answer: 1 },
    { q: "이 책에 없는 챕터 이름은?", options: ["침묵은 금이다.", "포플러나무", "걸리버 여행기"], answer: 2 },
    { q: "이 책의 발행연도는?", options: ["기원전 120년", "2018년", "2030년"], answer: 1 },
  ],
  normal: [
    { q: "1챕터의 아버지의 이름은?", options: ["큰노마", "노마", "모름"], answer: [0, 1] },
    { q: "1챕터의 노마는 어디서 태어났나요?", options: ["마구간", "다리 밑", "병원"], answer: 1 },
    { q: "1챕터에서 큰 노마는 왜 자신의 뺨을 때렸나요?", options: ["작은 노마가 나무 위에서 자겠다고 고집해서", "작은 노마가 버릇 없이 굴어서", "아내를 지키지 못하는 자신이 원망스러워서"], answer: 0 },
    { q: "노마가 집 대신 받은 돈으로 사지 않은 것은?", options: ["집", "우유", "건어"], answer: 0 },
    { q: "2챕터의 포플러 나무에서 아저씨가 넘었던 철봉의 최고높이는?", options: ["2m 50cm", "2cm 40mm", "2m 40cm"], answer: 2 },
    { q: "2챕터에서 아저씨가 나무 위로 사라져 버린 후 떨어진 것은?", options: ["사과", "할머니", "신발"], answer: 2 },
    { q: "3챕터에서 아저씨가 젊었을 적 은행에 예금을 했던 금액은?", options: ["약 2억₩", "약 2천$", "약 20억Z$"], answer: 0 },
    { q: "2챕터에서 방물장수가 아저씨의 미쳐버린 아내를 봤다고 하지 않은 장소는?", options: ["강가", "무덤가", "시장"], answer: 2 },
  ],
  hard: [
    { q: "이 책의 작가는 어떤 대학교 어떤 과를 나왔나요?", options: ["연세대 영문과", "연세대 국문과", "고려대 국문과"], answer: 0 },
    { q: "1챕터에서 시청 사람들이 노마를 설득하기 위해 말한 말은?", options: ["보기 흉하니까 나가라.", "보상금으로 더 좋은 곳으로 갈 수 있다.", "더 좋은 집을 추천해주겠다."], answer: 1 },
    { q: "노마의 엄마는 홍수에 휩쓸려 죽었다. 그 홍수는 무슨 물인가?", options: ["바닷물", "개천물", "개울물"], answer: 1 },
    { q: "작은 노마가 가지고 싶은 집 중 언급된 집은?", options: ["큰 집", "비와 바람을 가릴 수 있는 집", "태풍에 휩쓸리지 않는 집"], answer: 1 },
    { q: "2챕터의 아저씨가 심은 포플러나무가 여기까지 자란다고 언급되지 않은 곳은?", options: ["무지개", "철봉", "국기 게양대"], answer: 0 },
    { q: "2챕터의 아저씨가 높이 뛰는 모습을 보기 위해 화자와 애들이 준비한 것은?", options: ["모래 밭", "2m 40cm 장대", "아무것도 준비하지 않았다."], answer: 2 },
    { q: "3챕터의 아저씨가 이웃 사람들에게 좋은 이웃이라고 여겨진 이유는?", options: ["이웃을 늘 배려했다.", "불우이웃에게 기부를 하였다.", "아침마다 온 동네를 청소하였다."], answer: 2 },
    { q: "3챕터의 아저씨는 말하지 않겠다고 말한 후 약 몇 마디의 말을 하였나요?", options: ["한 마디도 하지 않았다.", "20마디 이상", "20마디 이하"], answer: 1 },
  ],
  hell: [
    { q: "'이상한 사람들'의 그린이는?", options: ["정중모", "김무연", "함명춘", "김민서"], answer: 1 },
    { q: "노마가 산 우표에 그려진 그림은?", options: ["여왕의 초상화", "나무 한 그루", "바다", "모나리자"], answer: 0 },
    { q: "노마는 나무 위에서 본 과일들에게 이름을 지어주었는데, 이 중 언급하지 않은 것은?", options: ["벽시계", "전화기", "자명종", "저금통"], answer: 1 },
    { q: "노마가 작은 집을 소유하게 된 나이는?", options: ["65세", "66세", "67세", "70세"], answer: 2 },
    { q: "'침묵은 금이다'의 아저씨는 몇 번의 금연 결심을 못 채워 파기하였나요?", options: ["7번", "8번", "9번", "12번"], answer: 2 },
    { q: "'침묵은 금이다'의 아저씨가 아이들에게 얘기해준 동화 중 언급된 것은?", options: ["콩쥐팥쥐", "토끼와 거북이", "흥부와 놀부", "금도끼 은도끼"], answer: 0 },
    { q: "노마의 집에 성경 액자가 그려진 페이지의 왼쪽 페이지 쪽수는?", options: ["30쪽", "32쪽", "34쪽", "28쪽"], answer: 0 },
    { q: "이 책의 가격은? (책에 표시된 것)", options: ["10000원", "12000원", "8000원", "14000원"], answer: 1 },
  ],
};

function QuizGame() {
  const [phase, setPhase] = useState("difficulty");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [locked, setLocked] = useState(false);
  const [clearedDiffs, setClearedDiffs] = useState(new Set());
  const currentDiffRef = useRef(null);

  useEffect(() => {
    setPicked(null);
    setLocked(false);
  }, [currentQ]);

  const startGame = (diff) => {
    currentDiffRef.current = diff;
    setQuestions([...QUIZ_QUESTIONS[diff]]);
    setCurrentQ(0);
    setScore(0);
    setPicked(null);
    setLocked(false);
    setPhase("playing");
  };

  const handleAnswer = (idx) => {
    if (locked) return;
    setLocked(true);
    setPicked(idx);
    const ans = questions[currentQ].answer;
    const isCorrect = Array.isArray(ans) ? ans.includes(idx) : idx === ans;
    playSound(isCorrect ? sfxCorrect : sfxWrong);
    if (isCorrect) setScore((s) => s + 1);
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setClearedDiffs(prev => new Set([...prev, currentDiffRef.current]));
        setPhase("result");
      } else {
        setCurrentQ((q) => q + 1);
        setPicked(null);
        setLocked(false);
      }
    }, 900);
  };

  if (phase === "difficulty") {
    return (
      <div className="quiz-wrap">
        <div className="quiz-diff-title">난이도를 골라주세요</div>
        <div className="quiz-diff-btns">
          {[
            { key: "easy",   label: "쉬움",   color: "#4ade80", count: QUIZ_QUESTIONS.easy.length },
            { key: "normal", label: "보통",   color: "#facc15", count: QUIZ_QUESTIONS.normal.length },
            { key: "hard",   label: "어려움", color: "#f87171", count: QUIZ_QUESTIONS.hard.length },
            { key: "hell",   label: "헬",     color: "#a855f7", count: QUIZ_QUESTIONS.hell.length, requiresClear: "hard" },
          ].map((d) => {
            const isLocked = d.requiresClear && !clearedDiffs.has(d.requiresClear);
            return (
              <button
                key={d.key}
                className="quiz-diff-btn"
                style={{ "--diff-color": isLocked ? "#555" : d.color, opacity: isLocked ? 0.5 : 1, cursor: isLocked ? "default" : "pointer" }}
                onClick={() => { if (!isLocked) { playSelect(); startGame(d.key); } }}
              >
                <span className="quiz-diff-label">{isLocked ? "🔒" : ""}{d.label}</span>
                <span className="quiz-diff-desc">{isLocked ? "어려움 클리어" : `${d.count}문제`}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const msg = pct === 100 ? "완벽해!" : pct >= 80 ? "잘했어!" : pct >= 60 ? "괜찮아!" : "다시 도전해보자!";
    return (
      <div className="quiz-wrap">
        <div className="quiz-result-title">결과</div>
        <div className="quiz-result-score">{score} / {total}</div>
        <div className="quiz-result-pct">{pct}점</div>
        <div className="quiz-result-msg">{msg}</div>
        <button className="quiz-retry-btn" onClick={() => { playSelect(); setPhase("difficulty"); }}>처음으로</button>
      </div>
    );
  }

  const q = questions[currentQ];
  return (
    <div className="quiz-wrap" style={{ position: "relative" }}>
      <button className="quiz-back-btn" onClick={() => setPhase("difficulty")}>← 뒤로</button>
      <div className="quiz-progress">{currentQ + 1} / {questions.length}</div>
      <div className="quiz-question">{q.q}</div>
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = "quiz-opt-btn";
          if (picked !== null) {
            const isAns = Array.isArray(q.answer) ? q.answer.includes(i) : i === q.answer;
            if (isAns) cls += " correct";
            else if (i === picked) cls += " wrong";
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==================== GAME MODAL ====================
const GAME_LABELS = {
  game1: "못 박기",
  ox: "포플러 나무 넘기",
  memory: "책 내용 퀴즈",
  word: "신발 닦기",
};

function GameModal({ gameId, onClose, zoom = 1 }) {
  return (
    <div className="game-modal-overlay">
      <div style={{ width: 934 * zoom, height: 660 * zoom, flexShrink: 0 }}>
      <div
        className="game-modal-panel"
        style={{ width: 934, height: 660, transform: `scale(${zoom})`, transformOrigin: "top left" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="game-modal-header">
          <span className="game-modal-title">
            {GAME_LABELS[gameId] ?? gameId}
          </span>
          <button className="game-modal-close" onClick={() => { playSelect(); onClose(); }}>✕</button>
        </div>
        <div className="game-modal-body" style={(gameId === "game1" || gameId === "ox" || gameId === "word" || gameId === "memory") ? { padding: 0 } : {}}>
          {gameId === "game1" && <NailGame />}
          {gameId === "ox" && <TreeGame />}
          {gameId === "memory" && <QuizGame />}
          {gameId === "word" && <CleaningGame />}
        </div>
      </div>
      </div>
    </div>
  );
}

// ==================== BOOK ====================
function Book({ onStartGame, zoom }) {
  const flipBookRef = useRef();
  const pageWidth = Math.round(467 * zoom);
  const pageHeight = Math.round(660 * zoom);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookState, setBookState] = useState("read");
  const [isBookReady, setIsBookReady] = useState(false);
  const backCoverPageIndex = SPREADS.length * 2 + 1;

  useEffect(() => {
    setCurrentPage(0);
    setBookState("read");
  }, [pageWidth, pageHeight]);
  const showGoFirstButton = currentPage === backCoverPageIndex && bookState === "read";

  const softenCoverPages = (pageFlip) => {
    const pageCount = pageFlip?.getPageCount?.() ?? 0;
    const firstPage = pageFlip?.getPage?.(0);
    const lastPage = pageFlip?.getPage?.(pageCount - 1);

    firstPage?.setDensity?.("soft");
    lastPage?.setDensity?.("soft");
  };

  const prepareBook = (pageFlip) => {
    setIsBookReady(false);
    softenCoverPages(pageFlip);

    window.setTimeout(() => {
      softenCoverPages(pageFlip);
      setIsBookReady(true);
    }, 80);
  };

  const goFirstPage = () => {
    flipBookRef.current?.pageFlip()?.turnToPage(0);
    setCurrentPage(0);
  };

  const goPrevPage = () => flipBookRef.current?.pageFlip()?.flipPrev();
  const goNextPage = () => flipBookRef.current?.pageFlip()?.flipNext();

  return (
    <div
      className="book-stage"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <HTMLFlipBook
        key={`book-${pageWidth}-${pageHeight}`}
        ref={flipBookRef}
        width={pageWidth}
        height={pageHeight}
        size="fixed"
        minWidth={pageWidth}
        maxWidth={pageWidth}
        minHeight={pageHeight}
        maxHeight={pageHeight}
        maxShadowOpacity={0.36}
        showCover={true}
        mobileScrollSupport={true}
        flippingTime={1000}
        useMouseEvents={true}
        drawShadow={true}
        showPageCorners={!showGoFirstButton}
        disableFlipByClick={showGoFirstButton}
        className="magic-book"
        onFlip={(e) => setCurrentPage(e.data)}
        onChangeState={(e) => { if (e.data === "flipping") playSound(sfxPageFlip); setBookState(e.data); }}
        onInit={(e) => prepareBook(e.object)}
        onUpdate={(e) => prepareBook(e.object)}
      >
        <CoverPage key="cover" />

        {SPREADS.flatMap((spread, idx) => [
          <div key={`l-${idx}`} data-density="soft" style={{ width: "100%", height: "100%", background: "#f5e8cc" }}>
            <LeftPage data={spread.left} pageNum={idx * 2 + 1} zoom={zoom} />
          </div>,

          <div key={`r-${idx}`} data-density="soft" style={{ width: "100%", height: "100%", background: "#f5e8cc" }}>
            <RightPage data={spread.right} pageNum={idx * 2 + 2} onStartGame={onStartGame} zoom={zoom} />
          </div>,
        ])}

        <BackCoverPage
          key="back-cover"
        />
      </HTMLFlipBook>

      {isBookReady && !showGoFirstButton && currentPage > 0 && (
        <button
          className="book-nav-btn"
          onClick={goPrevPage}
          style={{ left: `calc(50% - ${pageWidth}px - 52px)` }}
        >
          ◀
        </button>
      )}
      {isBookReady && !showGoFirstButton && currentPage < backCoverPageIndex && (
        <button
          className="book-nav-btn"
          onClick={goNextPage}
          style={{ left: `calc(50% + ${pageWidth}px + 12px)` }}
        >
          ▶
        </button>
      )}

      {(!isBookReady || showGoFirstButton) && (
        <div
          className="back-cover-lock"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {showGoFirstButton && (
            <button
              className="back-to-front-button"
              type="button"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerMove={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                playSelect();
                goFirstPage();
              }}
              style={{
                fontSize: `${1 * zoom}rem`,
                padding: `${0.85 * zoom}rem ${1.35 * zoom}rem`,
                bottom: `calc(50% - ${pageHeight / 2}px + ${2 * zoom}rem)`,
                left: `calc(50% - ${pageWidth / 2}px)`,
              }}
            >
              맨앞으로
            </button>
          )}
        </div>
      )}
    </div>
  );
}


// ==================== APP ====================
export default function App() {
  useGoogleFonts();
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  useEffect(() => {
    // BGM 즉시 시작 시도
    if (!_bgm) {
      _bgm = new Audio(bgmSrc);
      _bgm.loop = true;
      if (_musicOn) startBgm();
    }

    // 첫 클릭 시: 효과음 프리로드 + autoplay 막혔으면 BGM 재시도
    const onFirst = () => {
      preloadSounds([sfxHammer, sfxWrong, sfxSelect, sfxPageFlip, sfxCorrect, sfxClean, sfxJump]);
      if (_musicOn && _bgm && _bgm.paused) startBgm();
      window.removeEventListener("pointerdown", onFirst);
    };
    window.addEventListener("pointerdown", onFirst);

    // 창 포커스 잃으면 즉시 BGM 정지, 돌아오면 재생
    const onBlur  = () => { if (_bgm && _musicOn) _bgm.pause(); };
    const onFocus = () => { if (_bgm && _musicOn) _bgm.play().catch(() => {}); };
    window.addEventListener("blur",  onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("blur",  onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  const handleVolume = (v) => { setVolume(v); _vol = v / 100; syncBgmVolume(); };
  const handleMute = () => { setMuted(m => { _muted = !m; syncBgmVolume(); return !m; }); };
  const handleMusicToggle = () => {
    setMusicOn(m => {
      _musicOn = !m;
      if (_musicOn) startBgm();
      else stopBgm();
      return !m;
    });
  };
  const [activeGame, setActiveGame] = useState(null);
  const initialZoom = Math.max(0.4, Math.min(2, (window.innerWidth - 96) / (467 * 2), (window.innerHeight - 96) / 660));
  const [zoom, setZoom] = useState(initialZoom);
  const [zoomInput, setZoomInput] = useState(String(Math.round(initialZoom * 100)));
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const minZoom = 0.4;
  const maxSafeZoom = Math.max(
    0.4,
    Math.min(
      2,
      (viewport.width - 96) / (467 * 2),
      (viewport.height - 96) / 660
    )
  );
  const clampZoom = (value) =>
    Math.min(maxSafeZoom, Math.max(minZoom, value));

  const zoomOut = () => setZoom((value) => Math.max(minZoom, Number((value - 0.1).toFixed(2))));
  const zoomIn = () =>
    setZoom((value) =>
      Math.min(maxSafeZoom, Number((value + 0.1).toFixed(2)))
    );
  const resetZoom = () => setZoom(maxSafeZoom);
  const applyZoomInput = () => {
    const parsedValue = Number(zoomInput);

    if (!Number.isFinite(parsedValue)) {
      setZoomInput(String(Math.round(zoom * 100)));
      return;
    }

    const nextZoom = Number(clampZoom(parsedValue / 100).toFixed(2));
    setZoom(nextZoom);
    setZoomInput(String(Math.round(nextZoom * 100)));
  };

  useEffect(() => {
    setZoom((value) => Math.min(value, maxSafeZoom));
  }, [maxSafeZoom]);

  useEffect(() => {
    setZoomInput(String(Math.round(zoom * 100)));
  }, [zoom]);


  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        userSelect: "none",
        WebkitUserSelect: "none",
        background: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 79px,
            #000 79px,
            #000 80px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 79px,
            #000 79px,
            #000 80px
          ),
          white
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        aspectRatio: "16 / 9",
      }}
    >
      <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
        }

        html, body {
          overflow: hidden;
          height: 100%;
          touch-action: none;
        }

        .book-stage {
          perspective: 1800px;
          transform-style: preserve-3d;
        }

        .magic-book {
          filter:
            drop-shadow(0 28px 26px rgba(0, 0, 0, 0.32))
            drop-shadow(0 8px 8px rgba(0, 0, 0, 0.18));
          transform-style: preserve-3d;
        }

        .magic-book .stf__block {
          transform-style: preserve-3d;
        }

        .magic-book .stf__block::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 18px;
          transform: translateX(-50%);
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.28),
              rgba(255, 246, 213, 0.22) 46%,
              rgba(0, 0, 0, 0.28)
            );
          filter: blur(0.3px);
          pointer-events: none;
          z-index: 0;
        }

        .magic-book .stf__item {
          box-shadow:
            inset 0 0 0 1px rgba(72, 40, 15, 0.08),
            0 3px 8px rgba(0, 0, 0, 0.12);
          transform-style: preserve-3d;
          backface-visibility: hidden;
          z-index: 1;
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border: 1px solid rgba(0, 0, 0, 0.16);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: none;
          backdrop-filter: blur(8px);
        }

        .zoom-controls button {
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border: 1px solid rgba(0, 0, 0, 0.18);
          border-radius: 6px;
          background: white;
          color: #1f1710;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1;
        }

        .zoom-controls button:hover {
          background: #f5e8cc;
        }

        .zoom-controls span {
          min-width: 46px;
          text-align: center;
          color: #1f1710;
          font-family: Arial, sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
        }

        .back-cover-lock {
          position: absolute;
          inset: 0;
          z-index: 9999;
          cursor: default;
          pointer-events: auto;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }

        .back-to-front-button {
          position: absolute;
          transform: translateX(-50%);
          z-index: 10000;
          border: 1px solid rgba(201, 168, 76, 0.78);
          border-radius: 8px;
          background: rgba(29, 6, 6, 0.88);
          -webkit-tap-highlight-color: transparent;
          color: #ecd07a;
          cursor: pointer;
          font-family: "Playfair Display", serif;
          font-weight: 700;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
        }

        .back-to-front-button:hover {
          background: rgba(75, 17, 17, 0.94);
        }

        .book-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          background: rgba(0, 0, 0, 0.82);
          border: none;
          border-radius: 50%;
          color: #ffffff;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.32);
          transition: background 0.15s;
        }
        .book-nav-btn:hover {
          background: rgba(30, 30, 30, 0.95);
        }

        .game-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50000;
          background: rgba(0, 0, 0, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          user-select: none;
        }

        .game-modal-panel {
          background: linear-gradient(160deg, #1a0c06, #0d0a06);
          border: 1px solid rgba(201, 168, 76, 0.5);
          border-radius: 12px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .game-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(201, 168, 76, 0.3);
        }

        .game-modal-title {
          font-family: "Playfair Display", serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #ecd07a;
        }

        .game-modal-close {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(201, 168, 76, 0.4);
          border-radius: 6px;
          background: transparent;
          color: #c9a84c;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .game-modal-close:hover {
          background: rgba(201, 168, 76, 0.15);
          color: #ecd07a;
        }

        .game-modal-body {
          flex: 1;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ---- NAIL GAME ---- */
        .nail-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 13px;
          padding: 20px 24px;
          max-height: 100%;
          overflow-y: auto;
          width: 100%;
        }

        .nail-intro-title {
          font-family: "Playfair Display", serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #ecd07a;
        }

        .nail-intro-desc {
          color: #c9a84c;
          text-align: center;
          line-height: 1.8;
          font-size: 0.88rem;
        }

        .nail-nickname-input {
          padding: 9px 14px;
          border: 1px solid rgba(201,168,76,0.55);
          border-radius: 7px;
          background: rgba(255,255,255,0.07);
          color: #f5e8cc;
          -webkit-tap-highlight-color: transparent;
          font-size: 0.95rem;
          width: 200px;
          outline: none;
          font-family: "EB Garamond", serif;
        }
        .nail-nickname-input::placeholder { color: rgba(201,168,76,0.45); }
        .nail-nickname-input:focus { border-color: rgba(201,168,76,0.9); }

        .nail-btn {
          padding: 9px 26px;
          background: linear-gradient(135deg, #4b1111, #1d0606);
          color: #ecd07a;
          border: 1px solid rgba(201,168,76,0.55);
          -webkit-tap-highlight-color: transparent;
          border-radius: 7px;
          cursor: pointer;
          font-family: "Playfair Display", serif;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .nail-btn:hover:not(:disabled) { background: linear-gradient(135deg, #6b1919, #2d0a0a); }
        .nail-btn:disabled { opacity: 0.38; cursor: default; }

        .nail-ranking-box {
          width: 100%;
          max-width: 360px;
          border: 1px solid rgba(201,168,76,0.28);
          border-radius: 7px;
          overflow: hidden;
        }
        .nail-ranking-title {
          padding: 7px 13px;
          background: rgba(201,168,76,0.1);
          color: #ecd07a;
          font-family: "Playfair Display", serif;
          font-weight: 700;
          font-size: 0.88rem;
          border-bottom: 1px solid rgba(201,168,76,0.18);
        }
        .nail-ranking-row {
          display: flex;
          gap: 10px;
          padding: 6px 13px;
          color: #c9a84c;
          font-size: 0.83rem;
          border-bottom: 1px solid rgba(201,168,76,0.08);
          align-items: center;
        }
        .nail-ranking-row:last-child { border-bottom: none; }
        .nail-ranking-row-me { background: rgba(201,168,76,0.14); color: #ecd07a; font-weight: 700; }
        .nail-rank-num { min-width: 20px; font-weight: 700; color: #ecd07a; }
        .nail-rank-name { flex: 1; }
        .nail-rank-time { font-family: monospace; }

        .nail-playing {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          align-self: stretch;
        }
        .nail-hud {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 14px;
          background: rgba(0,0,0,0.38);
          border-bottom: 1px solid rgba(201,168,76,0.18);
          flex-shrink: 0;
        }
        .nail-hud-count {
          color: #ecd07a;
          font-family: "Playfair Display", serif;
          font-size: 0.92rem;
          font-weight: 700;
        }
        .nail-hud-timer {
          color: #c9a84c;
          font-family: monospace;
          font-size: 0.98rem;
          font-weight: 700;
          min-width: 90px;
          text-align: right;
        }
        .nail-hud-timer-warn {
          animation: timer-shake 0.18s ease-in-out infinite;
        }
        @keyframes timer-shake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }
        .nail-shake-alert {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          color: #ff7070;
          font-weight: 700;
          font-size: 0.88rem;
          animation: shake-alert-fade 0.9s ease-out forwards;
          pointer-events: none;
          white-space: nowrap;
        }

        @keyframes shake-alert-fade {
          0%   { opacity: 1; transform: translateX(-50%) scale(1.15); }
          60%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateX(-50%) scale(0.95); }
        }

        .nail-wall-shaking {
          animation: wall-tremble 150ms ease-in-out;
        }

        @keyframes wall-tremble {
          0%   { transform: translate(0,0); }
          20%  { transform: translate(-4px, 2px); }
          40%  { transform: translate(4px,-2px); }
          60%  { transform: translate(-3px, 2px); }
          80%  { transform: translate(3px,-1px); }
          100% { transform: translate(0,0); }
        }

        .nail-wall {
          flex: 1;
          position: relative;
          -webkit-tap-highlight-color: transparent;
          background:
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(130,90,40,0.1) 39px, rgba(130,90,40,0.1) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(130,90,40,0.07) 39px, rgba(130,90,40,0.07) 40px),
            #d9c9a6;
          cursor: crosshair;
          overflow: hidden;
          user-select: none;
        }
        .nail-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 160px;
          height: 200px;
          border: 14px solid #7a4e2d;
          box-shadow:
            inset 0 0 0 2px #c9913e,
            inset 0 0 0 5px #5c3318,
            0 6px 18px rgba(0,0,0,0.32);
          background: linear-gradient(135deg, #e8dcc0, #d0c090);
          border-radius: 2px;
          pointer-events: none;
        }
        .nail-head {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .nail-result-icon { font-size: 2.5rem; line-height: 1; }
        .nail-result-title {
          font-family: "Playfair Display", serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #ecd07a;
        }
        .nail-result-time {
          font-family: monospace;
          font-size: 1.85rem;
          color: #ecd07a;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .nail-result-sub { color: #c9a84c; font-size: 0.86rem; }

        .nail-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(160,0,0,0.72) 100%);
        }

        @keyframes nail-pop-out {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
          40%  { transform: translate(-50%,-50%) scale(1.7); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(0);   opacity: 0; }
        }
        .nail-popping {
          animation: nail-pop-out 0.32s ease-in forwards;
          z-index: 20;
        }

        .nail-result-card {
          width: 100%;
          max-width: 340px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 8px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-family: monospace;
        }
        .nail-result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.92rem;
          color: #c9a84c;
        }
        .nail-result-label { }
        .nail-result-val   { font-weight: 700; }
        .nail-result-gold  { color: #80c0ff; }
        .nail-result-mine  { color: #ff7070; }
        .nail-result-divider {
          color: rgba(201,168,76,0.35);
          font-size: 0.75rem;
          text-align: center;
          letter-spacing: 0.05em;
        }
        .nail-result-final {
          color: #ecd07a;
          font-size: 1.05rem;
        }
        .nail-result-final .nail-result-val { font-size: 1.2rem; }

        .nail-result-breakdown {
          display: flex;
          gap: 12px;
          font-family: monospace;
          font-size: 0.82rem;
          color: #c9a84c;
          flex-wrap: wrap;
          justify-content: center;
        }
        .nail-result-gold { color: #ecd07a; }
        .nail-result-mine { color: #ff7070; }

        .nail-hud-badge {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .nail-hud-badge-gold { background: rgba(80,160,255,0.2); color: #80c0ff; }
        .nail-hud-badge-mine { background: rgba(255,80,80,0.18); color: #ff7070; }
        .nail-hud-badge-miss { background: rgba(255,180,0,0.18); color: #ffcc44; }
        .nail-result-miss { color: #ffcc44; }

        .nail-zone {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: zone-pulse 0.9s ease-in-out infinite alternate;
        }
        .nail-zone-golden {
          background: rgba(80,160,255,0.3);
          border: 3px solid rgba(80,160,255,0.95);
          box-shadow: 0 0 24px rgba(80,160,255,0.6), inset 0 0 20px rgba(80,160,255,0.15);
        }
        .nail-zone-mine {
          background: rgba(255,80,80,0.15);
          border: 2px solid rgba(255,80,80,0.6);
          box-shadow: 0 0 18px rgba(255,80,80,0.22);
          animation-duration: 0.55s;
        }
        @keyframes zone-pulse {
          from { opacity: 0.65; transform: scale(0.96); }
          to   { opacity: 1;    transform: scale(1.04); }
        }

        .nail-head-normal {
          background: radial-gradient(circle at 33% 30%, #d0d0d0, #666 52%, #1a1a1a);
          box-shadow: 0 1px 3px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.22);
        }
        .nail-head-golden {
          background: radial-gradient(circle at 33% 30%, #b0d8ff, #3090ff 52%, #003880);
          box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 0 8px rgba(80,160,255,0.8);
        }
        .nail-head-mine {
          background: radial-gradient(circle at 33% 30%, #ff9090, #cc2222 52%, #5c0000);
          box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 0 8px rgba(200,0,0,0.55);
        }


        /* ---- TREE GAME ---- */
        .tree-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          height: 100%;
          align-self: stretch;
          background: #0d0a06;
        }
        .tree-main {
          display: flex;
          flex-direction: row;
          flex: 1;
          width: 100%;
          overflow: hidden;
        }
        .tree-practice-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          gap: 8px;
          width: 78px;
          flex-shrink: 0;
          background: rgba(0,0,0,0.25);
          border-left: 1px solid rgba(201,168,76,0.15);
        }
        .tree-practice-btn {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          padding: 14px 8px;
          background: linear-gradient(180deg, #1a3a1a, #0d200d);
          color: #90dd90;
          border: 1px solid rgba(100,200,100,0.4);
          border-radius: 6px;
          cursor: pointer;
          font-family: "Playfair Display", serif;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          -webkit-tap-highlight-color: transparent;
        }
        .tree-practice-btn:hover:not(:disabled) { background: linear-gradient(180deg, #2a5a2a, #1a3a1a); }
        .tree-practice-btn.active { background: linear-gradient(180deg, #3a1a1a, #200d0d); color: #dd9090; border-color: rgba(200,100,100,0.4); }
        .tree-practice-btn.active:hover:not(:disabled) { background: linear-gradient(180deg, #5a2a2a, #3a1a1a); }
        .tree-practice-btn:disabled { opacity: 0.38; cursor: default; }
        .tree-practice-combo {
          color: #90dd90;
          font-family: "Playfair Display", serif;
          font-size: 0.82rem;
          font-weight: 700;
          text-align: center;
        }
        .tree-practice-bonus-disp {
          color: #80c0ff;
          font-family: monospace;
          font-size: 0.8rem;
          text-align: center;
        }
        .tree-hud-bonus { color: #80c0ff; font-size: 0.75rem; margin-left: 2px; }
        .pbar-wrap { position: absolute; }
        .pbar-stand {
          position: absolute;
          bottom: 0;
          width: 5px;
          height: 100%;
          background: #8a8a8a;
          border-radius: 2px;
        }
        .pbar-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: linear-gradient(to right, #cc2222, #ff5555, #cc2222);
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255,80,80,0.6);
        }
        .tree-hud {
          display: flex;
          gap: 20px;
          align-items: center;
          padding: 10px 20px;
          background: rgba(0,0,0,0.4);
          border-bottom: 1px solid rgba(201,168,76,0.2);
          width: 100%;
          justify-content: center;
          flex-shrink: 0;
        }
        .tree-hud-stage  { color: #ecd07a; font-family: "Playfair Display", serif; font-weight: 700; font-size: 0.88rem; }
        .tree-hud-age    { color: #c9a84c; font-size: 0.85rem; }
        .tree-hud-height { color: #90dd90; font-size: 0.85rem; }
        .tree-hud-prob   { color: #80c0ff; font-family: monospace; font-size: 0.82rem; }
        .tree-scene {
          position: relative;
          flex: 1;
          overflow: hidden;
          background: linear-gradient(to bottom, #87ceeb 0%, #b8d9f0 60%, #c8dea8 100%);
          transition: transform 1.2s cubic-bezier(0.33, 1, 0.68, 1);
          transform-origin: 70% 96%;
        }
        .tree-scene-zoom {
          transform: scale(2.8);
        }
        .tree-ground {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 25px;
          background: linear-gradient(to bottom, #5a8a3a, #3d5a20);
          border-top: 3px solid #7ab050;
        }
        .tree-poplar {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          width: auto;
        }
        .tree-img {
          height: 100%;
          width: auto;
          object-fit: contain;
          display: block;
          pointer-events: none;
          user-select: none;
        }
        .tree-img-overlay {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        .tree-trunk {
          width: 14px;
          height: 26px;
          background: linear-gradient(to right, #8b5e3c, #6b4423);
          border-radius: 2px;
          flex-shrink: 0;
        }
        .tree-char {
          position: absolute;
          left: 28%;
          bottom: 25px;
          width: 72px;
          height: 72px;
          will-change: transform;
        }
        .tree-char img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .tree-char-clear { left: auto; right: 30%; }
        .tree-dead-msg {
          color: #ff7070;
          font-family: "Playfair Display", serif;
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          padding: 10px 0;
          flex-shrink: 0;
          width: 100%;
          background: rgba(0,0,0,0.55);
          border-top: 1px solid rgba(255,80,80,0.2);
        }
        .tree-death-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .tree-death-card {
          background: rgba(12,3,3,0.94);
          border: 1px solid rgba(255,80,80,0.4);
          border-radius: 10px;
          padding: 24px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 32px rgba(0,0,0,0.6);
        }
        .tree-death-stage {
          color: #ff7070;
          font-family: "Playfair Display", serif;
          font-size: 1.3rem;
          font-weight: 700;
          text-align: center;
        }
        .tree-cleared-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          padding: 8px 0;
        }
        .tree-cleared-msg {
          color: #ecd07a;
          font-family: "Playfair Display", serif;
          font-size: 1.3rem;
          font-weight: 700;
          text-align: center;
        }
        .tree-btn {
          padding: 10px 32px;
          background: linear-gradient(135deg, #4b1111, #1d0606);
          color: #ecd07a;
          border: 1px solid rgba(201,168,76,0.55);
          border-radius: 7px;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
          font-family: "Playfair Display", serif;
          font-size: 1rem;
          font-weight: 700;
          flex-shrink: 0;
          margin-bottom: 8px;
        }
        .tree-btn:hover { background: linear-gradient(135deg, #6b1919, #2d0a0a); }
        .tree-btn-practice { background: linear-gradient(135deg, #113333, #061d1d); color: #7addc8; border-color: rgba(76,201,180,0.55); }
        .tree-btn-practice:hover { background: linear-gradient(135deg, #194f4f, #0d2d2d); }
        .tree-char-ascending {
          animation: tree-char-ascend 1.7s ease-in forwards;
        }
        @keyframes tree-char-ascend {
          0%   { transform: translateY(0) scale(1);    opacity: 1; }
          25%  { transform: translateY(-60px) scale(1.15); opacity: 1; }
          100% { transform: translateY(-420px) scale(0.5); opacity: 0; }
        }
        .tree-canopy-fade {
          animation: tree-canopy-fade 1.7s ease-out forwards;
        }
        @keyframes tree-canopy-fade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        .tree-shoes {
          position: absolute;
          right: 30%;
          bottom: 25px;
          font-size: 1.8rem;
          line-height: 1;
          animation: tree-shoes-fall 1.0s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes tree-shoes-fall {
          0%   { transform: translateY(-270px); opacity: 0; }
          20%  { opacity: 1; }
          82%  { transform: translateY(8px); }
          100% { transform: translateY(0); }
        }

        /* ---- SHOE CLEANING GAME ---- */
        .clean-wrap {
          width: 100%;
          height: 100%;
          display: flex;
          background: #1a0e08;
          color: #f5e8cc;
        }
        .clean-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 24px;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .clean-right {
          width: 260px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 24px 18px;
          overflow-y: auto;
        }
        .clean-idle-title {
          font-family: "Playfair Display", serif;
          font-size: 1.8rem;
          color: #ecd07a;
        }
        .clean-idle-sub {
          font-size: 0.88rem;
          color: #777;
          font-family: "EB Garamond", serif;
        }
        .clean-start-btn {
          margin-top: 12px;
          padding: 18px 56px;
          border-radius: 12px;
          border: 2px solid #ecd07a;
          background: transparent;
          color: #ecd07a;
          font-family: "Playfair Display", serif;
          font-size: 1.5rem;
          font-weight: 700;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          transition: background 0.2s, transform 0.1s;
        }
        .clean-start-btn:hover { background: rgba(236,208,122,0.12); }
        .clean-start-btn:active { transform: scale(0.96); }
        .clean-done-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .clean-done-big {
          font-family: "Playfair Display", serif;
          font-size: 2rem;
          color: #4ade80;
          text-shadow: 0 0 16px rgba(74,222,128,0.5);
        }
        .clean-done-reward {
          font-family: "Playfair Display", serif;
          font-size: 1.2rem;
          color: #ecd07a;
        }
        .clean-auto-info {
          font-size: 0.78rem;
          color: #6090c0;
          font-family: monospace;
        }
        .clean-shoe-name {
          font-family: "Playfair Display", serif;
          font-size: 1.15rem;
          color: #ecd07a;
        }
        .clean-dirt-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: #aaa;
          width: 100%;
          max-width: 320px;
        }
        .clean-dirt-bar {
          flex: 1;
          height: 10px;
          background: rgba(255,255,255,0.1);
          border-radius: 5px;
          overflow: hidden;
        }
        .clean-dirt-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ade80, #22c55e);
          border-radius: 5px;
          transition: width 0.1s linear;
        }
        .clean-shoe-wrap {
          position: relative;
          width: 200px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 16px;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: border-color 0.15s, transform 0.1s;
          touch-action: none;
        }
        .clean-shoe-wrap.clean-shoe-active {
          border-color: #ecd07a;
          transform: scale(0.96);
        }
        .clean-shoe-wrap.clean-shoe-done { border-color: #4ade80; }
        .clean-shoe-img {
          width: 140px;
          height: 100px;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
          position: relative;
          z-index: 1;
        }
        .clean-dirt-overlay {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: radial-gradient(ellipse at center, rgba(90,48,16,0.9), rgba(40,20,5,0.7));
          pointer-events: none;
          z-index: 2;
          transition: opacity 0.1s;
        }
        .clean-done-badge {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Playfair Display", serif;
          font-size: 1.3rem;
          color: #4ade80;
          z-index: 3;
          text-shadow: 0 0 12px rgba(74,222,128,0.6);
        }
        .clean-hint {
          font-size: 0.82rem;
          color: #777;
          font-family: "EB Garamond", serif;
        }
        .clean-back-btn {
          margin-top: 4px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 6px;
          color: #888;
          font-size: 0.8rem;
          padding: 5px 12px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          transition: color 0.15s, border-color 0.15s;
        }
        .clean-back-btn:hover { color: #ecd07a; border-color: #ecd07a; }
        .clean-coins {
          font-family: "Playfair Display", serif;
          font-size: 1.35rem;
          color: #ecd07a;
          text-align: center;
        }
        .clean-power-info {
          font-size: 0.75rem;
          color: #777;
          text-align: center;
          font-family: monospace;
        }
        .clean-upgrade-section { display: flex; flex-direction: column; gap: 7px; }
        .clean-upgrade-title {
          font-family: "Playfair Display", serif;
          font-size: 0.92rem;
          color: #c9a84c;
          margin-bottom: 2px;
        }
        .clean-buy-btn {
          margin-top: 4px;
          padding: 10px;
          border-radius: 8px;
          border: 1.5px solid #ecd07a;
          background: transparent;
          color: #ecd07a;
          font-family: "Playfair Display", serif;
          font-size: 0.82rem;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          transition: background 0.15s;
        }
        .clean-buy-btn:hover:not(:disabled) { background: rgba(236,208,122,0.12); }
        .clean-buy-btn:disabled { opacity: 0.38; cursor: default; }
        .clean-maxed { font-size: 0.78rem; color: #4ade80; text-align: center; margin-top: 4px; }
        .clean-upgrade-locked { opacity: 0.35; }
        .clean-ending-btn { border-color: #c8a8ff; color: #c8a8ff; }
        .clean-ending-btn:hover:not(:disabled) { background: rgba(200,168,255,0.12); }

        /* ---- VN SHARED (선택·완료 화면) ---- */
        .vn-bg-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          pointer-events: none;
          z-index: 0;
        }
        .vn-end {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background-size: cover;
          background-position: center;
        }
        .vn-end-icon { font-size: 2.5rem; color: #c8a8ff; }
        .vn-end-title {
          font-family: "Playfair Display", serif;
          font-size: 2rem;
          font-weight: 700;
          color: #e8d8ff;
          letter-spacing: 0.3em;
        }
        .vn-btn {
          padding: 10px 28px;
          background: rgba(100,60,200,0.3);
          border: 1px solid rgba(160,100,255,0.55);
          border-radius: 7px;
          color: #e8d8ff;
          font-family: "Playfair Display", serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
        }
        .vn-btn:hover { background: rgba(130,80,240,0.45); }

        .vn-select-wrap {
          width: 100%;
          height: 100%;
          position: relative;
          background-size: cover;
          background-position: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }
        .vn-select-title {
          position: relative;
          z-index: 1;
          font-family: "Playfair Display", serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #f0eaff;
          letter-spacing: 0.08em;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        }
        .vn-shoe-grid {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 18px;
          padding: 0 24px;
          max-width: 420px;
          max-width: 700px;
        }
        .vn-shoe-btn {
          width: 116px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: rgba(0,0,0,0.52);
          border: 1px solid rgba(160,100,255,0.4);
          border-radius: 10px;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.12s;
        }
        .vn-shoe-btn:hover {
          background: rgba(100,60,200,0.38);
          border-color: rgba(180,130,255,0.85);
          transform: translateY(-4px);
        }
        .vn-shoe-img {
          width: 80px;
          height: 60px;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }
        .vn-shoe-label {
          font-family: "EB Garamond", serif;
          font-size: 0.88rem;
          color: #e8d8ff;
        }
        .vn-shoe-done {
          opacity: 0.4;
          cursor: default;
          border-color: rgba(160,100,255,0.15);
        }
        .vn-shoe-done:hover {
          background: rgba(0,0,0,0.52);
          border-color: rgba(160,100,255,0.15);
          transform: none;
        }

        /* ---- QUIZ GAME ---- */
        .quiz-wrap {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 32px;
          box-sizing: border-box;
          background: #1a0e08;
          color: #f5e8cc;
          -webkit-tap-highlight-color: transparent;
        }
        .quiz-diff-title {
          font-family: "Playfair Display", serif;
          font-size: 1.8rem;
          color: #ecd07a;
        }
        .quiz-diff-btns {
          display: flex;
          gap: 20px;
        }
        .quiz-diff-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 120px;
          padding: 20px 0;
          border: 2px solid var(--diff-color);
          border-radius: 12px;
          background: transparent;
          color: var(--diff-color);
          cursor: pointer;
          transition: background 0.2s;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }
        .quiz-diff-btn:hover {
          background: rgba(255,255,255,0.07);
        }
        .quiz-diff-label {
          font-family: "Playfair Display", serif;
          font-size: 1.4rem;
          font-weight: 700;
        }
        .quiz-diff-desc {
          font-size: 0.85rem;
          opacity: 0.75;
        }
        .quiz-back-btn {
          position: absolute;
          top: 14px;
          left: 16px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          color: #aaa;
          font-size: 0.82rem;
          padding: 5px 10px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          transition: color 0.15s, border-color 0.15s;
        }
        .quiz-back-btn:hover {
          color: #ecd07a;
          border-color: #ecd07a;
        }
        .quiz-progress {
          font-size: 0.9rem;
          color: #aaa;
          align-self: flex-start;
        }
        .quiz-question {
          font-family: "Playfair Display", serif;
          font-size: 1.3rem;
          text-align: center;
          line-height: 1.65;
          color: #f5e8cc;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 22px 28px;
          width: 100%;
          box-sizing: border-box;
        }
        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .quiz-opt-btn {
          padding: 16px 12px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.04);
          color: #f5e8cc;
          font-family: "EB Garamond", serif;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }
        .quiz-opt-btn:hover:not(.correct):not(.wrong) {
          background: rgba(255,255,255,0.1);
          border-color: #ecd07a;
        }
        .quiz-opt-btn.correct {
          background: rgba(74,222,128,0.22);
          border-color: #4ade80;
          color: #4ade80;
        }
        .quiz-opt-btn.wrong {
          background: rgba(248,113,113,0.22);
          border-color: #f87171;
          color: #f87171;
        }
        .quiz-result-title {
          font-family: "Playfair Display", serif;
          font-size: 1.6rem;
          color: #ecd07a;
        }
        .quiz-result-score {
          font-size: 3rem;
          font-weight: 700;
          color: #f5e8cc;
        }
        .quiz-result-pct {
          font-size: 1.3rem;
          color: #aaa;
        }
        .quiz-result-msg {
          font-size: 1.1rem;
          color: #ecd07a;
        }
        .quiz-retry-btn {
          margin-top: 8px;
          padding: 12px 36px;
          border-radius: 8px;
          border: 1.5px solid #ecd07a;
          background: transparent;
          color: #ecd07a;
          font-family: "Playfair Display", serif;
          font-size: 1rem;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          transition: background 0.2s;
        }
        .quiz-retry-btn:hover {
          background: rgba(236,208,122,0.13);
        }

      `}</style>

      <div style={{ position: "fixed", top: 12, right: 24, zIndex: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: "1px solid rgba(0,0,0,0.16)", borderRadius: 8, background: "rgba(255,255,255,0.82)", boxShadow: "none", backdropFilter: "blur(8px)", fontSize: "0.82rem", color: "#1a1a1a", whiteSpace: "nowrap", pointerEvents: "none" }}>
          tip: 큰화면으로 플레이하면 편하다
        </div>
        <div className="zoom-controls" aria-label="zoom controls">
          <button type="button" onClick={() => { playSelect(); zoomOut(); }} aria-label="zoom out">-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => { playSelect(); zoomIn(); }} aria-label="zoom in">+</button>
          <button type="button" onClick={() => { playSelect(); resetZoom(); }} aria-label="reset zoom">초기화</button>
        </div>
      </div>

      <div style={{ position: "fixed", top: 12, left: 16, zIndex: 20, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid rgba(0,0,0,0.16)", borderRadius: 8, background: "rgba(255,255,255,0.82)", boxShadow: "none", backdropFilter: "blur(8px)" }}>
        <button
          type="button"
          onClick={handleMusicToggle}
          title={musicOn ? "음악 끄기" : "음악 켜기"}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: 0, lineHeight: 1, flexShrink: 0, WebkitTapHighlightColor: "transparent", opacity: musicOn ? 1 : 0.35 }}
        >🎵</button>
        <button
          type="button"
          onClick={handleMute}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: 0, lineHeight: 1, flexShrink: 0, WebkitTapHighlightColor: "transparent" }}
        >{muted ? "🔇" : "🔊"}</button>
        <input
          type="range" min={0} max={100} value={muted ? 0 : volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
          style={{ width: 160, cursor: "pointer", accentColor: "#4b1111", flexShrink: 0 }}
        />
        <span style={{ fontSize: "0.75rem", color: "#333", width: "2.5em", textAlign: "right", flexShrink: 0 }}>{muted ? 0 : volume}%</span>
      </div>

      {/* 16:9 영역 */}
      <div
        style={{
          width: "100%",

          height: "100%",

          display: "flex",

          flexDirection: "column",

          alignItems: "center",

          justifyContent: "center",

          position: "relative",
        }}
      >
        <Book onStartGame={setActiveGame} zoom={zoom} />
      </div>

      <div style={{ position: "fixed", bottom: 12, right: 16, zIndex: 20, fontSize: "0.75rem", color: "rgba(0,0,0,0.45)", fontFamily: "Arial, sans-serif", pointerEvents: "none", background: "white", padding: "2px 6px", borderRadius: 4 }}>
        made by 임승주, 류현서, claudeAI
      </div>

      {activeGame && (
        <GameModal gameId={activeGame} onClose={() => setActiveGame(null)} zoom={zoom} />
      )}
    </div>
  );
}
