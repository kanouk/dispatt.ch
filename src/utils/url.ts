interface GetPublicUrlParams {
  service: string;
  epNo?: string | number;
  alias?: string;
  variant?: string;
}

export const getPublicUrl = ({ service, epNo, alias, variant }: GetPublicUrlParams): string => {
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN;
  
  // Use alias if available, otherwise use episode number
  let basePath: string;
  if (alias) {
    basePath = `/${service}/ep/${alias}`;
  } else if (epNo) {
    basePath = `/${service}/ep/${epNo}`;
  } else {
    throw new Error('Either epNo or alias must be provided');
  }
  
  const variantPath = variant ? `/${variant}` : '';
  
  return `https://${rootDomain}${basePath}${variantPath}`;
};