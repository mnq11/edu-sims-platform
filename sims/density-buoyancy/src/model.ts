/**
 * نموذج الكثافة والطفو — مبدأ أرخميدس جبرياً (لا تكامل زمنياً).
 * الجسم يطفو إذا كانت كثافته أقل من كثافة السائل، وعندها تكون نسبة
 * الغمر = ρo/ρf؛ وإلا يغوص كلياً ويكون وزنه الظاهري (ρo−ρf)·V·g.
 */
import { NumberProperty, Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

const G = 9.81; // م/ث²
const DEFAULTS = {
  objectDensity: 500, // كغ/م³ (خشب)
  fluidDensity: 1000, // كغ/م³ (ماء)
  objectVolume: 2, // لتر
};

export class DensityModel extends SimModel {
  readonly objectDensity = new NumberProperty(DEFAULTS.objectDensity, { min: 100, max: 3000, step: 10 });
  readonly fluidDensity = new NumberProperty(DEFAULTS.fluidDensity, { min: 500, max: 3000, step: 10 });
  readonly objectVolume = new NumberProperty(DEFAULTS.objectVolume, { min: 0.5, max: 10, step: 0.5 });

  /** كتلة الجسم بالكيلوغرام. */
  readonly mass: Property<number>;
  /** وزن الجسم بالنيوتن. */
  readonly weight: Property<number>;
  /** أقصى قوة طفو (الغمر الكامل) بالنيوتن — وزن السائل المُزاح. */
  readonly maxBuoyancy: Property<number>;
  /** نسبة الحجم المغمور: ρo/ρf للطافئ و1 للغارق أو المحايد. */
  readonly submergedFraction: Property<number>;
  /** الوزن الظاهري بالنيوتن: صفر للطافئ والمحايد، و(ρo−ρf)·V·g للغارق. */
  readonly apparentWeight: Property<number>;
  /** حالة الجسم: 'يطفو' | 'يغوص' | 'محايد'. */
  readonly status: Property<string>;

  constructor() {
    super();
    const recompute = (): {
      mass: number; weight: number; maxBuoyancy: number;
      submergedFraction: number; apparentWeight: number; status: string;
    } => {
      const rhoO = this.objectDensity.value;
      const rhoF = this.fluidDensity.value;
      const volumeM3 = this.objectVolume.value / 1000;
      const mass = rhoO * volumeM3;
      const weight = mass * G;
      const maxBuoyancy = rhoF * volumeM3 * G;
      const floats = rhoO < rhoF;
      const neutral = rhoO === rhoF;
      const submergedFraction = floats ? rhoO / rhoF : 1;
      const apparentWeight = floats || neutral ? 0 : (rhoO - rhoF) * volumeM3 * G;
      const status = floats ? 'يطفو' : neutral ? 'محايد' : 'يغوص';
      return { mass, weight, maxBuoyancy, submergedFraction, apparentWeight, status };
    };

    const init = recompute();
    this.mass = new Property(init.mass);
    this.weight = new Property(init.weight);
    this.maxBuoyancy = new Property(init.maxBuoyancy);
    this.submergedFraction = new Property(init.submergedFraction);
    this.apparentWeight = new Property(init.apparentWeight);
    this.status = new Property(init.status);

    const update = (): void => {
      const next = recompute();
      this.mass.value = next.mass;
      this.weight.value = next.weight;
      this.maxBuoyancy.value = next.maxBuoyancy;
      this.submergedFraction.value = next.submergedFraction;
      this.apparentWeight.value = next.apparentWeight;
      this.status.value = next.status;
    };
    this.objectDensity.link(update);
    this.fluidDensity.link(update);
    this.objectVolume.link(update);
  }

  protected step(_dt: number): void {
    // نموذج جبري ساكن — لا تكامل زمنياً
  }

  reset(): void {
    this.objectDensity.value = DEFAULTS.objectDensity;
    this.fluidDensity.value = DEFAULTS.fluidDensity;
    this.objectVolume.value = DEFAULTS.objectVolume;
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        objectDensity: this.objectDensity.value,
        fluidDensity: this.fluidDensity.value,
        objectVolume: this.objectVolume.value,
      },
    };
  }

  setState(state: SimState): void {
    const vals = state.values;
    this.objectDensity.value = Number(vals['objectDensity'] ?? DEFAULTS.objectDensity);
    this.fluidDensity.value = Number(vals['fluidDensity'] ?? DEFAULTS.fluidDensity);
    this.objectVolume.value = Number(vals['objectVolume'] ?? DEFAULTS.objectVolume);
  }
}
