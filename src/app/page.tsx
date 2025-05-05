'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MaterialCard from '@/components/MaterialCard';
import CategoryFilter from '@/components/CategoryFilter';
import Footer from '@/components/Footer';
import { Material, Category } from '@/types';

// 模拟数据，实际应用中应从API获取
const MOCK_MATERIALS: Material[] = [
  {
    id: '1',
    title: '高等数学第一章',
    description: '函数与极限',
    category: '数学',
    fileUrl: '/materials/math-ch1.pdf',
    fileSize: 2500000,
    uploadDate: '2023-10-15',
    uploadedBy: '张教授'
  },
  // 更多课件...
];

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: '数学' },
  { id: '2', name: '物理' },
  { id: '3', name: '化学' },
  { id: '4', name: '生物' },
  { id: '5', name: '计算机科学' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 获取课件数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取分类数据
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('获取分类数据失败');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // 获取课件数据
        const materialsResponse = await fetch('/api/materials');
        if (!materialsResponse.ok) {
          throw new Error('获取课件数据失败');
        }
        const materialsData = await materialsResponse.json();
        setMaterials(materialsData);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 根据分类筛选课件
  const filteredMaterials = selectedCategory 
    ? materials.filter(m => m.category === selectedCategory)
    : materials;

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>加载中...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">课件资源中心</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
          
          <div className="w-full md:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
            
            {filteredMaterials.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">没有找到相关课件</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
