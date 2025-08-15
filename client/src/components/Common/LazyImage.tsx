// Lazy Image Component - Optimized image loading with placeholders and effects
// Provides progressive loading, blur effects, and fallback handling

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Image, ImageOff, Loader2 } from "lucide-react";

// Lazy image props interface
export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  effect?: "blur" | "fade" | "scale" | "none";
  threshold?: number;
  rootMargin?: string;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: (error: string) => void;
  onIntersect?: () => void;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
  aspectRatio?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  showPlaceholder?: boolean;
  placeholderColor?: string;
  placeholderIcon?: React.ReactNode;
  transitionDuration?: number;
  errorFallback?: React.ReactNode;
}

// Lazy image component
export function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
  placeholder,
  fallback,
  effect = "blur",
  threshold = 0.1,
  rootMargin = "50px",
  loading = "lazy",
  onLoad,
  onError,
  onIntersect,
  priority = false,
  sizes,
  quality = 75,
  blurDataURL,
  aspectRatio,
  objectFit = "cover",
  showPlaceholder = true,
  placeholderColor = "#f3f4f6",
  placeholderIcon = <Image className="w-8 h-8 text-gray-400" />,
  transitionDuration = 300,
  errorFallback,
}: LazyImageProps) {
  // State management
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection observer hook
  const { ref: intersectionRef, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  // Combined ref for intersection observer
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      intersectionRef(node);
    },
    [intersectionRef],
  );

  // Handle intersection
  useEffect(() => {
    if (inView && !isIntersecting) {
      setIsIntersecting(true);
      onIntersect?.();

      // Load image if not already loaded
      if (!imageSrc && src) {
        loadImage();
      }
    }
  }, [inView, isIntersecting, imageSrc, src, onIntersect]);

  // Load image function
  const loadImage = useCallback(async () => {
    if (!src) return;

    try {
      // Create a new image element to preload
      const img = document.createElement('img');

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };

      img.onerror = () => {
        setHasError(true);
        onError?.(`Failed to load image: ${src}`);

        // Try fallback if available
        if (fallback) {
          setImageSrc(fallback);
          setIsLoaded(true);
        }
      };

      // Set source to trigger loading
      img.src = src;

      // Add query parameters for optimization if needed
      if (quality !== 75) {
        const url = new URL(src, window.location.origin);
        url.searchParams.set("q", quality.toString());
        img.src = url.toString();
      }
    } catch (error) {
      setHasError(true);
      onError?.(`Error loading image: ${error}`);
    }
  }, [src, fallback, quality, onLoad, onError]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setHasError(true);
    onError?.(`Failed to load image: ${src}`);
  }, [src, onError]);

  // Priority loading (immediate load for above-the-fold images)
  useEffect(() => {
    if (priority && src) {
      loadImage();
    }
  }, [priority, src, loadImage]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Container styles
  const containerStyles: React.CSSProperties = {
    width: width || "auto",
    height: height || "auto",
    aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
    position: "relative",
    overflow: "hidden",
    backgroundColor: placeholderColor,
  };

  // Image styles
  const imageStyles: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit,
    transition: `opacity ${transitionDuration}ms ease-in-out, transform ${transitionDuration}ms ease-in-out`,
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? "scale(1)" : "scale(1.05)",
  };

  // Placeholder styles
  const placeholderStyles: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: placeholderColor,
    transition: `opacity ${transitionDuration}ms ease-in-out`,
    opacity: isLoaded ? 0 : 1,
  };

  // Blur effect styles
  const blurStyles: React.CSSProperties = {
    filter: isLoaded ? "blur(0px)" : "blur(10px)",
    transition: `filter ${transitionDuration}ms ease-in-out`,
  };

  // Render placeholder
  const renderPlaceholder = () => {
    if (!showPlaceholder) return null;

    if (placeholder) {
      return (
        <img
          src={placeholder}
          alt=""
          style={placeholderStyles}
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }

    return <div style={placeholderStyles}>{placeholderIcon}</div>;
  };

  // Render error state
  const renderError = () => {
    if (!hasError) return null;

    if (errorFallback) {
      return errorFallback;
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <ImageOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Failed to load image</p>
        </div>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => {
    if (isLoaded || hasError) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  };

  // Render main image
  const renderImage = () => {
    if (!imageSrc && !src) return null;

    const imageSource = imageSrc || src;
    const imageStylesWithEffect =
      effect === "blur" ? { ...imageStyles, ...blurStyles } : imageStyles;

    return (
      <img
        src={imageSource}
        alt={alt}
        style={imageStylesWithEffect}
        className={className}
        loading={loading}
        sizes={sizes}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  };

  return (
    <div
      ref={setRefs}
      style={containerStyles}
      className={`lazy-image ${className}`}
    >
      {/* Placeholder */}
      {renderPlaceholder()}

      {/* Loading indicator */}
      {renderLoading()}

      {/* Error state */}
      {renderError()}

      {/* Main image */}
      {renderImage()}

      {/* Blur data URL for Next.js style optimization */}
      {blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(20px)",
            transform: "scale(1.1)",
            opacity: isLoaded ? 0 : 1,
            transition: `opacity ${transitionDuration}ms ease-in-out`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

// Export the component
export default LazyImage;
