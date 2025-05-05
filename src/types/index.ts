export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // 哈希后的密码
  salt?: string; // 密码盐值
  role: 'student' | 'teacher' | 'admin'; // 添加admin角色
}

// 添加教师登录表单类型
export interface TeacherLoginForm {
  name: string;
  password: string;
}

// 添加密码更改表单类型
export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}