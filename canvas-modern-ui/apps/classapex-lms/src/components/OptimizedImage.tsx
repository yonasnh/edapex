import React, { useState, useMemo } from 'react';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  style,
  fallbackSrc = '/classapex_logo_transparent.png',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Auto-generate WebP source fallback if it is a local static png/jpg
  const webpSrc = useMemo(() => {
    if (!src) return undefined;
    if (src.includes('data:') || src.startsWith('blob:')) return undefined;
    
    // Check if image is png, jpg or jpeg
    if (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg')) {
      const idx = src.lastIndexOf('.');
      return src.substring(0, idx) + '.webp';
    }
    return undefined;
  }, [src]);

  return (
    <div
      className={`cx-image-container ${loaded ? 'loaded' : 'loading'}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--cx-bg-surface-raised, rgba(0,0,0,0.03))',
        ...style
      }}
    >
      {!loaded && (
        <div
          className="cx-shimmer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
          }}
        />
      )}
      <picture style={{ display: 'block', width: '100%', height: '100%' }}>
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          className={className}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (fallbackSrc && currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc);
            } else {
              setLoaded(true); // Resolve shimmer on full error
            }
          }}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: (style as any)?.objectFit || 'cover',
          }}
          {...props}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;
