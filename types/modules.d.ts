declare module 'react-native-redash' {
  import { SharedValue } from 'react-native-reanimated';
  
  export interface Vector<T> {
    x: T;
    y: T;
  }
  
  export function useVector(
    x: number,
    y: number
  ): Vector<SharedValue<number>>;
  
  export function snapPoint(
    value: number,
    velocity: number,
    points: number[]
  ): number;
}

declare module '@react-native-community/masked-view' {
  import React from 'react';
  import { ViewProps } from 'react-native';
  
  export interface MaskedViewProps extends ViewProps {
    maskElement: React.ReactElement;
  }
  
  export default function MaskedView(
    props: MaskedViewProps & { children: React.ReactNode }
  ): JSX.Element;
} 