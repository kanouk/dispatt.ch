import React, { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlatformIcon, availableIcons } from '@/components/ui/platform-icon';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string, iconColor: string, iconLabel: string) => void;
  className?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  value = '',
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const cats = new Set(availableIcons.map(icon => icon.category));
    return ['all', ...Array.from(cats).sort()];
  }, []);

  const filteredIcons = useMemo(() => {
    return availableIcons.filter(icon => {
      const matchesSearch = icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           icon.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const selectedIcon = availableIcons.find(icon => icon.name === value);

  const handleIconSelect = (icon: typeof availableIcons[0]) => {
    onChange(icon.name, icon.defaultColor, icon.label);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Focus search input when popover opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>アイコン</Label>
      <Popover open={isOpen} onOpenChange={handleOpenChange} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-auto p-3"
          >
            <div className="flex items-center gap-2">
              <PlatformIcon 
                iconName={value || 'FaGlobe'} 
                size={20}
                color={selectedIcon?.defaultColor || '#6B7280'}
              />
              <span className="text-sm">
                {selectedIcon?.label || 'アイコンを選択してください'}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="アイコンを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {categories.slice(1).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Icon Grid */}
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((icon) => (
                  <Button
                    key={icon.name}
                    variant={value === icon.name ? "secondary" : "ghost"}
                    className="h-12 w-12 p-2 flex flex-col items-center justify-center"
                    onClick={() => handleIconSelect(icon)}
                    title={icon.label}
                  >
                    <PlatformIcon 
                      iconName={icon.name}
                      size={20}
                      color={icon.defaultColor}
                    />
                  </Button>
                ))}
              </div>
              
              {filteredIcons.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  アイコンが見つかりませんでした
                </div>
              )}
            </div>

            {/* Current Selection */}
            {selectedIcon && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>選択中:</span>
                  <PlatformIcon 
                    iconName={selectedIcon.name}
                    size={16}
                    color={selectedIcon.defaultColor}
                  />
                  <span>{selectedIcon.label}</span>
                  <span className="text-xs">({selectedIcon.name})</span>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};