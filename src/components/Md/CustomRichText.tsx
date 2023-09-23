import { FunctionComponent, ReactNode } from 'react';

type CustomElementProps = {
  Component: 'p' | 'ol' | 'li';
  children?: ReactNode;
  [key: string]: any;
};

const CustomElement: FunctionComponent<CustomElementProps> = ({
  Component,
  children,
  ...otherProps
}) => {
  const className = (() => {
    switch (Component) {
      case 'p':
        return 'leading-loose text-base mb-4';
      case 'ol':
        return 'list-decimal list-inside';
      case 'li':
        return 'mb-2';
      default:
        return '';
    }
  })();

  return (
    <Component className={className} {...otherProps}>
      {children}
    </Component>
  );
};

export const CustomP: FunctionComponent<React.HTMLProps<HTMLParagraphElement>> = (props) => (
  <CustomElement Component="p" {...props} />
);

export const CustomOL: FunctionComponent<React.HTMLProps<HTMLOListElement>> = (props) => (
  <CustomElement Component="ol" {...props} />
);

export const CustomLI: FunctionComponent<React.HTMLProps<HTMLLIElement>> = (props) => (
  <CustomElement Component="li" {...props} />
);
