interface Props {
  alt: string;
  size?: number;
  color?: string;
}

export const Logo = ({ alt, size = 24, color = "currentcolor" }: Props) => (
  <svg
    version="1.1"
    width={size}
    height={size}
    viewBox="0 0 1200 1200"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={alt}
  >
    <title>{alt}</title>
    <path
      stroke="none"
      fill={color}
      d="m646.5 871.31c287.88 22.25 503.5-285.5 503.5-285.5 22.637-60.195 39.383-122.45 50-185.88 0 0-81-31.375-109.62-187.5 0 0-694.62 282-937.5 250.75 0 0-108.38-9.125-152.75-79.625 16.715 64.133 39.875 126.41 69.125 185.88 47 94 248.12 471.38 667.25 412.5 164.62-23.125 272.75-130.25 342.88-246.5-46.27 44.426-98.172 82.586-154.38 113.5-439.5 245.25-779.75-249-779.75-249s213.38 249 501.25 271.38z"
    />
  </svg>
);
