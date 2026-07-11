export type SvgIconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { readonly title?: string }
>;

export type IconName = string;

export interface IconProps {
  readonly name: IconName;
  readonly label?: string;
  readonly className?: string;
  readonly iconClassName?: string;
}
