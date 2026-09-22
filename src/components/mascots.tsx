import type { CSSProperties } from "react";
import type { CharacterId } from "@/lib/trail-types";
import { Nina3D } from "@/components/nina-3d";

export type MascotMood = "idle" | "talk" | "happy" | "sad" | "cheer";

const INK = "#2b2118";

/** Rosto animado: olhos que piscam, bochechas e boca que muda conforme o humor. */
function Face({
  mood,
  cx,
  cy,
  gap = 14,
  r = 5,
}: {
  mood: MascotMood;
  cx: number;
  cy: number;
  gap?: number;
  r?: number;
}) {
  const lx = cx - gap;
  const rx = cx + gap;
  const joyful = mood === "happy" || mood === "cheer";
  return (
    <g>
      {joyful ? (
        <>
          <path
            d={`M${lx - 5} ${cy + 2} q5 -9 10 0`}
            stroke={INK}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${rx - 5} ${cy + 2} q5 -9 10 0`}
            stroke={INK}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <g className="nc-blink">
          <ellipse cx={lx} cy={cy} rx={r} ry={r * 1.2} fill={INK} />
          <ellipse cx={rx} cy={cy} rx={r} ry={r * 1.2} fill={INK} />
          <circle cx={lx + 1.6} cy={cy - 2.2} r={1.8} fill="#fff" />
          <circle cx={rx + 1.6} cy={cy - 2.2} r={1.8} fill="#fff" />
        </g>
      )}
      {mood === "sad" && (
        <>
          <path
            d={`M${lx - 6} ${cy - 5} l10 -4`}
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <path
            d={`M${rx + 6} ${cy - 5} l-10 -4`}
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <path
            d={`M${rx + 2} ${cy + 8} q-3 6 0 8 q3 -2 0 -8z`}
            fill="#7dd3fc"
            className="nc-twinkle"
          />
        </>
      )}
      <circle cx={lx - 7} cy={cy + 9} r={5} fill="#fb7185" opacity={0.42} />
      <circle cx={rx + 7} cy={cy + 9} r={5} fill="#fb7185" opacity={0.42} />
      {mood === "talk" ? (
        <g>
          <ellipse className="nc-talk" cx={cx} cy={cy + 14} rx={6} ry={5.5} fill="#7f1d1d" />
        </g>
      ) : joyful ? (
        <g>
          <path d={`M${cx - 10} ${cy + 9} q10 17 20 0z`} fill="#7f1d1d" />
          <path d={`M${cx - 5} ${cy + 17} q5 -5 10 0 q-5 4 -10 0z`} fill="#fb7185" />
        </g>
      ) : mood === "sad" ? (
        <path
          d={`M${cx - 6} ${cy + 17} q6 -8 12 0`}
          stroke={INK}
          strokeWidth={2.8}
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d={`M${cx - 7} ${cy + 10} q7 8 14 0`}
          stroke={INK}
          strokeWidth={2.8}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** Braço que muda de posição conforme o humor e balança quando o personagem comemora. */
function Arm({
  side,
  x,
  y,
  color,
  mood,
  handColor,
}: {
  side: -1 | 1;
  x: number;
  y: number;
  color: string;
  mood: MascotMood;
  handColor?: string;
}) {
  const angle =
    mood === "cheer" ? 155 : mood === "happy" ? 40 : mood === "sad" ? 4 : mood === "talk" ? 22 : 14;
  return (
    <g transform={`rotate(${side * angle} ${x} ${y})`}>
      <g className={mood === "cheer" || (mood === "talk" && side === 1) ? "nc-wave" : undefined}>
        <ellipse cx={x + side * 3} cy={y + 12} rx={6.5} ry={13} fill={color} />
        {handColor && <circle cx={x + side * 3} cy={y + 24} r={6} fill={handColor} />}
      </g>
    </g>
  );
}

function Feet({ color, y = 133, gap = 17 }: { color: string; y?: number; gap?: number }) {
  return (
    <>
      <ellipse cx={60 - gap} cy={y} rx={11} ry={6} fill={color} />
      <ellipse cx={60 + gap} cy={y} rx={11} ry={6} fill={color} />
    </>
  );
}

const Shadow = () => <ellipse cx={60} cy={138} rx={30} ry={4.5} fill="#000" opacity={0.12} />;

function Lipe({ mood }: { mood: MascotMood }) {
  return (
    <>
      <Shadow />
      <Feet color="#3f6212" />
      <Arm side={-1} x={20} y={82} color="#4d7c0f" mood={mood} />
      <Arm side={1} x={100} y={82} color="#4d7c0f" mood={mood} />
      <path
        d="M60 8 C92 8 106 52 106 88 C106 118 86 134 60 134 C34 134 14 118 14 88 C14 52 28 8 60 8Z"
        fill="#4d7c0f"
      />
      <path
        d="M60 20 C86 20 95 56 95 88 C95 111 79 124 60 124 C41 124 25 111 25 88 C25 56 34 20 60 20Z"
        fill="#d9f99d"
      />
      <circle cx={60} cy={102} r={17} fill="#a16207" />
      <ellipse cx={54} cy={96} rx={5} ry={7} fill="#fff" opacity={0.25} />
      <Face mood={mood} cx={60} cy={58} gap={14} />
    </>
  );
}

function Tito({ mood }: { mood: MascotMood }) {
  return (
    <>
      <Shadow />
      <Feet color="#65a30d" />
      <Arm side={-1} x={36} y={88} color="#a3e635" mood={mood} />
      <Arm side={1} x={84} y={88} color="#a3e635" mood={mood} />
      <path
        d="M40 64 C36 92 40 124 50 130 L70 130 C80 124 84 92 80 64Z"
        fill="#bef264"
        stroke="#84cc16"
        strokeWidth={2}
      />
      <g className="nc-wobble" style={{ transformOrigin: "60px 56px" }}>
        <circle cx={36} cy={44} r={22} fill="#15803d" />
        <circle cx={84} cy={44} r={22} fill="#15803d" />
        <circle cx={60} cy={30} r={26} fill="#16a34a" />
        <circle cx={44} cy={58} r={17} fill="#16a34a" />
        <circle cx={76} cy={58} r={17} fill="#16a34a" />
        <circle cx={52} cy={24} r={6} fill="#4ade80" opacity={0.7} />
        <circle cx={30} cy={38} r={5} fill="#4ade80" opacity={0.6} />
        <circle cx={88} cy={40} r={5} fill="#4ade80" opacity={0.6} />
      </g>
      <Face mood={mood} cx={60} cy={90} gap={12} r={4.6} />
    </>
  );
}

function Mila({ mood }: { mood: MascotMood }) {
  return (
    <>
      <Shadow />
      <Feet color="#b91c1c" y={132} />
      <Arm side={-1} x={14} y={78} color="#dc2626" mood={mood} />
      <Arm side={1} x={106} y={78} color="#dc2626" mood={mood} />
      <path
        d="M60 34 C46 18 14 28 14 68 C14 106 38 130 60 122 C82 130 106 106 106 68 C106 28 74 18 60 34Z"
        fill="#ef4444"
      />
      <ellipse
        cx={34}
        cy={54}
        rx={6}
        ry={12}
        fill="#fff"
        opacity={0.32}
        transform="rotate(-25 34 54)"
      />
      <path
        d="M60 34 C60 24 62 16 69 9"
        stroke="#78350f"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <g className="nc-sway" style={{ transformOrigin: "64px 24px" }}>
        <path d="M65 22 C75 6 94 8 98 16 C91 32 73 32 65 22Z" fill="#22c55e" />
        <path d="M68 22 C76 16 86 14 92 15" stroke="#15803d" strokeWidth={1.6} fill="none" />
      </g>
      <Face mood={mood} cx={60} cy={72} gap={16} />
    </>
  );
}

function Cadu({ mood }: { mood: MascotMood }) {
  return (
    <>
      <Shadow />
      <Feet color="#c2410c" y={134} gap={10} />
      <Arm side={-1} x={30} y={74} color="#fb923c" mood={mood} />
      <Arm side={1} x={90} y={74} color="#fb923c" mood={mood} />
      <g className="nc-sway" style={{ transformOrigin: "60px 34px" }}>
        <path d="M60 34 C48 12 34 6 30 12 C34 26 46 34 60 38Z" fill="#22c55e" />
        <path d="M60 34 C60 10 66 -2 72 0 C76 12 70 28 60 38Z" fill="#16a34a" />
        <path d="M60 34 C72 14 88 8 92 14 C88 28 74 34 60 38Z" fill="#22c55e" />
      </g>
      <path
        d="M60 32 C94 32 100 64 80 116 C72 138 48 138 40 116 C20 64 26 32 60 32Z"
        fill="#fb923c"
      />
      <path
        d="M36 90 q8 3 14 0 M70 100 q8 3 14 0 M44 112 q6 2 10 0"
        stroke="#ea580c"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx={38}
        cy={54}
        rx={4.5}
        ry={10}
        fill="#fff"
        opacity={0.28}
        transform="rotate(12 38 54)"
      />
      <Face mood={mood} cx={60} cy={60} gap={14} />
    </>
  );
}

function Nina({ mood }: { mood: MascotMood }) {
  const skin = "#c98f6b";
  return (
    <>
      <Shadow />
      <Feet color="#334155" y={134} gap={13} />
      <Arm side={-1} x={34} y={84} color="#ffffff" handColor={skin} mood={mood} />
      <Arm side={1} x={86} y={84} color="#ffffff" handColor={skin} mood={mood} />
      <circle cx={60} cy={14} r={11} fill="#3b2416" />
      <circle cx={60} cy={44} r={31} fill="#3b2416" />
      <path
        d="M28 128 C28 92 40 78 60 76 C80 78 92 92 92 128Z"
        fill="#fff"
        stroke="#e2e8f0"
        strokeWidth={2}
      />
      <path d="M49 78 L60 98 L71 78Z" fill="#34d399" />
      <path
        d="M44 84 C38 106 56 112 60 100"
        stroke="#64748b"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={60} cy={102} r={3.4} fill="#94a3b8" />
      <rect x={70} y={98} width={14} height={9} rx={2} fill="#dcfce7" stroke="#86efac" />
      <circle cx={60} cy={50} r={26} fill={skin} />
      <path d="M33 46 C33 22 87 22 87 46 C76 34 46 32 33 46Z" fill="#3b2416" />
      <Face mood={mood} cx={60} cy={52} gap={11} r={4.2} />
    </>
  );
}

const DRAW: Record<CharacterId, (p: { mood: MascotMood }) => React.ReactNode> = {
  lipe: Lipe,
  tito: Tito,
  mila: Mila,
  cadu: Cadu,
  nina: Nina,
};

const MOOD_CLASS: Record<MascotMood, string> = {
  idle: "nc-bob",
  talk: "nc-bob-fast",
  happy: "nc-hop",
  cheer: "nc-hop-loop",
  sad: "nc-shake",
};

/**
 * Personagem animado (SVG). Humores: `idle` respira e pisca; `talk` mexe a boca;
 * `happy` pula uma vez; `cheer` pula acenando; `sad` treme uma vez.
 * Troque a `key` para repetir animações de uma vez só.
 */
export function Mascot({
  id,
  mood = "idle",
  size = 96,
  className = "",
  style,
  flip = false,
}: {
  id: CharacterId;
  mood?: MascotMood;
  size?: number;
  className?: string;
  style?: CSSProperties;
  flip?: boolean;
}) {
  const Draw = DRAW[id];
  // A Nina é um personagem 3D: busto em tamanhos pequenos, corpo inteiro nos grandes.
  const nina = id === "nina";
  const bust = size <= 110;
  const height = nina && !bust ? size * 1.5 : nina ? (size * 233) / 200 : (size * 140) / 120;
  return (
    <div
      className={`inline-block shrink-0 select-none ${MOOD_CLASS[mood]} ${className}`}
      style={{ width: size, height, ...style }}
      aria-hidden="true"
    >
      {nina ? (
        <div
          style={
            flip
              ? { transform: "scaleX(-1)", width: "100%", height: "100%" }
              : { width: "100%", height: "100%" }
          }
        >
          <Nina3D mood={mood} bust={bust} />
        </div>
      ) : (
        <svg
          viewBox="0 0 120 140"
          width="100%"
          height="100%"
          style={flip ? { transform: "scaleX(-1)" } : undefined}
          overflow="visible"
        >
          <Draw mood={mood} />
        </svg>
      )}
    </div>
  );
}
