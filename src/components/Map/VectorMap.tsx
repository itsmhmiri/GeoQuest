import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { getProjectedMapData, MAP_BASE_WIDTH, MAP_BASE_HEIGHT, ProjectedCountry, graticulePath, spherePath } from '../../utils/geo';
import { useGameStore } from '../../store/gameStore';
import { CountryRecord } from '../../data/types';
import { ZoomIn, ZoomOut, RotateCcw, Compass, MapPin } from 'lucide-react';

interface VectorMapProps {
  onCountryClick?: (country: CountryRecord) => void;
  highlightedCountryIds?: Set<string>;
  missedCountryIds?: Set<string>;
  activePromptCountryId?: string | null;
  maskedCountryIds?: Set<string>;
  chainCountryIds?: string[];
  spotlightCenterCountryId?: string | null;
  className?: string;
  interactive?: boolean;
}

export const VectorMap: React.FC<VectorMapProps> = ({
  onCountryClick,
  highlightedCountryIds,
  missedCountryIds,
  activePromptCountryId,
  maskedCountryIds,
  chainCountryIds,
  spotlightCenterCountryId,
  className = '',
  interactive = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Zustand state
  const {
    hoveredCountry,
    setHoveredCountry,
    setSelectedCountry,
    autoPanEnabled,
  } = useGameStore();

  // Transform state for pan & zoom
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({
    x: 0,
    y: 0,
    k: 1,
  });

  // Mouse dragging state
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringElement, setIsHoveringElement] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch tracking state for mobile / tablet gestures
  const touchState = useRef<{
    active: boolean;
    mode: 'none' | 'pan' | 'pinch';
    startX: number;
    startY: number;
    initialDistance: number;
    initialK: number;
    midX: number;
    midY: number;
  }>({
    active: false,
    mode: 'none',
    startX: 0,
    startY: 0,
    initialDistance: 0,
    initialK: 1,
    midX: 0,
    midY: 0,
  });

  // Map Data (projected once)
  const { projectedCountries } = useMemo(() => getProjectedMapData(), []);

  // Compute spotlight neighbor IDs if spotlightCenterCountryId is given
  const spotlightNeighborIds = useMemo(() => {
    if (!spotlightCenterCountryId) return null;
    const center = projectedCountries.find((p) => p.country.id === spotlightCenterCountryId);
    if (!center) return null;
    return new Set([center.country.id, ...center.country.borders]);
  }, [spotlightCenterCountryId, projectedCountries]);

  // Handle Wheel Zoom CENTERED AT CURSOR POSITION
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;

    setTransform((prev) => {
      const nextK = Math.max(0.8, Math.min(prev.k * zoomFactor, 14));
      // Zoom toward cursor (cursorX, cursorY)
      const nextX = cursorX - ((cursorX - prev.x) / prev.k) * nextK;
      const nextY = cursorY - ((cursorY - prev.y) / prev.k) * nextK;

      return {
        x: nextX,
        y: nextY,
        k: nextK,
      };
    });
  }, []);

  // Handle Mouse Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      }));
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch Handlers for mobile & tablet (1 finger = pan, 2 fingers = pinch zoom)
  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (e.touches.length === 1) {
      touchState.current = {
        active: true,
        mode: 'pan',
        startX: e.touches[0].clientX - transform.x,
        startY: e.touches[0].clientY - transform.y,
        initialDistance: 0,
        initialK: transform.k,
        midX: e.touches[0].clientX - rect.left,
        midY: e.touches[0].clientY - rect.top,
      };
    } else if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = getTouchDistance(t1, t2);
      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

      touchState.current = {
        active: true,
        mode: 'pinch',
        startX: transform.x,
        startY: transform.y,
        initialDistance: dist,
        initialK: transform.k,
        midX,
        midY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchState.current.active || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (e.touches.length === 1 && touchState.current.mode === 'pan') {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      setTransform((prev) => ({
        ...prev,
        x: clientX - touchState.current.startX,
        y: clientY - touchState.current.startY,
      }));
    } else if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = getTouchDistance(t1, t2);
      if (touchState.current.initialDistance <= 0) return;

      const scaleRatio = currentDist / touchState.current.initialDistance;
      const nextK = Math.max(0.8, Math.min(touchState.current.initialK * scaleRatio, 14));

      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

      setTransform(() => {
        const nextX = midX - ((touchState.current.midX - touchState.current.startX) / touchState.current.initialK) * nextK;
        const nextY = midY - ((touchState.current.midY - touchState.current.startY) / touchState.current.initialK) * nextK;
        return {
          x: nextX,
          y: nextY,
          k: nextK,
        };
      });
    }
  };

  const handleTouchEnd = () => {
    touchState.current.active = false;
    touchState.current.mode = 'none';
  };

  // Zoom Controls (centered on container center)
  const zoomIn = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    setTransform((prev) => {
      const nextK = Math.min(prev.k * 1.35, 14);
      const nextX = cx - ((cx - prev.x) / prev.k) * nextK;
      const nextY = cy - ((cy - prev.y) / prev.k) * nextK;
      return { x: nextX, y: nextY, k: nextK };
    });
  };

  const zoomOut = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    setTransform((prev) => {
      const nextK = Math.max(prev.k * 0.74, 0.8);
      const nextX = cx - ((cx - prev.x) / prev.k) * nextK;
      const nextY = cy - ((cy - prev.y) / prev.k) * nextK;
      return { x: nextX, y: nextY, k: nextK };
    });
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, k: 1 });
  };

  // Auto-pan to center on target coordinates
  const panToCoordinates = useCallback((cx: number, cy: number, targetZoom = 2.8) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgWidth = rect.width;
    const svgHeight = rect.height;

    const scaleToPixels = svgWidth / MAP_BASE_WIDTH;
    const pixelX = cx * scaleToPixels;
    const pixelY = cy * scaleToPixels;

    const newX = svgWidth / 2 - pixelX * targetZoom;
    const newY = svgHeight / 2 - pixelY * targetZoom;

    setTransform({
      x: newX,
      y: newY,
      k: targetZoom,
    });
  }, []);

  // When active prompt changes (e.g. in Capital Blitz), auto-pan if enabled
  useEffect(() => {
    if (activePromptCountryId && autoPanEnabled) {
      const target = projectedCountries.find((p) => p.country.id === activePromptCountryId);
      if (target) {
        panToCoordinates(target.centroid[0], target.centroid[1], 3.2);
      }
    }
  }, [activePromptCountryId, autoPanEnabled, panToCoordinates, projectedCountries]);

  // Determine Country Color State
  const getCountryFill = (item: ProjectedCountry): string => {
    const id = item.country.id;

    // 1. Masked in Phantom 10 mode
    if (maskedCountryIds && maskedCountryIds.has(id)) {
      return '#060a12'; // Void blending into oceanic gradient
    }

    // 2. Active prompt / focus
    if (activePromptCountryId === id) {
      return '#f59e0b'; // Cyber amber
    }

    // 3. Chain route (Border Bridge)
    if (chainCountryIds && chainCountryIds.includes(id)) {
      const isHead = chainCountryIds[chainCountryIds.length - 1] === id;
      return isHead ? '#38bdf8' : '#0284c7';
    }

    // 4. Highlighted / Solved
    if (highlightedCountryIds && highlightedCountryIds.has(id)) {
      return '#10b981'; // Vibrant emerald
    }

    // 5. Missed / Forfeited
    if (missedCountryIds && missedCountryIds.has(id)) {
      return '#f43f5e'; // Crimson rose
    }

    // 6. Spotlight Neighbors mode
    if (spotlightNeighborIds) {
      if (spotlightNeighborIds.has(id)) {
        return id === spotlightCenterCountryId ? '#38bdf8' : '#475569';
      }
      return '#0d131f'; // Dimmed out
    }

    // 7. Hovered state
    if (hoveredCountry?.id === id) {
      return '#222d3d';
    }

    // 8. Default cartographic dark slate
    return '#141c28';
  };

  const getCountryStroke = (item: ProjectedCountry): string => {
    const id = item.country.id;

    if (maskedCountryIds && maskedCountryIds.has(id)) {
      return 'transparent';
    }

    if (hoveredCountry?.id === id) {
      return '#38bdf8';
    }

    if (activePromptCountryId === id) {
      return '#fbbf24';
    }

    if (chainCountryIds && chainCountryIds.includes(id)) {
      return '#7dd3fc';
    }

    if (highlightedCountryIds && highlightedCountryIds.has(id)) {
      return '#34d399';
    }

    if (missedCountryIds && missedCountryIds.has(id)) {
      return '#fb7185';
    }

    if (spotlightNeighborIds && !spotlightNeighborIds.has(id)) {
      return '#17202f';
    }

    return '#232e3f';
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#060a12] select-none touch-none ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      {/* Background ambient lighting vignettes */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_45%,rgba(16,185,129,0.03),rgba(6,10,18,0.85)_75%)]" />

      {/* SVG Map Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_BASE_WIDTH} ${MAP_BASE_HEIGHT}`}
        className="w-full h-full relative z-10"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Oceanic depth radial gradient */}
          <radialGradient id="ocean-radial" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#0b111c" />
            <stop offset="70%" stopColor="#070c15" />
            <stop offset="100%" stopColor="#04070e" />
          </radialGradient>

          {/* Atmosphere rim aura */}
          <linearGradient id="atmosphere-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </linearGradient>

          {/* Glow filters for vibrant states */}
          <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#10b981" floodOpacity="0.65" />
          </filter>
          <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
          </filter>
          <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.75" />
          </filter>
          <filter id="rose-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f43f5e" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* Scaled/panned container group */}
        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
          style={{ transition: isDragging.current || touchState.current.active ? 'none' : 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Earth sphere boundary */}
          {spherePath && (
            <path
              d={spherePath}
              fill="url(#ocean-radial)"
              stroke="url(#atmosphere-rim)"
              strokeWidth="1.2"
            />
          )}

          {/* Delicate cartographic graticules */}
          {graticulePath && (
            <path
              d={graticulePath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="0.45"
              pointerEvents="none"
            />
          )}

          {/* Render Base Country Polygons */}
          {projectedCountries.map((item) => {
            if (!item.pathData) return null;

            const isMasked = maskedCountryIds && maskedCountryIds.has(item.country.id);
            const isSolved = highlightedCountryIds && highlightedCountryIds.has(item.country.id);
            const isActive = activePromptCountryId === item.country.id;
            const isChain = chainCountryIds && chainCountryIds.includes(item.country.id);
            const isMissed = missedCountryIds && missedCountryIds.has(item.country.id);
            const isHovered = hoveredCountry?.id === item.country.id;

            return (
              <path
                key={item.country.id}
                d={item.pathData}
                fill={getCountryFill(item)}
                stroke={getCountryStroke(item)}
                strokeWidth={isMasked ? '0' : isHovered ? '1.2' : isSolved || isActive ? '0.75' : '0.45'}
                filter={
                  isActive
                    ? 'url(#amber-glow)'
                    : isChain
                    ? 'url(#cyan-glow)'
                    : isSolved
                    ? 'url(#emerald-glow)'
                    : isMissed
                    ? 'url(#rose-glow)'
                    : undefined
                }
                className="transition-colors duration-150"
                style={{
                  pointerEvents: isMasked ? 'none' : 'auto',
                }}
                onMouseEnter={() => {
                  if (!isMasked) {
                    setHoveredCountry(item.country);
                    setIsHoveringElement(true);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredCountry(null);
                  setIsHoveringElement(false);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isMasked && interactive) {
                    setSelectedCountry(item.country);
                    if (onCountryClick) onCountryClick(item.country);
                  }
                }}
              />
            );
          })}

          {/* Render Micro-State Selectable Markers with Pulsing Radiance */}
          {projectedCountries
            .filter((item) => item.isMicroState)
            .map((item) => {
              const isMasked = maskedCountryIds && maskedCountryIds.has(item.country.id);
              if (isMasked) return null;

              const isSolved = highlightedCountryIds && highlightedCountryIds.has(item.country.id);
              const isActive = activePromptCountryId === item.country.id;
              const isHovered = hoveredCountry?.id === item.country.id;
              const [cx, cy] = item.centroid;

              const fillColor = isActive
                ? '#f59e0b'
                : isSolved
                ? '#10b981'
                : isHovered
                ? '#38bdf8'
                : '#64748b';

              const dotRadius = Math.max(1.8, Math.min(3.6 / Math.sqrt(transform.k), 3.2));
              const hitRadius = Math.max(7, 13 / Math.sqrt(transform.k));

              return (
                <g
                  key={`micro-${item.country.id}`}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredCountry(item.country);
                    setIsHoveringElement(true);
                  }}
                  onMouseLeave={() => {
                    setHoveredCountry(null);
                    setIsHoveringElement(false);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (interactive) {
                      setSelectedCountry(item.country);
                      if (onCountryClick) onCountryClick(item.country);
                    }
                  }}
                >
                  <circle cx={cx} cy={cy} r={hitRadius} fill="transparent" />

                  {(isActive || isSolved || isHovered) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={dotRadius * 1.9}
                      fill="none"
                      stroke={fillColor}
                      strokeWidth="0.8"
                      opacity="0.75"
                    />
                  )}

                  <circle
                    cx={cx}
                    cy={cy}
                    r={dotRadius}
                    fill={fillColor}
                    stroke="#04070e"
                    strokeWidth="0.6"
                  />
                </g>
              );
            })}
        </g>
      </svg>

      {/* Floating Tooltip on Country Hover with High-Fidelity Geography Badges (Desktop only, hidden on touch) */}
      {hoveredCountry && isHoveringElement && (
        <div
          className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full mb-3 rounded-2xl bg-[#0a101f]/95 px-3.5 py-2.5 text-xs text-white backdrop-blur-2xl border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.7)] transition-opacity duration-150 animate-fadeIn hidden sm:block"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 14}px`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none drop-shadow">{hoveredCountry.flagEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">{hoveredCountry.name}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  {hoveredCountry.id}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5 text-emerald-400" />
                  {hoveredCountry.capital}
                </span>
                <span>·</span>
                <span>{hoveredCountry.continent}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Map Controller Glass Buttons */}
      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20 flex flex-col gap-1 rounded-2xl bg-[#090e1c]/85 p-1.5 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <button
          onClick={zoomIn}
          title="Zoom in (+)"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={zoomOut}
          title="Zoom out (-)"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="h-[1px] w-5 mx-auto bg-white/10 my-0.5" />
        <button
          onClick={resetView}
          title="Reset map view (1x)"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cartographic Scale Badge watermark */}
      <div className="pointer-events-none absolute bottom-4 left-4 sm:left-5 z-20 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/[0.06] text-[10px] sm:text-[11px] text-slate-400 font-medium shadow-md">
        <Compass className="h-3.5 w-3.5 text-emerald-400" />
        <span className="tabular-nums font-mono text-[9px] sm:text-[10px]">Natural Earth 1 · {transform.k.toFixed(1)}x</span>
      </div>
    </div>
  );
};
