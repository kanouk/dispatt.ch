import React from 'react';
import { 
  FaYoutube, 
  FaTiktok, 
  FaInstagram, 
  FaSpotify,
  FaGlobe,
  FaStickyNote
} from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface PlatformIconProps {
  iconName: string;
  className?: string;
  size?: number;
  color?: string;
}

const iconMap = {
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaSpotify,
  FaStickyNote,
  FaGlobe, // fallback icon
};

export const PlatformIcon: React.FC<PlatformIconProps> = ({ 
  iconName, 
  className, 
  size = 20,
  color = 'currentColor'
}) => {
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || FaGlobe;
  
  return (
    <IconComponent 
      className={cn(className)} 
      size={size}
      color={color}
    />
  );
};