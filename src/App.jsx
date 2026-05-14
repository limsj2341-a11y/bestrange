import {
  useState,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import coverImg from "./assets/nana.png";
import backCoverImg from "./assets/kaka.png";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://uvveffiuekvjmbqhlqnt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dmVmZml1ZWt2am1icWhscW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTIwNTgsImV4cCI6MjA5NDI2ODA1OH0.pBKdyDAr_Tb-COFzkGCweyAHVb-VTWJjrQm2Cbmn9Hc"
);

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
    },
  },

  {
    left: {
      title: "O X 퀴즈",
      content:
        "이야기를 읽고 맞으면 ⭕ 틀리면 ❌를 누르는 간단한 게임입니다.",
    },

    right: {
      type: "game",
      gameId: "ox",
      label: "게임 시작하기",
    },
  },

  {
    left: {
      title: "카드 뒤집기",
      content:
        "같은 그림의 카드를 찾아 짝을 맞춰보세요.",
    },

    right: {
      type: "game",
      gameId: "memory",
      label: "게임 시작하기",
    },
  },

  {
    left: {
      title: "낱말 게임",
      content:
        "흩어진 글자를 올바른 순서로 배열해 단어를 완성해 보세요.",
    },

    right: {
      type: "game",
      gameId: "word",
      label: "게임 시작하기",
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
              }}
              onClick={() => onStartGame(data.gameId)}
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
    style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}
  >
    <img
      src={backCoverImg}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
  const [endingStats, setEndingStats] = useState({ gCount: 0, mCount: 0, rawTime: 0, finalTime: 0 });
  const [rankings, setRankings] = useState([]);

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const r = NAIL_MIN_DIST / 2;
    if (x < r || y < r || x > rect.width - r || y > rect.height - r) return;

    const cur = nailsRef.current;
    if (cur.some((n) => Math.hypot(n.x - x, n.y - y) < NAIL_MIN_DIST)) {
      if (!shaking) startTimeRef.current -= 50;
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
      const finalTime = Math.max(0, ft - gCount * 300 + mCount * 300);
      setEndingStats({ gCount, mCount, rawTime: ft, finalTime });
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
    nailsRef.current = [];
    setNails([]);
    setElapsed(0);
    setGoldenZone(null);
    setMineZones([]);
    setPhase("playing");
  };

  const calcFinalTime = (nailsArr, elapsedMs) => {
    const g = nailsArr.filter((n) => n.type === "golden").length;
    const m = nailsArr.filter((n) => n.type === "mine").length;
    return Math.max(0, elapsedMs - g * 100 + m * 300);
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
    const { gCount, mCount, rawTime, finalTime } = endingStats;
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

// ==================== GAME MODAL ====================
const GAME_LABELS = {
  game1: "못 박기",
  ox: "OX 퀴즈",
  memory: "카드 맞추기",
  word: "낱말 게임",
};

function GameModal({ gameId, onClose }) {
  return (
    <div className="game-modal-overlay">
      <div className="game-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="game-modal-header">
          <span className="game-modal-title">
            {GAME_LABELS[gameId] ?? gameId}
          </span>
          <button className="game-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="game-modal-body" style={gameId === "game1" ? { padding: 0 } : {}}>
          {gameId === "game1" && <NailGame />}
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
        onChangeState={(e) => setBookState(e.data)}
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
              onPointerDown={(e) => e.stopPropagation()}
              onPointerMove={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
  const [activeGame, setActiveGame] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [zoomInput, setZoomInput] = useState("100");
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
  const resetZoom = () => setZoom(1);
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
        height: "100vh",
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
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border: 1px solid rgba(0, 0, 0, 0.16);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
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
        }

        .back-to-front-button {
          position: absolute;
          transform: translateX(-50%);
          z-index: 10000;
          border: 1px solid rgba(201, 168, 76, 0.78);
          border-radius: 8px;
          background: rgba(29, 6, 6, 0.88);
          color: #ecd07a;
          cursor: pointer;
          font-family: "Playfair Display", serif;
          font-weight: 700;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
        }

        .back-to-front-button:hover {
          background: rgba(75, 17, 17, 0.94);
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
          width: min(820px, 90vw);
          height: min(580px, 85vh);
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

      `}</style>

      <div className="zoom-controls" aria-label="zoom controls">
        <button type="button" onClick={zoomOut} aria-label="zoom out">
          -
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={zoomIn} aria-label="zoom in">
          +
        </button>
        <button type="button" onClick={resetZoom} aria-label="reset zoom">
          초기화
        </button>
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

      {activeGame && (
        <GameModal gameId={activeGame} onClose={() => setActiveGame(null)} />
      )}
    </div>
  );
}
