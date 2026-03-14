import { memo } from "react";

type SvgIconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { title?: string }
>;

export const ICON_COMPONENTS: Record<string, SvgIconComponent> = {};

export type IconName = string;

export interface IconProps {
  name: IconName;
  label?: string;
  className?: string;
  iconClassName?: string;
}

const Icon: React.FC<IconProps> = memo(
  ({ name, label, className, iconClassName }) => {
    const IconComponent = ICON_COMPONENTS[name];
    if (!IconComponent) {
      return null;
    }

    const svgElement = (
      <IconComponent
        aria-hidden="true"
        focusable="false"
        className={iconClassName}
      />
    );

    return label ? (
      <span className={className}>
        {svgElement}
        <span className="sr-only">{label}</span>
      </span>
    ) : (
      svgElement
    );
  },
);

export default Icon;
