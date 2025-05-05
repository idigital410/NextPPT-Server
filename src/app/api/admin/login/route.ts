import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/utils/auth';
import fs from 'fs';
import path from 'path';

// 默认管理员账户，用于初始化
const DEFAULT_ADMIN = {
  id: 'admin1',
  name: '系统管理员',
  email: 'admin',
  password: 'admin123',
  salt: '',  // 初始无盐值
  role: 'admin'
};

// 管理员数据文件路径
const adminFilePath = path.join(process.cwd(), 'data', 'admin.json');

// 读取管理员数据
const getAdminData = () => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(adminFilePath)) {
      // 创建默认管理员数据文件
      fs.writeFileSync(adminFilePath, JSON.stringify(DEFAULT_ADMIN, null, 2));
      return DEFAULT_ADMIN;
    }
    
    const data = fs.readFileSync(adminFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取管理员数据失败:', error);
    return DEFAULT_ADMIN;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 获取管理员数据
    const adminData = getAdminData();

    // 验证邮箱
    if (email !== adminData.email) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 400 });
    }

    // 验证密码
    let isPasswordValid = false;
    
    // 如果管理员账户已经有盐值，使用MD5验证
    if (adminData.salt) {
      isPasswordValid = verifyPassword(password, adminData.password, adminData.salt);
    } else {
      // 兼容旧密码（未加盐）
      isPasswordValid = password === adminData.password;
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 400 });
    }

    // 返回管理员信息（不包含密码和盐值）
    const { password: _, salt: __, ...adminInfo } = adminData;
    
    return NextResponse.json({
      ...adminInfo,
      role: 'admin'
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '登录失败，请重试' },
      { status: 500 }
    );
  }
}