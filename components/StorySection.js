"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export const StorySection = ({ items, icons }) => {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const handleToggle = (idx) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="border-0 bg-white shadow-sm hover:shadow-lg rounded-xl transition-all duration-300">
      <div className="p-6 lg:p-12 space-y-4 lg:space-y-8">
        {items?.map((item, idx) => (
          <StoryItem
            key={idx}
            item={item}
            icon={icons[idx % icons.length]}
            idx={idx}
            isExpanded={expandedIdx === idx}
            onToggle={() => handleToggle(idx)}
          />
        ))}
      </div>
    </div>
  );
};

const COLLAPSED_HEIGHT = 120; // px – roughly 4-5 lines of text

const StoryItem = ({ item, icon, idx, isExpanded, onToggle }) => {
  const isEmerald = idx % 2 === 0;
  const contentRef = useRef(null);
  const [needsToggle, setNeedsToggle] = useState(item?.content?.length > 250);

  useEffect(() => {
    if (contentRef.current) {
      const shouldToggle = contentRef.current.scrollHeight > COLLAPSED_HEIGHT;
      // Only update if different to avoid unnecessary re-renders
      if (shouldToggle !== needsToggle) {
        setNeedsToggle(shouldToggle);
      }
    }
  }, [item?.content, needsToggle]);

  return (
    <div className="flex items-start gap-4 lg:gap-6">
      <div
        className={`${isEmerald ? "bg-emerald-100" : "bg-amber-100"
          } w-12 h-12 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center flex-shrink-0 mt-1`}
      >
        <span
          className={`${isEmerald ? "text-emerald-600" : "text-amber-600"
            } h-6 w-6 lg:h-8 lg:w-8 flex items-center justify-center`}
        >
          {icon}
        </span>
      </div>
      <div className="space-y-2 lg:space-y-3 w-full">
        <h3 className="font-semibold lg:text-xl text-gray-900">
          {item?.title}
        </h3>
        <div className="relative">
          <div
            ref={contentRef}
            className="overflow-hidden transition-all duration-400 ease-in-out"
            style={{
              maxHeight: isExpanded || !needsToggle ? contentRef.current?.scrollHeight || "none" : `${COLLAPSED_HEIGHT}px`,
            }}
          >
            <p className="text-gray-600 lg:text-lg leading-relaxed">
              {item?.content}
            </p>
          </div>

          {/* Gradient fade when collapsed */}
          {!isExpanded && needsToggle && (
            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        {needsToggle && (
          <button
            onClick={onToggle}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 cursor-pointer ${isEmerald
                ? "text-emerald-600 hover:text-emerald-700"
                : "text-amber-600 hover:text-amber-700"
              }`}
          >
            {isExpanded ? "Show Less" : "Read More"}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
