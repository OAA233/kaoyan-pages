import * as T from '../vendor/three.module.min.js';
const smooth = t => { t = T.MathUtils.clamp(t, 0, 1); return t * t * (3 - 2 * t); };

let effectsModule, failedLoads = 0;
export function loadEffects() {
  if (!effectsModule) effectsModule = import(failedLoads ? './skill-effects.js?retry=' + failedLoads : './skill-effects.js')
    .catch(error => { effectsModule = null; failedLoads++; throw error; });
  return effectsModule;
}

// Shared pose for the performer and remote observers; never changes a camera.
export function poseSkill(player, sprite, kind, t, d) {
    const blend = smooth(t / .45) * smooth((d - t) / .6);
    const a = player.userData.anim;
    sprite.scale.set(a.baseW, a.baseH, 1); sprite.position.set(0, a.baseY, 0);
    const pulse = Math.sin(Math.PI * Math.min(1, t / (d - .6)));
    sprite.material.rotation = -.08 * blend;
    if (kind === 'lamp') {
      const spin = smooth((t - .6) / .5) * smooth((d - .5 - t) / .5);
      const turn = Math.cos(Math.max(0, t - .6) * 7);
      sprite.scale.x = a.baseW * (1 - spin + spin * (.82 + .18 * Math.abs(turn))) * (spin > .5 && turn < 0 ? -1 : 1);
      sprite.position.x = Math.sin(t * 7) * .16 * spin;
      sprite.position.y += Math.abs(Math.sin(t * 7)) * .13 * spin;
      sprite.material.rotation = Math.sin(t * 7) * .14 * spin;
    } else if (kind === 'migi-blade') {
      sprite.scale.set(a.baseW * (1 - .22 * pulse), a.baseH * (1 + .35 * pulse), 1);
      sprite.position.y += a.baseH * .16 * pulse;
      sprite.material.rotation = Math.sin(t * 3) * .15 * blend;
    } else {
      const recoil = Math.exp(-Math.pow((t / d - .53) * 18, 2));
      sprite.material.rotation = (-.09 + recoil * .19) * blend;
      sprite.position.y += .15 * pulse;
      sprite.scale.y = a.baseH * (1 + .045 * pulse);
    }
}
