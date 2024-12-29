import type { Container, Engine } from "@tsparticles/engine";

declare module "@tsparticles/engine" {
  interface IParticlesProps {
    id?: string;
    options?: RecursivePartial<IOptions>;
    container?: Container;
    init?: (engine: Engine) => Promise<void>;
  }

  interface IOptions {
    background?: IBackground;
    particles?: IParticles;
    interactivity?: IInteractivity;
    responsive?: Array<IResponsive>;
    style?: React.CSSProperties;
  }

  interface IBackground {
    color?: string;
    image?: string;
    position?: string;
    repeat?: string;
    size?: string;
    opacity?: number;
  }

  interface IParticles {
    number?: {
      value?: number;
      density?: {
        enable?: boolean;
        value_area?: number;
      };
    };
    color?: {
      value?: string | string[] | IColor;
    };
    shape?: {
      type?: string | string[];
      stroke?: {
        width?: number;
        color?: string;
      };
    };
    opacity?: {
      value?: number;
      random?: boolean;
      anim?: {
        enable?: boolean;
        speed?: number;
        opacity_min?: number;
        sync?: boolean;
      };
    };
    size?: {
      value?: number;
      random?: boolean;
      anim?: {
        enable?: boolean;
        speed?: number;
        size_min?: number;
        sync?: boolean;
      };
    };
    line_linked?: {
      enable?: boolean;
      distance?: number;
      color?: string;
      opacity?: number;
      width?: number;
    };
    move?: {
      enable?: boolean;
      speed?: number;
      direction?: string;
      random?: boolean;
      straight?: boolean;
      out_mode?: string;
      bounce?: boolean;
      attract?: {
        enable?: boolean;
        rotateX?: number;
        rotateY?: number;
      };
    };
  }

  interface IInteractivity {
    detect_on?: string;
    events?: {
      onhover?: {
        enable?: boolean;
        mode?: string | string[];
      };
      onclick?: {
        enable?: boolean;
        mode?: string | string[];
      };
      resize?: boolean;
    };
    modes?: {
      grab?: {
        distance?: number;
        line_linked?: {
          opacity?: number;
        };
      };
      bubble?: {
        distance?: number;
        size?: number;
        duration?: number;
        opacity?: number;
        speed?: number;
      };
      repulse?: {
        distance?: number;
        duration?: number;
      };
      push?: {
        particles_nb?: number;
      };
      remove?: {
        particles_nb?: number;
      };
    };
  }

  interface IResponsive {
    breakpoint: number;
    options: IOptions;
  }

  interface IColor {
    r: number;
    g: number;
    b: number;
  }

  type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
      ? RecursivePartial<U>[]
      : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
  };
}
