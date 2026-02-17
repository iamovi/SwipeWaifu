import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { SFW_CATEGORIES, NSFW_CATEGORIES } from '@/hooks/useWaifu';

interface CategoryPickerProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isNsfw: boolean;
}

export const CategoryPicker = ({ selectedCategory, onCategoryChange, isNsfw }: CategoryPickerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const categories = isNsfw ? NSFW_CATEGORIES : SFW_CATEGORIES;

  return (
    <div className="border-b border-border">
      {/* Header - Clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Category</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{selectedCategory}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Expandable Category Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setIsExpanded(false);
                    }}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      selectedCategory === category
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border hover:border-foreground/50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
