export interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
  focusableSelectors?: readonly string[];
  disableAutoFocus?: boolean;
  onEscape?: () => void;
  className?: string;
}
