// The HUD (spec §4.2): location card, time-of-day badge and the controls panel (H hides it).
// location is chapter content { name, detail }; time is a lighting time id ('dusk', …).
import { t } from './strings.js';

export function hudView({ location, time, controlsVisible }) {
  return {
    place: location?.name ?? '',
    detail: location?.detail ?? '',
    time: time ? t(`hud.time.${time}`) : '',
    controls: controlsVisible ? t('hud.controls') : null,
  };
}
