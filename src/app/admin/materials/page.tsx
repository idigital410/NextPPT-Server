'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Material, Category } from '@/types';
import { formatFileSize } from '@/lib/utils';

export default function AdminMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 编辑课件状态
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // 合并的 useEffect 用于管理员检查和初始数据加载
  useEffect(() => {
    const initializeAdminPage = async () => {
      setIsLoading(true);
      setInitialLoadError(null);
      const adminData = localStorage.getItem('adminUser');

      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          if (admin.role === 'admin') {
            setIsAdmin(true);
            // 获取分类数据
            await fetchCategories();
            // 获取课件数据 (优先 API, 失败则尝试 localStorage)
            try {
              await fetchMaterials();
              console.log('成功从 API 加载课件数据');
            } catch (apiError) {
              console.warn('从 API 加载课件失败:', apiError);
              // 尝试从 localStorage 加载
              const savedMaterials = localStorage.getItem('materials');
              if (savedMaterials) {
                try {
                  setMaterials(JSON.parse(savedMaterials));
                  console.log('成功从 localStorage 加载课件数据');
                  setInitialLoadError('无法从服务器加载最新数据，显示的是本地缓存。');
                } catch (parseError) {
                  console.error('解析本地存储的课件数据失败', parseError);
                  setInitialLoadError('加载课件数据失败，也无法读取本地缓存。');
                }
              } else {
                 setInitialLoadError('加载课件数据失败，且本地无缓存。');
              }
            }
          } else {
            router.push('/admin'); // 非管理员，跳转
          }
        } catch (error) {
          console.error('解析管理员数据失败', error);
          router.push('/admin'); // 解析失败，跳转
        }
      } else {
        router.push('/admin'); // 未登录，跳转
      }
      setIsLoading(false);
    };

    initializeAdminPage();
  }, [router]); // 依赖 router

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`获取科目数据失败: ${response.statusText}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('获取科目数据失败:', error);
      alert('获取科目数据失败，请重试');
      // 可以选择抛出错误，让上层知道获取失败
      // throw error;
    }
  };

  const fetchMaterials = async (category: string = selectedCategory) => {
    try {
      const url = category
        ? `/api/materials?category=${encodeURIComponent(category)}`
        : '/api/materials';
    
      const response = await fetch(url);
      if (!response.ok) throw new Error(`获取失败: ${response.statusText}`);
    
      const data = await response.json();
      setMaterials(data);
      // 清除错误状态
      setInitialLoadError(null);
    } catch (error) {
      console.error('获取课件失败:', error);
      setInitialLoadError('获取课件数据失败，请重试');
      // 尝试从本地缓存加载
      const savedMaterials = localStorage.getItem('materials');
      if (savedMaterials) {
        setMaterials(JSON.parse(savedMaterials));
      }
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true); // 开始加载
    try {
      await fetchMaterials(category); // 传入新的分类进行筛选
    } catch (error) {
      console.error(`筛选分类 "${category}" 时获取课件失败:`, error);
      alert(`加载分类 "${category}" 的课件失败，请稍后重试。`);
      // 即使失败，也可能需要显示空列表或之前的列表，取决于产品需求
      // setMaterials([]); // 或者不清空，显示旧数据
    } finally {
      setIsLoading(false); // 结束加载
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    // 可能也需要清除其他本地缓存，例如课件缓存
    // localStorage.removeItem('materials');
    setIsAdmin(false);
    router.push('/admin');
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('确定要删除这个课件吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch(`/api/materials?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除课件失败');
      }

      // API 删除成功，更新本地状态
      const updatedMaterials = materials.filter(m => m.id !== id);
      setMaterials(updatedMaterials);
      // 同步更新 localStorage
      localStorage.setItem('materials', JSON.stringify(updatedMaterials));

      alert('课件删除成功');
    } catch (error) {
      console.error('删除课件失败:', error);
      alert(error instanceof Error ? error.message : '删除课件失败，请重试');
    }
  };

  const startEditing = (material: Material) => {
    setEditingMaterial(material);
    setEditTitle(material.title);
    setEditDescription(material.description);
    setEditCategory(material.category);
  };

  const cancelEditing = () => {
    setEditingMaterial(null);
    setEditTitle('');
    setEditDescription('');
    setEditCategory('');
  };

  // 修改 handleUpdateMaterial 函数
  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMaterial) return;

    if (!editTitle.trim() || !editCategory) {
      alert('标题和分类不能为空');
      return;
    }

    const updatedMaterial = {
      ...editingMaterial,
      title: editTitle,
      description: editDescription,
      category: editCategory
    };

    // 直接更新本地状态
    const updatedMaterials = materials.map(m => 
      m.id === updatedMaterial.id ? updatedMaterial : m
    );
    setMaterials(updatedMaterials);
    localStorage.setItem('materials', JSON.stringify(updatedMaterials));

    // 仍然尝试调用API但不阻塞UI
    try {
      await fetch('/api/materials', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedMaterial)
      });
    } catch (error) {
      console.error('API更新失败:', error);
    }

    cancelEditing();
    alert('课件已更新(本地)');
  };

  if (isLoading && !initialLoadError) { // 只有在真正加载且没有初始错误时显示加载中
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <p>加载中...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!isAdmin) {
    // 如果 isAdmin 为 false，useEffect 应该已经处理了重定向
    // 这里返回 null 防止在重定向前短暂渲染页面内容
    return null;
  }

  // 管理员已登录，显示页面内容
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-8">
        {initialLoadError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">加载提示</p>
            <p>{initialLoadError}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">课件管理</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              返回管理面板
            </button>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" // 退出按钮样式调整
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 筛选区域 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {/* ... existing filter code ... */}
          <h2 className="text-xl font-semibold mb-4">筛选课件</h2>

          <div className="flex items-center space-x-4">
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                按科目筛选
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading} // 加载时禁用筛选
              >
                <option value="">全部科目</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange('')}
                className="mt-6 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                disabled={isLoading} // 加载时禁用清除
              >
                清除筛选
              </button>
            )}
             {isLoading && <p className="mt-6 text-sm text-gray-500">加载中...</p>}
          </div>
        </div>


        {/* 课件列表 */}
        <div className="bg-white rounded-lg shadow p-6">
           {/* ... existing table code ... */}
           <h2 className="text-xl font-semibold mb-4">课件列表</h2>

          {materials.length === 0 && !isLoading ? ( // 仅在非加载状态且无数据时显示提示
            <div className="text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">没有课件</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedCategory ? `没有找到属于 "${selectedCategory}" 分类的课件` : '系统中暂无课件'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题 / 描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      上传者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      上传日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件大小
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {materials.map(material => (
                    <tr key={material.id} className={`hover:bg-gray-50 ${editingMaterial?.id === material.id ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4 align-top"> {/* 使用 align-top 保证编辑时对齐 */}
                        {editingMaterial?.id === material.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded mb-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="课件标题"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{material.title}</div>
                        )}

                        {editingMaterial?.id === material.id ? (
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded mt-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows={2}
                            placeholder="课件描述 (可选)"
                          />
                        ) : (
                           <div className="text-sm text-gray-500 mt-1">{material.description || '-'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        {editingMaterial?.id === material.id ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {/* 添加一个默认空选项，防止意外选中 */}
                            <option value="" disabled>选择分类</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {material.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                        {material.uploadedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                        {new Date(material.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                        {formatFileSize(material.fileSize)} {/* 使用工具函数 */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-top">
                        {editingMaterial?.id === material.id ? (
                          <div className="flex flex-col space-y-1"> {/* 垂直排列按钮 */}
                            <button
                              onClick={handleUpdateMaterial}
                              className="text-green-600 hover:text-green-900 text-left" // 左对齐
                            >
                              保存
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-900 text-left" // 左对齐
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-1"> {/* 垂直排列按钮 */}
                            <a
                              href={material.fileUrl} // <--- 这里使用了 fileUrl
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              查看
                            </a>
                            <button
                              onClick={() => startEditing(material)}
                              className="text-indigo-600 hover:text-indigo-900 text-left" // 左对齐
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-600 hover:text-red-900 text-left" // 左对齐
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

      <Footer />
    </main>
  );
}