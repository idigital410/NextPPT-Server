'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 新科目表单状态
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // 编辑科目状态
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  
  useEffect(() => {
    // 检查是否已登录为管理员
    const adminData = localStorage.getItem('adminUser');
    
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin.role === 'admin') {
          setIsAdmin(true);
          // 获取科目数据
          fetchCategories();
        } else {
          router.push('/admin');
        }
      } catch (error) {
        console.error('解析管理员数据失败', error);
        router.push('/admin');
      }
    } else {
      router.push('/admin');
    }
    
    setIsLoading(false);
  }, [router]);
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('获取科目数据失败');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('获取科目数据失败:', error);
      alert('获取科目数据失败，请重试');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    setIsAdmin(false);
    router.push('/admin');
  };
  
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      alert('科目名称不能为空');
      return;
    }
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '添加科目失败');
      }
      
      const newCategory = await response.json();
      
      // 更新本地状态
      setCategories([...categories, newCategory]);
      
      // 重置表单
      setNewCategoryName('');
      
      alert('科目添加成功');
    } catch (error) {
      console.error('添加科目失败:', error);
      alert(error instanceof Error ? error.message : '添加科目失败，请重试');
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个科目吗？这可能会影响已关联的课件。')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除科目失败');
      }
      
      // 更新本地状态
      setCategories(categories.filter(c => c.id !== id));
      
      alert('科目删除成功');
    } catch (error) {
      console.error('删除科目失败:', error);
      alert(error instanceof Error ? error.message : '删除科目失败，请重试');
    }
  };
  
  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };
  
  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
  };
  
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory) return;
    
    if (!editName.trim()) {
      alert('科目名称不能为空');
      return;
    }
    
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingCategory.id, name: editName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新科目失败');
      }
      
      const updatedCategory = await response.json();
      
      // 更新本地状态
      setCategories(categories.map(c => 
        c.id === updatedCategory.id ? updatedCategory : c
      ));
      
      // 重置编辑状态
      cancelEditing();
      
      alert('科目更新成功');
    } catch (error) {
      console.error('更新科目失败:', error);
      alert(error instanceof Error ? error.message : '更新科目失败，请重试');
    }
  };
  
  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <p>加载中...</p>
        </div>
        <Footer />
      </main>
    );
  }
  
  if (!isAdmin) {
    return null; // 防止在重定向前显示内容
  }
  
  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">科目管理</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/admin')}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              返回管理面板
            </button>
            <button 
              onClick={handleLogout}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              退出登录
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 添加新科目 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">添加新科目</h2>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  科目名称
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例如：数学、物理、化学..."
                  required
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  添加科目
                </button>
              </div>
            </form>
          </div>
          
          {/* 科目列表 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">科目列表</h2>
            
            {categories.length === 0 ? (
              <p className="text-gray-500">暂无科目数据</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingCategory?.id === category.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingCategory?.id === category.id ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={handleUpdateCategory}
                                className="text-green-600 hover:text-green-900"
                              >
                                保存
                              </button>
                              <button 
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => startEditing(category)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                编辑
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                删除
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}