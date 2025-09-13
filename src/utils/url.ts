interface GetPublicUrlParams {
  service: string;
  epNo: string | number;
  variant?: string;
}

export const getPublicUrl = ({ service, epNo, variant }: GetPublicUrlParams): string => {
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN;
  const basePath = `/${service}/ep/${epNo}`;
  const variantPath = variant ? `/${variant}` : '';
  
  return `https://${rootDomain}${basePath}${variantPath}`;
};