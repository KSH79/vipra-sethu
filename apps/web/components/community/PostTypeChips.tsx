"use client";

import { PostType } from '@/lib/posts'

interface PostTypeChipsProps {
  types: { value: PostType | 'all'; label: string }[];
  selected: PostType | 'all';
  onChange: (type: PostType | 'all') => void;
}

export default function PostTypeChips({ types, selected, onChange }: PostTypeChipsProps) {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {types.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={`
            px-6 py-2 rounded-full font-medium transition-all
            ${
              selected === type.value
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
            }
          `}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}
