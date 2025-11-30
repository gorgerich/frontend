"use client";

import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const BaseIcon: React.FC<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

// ОДИН и тот же базовый значок, но с разными именами экспорта.
// Это нужно только для того, чтобы всё собиралось и работало.
// Потом иконки можно будет заменить на настоящие.

export const CheckCircle2 = (props: IconProps) => <BaseIcon {...props} />;
export const Camera = (props: IconProps) => <BaseIcon {...props} />;
export const Edit2 = (props: IconProps) => <BaseIcon {...props} />;
export const Download = (props: IconProps) => <BaseIcon {...props} />;
export const Share2 = (props: IconProps) => <BaseIcon {...props} />;
export const Clock = (props: IconProps) => <BaseIcon {...props} />;
export const RubleSign = (props: IconProps) => <BaseIcon {...props} />;
export const Music = (props: IconProps) => <BaseIcon {...props} />;
export const Church = (props: IconProps) => <BaseIcon {...props} />;
export const Car = (props: IconProps) => <BaseIcon {...props} />;
export const Flower2 = (props: IconProps) => <BaseIcon {...props} />;
export const Snowflake = (props: IconProps) => <BaseIcon {...props} />;
export const Sparkles = (props: IconProps) => <BaseIcon {...props} />;
export const Shirt = (props: IconProps) => <BaseIcon {...props} />;
export const Building = (props: IconProps) => <BaseIcon {...props} />;
export const UserCheck = (props: IconProps) => <BaseIcon {...props} />;
export const Users = (props: IconProps) => <BaseIcon {...props} />;
export const Route = (props: IconProps) => <BaseIcon {...props} />;
export const Bus = (props: IconProps) => <BaseIcon {...props} />;
export const Package = (props: IconProps) => <BaseIcon {...props} />;
export const Palette = (props: IconProps) => <BaseIcon {...props} />;
export const Video = (props: IconProps) => <BaseIcon {...props} />;
export const Cross = (props: IconProps) => <BaseIcon {...props} />;
export const FileText = (props: IconProps) => <BaseIcon {...props} />;
export const Utensils = (props: IconProps) => <BaseIcon {...props} />;
export const Landmark = (props: IconProps) => <BaseIcon {...props} />;
export const Check = (props: IconProps) => <BaseIcon {...props} />;
export const Search = (props: IconProps) => <BaseIcon {...props} />;
export const MapPin = (props: IconProps) => <BaseIcon {...props} />;
export const X = (props: IconProps) => <BaseIcon {...props} />;
export const ChevronDown = (props: IconProps) => <BaseIcon {...props} />;
export const ChevronLeft = (props: IconProps) => <BaseIcon {...props} />;
export const ChevronRight = (props: IconProps) => <BaseIcon {...props} />;
export const ChevronUp = (props: IconProps) => <BaseIcon {...props} />;