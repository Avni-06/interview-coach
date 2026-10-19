import { RUBRIC } from '../lib/score';

const SIZE = 300;
const C = SIZE / 2;
const R = 96;
const LEVELS = [2.5, 5, 7.5, 10];

// Axis i points: top, right, bottom, left
const point = (i, value) => {
  const angle = -Math.PI / 2 + (i * Math.PI) / 2;
  const r = (value / 10) * R;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)];
};
const poly = (value) => RUBRIC.map((_, i) => point(i, value).join(',')).join(' ');

const labelProps = [
  { dy: -10, anchor: 'middle' },
  { dx: 12, dy: 4, anchor: 'start' },
  { dy: 20, anchor: 'middle' },
  { dx: -12, dy: 4, anchor: 'end' },
];

const RadarChart = ({ rubric }) => {
  const data = RUBRIC.map(({ key }, i) => point(i, rubric[key]));
  const summary = RUBRIC.map(({ key, label }) => `${label} ${rubric[key].toFixed(1)}`).join(', ');

  return (
    <svg viewBox={`-36 0 ${SIZE + 72} ${SIZE}`} role="img" aria-label={`Rubric scores out of 10: ${summary}`} className="radar">
      {LEVELS.map((lvl) => (
        <polygon key={lvl} points={poly(lvl)} fill="none" stroke="var(--line)" strokeWidth="1" />
      ))}
      {RUBRIC.map((_, i) => {
        const [x, y] = point(i, 10);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
      })}
      <polygon points={data.map((p) => p.join(',')).join(' ')} fill="var(--accent)" fillOpacity="0.16" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      {data.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent)" />
      ))}
      {RUBRIC.map(({ label }, i) => {
        const [x, y] = point(i, 10);
        const { dx = 0, dy = 0, anchor } = labelProps[i];
        return (
          <text key={label} x={x + dx} y={y + dy} textAnchor={anchor} fontSize="12" fontWeight="500" fill="var(--muted)">
            {label}
          </text>
        );
      })}
    </svg>
  );
};

export default RadarChart;
