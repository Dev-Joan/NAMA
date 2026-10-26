import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Clinic photos: every image in src/assets/clinic/ is shown, sorted by file name
// (see the README there). The part after the number ("03-salon" → "salon") picks the alt text.
const photoFiles = import.meta.glob<string>('../assets/clinic/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
const photos = Object.keys(photoFiles)
  .sort()
  .map((path) => ({ id: path.replace(/^.*\/|\.[^.]+$/g, '').replace(/^\d+[-_ ]*/, '').toLowerCase(), src: photoFiles[path] }));

const AUTOPLAY_MS = 4000;
const RESUME_AFTER_MS = 6000;
const SWIPE_PX = 40;

export type ClinicCarouselCopy = {
  label: string;
  previous: string;
  next: string;
  goTo: string;
  photoFallback: string;
  photos: Record<string, string>;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function ClinicCarousel({ copy }: { copy: ClinicCarouselCopy }) {
  const count = photos.length;
  // The photos are rendered three times so the row can loop: `position` stays in the middle copy,
  // and after a slide lands in an outer copy the track jumps back to its twin without animating.
  const slides = [...photos, ...photos, ...photos];
  const [position, setPosition] = useState(count);
  const [instant, setInstant] = useState(false);
  const [offset, setOffset] = useState(0);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState(false);
  const [tick, setTick] = useState(0);
  const [holding, setHolding] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const holdTimer = useRef<number | undefined>(undefined);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const active = ((position % count) + count) % count;
  useEffect(() => setHovered(false), [position]);

  const settle = useCallback((next: number) => {
    if (next >= count && next < count * 2) return;
    setInstant(true);
    setPosition(((next % count) + count) % count + count);
  }, [count]);

  const moveTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    setPosition(clamped);
    // Without the slide animation there is no transitionend to wait for.
    if (reducedMotion) settle(clamped);
  }, [reducedMotion, settle, slides.length]);

  // A click, tap or swipe pauses autoplay for a few seconds.
  const hold = () => {
    setHolding(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHolding(false), RESUME_AFTER_MS);
  };
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  const step = (delta: number) => { hold(); moveTo(position + delta); };
  const goTo = (index: number) => {
    hold();
    let delta = index - active;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;
    moveTo(position + delta);
  };

  useEffect(() => {
    if (count < 2 || hovered || holding) return;
    // In a background tab, wait another round instead of stopping.
    const timer = window.setTimeout(() => { if (document.hidden) setTick((value) => value + 1); else moveTo(position + 1); }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [count, hovered, holding, moveTo, position, tick]);

  // Centre the current slide: measure it, since photos keep their own width.
  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const slide = slideRefs.current[position];
    if (!viewport || !slide) return;
    setOffset(viewport.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2));
  }, [position]);
  useLayoutEffect(measure, [measure, ratios]);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [measure]);

  // Turn the animation back on once the instant jump has been painted.
  useEffect(() => {
    if (!instant) return;
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setInstant(false)); });
    return () => cancelAnimationFrame(frame);
  }, [instant]);

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(event.clientY - start.y)) return;
    step(dx < 0 ? 1 : -1);
  };

  if (count === 0) return null;

  return (
    <div
      className={`clinic-carousel${reducedMotion ? ' is-reduced' : ''}`}
      dir="ltr"
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.label}
      data-testid="carousel-clinic"
    >
      <div
        className="clinic-carousel-viewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { swipeStart.current = null; }}
      >
        <div
          className={`clinic-carousel-track${instant ? ' is-instant' : ''}`}
          style={{ transform: `translate3d(${offset}px, 0, 0)` }}
          onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === 'transform') settle(position); }}
        >
          {slides.map((photo, index) => {
            const isActive = index === position;
            return (
              <figure
                key={index}
                ref={(element) => { slideRefs.current[index] = element; }}
                className={`clinic-slide${isActive ? ' is-active' : ''}${reducedMotion && isActive ? ` is-fading-${position % 2}` : ''}`}
                style={{ aspectRatio: String(ratios[photo.id] ?? 3 / 2) }}
                aria-hidden={!isActive}
                role="group"
                aria-roledescription="slide"
                aria-label={`${(index % count) + 1} / ${count}`}
                // Only hovering the centre photo pauses autoplay: the row spans the whole screen.
                onMouseEnter={isActive ? () => setHovered(true) : undefined}
                onMouseLeave={isActive ? () => setHovered(false) : undefined}
              >
                <img
                  src={photo.src}
                  alt={isActive ? copy.photos[photo.id] ?? copy.photoFallback : ''}
                  draggable={false}
                  decoding="async"
                  loading={Math.abs(index - position) <= 2 ? 'eager' : 'lazy'}
                  onLoad={(event) => {
                    const { naturalWidth, naturalHeight } = event.currentTarget;
                    if (naturalWidth && naturalHeight && !ratios[photo.id]) setRatios((current) => ({ ...current, [photo.id]: naturalWidth / naturalHeight }));
                  }}
                />
              </figure>
            );
          })}
        </div>
      </div>

      {count > 1 && (
        <div className="clinic-carousel-controls">
          <button type="button" className="clinic-carousel-arrow" onClick={() => step(-1)} aria-label={copy.previous} data-testid="button-carousel-previous">
            <ArrowLeft size={18} strokeWidth={1.2} />
          </button>
          <div className="clinic-carousel-dots">
            {photos.map((photo, index) => (
              <button
                type="button"
                key={photo.id + index}
                className={index === active ? 'is-active' : ''}
                onClick={() => goTo(index)}
                aria-label={`${copy.goTo} ${index + 1}`}
                aria-current={index === active}
              />
            ))}
          </div>
          <button type="button" className="clinic-carousel-arrow" onClick={() => step(1)} aria-label={copy.next} data-testid="button-carousel-next">
            <ArrowRight size={18} strokeWidth={1.2} />
          </button>
        </div>
      )}
    </div>
  );
}
