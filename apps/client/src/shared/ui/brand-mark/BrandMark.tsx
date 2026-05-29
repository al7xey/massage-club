import type { SVGProps } from 'react';

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.5 32.1c6.2-10.4 16.9-17.5 31.6-20.9 5.7-1.3 11-1.7 15.8-1.1-4.1 9.6-11.7 16.3-22.8 20.1-7.1 2.4-15.3 3.1-24.6 1.9Z"
        fill="currentColor"
      />
      <path
        d="M8 39.2c9.2-4.1 18.1-3.7 26.9 1.1 6.2 3.5 13 5 20.6 4.6-6.2 6-13.1 9.2-20.7 9.6-11.8.6-20.7-4.5-26.8-15.3Z"
        fill="currentColor"
        opacity="0.86"
      />
      <path
        d="M15.3 33.4c11.9.2 22.7-3.1 32.4-10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4.8"
      />
    </svg>
  );
}
