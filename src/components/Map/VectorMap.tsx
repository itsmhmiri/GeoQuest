import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { getProjectedMapData, MAP_BASE_WIDTH, MAP_BASE_HEIGHT, ProjectedCountry } from '../../utils/geo';
import { useGameStore } from '../../store/gameStore';
import { CountryRecord } from '../../data/types';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';

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
    currentMode,
  } = useGameStore();

  // Transform state for pan & zoom
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({
    x: 0,
    y: 0,
    k: 1,
  });

  // Dragging state
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringElement, setIsHoveringElement] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map Data (projected once)
  const { projectedCountries } = useMemo(() => getProjectedMapData(), []);

  // Compute spotlight neighbor IDs if spotlightCenterCountryId is given
  const spotlightNeighborIds = useMemo(() => {
    if (!spotlightCenterCountryId) return null;
    const center = projectedCountries.find((p) => p.country.id === spotlightCenterCountryId);
    if (!center) return null;
    return new Set([center.country.id, ...center.country.borders]);
  }, [spotlightCenterCountryId, projectedCountries]);

  // Handle Wheel Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setTransform((prev) => {
      const nextK = Math.max(0.8, Math.min(prev.k * zoomFactor, 12));
      return {
        ...prev,
        k: nextK,
      };
    });
  }, []);

  // Handle Drag / Pan
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

  // Zoom Controls
  const zoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      k: Math.min(prev.k * 1.35, 12),
    }));
  };

  const zoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      k: Math.max(prev.k * 0.74, 0.8),
    }));
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, k: 1 });
  };

  // Auto-pan to center on target coordinates
  const panToCoordinates = useCallback((cx: number, cy: number, targetZoom = 2.5) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgWidth = rect.width;
    const svgHeight = rect.height;

    // ViewBox is MAP_BASE_WIDTH x MAP_BASE_HEIGHT
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
      return '#090d16'; // Invisible ocean void
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
        return id === spotlightCenterCountryId ? '#38bdf8' : '#64748b';
      }
      return '#18181b'; // Dimmed out
    }

    // 7. Default neutral zinc
    return '#27272a';
  };

  const getCountryStroke = (item: ProjectedCountry): string => {
    const id = item.country.id;

    // Invisible border if masked
    if (maskedCountryIds && maskedCountryIds.has(id)) {
      return 'transparent';
    }

    if (activePromptCountryId === id) {
      return '#fbbf24';
    }

    if (chainCountryIds && chainCountryIds.includes(id)) {
      return '#7dd3fc';
    }

    if (highlightedCountryIds && highlightedCountryIds.has(id)) {
      return '#059669';
    }

    if (missedCountryIds && missedCountryIds.has(id)) {
      return '#e11d48';
    }

    if (spotlightNeighborIds && !spotlightNeighborIds.has(id)) {
      return '#27272a';
    }

    return '#3f3f46';
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#090d16] select-none ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      {/* SVG Map Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_BASE_WIDTH} ${MAP_BASE_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#10b981" floodOpacity="0.45" />
          </filter>
          <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f59e0b" floodOpacity="0.6" />
          </filter>
          <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Scaled/panned container group */}
        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
          style={{ transition: isDragging.current ? 'none' : 'transform 120ms ease-out' }}
        >
          {/* Sphere/Ocean background grid line circles for subtle atlas feeling */}
          <ellipse
            cx={MAP_BASE_WIDTH / 2}
            cy={MAP_BASE_HEIGHT / 2}
            rx={450}
            ry={225}
            fill="none"
            stroke="rgba(255,255,255,0.02)"
            strokeWidth="1"
          />

          {/* Render Base Country Polygons */}
          {projectedCountries.map((item) => {
            if (!item.pathData) return null;

            const isMasked = maskedCountryIds && maskedCountryIds.has(item.country.id);
            const isSolved = highlightedCountryIds && highlightedCountryIds.has(item.country.id);
            const isActive = activePromptCountryId === item.country.id;
            const isChain = chainCountryIds && chainCountryIds.includes(item.country.id);
            const isHovered = hoveredCountry?.id === item.country.id;

            return (
              <path
                key={item.country.id}
                d={item.pathData}
                fill={getCountryFill(item)}
                stroke={getCountryStroke(item)}
                strokeWidth={isMasked ? '0' : isHovered ? '1.2' : '0.45'}
                filter={
                  isActive
                    ? 'url(#amber-glow)'
                    : isChain
                    ? 'url(#cyan-glow)'
                    : isSolved
                    ? 'url(#emerald-glow)'
                    : undefined
                }
                className="transition-colors duration-200"
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

          {/* Render Micro-State Selectable Markers */}
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
                : '#71717a';

              // Scale dot inversely with zoom so it remains crisp and easy to target
              const dotRadius = Math.max(1.8, Math.min(3.6 / Math.sqrt(transform.k), 3.2));
              const hitRadius = Math.max(6, 12 / Math.sqrt(transform.k));

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
                  {/* Invisible enlarged hit target for easy clicking on mobile / desktop */}
                  <circle cx={cx} cy={cy} r={hitRadius} fill="transparent" />

                  {/* Pulsing ring for active or solved small nations */}
                  {(isActive || isSolved || isHovered) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={dotRadius * 1.8}
                      fill="none"
                      stroke={fillColor}
                      strokeWidth="0.8"
                      opacity="0.6"
                    />
                  )}

                  {/* Core dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={dotRadius}
                    fill={fillColor}
                    stroke="#090d16"
                    strokeWidth="0.5"
                  />
                </g>
              );
            })}
        </g>
      </svg>

      {/* Micro Floating Tooltip on Country Hover */}
      {hoveredCountry && isHoveringElement && (
        <div
          className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full mb-3 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs text-white backdrop-blur-md border border-white/10 shadow-xl transition-opacity duration-150"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 12}px`,
          }}
        >
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-base">{hoveredCountry.flagEmoji}</span>
            <span className="font-semibold">{hoveredCountry.name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{hoveredCountry.capital}</span>
          </div>
        </div>
      )}

      {/* Floating Map Controller Buttons (Zoom in, Zoom out, Reset) */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-1.5 rounded-lg bg-slate-900/80 p-1.5 backdrop-blur-md border border-white/10 shadow-lg">
        <button
          onClick={zoomIn}
          title="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={zoomOut}
          title="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset map view"
          className="flex h-8 w-8 items-center justify-center rounded text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Scale indicator watermark */}
      <div className="pointer-events-none absolute bottom-4 left-5 z-20 text-[11px] text-slate-500 tabular-nums">
        Zoom: {transform.k.toFixed(1)}x
      </div>
    </div>
  );
};
