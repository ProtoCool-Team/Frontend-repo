import {STATES} from '../constants.js';

export default function StatusPill({state}) {
  return (
    <span className={`pill pill-${state}`}>
      <span className="pill-dot" />
      {STATES[state].label}
    </span>
  );
}
