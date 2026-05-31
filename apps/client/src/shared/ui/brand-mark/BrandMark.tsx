import type { SVGProps } from 'react';

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="150 220 2065 620" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <image href="/brand-logo.png" width="2365" height="1028" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}
