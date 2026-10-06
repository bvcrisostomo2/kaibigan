// The touch joystick (spec §4.3). A drag in screen pixels from the stick's centre (y down)
// becomes { x, z } for input.setVirtualMove: at most unit length, zero inside the deadzone.
// Screen up is north (−z), matching the fixed camera.
export const STICK_RADIUS = 48;
export const DEADZONE = 0.15;

export function stickVector(dx, dy, radius = STICK_RADIUS) {
  let x = dx / radius;
  let z = dy / radius;
  const len = Math.hypot(x, z);
  if (!(len >= DEADZONE)) return { x: 0, z: 0 };
  if (len > 1) {
    x /= len;
    z /= len;
  }
  return { x, z };
}
