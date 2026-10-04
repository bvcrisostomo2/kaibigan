// Save codes ("Kodigo", spec §3.9): persistent state ⇄ a short list of Filipino words.
//
// Encoding: fields are packed little-endian into one BigInt (4-bit layout version first),
// written as base-509 digits (one word each), then one checksum word is appended.
// The checksum makes sum((i + 1) * digit_i) ≡ 0 (mod 509) over all words. Because 509 is
// prime, any single wrong word and any swap of two adjacent different words is detected.
import { WORDS } from '../content/wordlist.js';
import { CODE_LAYOUTS, CURRENT_LAYOUT } from '../content/codeLayout.js';
import { createState } from './state.js';

const MOD = 509;
const BASE = 509n;
const VERSION_BITS = 4;
const INDEX = new Map(WORDS.map((w, i) => [w, i]));

export function levenshtein(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

function layoutBits(l) {
  return VERSION_BITS + l.checkpointBits + 1 + 2 * l.meterBits + l.flags.length + l.affinity.length * l.affinityBits + l.notes.length;
}

function payloadWordCount(l) {
  const max = 1n << BigInt(layoutBits(l));
  let k = 0;
  for (let cap = 1n; cap < max; cap *= BASE) k++;
  return k;
}

// Total words in a code for a layout (payload words + 1 checksum word).
export function codeLength(version = CURRENT_LAYOUT) {
  return payloadWordCount(CODE_LAYOUTS[version]) + 1;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function weightedSum(digits) {
  return digits.reduce((sum, d, i) => (sum + (i + 1) * d) % MOD, 0);
}

function modInverse(a) {
  // Fermat: a^(p-2) mod p.
  let result = 1;
  let base = a % MOD;
  for (let e = MOD - 2; e > 0; e >>= 1) {
    if (e & 1) result = (result * base) % MOD;
    base = (base * base) % MOD;
  }
  return result;
}

function checksumDigit(payload) {
  const n = payload.length;
  return (((MOD - weightedSum(payload)) % MOD) * modInverse(n + 1)) % MOD;
}

export function encodeCode(state, version = CURRENT_LAYOUT) {
  const l = CODE_LAYOUTS[version];
  if (!l) throw new Error(`Unknown code layout ${version}`);
  if (!Number.isInteger(state.checkpoint) || state.checkpoint < 0 || state.checkpoint >= 1 << l.checkpointBits) {
    throw new Error(`Checkpoint ${state.checkpoint} out of range`);
  }
  const mHalf = 1 << (l.meterBits - 1);
  const aHalf = 1 << (l.affinityBits - 1);
  let n = 0n;
  let shift = 0n;
  const put = (value, bits) => {
    n |= BigInt(value) << shift;
    shift += BigInt(bits);
  };
  put(version, VERSION_BITS);
  put(state.checkpoint, l.checkpointBits);
  put(state.title === 'Doña' ? 1 : 0, 1);
  put(clamp(state.tiwala, -mHalf, mHalf - 1) + mHalf, l.meterBits);
  put(clamp(state.hinala, -mHalf, mHalf - 1) + mHalf, l.meterBits);
  for (const f of l.flags) put(state.flags.includes(f) ? 1 : 0, 1);
  for (const id of l.affinity) put(clamp(state.affinity[id] ?? 0, -aHalf, aHalf - 1) + aHalf, l.affinityBits);
  for (const id of l.notes) put(state.notes.includes(id) ? 1 : 0, 1);

  const digits = [];
  for (let i = 0; i < payloadWordCount(l); i++) {
    digits.push(Number(n % BASE));
    n /= BASE;
  }
  digits.push(checksumDigit(digits));
  return digits.map((d) => WORDS[d]).join(' ');
}

function tokenize(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

// Resolves one typed word: exact match, else a unique prefix of 4+ letters,
// else the only word one edit away. Returns { index, word } or { index: null, candidates }.
export function matchWord(token) {
  if (INDEX.has(token)) return { index: INDEX.get(token), word: token };
  const prefixed = token.length >= 4 ? WORDS.filter((w) => w.startsWith(token)) : [];
  if (prefixed.length === 1) return { index: INDEX.get(prefixed[0]), word: prefixed[0] };
  const near = WORDS.filter((w) => levenshtein(w, token) === 1);
  if (near.length === 1 && prefixed.length === 0) return { index: INDEX.get(near[0]), word: near[0] };
  return { index: null, candidates: [...new Set([...prefixed, ...near])].slice(0, 5) };
}

// Returns { ok: true, data, corrected } or { ok: false, error }.
// error.kind: 'empty' | 'unknownWord' | 'ambiguousWord' | 'length' | 'checksum' | 'newerVersion'
// (word errors also carry { word, position (1-based), candidates }).
// corrected lists autocorrected words as { position, from, to }.
export function decodeCode(input) {
  const tokens = tokenize(input);
  if (tokens.length === 0) return { ok: false, error: { kind: 'empty' } };
  const digits = [];
  const corrected = [];
  for (let i = 0; i < tokens.length; i++) {
    const m = matchWord(tokens[i]);
    if (m.index == null) {
      const kind = m.candidates.length ? 'ambiguousWord' : 'unknownWord';
      return { ok: false, error: { kind, word: tokens[i], position: i + 1, candidates: m.candidates } };
    }
    if (m.word !== tokens[i]) corrected.push({ position: i + 1, from: tokens[i], to: m.word });
    digits.push(m.index);
  }
  if (digits.length < 2) return { ok: false, error: { kind: 'length' } };
  if (weightedSum(digits) !== 0) return { ok: false, error: { kind: 'checksum' } };

  const payload = digits.slice(0, -1);
  let n = 0n;
  for (let i = payload.length - 1; i >= 0; i--) n = n * BASE + BigInt(payload[i]);
  let shift = 0n;
  const take = (bits) => {
    const v = Number((n >> shift) & ((1n << BigInt(bits)) - 1n));
    shift += BigInt(bits);
    return v;
  };

  const version = take(VERSION_BITS);
  const l = CODE_LAYOUTS[version];
  if (!l) return { ok: false, error: { kind: version > CURRENT_LAYOUT ? 'newerVersion' : 'checksum' } };
  if (payload.length !== payloadWordCount(l)) return { ok: false, error: { kind: 'length' } };
  if (n >> BigInt(layoutBits(l)) !== 0n) return { ok: false, error: { kind: 'checksum' } };

  const mHalf = 1 << (l.meterBits - 1);
  const aHalf = 1 << (l.affinityBits - 1);
  const checkpoint = take(l.checkpointBits);
  const title = take(1) ? 'Doña' : 'Don';
  const tiwala = take(l.meterBits) - mHalf;
  const hinala = take(l.meterBits) - mHalf;
  const flags = l.flags.filter(() => take(1) === 1);
  const affinity = {};
  for (const id of l.affinity) {
    const v = take(l.affinityBits) - aHalf;
    if (v !== 0) affinity[id] = v;
  }
  const notes = l.notes.filter(() => take(1) === 1);
  return { ok: true, data: { version, checkpoint, title, tiwala, hinala, flags, affinity, notes }, corrected };
}

// Builds a fresh state from decoded data. `restore` is the checkpoint beat's
// { flags, bios } — story progress implied by reaching that checkpoint.
export function stateFromCode(data, name, restore = {}) {
  const state = createState({ name, title: data.title });
  state.tiwala = data.tiwala;
  state.hinala = data.hinala;
  state.flags = [...data.flags, ...(restore.flags ?? []).filter((f) => !data.flags.includes(f))];
  state.affinity = { ...data.affinity };
  state.notes = [...data.notes];
  state.bios = [...(restore.bios ?? [])];
  state.checkpoint = data.checkpoint;
  return state;
}
