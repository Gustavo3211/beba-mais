import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function BrandDrop({ size = 29 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.7C9.5 6.3 5.8 10.2 5.8 14.4a6.2 6.2 0 1 0 12.4 0C18.2 10.2 14.5 6.3 12 2.7Z"
        fill={colors.blue}
      />
      <Path
        d="M9 15.1c.2 1.5 1.2 2.5 2.8 2.8"
        stroke="#09283a"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function DropletIcon({ size = 19, color = colors.blue, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.8C9.7 6.2 5.7 10.1 5.7 14.4a6.3 6.3 0 1 0 12.6 0C18.3 10.1 14.3 6.2 12 2.8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </Svg>
  );
}

export function NfcIcon({ size = 21, color = colors.blue, strokeWidth = 1.8 }: IconProps) {
  const stroke = { stroke: color, strokeWidth, fill: 'none' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6.5 6.5a8 8 0 0 1 0 11" {...stroke} strokeLinecap="round" />
      <Path d="M10 9.5a4 4 0 0 1 0 5" {...stroke} strokeLinecap="round" />
      <Path d="M13.5 4a11 11 0 0 1 0 16" {...stroke} strokeLinecap="round" />
      <Circle cx={12} cy={12} r={1.1} fill={color} />
    </Svg>
  );
}

export function PencilIcon({ size = 15, color = colors.blue, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 21, color = colors.blue, strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function HomeIcon({ size = 22, color = colors.blue, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function CalendarIcon({ size = 22, color = colors.blue, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect
        x={3}
        y={5}
        width={18}
        height={16}
        rx={2}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M16 3v4M8 3v4M3 10h18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      {[8, 12, 16].map((cx) => (
        <Circle key={`a-${cx}`} cx={cx} cy={14} r={0.9} fill={color} />
      ))}
      {[8, 12].map((cx) => (
        <Circle key={`b-${cx}`} cx={cx} cy={17} r={0.9} fill={color} />
      ))}
    </Svg>
  );
}

export function UserIcon({ size = 22, color = colors.blue, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M4 21a8 8 0 0 1 16 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 18, color = colors.blue, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="m15 18-6-6 6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = colors.blue, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="m9 18 6-6-6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = colors.aquaSoft, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="m5 12.5 4.4 4.4L19 7.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function WaveIcon({ size = 17, color = colors.aqua }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 8c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2M3 13.5c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2M3 19c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function CupIcon({ size = 20, color = colors.blue, strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6.5 8.5h9l-.9 10a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8l-.9-10Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M15.5 10.5h1.6a2 2 0 0 1 0 4h-1.9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M5.5 8.5h11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function GlassIcon({ size = 22, color = colors.blue, strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7 3.5h10l-1.3 16.2a1.5 1.5 0 0 1-1.5 1.4H9.8a1.5 1.5 0 0 1-1.5-1.4L7 3.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M7.6 10.5h8.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function BottleIcon({ size = 24, color = colors.blue, strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10 2.8h4v3.4l1.6 2.4a3 3 0 0 1 .5 1.7V20a1.2 1.2 0 0 1-1.2 1.2H9.1A1.2 1.2 0 0 1 7.9 20V10.3a3 3 0 0 1 .5-1.7L10 6.2V2.8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9.5 2.8h5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M8.4 11.2h7.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
