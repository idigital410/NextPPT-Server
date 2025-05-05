import { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">学科分类</h2>
      
      <div className="space-y-2">
        <button
          className={`w-full text-left px-3 py-2 rounded ${
            selectedCategory === '' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
          }`}
          onClick={() => onSelectCategory('')}
        >
          全部
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            className={`w-full text-left px-3 py-2 rounded ${
              selectedCategory === category.name ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'
            }`}
            onClick={() => onSelectCategory(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}