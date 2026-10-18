'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePhoto } from '@/hooks/use-photo';
import { X } from 'lucide-react';

export function PhotoOverlay() {
  const { photo, setPhoto } = usePhoto();
  const [isSelected, setIsSelected] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 拖拽状态
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  });

  // 调整大小状态
  const resizeState = useRef({
    isResizing: false,
    handle: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startLeft: 0,
    startTop: 0,
    startBottomPct: 0,
    imageAspectRatio: 1,
    parentWidth: 0,
    parentHeight: 0,
  });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isSelected) {
      setIsSelected(true);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    dragState.current.isDragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.startY = e.clientY;
    dragState.current.startLeft = photo.x;
    dragState.current.startTop = photo.y;
  }, [isSelected, photo.x, photo.y]);

  const onResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    resizeState.current.isResizing = true;
    resizeState.current.handle = handle;
    resizeState.current.startX = e.clientX;
    resizeState.current.startY = e.clientY;
    resizeState.current.startWidth = photo.width;
    resizeState.current.startLeft = photo.x;
    resizeState.current.startTop = photo.y;

    if (wrapperRef.current && wrapperRef.current.parentElement) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const parentRect = wrapperRef.current.parentElement.getBoundingClientRect();
      resizeState.current.parentWidth = parentRect.width;
      resizeState.current.parentHeight = parentRect.height;
      resizeState.current.imageAspectRatio = rect.width / rect.height;
      resizeState.current.startBottomPct = photo.y + (rect.height / parentRect.height) * 100;
    }
  }, [photo.width, photo.x, photo.y]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      // 处理拖拽
      if (dragState.current.isDragging && wrapperRef.current) {
        const parent = wrapperRef.current.parentElement;
        if (!parent) return;
        const parentRect = parent.getBoundingClientRect();

        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;

        const dxPct = (dx / parentRect.width) * 100;
        const dyPct = (dy / parentRect.height) * 100;

        const newX = Math.max(0, Math.min(100 - photo.width, dragState.current.startLeft + dxPct));
        const newY = Math.max(0, Math.min(100, dragState.current.startTop + dyPct));

        setPhoto({ ...photo, x: newX, y: newY });
      }

      // 处理调整大小
      if (resizeState.current.isResizing && wrapperRef.current) {
        const parent = wrapperRef.current.parentElement;
        if (!parent) return;
        const parentRect = parent.getBoundingClientRect();

        const dx = e.clientX - resizeState.current.startX;
        const dy = e.clientY - resizeState.current.startY;

        const dxPct = (dx / parentRect.width) * 100;
        const dyPct = (dy / parentRect.height) * 100;

        let newWidth = resizeState.current.startWidth;
        let newLeft = resizeState.current.startLeft;
        let newTop = resizeState.current.startTop;

        if (resizeState.current.handle.includes('right')) {
          newWidth = Math.max(5, Math.min(100 - resizeState.current.startLeft, resizeState.current.startWidth + dxPct));
        } else if (resizeState.current.handle.includes('left')) {
          const tempWidth = Math.max(5, Math.min(resizeState.current.startLeft + resizeState.current.startWidth, resizeState.current.startWidth - dxPct));
          const tempLeft = resizeState.current.startLeft + (resizeState.current.startWidth - tempWidth);
          if (tempLeft >= 0) {
            newWidth = tempWidth;
            newLeft = tempLeft;
          }
        }

        if (resizeState.current.handle === 'top-left') {
          const currentWidthPx = (newWidth / 100) * resizeState.current.parentWidth;
          const newHeightPx = currentWidthPx / resizeState.current.imageAspectRatio;
          const newHeightPct = (newHeightPx / resizeState.current.parentHeight) * 100;
          newTop = resizeState.current.startBottomPct - newHeightPct;
        }

        setPhoto({ ...photo, x: newLeft, y: newTop, width: newWidth });
      }
    };

    const onMouseUp = () => {
      dragState.current.isDragging = false;
      resizeState.current.isResizing = false;
    };

    const onWindowClick = (e: MouseEvent) => {
      if (isSelected && wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousedown', onWindowClick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousedown', onWindowClick);
    };
  }, [isSelected, photo, setPhoto]);

  const remove = useCallback(() => {
    setPhoto({ ...photo, src: '' });
  }, [photo, setPhoto]);

  if (!photo.src) return null;

  return (
    <div
      ref={wrapperRef}
      className="absolute select-none"
      style={{
        left: `${photo.x}%`,
        top: `${photo.y}%`,
        width: `${photo.width}%`,
        zIndex: 50,
      }}
      onMouseDown={onMouseDown}
    >
      <img
        src={photo.src}
        alt="Photo"
        className={`w-full h-auto block shadow-sm ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{ cursor: isSelected ? 'move' : 'pointer' }}
        draggable={false}
      />

      {isSelected && (
        <>
          {/* 删除按钮 */}
          <button
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-50 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              remove();
            }}
          >
            <X className="w-3 h-3" />
          </button>

          {/* 调整大小锚点 */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nwse-resize z-50"
            onMouseDown={(e) => onResizeStart(e, 'top-left')}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nesw-resize z-50"
            onMouseDown={(e) => onResizeStart(e, 'bottom-left')}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nwse-resize z-50"
            onMouseDown={(e) => onResizeStart(e, 'bottom-right')}
          />
        </>
      )}
    </div>
  );
}
