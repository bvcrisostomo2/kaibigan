// A companion that follows the leader along the leader's own footsteps (pure). Walking the
// trail instead of heading straight for the leader takes him round corners and through doors.
export const FOLLOW = {
  gap: 1.2, // stops this close to the leader
  resume: 1.8, // sets off again once the leader is this far
  runBeyond: 3.5, // runs to catch up past this distance
  crumb: 0.3, // spacing of the recorded footsteps
  reach: 0.25, // a footstep counts as reached within this distance
  maxTrail: 400,
};

export function createFollower() {
  return { trail: [], moving: false };
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Motion for this frame: { x, z, run } with (x, z) a unit vector, or zero to stand still.
// Positions are { x, z } (y is ignored).
export function followStep(f, self, leader) {
  const last = f.trail[f.trail.length - 1];
  if (!last || dist(last, leader) >= FOLLOW.crumb) {
    f.trail.push({ x: leader.x, z: leader.z });
    if (f.trail.length > FOLLOW.maxTrail) f.trail.shift();
  }
  const d = dist(self, leader);
  if (f.moving ? d <= FOLLOW.gap : d < FOLLOW.resume) {
    f.moving = false;
    return { x: 0, z: 0, run: false };
  }
  f.moving = true;
  while (f.trail.length > 1 && dist(self, f.trail[0]) < FOLLOW.reach) f.trail.shift();
  const target = f.trail[0] ?? leader;
  const dx = target.x - self.x;
  const dz = target.z - self.z;
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) return { x: 0, z: 0, run: false };
  return { x: dx / len, z: dz / len, run: d > FOLLOW.runBeyond };
}

// Start following from where the leader is now (forgets any old trail).
export function startFollowing(f, leader) {
  f.trail = [{ x: leader.x, z: leader.z }];
  f.moving = false;
}
