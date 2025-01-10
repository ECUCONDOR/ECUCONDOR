import 'react';

declare module 'react' {
  export type FC<P = {}> = React.FunctionComponent<P>;
  export type FunctionComponent<P = {}> = {
    (props: P & { children?: React.ReactNode }): React.ReactElement | null;
    displayName?: string;
  };
}
