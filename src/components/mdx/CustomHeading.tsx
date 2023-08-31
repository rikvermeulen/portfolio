import cc from '@/lib/cc';

type CustomHeadingProps = React.ComponentPropsWithRef<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> & {
  Component: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

function CustomHeading({ Component, id, children, className, ...otherProps }: CustomHeadingProps) {
  return (
    <Component
      id={id}
      className={cc(className, 'group mb-4 mt-8 whitespace-pre-wrap text-black')}
      {...otherProps}
    >
      {children}
    </Component>
  );
}

export const CustomH1 = (props: React.ComponentPropsWithRef<'h1'>) => (
  <CustomHeading Component="h1" className="" {...props} />
);
export const CustomH2 = (props: React.ComponentPropsWithRef<'h2'>) => (
  <CustomHeading Component="h2" className=" text-2xl font-medium" {...props} />
);
export const CustomH3 = (props: React.ComponentPropsWithRef<'h3'>) => (
  <CustomHeading Component="h3" className="" {...props} />
);
export const CustomH4 = (props: React.ComponentPropsWithRef<'h4'>) => (
  <CustomHeading Component="h4" className="" {...props} />
);
export const CustomH5 = (props: React.ComponentPropsWithRef<'h5'>) => (
  <CustomHeading Component="h5" {...props} />
);
export const CustomH6 = (props: React.ComponentPropsWithRef<'h6'>) => (
  <CustomHeading Component="h6" {...props} />
);
