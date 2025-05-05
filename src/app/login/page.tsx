'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TeacherLoginForm } from '@/types';
import { verifyPassword } from '@/utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TeacherLoginForm>({
    name: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 获取教师数据
      const response = await fetch('/api/teachers');
      if (!response.ok) {
        throw new Error('获取教师数据失败');
      }
      
      const teachers = await response.json();
      
      // 验证用户
      const teacher = teachers.find((t: any) => t.name === formData.name);
      
      // 验证密码
      let isPasswordValid = false;
      if (teacher) {
        if (teacher.salt) {
          // 使用MD5加盐验证
          isPasswordValid = verifyPassword(formData.password, teacher.password, teacher.salt);
        } else {
          // 兼容旧密码（未加盐）
          isPasswordValid = teacher.password === formData.password;
        }
      }
      
      if (teacher && isPasswordValid) {
        // 实际应用中应设置会话/令牌
        localStorage.setItem('teacherUser', JSON.stringify(teacher));
        router.push('/teacher');
      } else {
        // 登录失败
        setError('姓名或密码不正确');
      }
    } catch (err) {
      setError('登录过程中发生错误，请重试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              教师登录
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              请输入您的教师账号和密码
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">教师姓名</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="教师姓名"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">密码</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="密码"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}