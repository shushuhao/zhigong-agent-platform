'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const isImageLogo = (logo?: string) => {
  if (!logo) return false;
  return /^data:image\//.test(logo) || /^https?:\/\//.test(logo) || logo.startsWith('/');
};

const getLogoText = (logo?: string, name?: string) => {
  if (logo && !isImageLogo(logo)) return logo;
  const fallback = name?.trim()?.[0];
  return fallback ? fallback.toUpperCase() : 'A';
};

interface AgentLogoProps {
  logo?: string;
  name?: string;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
}

export const AgentLogo: React.FC<AgentLogoProps> = ({
  logo,
  name,
  className,
  imageClassName,
  textClassName,
}) => {
  const normalizedLogo = logo?.trim() ?? '';
  const isImage = isImageLogo(normalizedLogo);
  const logoText = getLogoText(normalizedLogo, name);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {isImage ? (
        <img
          src={normalizedLogo}
          alt={name || 'agent-logo'}
          className={cn('h-full w-full object-cover', imageClassName)}
        />
      ) : (
        <span className={cn('font-semibold', textClassName)}>{logoText}</span>
      )}
    </div>
  );
};
