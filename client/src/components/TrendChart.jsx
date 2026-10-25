import { formatDate } from '../lib/score';

const W = 640;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 32 };

const TrendChart = ({ points }) => {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v) => PAD.top + innerH - (v / 10) * innerH;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');

  return (
    <svg
      className="trend"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Score trend over your last ${points.length} sessions, from ${points[0].score} to ${points[points.length - 1].score} out of 10`}
    >
      {[0, 5, 10].map((v) => (
        <g key={v}>
          <line className="grid" x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} />
          <text className="axis-label" x={PAD.left - 8} y={y(v) + 4} textAnchor="end">{v}</text>
        </g>
      ))}
      {points.length > 1 && <path className="line" d={path} />}
      {points.map((p, i) => (
        <circle key={p.id} className="dot" cx={x(i)} cy={y(p.score)} r="4">
          <title>{`${p.role}: ${p.score.toFixed(1)}/10, ${formatDate(p.date)}`}</title>
        </circle>
      ))}
    </svg>
  );
};

export default TrendChart;
