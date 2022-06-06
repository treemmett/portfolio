declare module '*.svg' {
  const ReactComponent: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  export { ReactComponent };
}
