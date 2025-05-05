'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TeacherUpload from '@/components/TeacherUpload';
import { Material, User, Category } from '@/types';
import ChangePasswordForm from '@/components/ChangePasswordForm';

export default function TeacherPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // 编辑课件状态
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  
  useEffect(() => {
    // 检查用户是否已登录
    const teacherData = localStorage.getItem('teacherUser');
    
    if (teacherData) {
      try {
        const teacher = JSON.parse(teacherData);
        setCurrentTeacher(teacher);
        
        // 获取该教师的课件
        fetchTeacherMaterials(teacher.id);
        
        // 获取分类数据
        fetchCategories();
      } catch (error) {
        console.error('解析教师数据失败', error);
        router.push('/login');
      }
    } else {
      // 未登录，重定向到登录页
      router.push('/login');
    }
  }, [router]);
  
  const fetchTeacherMaterials = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/materials?teacherId=${teacherId}`);
      if (!response.ok) {
        throw new Error('获取课件失败');
      }
      
      const data = await response.json();
      setMaterials(data);
      setIsLoading(false);
    } catch (error) {
      console.error('获取课件失败:', error);
      setIsLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('获取分类失败');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };
  
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('teacherUser');
      router.push('/login');
    }
  };
  
  const handleUploadSuccess = (newMaterial: Material) => {
    setMaterials([newMaterial, ...materials]);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个课件吗？')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/materials?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除失败');
      }
      
      // 更新本地状态
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error) {
      console.error('删除课件失败:', error);
      alert(error instanceof Error ? error.message : '删除课件失败，请重试');
    }
  };
  
  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setEditTitle(material.title);
    setEditDescription(material.description);
    setEditCategory(material.category);
  };
  
  const handleCancelEdit = () => {
    setEditingMaterial(null);
  };
  
  const handleSaveEdit = async () => {
    if (!editingMaterial) return;
    
    try {
      const response = await fetch('/api/materials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingMaterial.id,
          title: editTitle,
          description: editDescription,
          category: editCategory
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新失败');
      }
      
      const updatedMaterial = await response.json();
      
      // 更新本地状态
      setMaterials(materials.map(m => 
        m.id === updatedMaterial.id ? updatedMaterial : m
      ));
      
      // 关闭编辑模式
      setEditingMaterial(null);
    } catch (error) {
      console.error('更新课件失败:', error);
      alert(error instanceof Error ? error.message : '更新课件失败，请重试');
    }
  };

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

  if (!currentTeacher) {
    return null; // 防止在重定向前显示内容
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">教师管理平台</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">欢迎，{currentTeacher.name}</span>
            <button 
              onClick={handleLogout}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">上传新课件</h2>
          <TeacherUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">我的课件</h2>
          
          {materials.length === 0 ? (
            <div className="text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">没有课件</h3>
              <p className="mt-1 text-sm text-gray-500">开始上传您的第一个课件吧</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
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
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMaterial?.id === material.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{material.title}</div>
                        )}
                        
                        {editingMaterial?.id === material.id ? (
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded mt-1"
                            rows={2}
                          />
                        ) : (
                          <div className="text-sm text-gray-500">{material.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingMaterial?.id === material.id ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          >
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(material.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingMaterial?.id === material.id ? (
                          <div className="flex space-x-2">
                            <button 
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-900"
                            >
                              保存
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <a 
                              href={material.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              查看
                            </a>
                            <button 
                              onClick={() => handleEdit(material)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              编辑
                            </button>
                            <button 
                              onClick={() => handleDelete(material.id)}
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
      
      <Footer />
    </main>
  );
}