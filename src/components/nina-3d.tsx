import { useEffect, useId, useRef } from "react";
import type { MascotMood } from "@/components/mascots";

/**
 * Nutri Nina: personagem com aparência 3D (volume por gradientes, luz e sombra) e movimentos próprios:
 * respira, pisca, olha para o cursor, inclina a cabeça, fala, acena e mostra o tablet do plano alimentar.
 * O desenho é vetorial (SVG). Em tamanhos pequenos mostra só o busto.
 */

const SKIN = "#f0c4a2";
const SKIN_SHADE = "#dda07c";
const HAIR = "#7b4a2b";
const HAIR_DARK = "#4c2b17";
const HAIR_LIGHT = "#b06f3f";
const INK = "#3a2416";

export function Nina3D({ mood = "idle", bust = false }: { mood?: MascotMood; bust?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const g = (name: string) => `${name}-${uid}`;
  const ref_ = (name: string) => `url(#${g(name)})`;

  // Cabeça e olhos acompanham o cursor (efeito de profundidade).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.35;
        const tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)));
        const ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)));
        el.style.setProperty("--tx", tx.toFixed(3));
        el.style.setProperty("--ty", ty.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const joyful = mood === "happy" || mood === "cheer";
  const sad = mood === "sad";
  const talk = mood === "talk";

  const headStyle = {
    transformOrigin: "100px 150px",
    transform:
      "translate(calc(var(--tx, 0) * 3px), calc(var(--ty, 0) * 1.5px)) rotate(calc(var(--tx, 0) * 2.4deg))",
    transition: "transform 0.25s ease-out",
  } as const;
  const eyeStyle = {
    transform: "translate(calc(var(--tx, 0) * 2.2px), calc(var(--ty, 0) * 1.6px))",
    transition: "transform 0.15s ease-out",
  } as const;

  return (
    <svg
      ref={ref}
      viewBox={bust ? "0 0 200 233" : "0 0 200 300"}
      width="100%"
      height="100%"
      overflow="visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={g("skin")} x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#f8d5b8" />
          <stop offset="0.6" stopColor={SKIN} />
          <stop offset="1" stopColor={SKIN_SHADE} />
        </linearGradient>
        <radialGradient id={g("cheek")}>
          <stop offset="0" stopColor="#f08c7a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f08c7a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g("hair")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={HAIR_LIGHT} />
          <stop offset="0.5" stopColor={HAIR} />
          <stop offset="1" stopColor={HAIR_DARK} />
        </linearGradient>
        <radialGradient id={g("iris")} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#b0682f" />
          <stop offset="0.6" stopColor="#7a4420" />
          <stop offset="1" stopColor="#3b1f0d" />
        </radialGradient>
        <linearGradient id={g("coat")} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f1eee8" />
          <stop offset="1" stopColor="#d6d1c7" />
        </linearGradient>
        <linearGradient id={g("shirt")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#58aaa0" />
          <stop offset="1" stopColor="#367a73" />
        </linearGradient>
        <linearGradient id={g("strap")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f08a2b" />
          <stop offset="0.5" stopColor="#5db54e" />
          <stop offset="1" stopColor="#3b82c4" />
        </linearGradient>
        <linearGradient id={g("jeans")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b4759" />
          <stop offset="1" stopColor="#252e3c" />
        </linearGradient>
        <linearGradient id={g("screen")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6f4fb" />
          <stop offset="1" stopColor="#bfe0ee" />
        </linearGradient>
        <radialGradient id={g("floor")}>
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {!bust && <ellipse cx={100} cy={296} rx={62} ry={7} fill={ref_("floor")} />}

      {/* Corpo respirando */}
      <g className="nc-breathe" style={{ transformOrigin: "100px 300px" }}>
        {/* Pernas */}
        {!bust && (
          <>
            <path d="M72 258 L98 258 L96 300 L76 300 Z" fill={ref_("jeans")} />
            <path d="M102 258 L128 258 L124 300 L104 300 Z" fill={ref_("jeans")} />
            <rect x={90} y={252} width={20} height={9} rx={2} fill="#2b3442" />
            <circle cx={100} cy={256} r={2.6} fill="#b9a27a" />
          </>
        )}

        {/* Braço livre (esquerda de quem vê): acena quando comemora */}
        <g transform={`rotate(${mood === "cheer" ? -158 : mood === "happy" ? -24 : 0} 60 172)`}>
          <g className={mood === "cheer" ? "nc-wave" : undefined}>
            <path
              d="M56 168 C44 176 38 212 38 246 C38 252 52 254 54 246 C56 222 60 196 68 178Z"
              fill={ref_("coat")}
              stroke="#cfc9be"
              strokeWidth={0.8}
            />
            <path d="M39 240 C44 246 50 246 54 240 L54 250 C48 255 42 254 39 249Z" fill="#7fb1ab" />
            <ellipse cx={46} cy={258} rx={8.5} ry={10} fill={SKIN} />
            <path d="M40 254 q3 8 8 8" stroke={SKIN_SHADE} strokeWidth={1.2} fill="none" />
          </g>
        </g>

        {/* Tronco: jaleco */}
        <path
          d="M52 172 C56 158 84 152 100 152 C116 152 144 158 148 172 L154 262 L46 262 Z"
          fill={ref_("coat")}
          stroke="#cfc9be"
          strokeWidth={0.8}
        />
        {/* Camisa */}
        <path d="M84 154 L116 154 L100 216 Z" fill={ref_("shirt")} />
        <path
          d="M84 154 L100 172 L92 158Z M116 154 L100 172 L108 158Z"
          fill="#2f6f69"
          opacity={0.6}
        />
        {/* Lapelas */}
        <path
          d="M84 153 L70 186 L92 218 L100 170Z"
          fill="#fbfaf7"
          stroke="#d3cdc2"
          strokeWidth={0.8}
        />
        <path
          d="M116 153 L130 186 L108 218 L100 170Z"
          fill="#f3f0ea"
          stroke="#d3cdc2"
          strokeWidth={0.8}
        />
        {/* Dobras */}
        <path
          d="M62 200 Q66 232 60 260"
          stroke="#c9c2b6"
          strokeWidth={1.3}
          fill="none"
          opacity={0.6}
        />
        <path
          d="M138 200 Q136 232 142 260"
          stroke="#c9c2b6"
          strokeWidth={1.3}
          fill="none"
          opacity={0.6}
        />
        <path d="M100 224 L100 262" stroke="#d0cabe" strokeWidth={1} />
        {[228, 246].map((y) => (
          <circle
            key={y}
            cx={100}
            cy={y}
            r={2.2}
            fill="#e8e3d9"
            stroke="#c9c2b6"
            strokeWidth={0.6}
          />
        ))}
        {/* Bolso com canetas */}
        <g>
          <rect
            x={116}
            y={202}
            width={22}
            height={26}
            rx={3}
            fill="#f1eee8"
            stroke="#cfc9be"
            strokeWidth={0.8}
          />
          <rect x={121} y={192} width={3.2} height={20} rx={1.6} fill="#e2582b" />
          <rect x={127} y={194} width={3.2} height={18} rx={1.6} fill="#2f6fb8" />
          <rect x={121} y={192} width={3.2} height={4} rx={1.4} fill="#b8401c" />
        </g>
        {/* Pescoço e sombra sob o queixo */}
        <path d="M88 132 L112 132 L114 158 Q100 168 86 158 Z" fill={ref_("skin")} />
        <ellipse cx={100} cy={147} rx={20} ry={7} fill="#c98b66" opacity={0.42} />
        {/* Colar do jaleco */}
        <path
          d="M84 153 Q100 172 116 153 L120 160 Q100 182 80 160 Z"
          fill="#f4f1eb"
          opacity={0.95}
        />
        {/* Crachá com cordão colorido */}
        <path d="M88 158 L100 216" stroke={ref_("strap")} strokeWidth={5} strokeLinecap="round" />
        <path d="M112 158 L100 216" stroke={ref_("strap")} strokeWidth={5} strokeLinecap="round" />
        <rect x={98} y={214} width={4} height={6} rx={1} fill="#9aa5b1" />
        <g className="nc-sway" style={{ transformOrigin: "100px 214px" }}>
          <rect
            x={85}
            y={218}
            width={30}
            height={40}
            rx={3.5}
            fill="#ffffff"
            stroke="#c2cad3"
            strokeWidth={1}
          />
          <rect x={85} y={218} width={30} height={7} rx={3} fill="#f2ede6" />
          <text
            x={100}
            y={223.4}
            textAnchor="middle"
            fontSize={4.2}
            fontWeight={700}
            fill="#b4532a"
            fontFamily="serif"
          >
            NutriConnect
          </text>
          <circle cx={100} cy={235} r={6.2} fill="#f5d6bc" />
          <path d="M94 233 Q100 226 106 233 Q104 231 100 231 Q96 231 94 233Z" fill={HAIR} />
          <path d="M91 246 Q100 240 109 246 L109 250 L91 250Z" fill="#dfe6ec" />
          <text
            x={100}
            y={253}
            textAnchor="middle"
            fontSize={5}
            fontWeight={800}
            fill="#334155"
            fontFamily="sans-serif"
          >
            Nina
          </text>
          <text
            x={100}
            y={257}
            textAnchor="middle"
            fontSize={3.2}
            fill="#64748b"
            fontFamily="sans-serif"
          >
            Nutricionista
          </text>
        </g>

        {/* Braço com o tablet do plano alimentar */}
        <g
          className={talk ? "nc-tablet-talk" : "nc-tablet"}
          style={{ transformOrigin: "146px 176px" }}
        >
          <path
            d="M146 170 C160 176 172 200 176 226 C177 232 164 236 162 230 C158 208 152 192 142 184Z"
            fill={ref_("coat")}
            stroke="#cfc9be"
            strokeWidth={0.8}
          />
          <path
            d="M163 218 C168 224 174 224 178 218 L177 230 C172 236 166 236 162 231Z"
            fill="#7fb1ab"
          />
          <g transform="rotate(-13 176 196)">
            <rect x={150} y={162} width={50} height={68} rx={6} fill="#2a2f36" />
            <rect
              x={150}
              y={162}
              width={50}
              height={68}
              rx={6}
              fill="none"
              stroke="#9aa3ad"
              strokeWidth={1.2}
            />
            <rect x={153.5} y={166} width={43} height={60} rx={3} fill={ref_("screen")} />
            <rect x={153.5} y={166} width={43} height={8} rx={2} fill="#7bbcd6" />
            <text
              x={175}
              y={172}
              textAnchor="middle"
              fontSize={4.6}
              fontWeight={800}
              fill="#ffffff"
              fontFamily="sans-serif"
            >
              Plano alimentar
            </text>
            {/* Pirâmide alimentar */}
            <path d="M175 178 L164 202 L186 202Z" fill="#e9573f" />
            <path d="M172 184 L178 184 L181 190 L169 190Z" fill="#f4a93c" />
            <path d="M167 195 L183 195 L186 202 L164 202Z" fill="#f7d354" />
            <path d="M162 205 L188 205 L191 213 L159 213Z" fill="#5db54e" />
            <path d="M160 214 L190 214 L191 221 L159 221Z" fill="#3fa36b" />
            <circle cx={175} cy={183} r={1.6} fill="#fff" opacity={0.85} />
            <circle cx={171} cy={198} r={1.5} fill="#fff" opacity={0.8} />
            <circle cx={179} cy={198} r={1.5} fill="#fff" opacity={0.8} />
          </g>
          {/* Mão segurando */}
          <ellipse cx={166} cy={222} rx={7.5} ry={9} fill={SKIN} transform="rotate(-18 166 222)" />
          <path
            d="M160 216 q-5 -1 -6 4 q1 5 6 4"
            fill={SKIN}
            stroke={SKIN_SHADE}
            strokeWidth={0.8}
          />
          <path d="M160 226 q-3 4 0 8" stroke={SKIN_SHADE} strokeWidth={1.1} fill="none" />
        </g>
      </g>

      {/* Cabeça: cabelo, rosto e expressões */}
      <g style={headStyle}>
        {/* Cabelo (volume de trás) */}
        <g className="nc-sway" style={{ transformOrigin: "100px 60px" }}>
          <path
            d="M46 96 C36 52 66 22 104 22 C140 22 168 52 158 98 C156 118 150 138 138 148 C142 130 138 112 134 104 L66 104 C60 116 58 132 62 148 C50 140 46 118 46 96Z"
            fill={ref_("hair")}
          />
          {/* Cachos soltos atrás */}
          <path d="M132 134 C150 138 156 156 144 168 C146 158 140 150 128 148Z" fill={HAIR_DARK} />
          <path
            d="M140 146 C154 150 158 166 148 176 C148 166 144 160 136 156Z"
            fill={ref_("hair")}
          />
        </g>

        {/* Orelhas */}
        <ellipse cx={55} cy={100} rx={5.5} ry={9} fill={SKIN_SHADE} />
        <ellipse cx={145} cy={100} rx={5.5} ry={9} fill={SKIN_SHADE} />
        <circle cx={55} cy={106} r={2} fill="#e9c86e" />
        <circle cx={145} cy={106} r={2} fill="#e9c86e" />

        {/* Rosto */}
        <path
          d="M54 92 C54 56 76 42 100 42 C124 42 146 56 146 92 C146 122 128 146 100 146 C72 146 54 122 54 92Z"
          fill={ref_("skin")}
        />
        {/* Luz e sombra do rosto (volume) */}
        <ellipse cx={82} cy={70} rx={20} ry={14} fill="#fff" opacity={0.16} />
        <path
          d="M128 60 C144 76 146 110 130 132 C138 108 136 84 122 64Z"
          fill="#c98b66"
          opacity={0.25}
        />
        {/* Bochechas e sardas */}
        <circle cx={72} cy={112} r={13} fill={ref_("cheek")} />
        <circle cx={128} cy={112} r={13} fill={ref_("cheek")} />
        {[
          [86, 104],
          [92, 107],
          [98, 103],
          [108, 106],
          [114, 103],
          [120, 107],
          [80, 108],
          [124, 109],
          [96, 109],
          [104, 110],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.9} fill="#c8845f" opacity={0.55} />
        ))}

        {/* Sobrancelhas */}
        <path
          d={sad ? "M64 76 Q74 78 88 72" : joyful ? "M64 70 Q76 62 90 68" : "M64 73 Q76 65 90 70"}
          stroke={HAIR_DARK}
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={
            sad
              ? "M136 76 Q126 78 112 72"
              : joyful
                ? "M136 70 Q124 62 110 68"
                : "M136 73 Q124 65 110 70"
          }
          stroke={HAIR_DARK}
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
        />

        {/* Olhos */}
        {joyful ? (
          <>
            <path
              d="M68 92 Q80 78 92 92"
              stroke={INK}
              strokeWidth={3.6}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M108 92 Q120 78 132 92"
              stroke={INK}
              strokeWidth={3.6}
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <g className="nc-blink" style={{ transformOrigin: "100px 92px" }}>
            {[80, 120].map((cx) => (
              <g key={cx}>
                <ellipse cx={cx} cy={92} rx={12} ry={13} fill="#fff" />
                <g style={eyeStyle}>
                  <circle cx={cx} cy={93} r={9.2} fill={ref_("iris")} />
                  <circle cx={cx} cy={93} r={4.6} fill="#1c0e06" />
                  <circle cx={cx - 3} cy={89} r={3.1} fill="#fff" />
                  <circle cx={cx + 3.4} cy={97} r={1.5} fill="#fff" opacity={0.85} />
                </g>
                <path
                  d={`M${cx - 13} 91 Q${cx} 76 ${cx + 13} 91`}
                  stroke={INK}
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M${cx - 13} 91 l-3.2 -2.6 M${cx + 13} 91 l3.2 -2.6`}
                  stroke={INK}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        )}

        {/* Nariz */}
        <path
          d="M97 104 Q100 111 103 104"
          stroke="#c98b66"
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={100} cy={111} rx={4.2} ry={2.6} fill="#e6a888" opacity={0.7} />

        {/* Boca */}
        {talk ? (
          <g>
            <ellipse className="nc-talk" cx={100} cy={128} rx={9} ry={7} fill="#7a2a22" />
            <ellipse className="nc-talk" cx={100} cy={132} rx={5} ry={2.6} fill="#e57b78" />
          </g>
        ) : joyful ? (
          <g>
            <path d="M84 122 Q100 148 116 122 Q100 126 84 122Z" fill="#7a2a22" />
            <path d="M88 124 Q100 128 112 124 L110 128 Q100 131 90 128Z" fill="#fff" />
            <path d="M92 134 Q100 130 108 134 Q100 141 92 134Z" fill="#e57b78" />
          </g>
        ) : sad ? (
          <path
            d="M88 132 Q100 122 112 132"
            stroke="#9a4a3a"
            strokeWidth={2.8}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <g>
            <path
              d="M86 124 Q100 136 114 124"
              stroke="#b0503c"
              strokeWidth={2.8}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M92 129 Q100 133 108 129"
              stroke="#e08d84"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
          </g>
        )}

        {/* Franja e cachos que emolduram o rosto */}
        <path
          d="M48 96 C40 56 70 30 104 32 C138 32 160 56 152 96 C148 78 134 62 114 58 C102 70 84 74 64 72 C56 78 52 88 48 96Z"
          fill={ref_("hair")}
        />
        <path
          d="M70 46 C84 40 100 40 116 44"
          stroke={HAIR_LIGHT}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
        />
        <path
          d="M86 36 C98 32 112 34 124 40"
          stroke="#c98552"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          opacity={0.6}
        />
        <g className="nc-sway" style={{ transformOrigin: "58px 90px" }}>
          <path d="M52 92 C42 106 44 126 54 134 C50 120 54 108 62 100Z" fill={ref_("hair")} />
          <path d="M50 120 C42 130 46 146 58 148 C52 140 54 132 58 128Z" fill={HAIR} />
        </g>
        <g className="nc-sway" style={{ transformOrigin: "148px 90px", animationDelay: "-1.4s" }}>
          <path
            d="M148 92 C158 106 156 126 146 134 C150 120 146 108 138 100Z"
            fill={ref_("hair")}
          />
          <path d="M150 120 C158 130 154 146 142 148 C148 140 146 132 142 128Z" fill={HAIR} />
        </g>
      </g>
    </svg>
  );
}
