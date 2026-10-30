// Movements while talking (Plan 5 spec §4.6): short, pure curves played on an actor's sprite.
// Every movement starts and ends at rest, so a speaker always settles back to their place.
// Amplitudes were tuned in the Plan 5b prototype to read at the dinner's camera distance.
export const MOVES = ['none', 'still', 'nod', 'shake', 'lean', 'bounce', 'hop_back', 'step_back', 'step', 'head_down', 'turn_away', 'bow', 'point', 'fan'];

export const FEELING_MOVES = {
  neutral: 'nod', content: 'nod', happy: 'bounce', sad: 'head_down', angry: 'shake',
  annoyed: 'turn_away', embarrassed: 'turn_away', shocked: 'hop_back', thoughtful: 'still',
};

// Movements that need feet: a seated speaker skips them.
export const FOOT_MOVES = ['bounce', 'hop_back', 'step_back', 'step'];

export const MOVE_SECONDS = {
  none: 0, still: 0, nod: 0.45, shake: 0.75, lean: 0.6, bounce: 0.5, hop_back: 0.6, step_back: 0.8,
  step: 0.8, head_down: 1.1, turn_away: 1.4, bow: 0.9, point: 0.8, fan: 1.2,
};

export function movementFor(feeling, { move = null, seated = false } = {}) {
  let m = move ?? FEELING_MOVES[feeling] ?? 'nod';
  if (seated && FOOT_MOVES.includes(m)) m = 'none';
  if (seated && m === 'bow') m = 'nod';
  return m;
}

const rest = () => ({ toward: 0, up: 0, tilt: 0, squash: 1, turn: false, done: true });
// 0 at both ends, 1 in the middle.
const arc = (k) => Math.sin(Math.PI * k);
// Out fast, back slowly: peaks at k = 0.25.
const kick = (k) => (k < 0.25 ? Math.sin((Math.PI / 2) * (k / 0.25)) : Math.cos((Math.PI / 2) * ((k - 0.25) / 0.75)));

// Where the sprite is t seconds into a movement: toward (units along the line to the target),
// up (units), tilt (radians, + leans toward the target), squash (y scale), turn (face away).
export function motionAt(move, t, { seated = false } = {}) {
  const d = MOVE_SECONDS[move] ?? 0;
  if (!(t < d) || t < 0) return rest();
  const k = t / d;
  const p = { toward: 0, up: 0, tilt: 0, squash: 1, turn: false, done: false };
  switch (move) {
    case 'nod':
      p.squash = 1 - 0.09 * arc(k);
      p.tilt = 0.1 * arc(k);
      break;
    case 'shake':
      // Lean in toward the target and shake with anger.
      p.tilt = (0.14 + 0.1 * Math.sin(2 * Math.PI * 6 * k)) * arc(k);
      p.toward = 0.15 * arc(k);
      break;
    case 'lean':
    case 'point':
      p.tilt = 0.16 * arc(k);
      p.toward = 0.15 * arc(k);
      break;
    case 'bounce':
      p.up = 0.2 * Math.abs(Math.sin(2 * Math.PI * k));
      p.squash = 1 + 0.05 * Math.sin(2 * Math.PI * k);
      break;
    case 'hop_back':
      p.toward = -0.45 * kick(k);
      p.up = k < 0.25 ? 0.22 * arc(k / 0.25) : 0;
      p.tilt = -0.1 * kick(k);
      break;
    case 'step_back':
    case 'step':
      p.toward = (move === 'step' ? 0.35 : -0.35) * arc(k);
      break;
    case 'head_down':
      p.squash = 1 - 0.1 * arc(k);
      p.toward = seated ? 0 : -0.15 * arc(k);
      break;
    case 'turn_away':
      p.turn = k < 0.85;
      break;
    case 'bow':
      p.squash = 1 - 0.18 * arc(k);
      break;
    case 'fan':
      p.tilt = 0.08 * Math.sin(2 * Math.PI * 3 * k) * arc(k);
      break;
    default:
      break;
  }
  return p;
}
