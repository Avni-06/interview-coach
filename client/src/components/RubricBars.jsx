import { RUBRIC } from '../lib/score';

const RubricBars = ({ rubric }) => (
  <ul className="rubric">
    {RUBRIC.map(({ key, label }) => (
      <li key={key}>
        <span className="rubric-label">{label}</span>
        <span className="bar" aria-hidden="true"><span style={{ width: `${rubric[key] * 10}%` }} /></span>
        <span className="rubric-value num">{Number.isInteger(rubric[key]) ? rubric[key] : rubric[key].toFixed(1)}/10</span>
      </li>
    ))}
  </ul>
);

export default RubricBars;
