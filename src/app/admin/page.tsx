'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, Material, Category } from '@/types';
import { verifyPassword } from '@/utils/auth';
import ChangePasswordForm from '@/components/ChangePasswordForm';

// 模拟管理员账户
const ADMIN_USER = {
  id: 'admin1',
  name: '系统管理员',
  email: 'admin',
  password: 'admin123',
  salt: '',  // 初始无盐值
  role: 'admin'
};

export default function AdminPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teachers' | 'materials' | 'categories'>('teachers');
  const [showChangePassword, setShowChangePassword] = useState(false);

  // 添加fetchMaterials函数
  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) throw new Error('获取课件数据失败');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('获取课件数据失败:', error);
      alert('获取课件数据失败，请重试');
    }
  };

  // 添加fetchCategories函数
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('获取分类数据失败');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('获取分类数据失败:', error);
      alert('获取分类数据失败，请重试');
    }
  };
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    password: ''
  });
  
  // 新科目表单状态
  const [newCategory, setNewCategory] = useState({
    name: ''
  });
  
  // 编辑科目状态
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // 管理员登录表单状态
  const [adminLogin, setAdminLogin] = useState({
    email: '',
    password: ''
  });
  
  const [loginError, setLoginError] = useState('');
  
  // 获取教师数据
  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      if (!response.ok) {
        throw new Error('获取教师数据失败');
      }
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('获取教师数据失败:', error);
      alert('获取教师数据失败，请重试');
    }
  };
  
  const MaterialsTab = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
  
    // 获取分类数据
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('获取分类数据失败');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('获取分类数据失败:', error);
      }
    };
  
    // 获取课件数据
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/materials');
        if (!response.ok) throw new Error('获取课件数据失败');
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error('获取课件数据失败:', error);
        alert('获取课件数据失败，请重试');
      }
    };
  
    useEffect(() => {
      fetchMaterials();
      fetchCategories();
    }, []);
  
    // 根据分类筛选课件
    const filteredMaterials = selectedCategory 
      ? materials.filter(m => m.category === selectedCategory)
      : materials;
  
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">课件管理</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">按分类筛选</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map(material => (
              <div key={material.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{material.title}</h3>
                <p className="text-sm text-gray-600">{material.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {material.category}
                  </span>
                  <button 
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="text-red-500 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const CategoriesTab = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editName, setEditName] = useState('');
  
    // 获取科目数据
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('获取科目数据失败');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('获取科目数据失败:', error);
        alert('获取科目数据失败，请重试');
      }
    };
  
    useEffect(() => {
      fetchCategories();
    }, []);
  
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
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        alert('科目添加成功');
      } catch (error) {
        console.error('添加科目失败:', error);
        alert(error instanceof Error ? error.message : '添加科目失败，请重试');
      }
    };
  
    // --- 添加 handleDeleteCategory 函数 ---
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
  
    // --- 添加 cancelEditing 函数 ---
    const cancelEditing = () => {
      setEditingCategory(null);
      setEditName('');
    };
  
    // --- 添加 handleUpdateCategory 函数 (如果需要保存编辑) ---
    const handleUpdateCategory = async () => {
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
  
  
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">科目管理</h2>
  
          {/* 添加科目表单 */}
          <form onSubmit={handleAddCategory} className="mb-6">
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">新科目名称</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="输入科目名称"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                添加
              </button>
            </div>
          </form>
  
          {/* 科目列表 */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">科目名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategory?.id === category.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingCategory?.id === category.id ? (
                        <>
                          <button
                            onClick={handleUpdateCategory} // 使用 handleUpdateCategory
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            保存
                          </button>
                          <button
                            onClick={cancelEditing} // 使用 cancelEditing
                            className="text-gray-600 hover:text-gray-900"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setEditName(category.name);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)} // 使用 handleDeleteCategory
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  useEffect(() => {
    // 检查是否已登录为管理员
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin.role === 'admin') {
          setIsAdmin(true);
          // 获取数据
          fetchTeachers();
          fetchMaterials();
          fetchCategories(); // Now calls the function defined in AdminPage scope
        }
      } catch (error) {
        console.error('解析管理员数据失败', error);
      }
    }
    setIsLoading(false);
  }, []);
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      // 调用管理员登录API
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminLogin.email,
          password: adminLogin.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }
      
      // 登录成功
      localStorage.setItem('adminUser', JSON.stringify(data));
      setIsAdmin(true);
      // 登录成功后获取教师数据
      fetchTeachers();
      fetchMaterials();
      fetchCategories();
    } catch (error) {
      console.error('登录失败', error);
      setLoginError('登录过程中发生错误');
    }
  };
  
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('adminUser');
      setIsAdmin(false);
    }
  };
  
  const handlePasswordSuccess = () => {
    setShowChangePassword(false);
    alert('密码已成功更改，下次登录时请使用新密码');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminLogin(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeacher.name || !newTeacher.password) {
      alert('请填写所有字段');
      return;
    }
    
    // 密码强度验证
    if (newTeacher.password.length < 8) {
      alert('密码长度至少需要8个字符');
      return;
    }
    
    try {
      // 自动生成邮箱，使用姓名拼音或随机字符串
      const teacherWithEmail = {
        ...newTeacher,
        email: `${newTeacher.name}_${Math.floor(Math.random() * 10000)}@example.com`
      };
      
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherWithEmail),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '添加教师失败');
      }
      
      const newTeacherData = await response.json();
      
      // 更新本地状态
      setTeachers([...teachers, newTeacherData]);
      
      // 重置表单
      setNewTeacher({
        name: '',
        email: '',
        password: ''
      });
      
      alert('教师账户创建成功');
    } catch (error) {
      console.error('添加教师失败:', error);
      alert(error instanceof Error ? error.message : '添加教师失败，请重试');
    }
  };
  
  const handleDeleteTeacher = async (id: string) => {
    try {
      const response = await fetch(`/api/teachers?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除教师失败');
      }
      
      // 更新本地状态
      setTeachers(teachers.filter(t => t.id !== id));
      
      alert('教师账户删除成功');
    } catch (error) {
      console.error('删除教师失败:', error);
      alert(error instanceof Error ? error.message : '删除教师失败，请重试');
    }
  };
  
  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('确定要删除这个课件吗？')) {
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
      
      // 更新本地状态
      setMaterials(materials.filter(m => m.id !== id));
      
      alert('课件删除成功');
    } catch (error) {
      console.error('删除课件失败:', error);
      alert(error instanceof Error ? error.message : '删除课件失败，请重试');
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
    return (
      <main className="min-h-screen">
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">管理员登录</h1>
          
          <form onSubmit={handleAdminLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" noValidate>
            {loginError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{loginError}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                邮箱
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="text"
                name="email"
                placeholder="admin"
                value={adminLogin.email}
                onChange={handleAdminInputChange}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                密码
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                name="password"
                placeholder="********"
                value={adminLogin.password}
                onChange={handleAdminInputChange}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
              >
                登录
              </button>
            </div>
          </form>
          

        </div>
        
        <Footer />
      </main>
    );
  }
  
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">管理员面板</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
            >
              更改密码
            </button>
            <button 
              onClick={handleLogout}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              退出登录
            </button>
          </div>
        </div>
        
        <div className="flex mb-8 border-b">
          <button 
            className={`px-4 py-2 ${activeTab === 'teachers' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            教师管理
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'materials' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            课件管理
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'categories' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            科目管理
          </button>
        </div>
        
        {showChangePassword && isAdmin && (
          <div className="mb-8">
            <ChangePasswordForm 
              userId={ADMIN_USER.id} 
              userRole="admin" 
              onSuccess={handlePasswordSuccess} 
              onCancel={() => setShowChangePassword(false)} 
            />
          </div>
        )}

        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'materials' && <MaterialsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
      </div>
      <Footer />
    </main>
  );
}

const TeachersTab = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    password: ''
  });
  
  // 移除不再需要的科目相关状态
  // const [categories, setCategories] = useState<Category[]>([]); 
  // const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  // const [editName, setEditName] = useState('');

  // 在组件内部定义 fetchTeachers 函数
  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      if (!response.ok) throw new Error('获取教师数据失败');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('获取教师数据失败:', error);
    }
  };
  
  // 移除不再需要的 fetchCategories 函数
  // const fetchCategories = async () => { ... };
  
  // 在useEffect中获取教师数据
  useEffect(() => {
    fetchTeachers();
    // fetchCategories(); // 移除分类数据获取
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeacher.name || !newTeacher.password) {
      alert('请填写所有字段');
      return;
    }
    
    // 密码强度验证
    if (newTeacher.password.length < 8) {
      alert('密码长度至少需要8个字符');
      return;
    }
    
    try {
      // 自动生成邮箱，使用姓名拼音或随机字符串
      const teacherWithEmail = {
        ...newTeacher,
        email: `${newTeacher.name}_${Math.floor(Math.random() * 10000)}@example.com`
      };
      
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherWithEmail),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // 使用 errorData.error 来显示后端返回的具体错误信息
        throw new Error(errorData.error || '添加教师失败'); 
      }
      
      const newTeacherData = await response.json();
      setTeachers([...teachers, newTeacherData]);
      setNewTeacher({ name: '', password: '' });
      alert('教师账户创建成功');
    } catch (error) {
      console.error('添加教师失败:', error);
      // 显示更具体的错误信息给用户
      alert(error instanceof Error ? error.message : '添加教师失败，请重试'); 
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    // 添加确认提示
    if (!confirm('确定要删除这个教师账户吗？')) {
      return;
    }
    try {
      const response = await fetch(`/api/teachers?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除教师失败');
      }
      
      setTeachers(teachers.filter(t => t.id !== id));
      alert('教师账户删除成功');
    } catch (error) {
      console.error('删除教师失败:', error);
      alert(error instanceof Error ? error.message : '删除教师失败，请重试');
    }
  };

  // 移除不再需要的科目编辑相关函数
  // const startEditing = (category: Category) => { ... };
  // const cancelEditing = () => { ... };
  // const handleUpdateCategory = async (e: React.FormEvent) => { ... };
  // const handleDeleteCategory = async (id: string) => { ... }; // 这个逻辑应该在 CategoriesTab 或独立的 categories page

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">教师管理</h2>
        
        {/* 添加教师表单 (保持不变) */}
        <form onSubmit={handleAddTeacher} className="mb-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名（中文）</label>
              <input
                type="text"
                name="name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                name="password"
                value={newTeacher.password}
                onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            添加教师
          </button>
        </form>

        {/* 教师列表 */}
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* 修改表头 */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* 修改为遍历 teachers 状态 */}
              {teachers.map(teacher => ( 
                <tr key={teacher.id}>
                  {/* 显示教师姓名 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     {/* 移除编辑逻辑，只保留删除按钮 */}
                     <button
                        // 调用正确的删除函数
                        onClick={() => handleDeleteTeacher(teacher.id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};