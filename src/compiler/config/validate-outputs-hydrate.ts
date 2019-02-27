import * as d from '@declarations';
import { isOutputTargetDist, isOutputTargetHydrate, isOutputTargetWww } from '../output-targets/output-utils';
import { sys } from '@sys';


export function validateOutputTargetHydrate(config: d.Config) {
  const hasHydrateOutputTarget = config.outputTargets.some(isOutputTargetHydrate);

  if (hasHydrateOutputTarget === false) {
    // we don't already have a hydrate output target
    // let's still see if we require one because of other output targets

    const hasWwwOutput = config.outputTargets
      .filter(isOutputTargetWww)
      .some(o => typeof o.indexHtml === 'string');

    if (hasWwwOutput && config.flags && config.flags.prerender) {
      // we're prerendering a www output target, so we'll need a hydrate app
      const hydrateForWwwOutputTarget: d.OutputTargetHydrate = {
        type: 'hydrate'
      };
      config.outputTargets.push(hydrateForWwwOutputTarget);
    }
  }

  const hydrateOutputTargets = config.outputTargets
    .filter(isOutputTargetHydrate);

  hydrateOutputTargets.forEach(outputTarget => {
    if (typeof outputTarget.dir !== 'string') {
      // no directory given, see if we've got a dist to go off of
      const distOutput = config.outputTargets.find(isOutputTargetDist);
      if (distOutput != null) {
        // a dist dir is set, go off of that
        outputTarget.dir = sys.path.join(distOutput.dir, 'hydrate');

      } else {
        // no default dist dir set, so let's do a default
        outputTarget.dir = sys.path.join(config.rootDir, 'dist', 'hydrate');
      }
    }

    if (!sys.path.isAbsolute(outputTarget.dir)) {
      outputTarget.dir = sys.path.join(config.rootDir, outputTarget.dir);
    }
  });
}
