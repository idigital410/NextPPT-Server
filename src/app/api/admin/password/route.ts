import { NextRequest, NextResponse } from 'next/server';
import { generateSalt, hashPassword, verifyPassword } from '@/utils/auth';
import fs from 'fs';
import path from 'path';

// 默认管理员账户，用于初始化
const DEFAULT_ADMIN = {
  id: 'admin1',
  name: '系统管理员',
  email: 'admin@example.com',
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

// 保存管理员数据
const saveAdminData = (data: any) => {
  try {
    // 确保目录存在
    const dir = path.dirname(adminFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(adminFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('保存管理员数据失败:', error);
    return false;
  }
};

export async function PUT(request: NextRequest) {
  try {
    const { id, currentPassword, newPassword, action } = await request.json();

    // 验证操作类型
    if (action !== 'changePassword') {
      return NextResponse.json({ error: '不支持的操作' }, { status: 400 });
    }

    // 获取管理员数据
    const adminData = getAdminData();

    // 验证当前密码
    let isPasswordValid = false;
    
    // 如果管理员账户已经有盐值，使用MD5验证
    if (adminData.salt) {
      isPasswordValid = verifyPassword(currentPassword, adminData.password, adminData.salt);
    } else {
      // 兼容旧密码（未加盐）
      isPasswordValid = currentPassword === adminData.password;
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
    }

    // 生成新的盐值和哈希密码
    const salt = generateSalt();
    const hashedPassword = hashPassword(newPassword, salt);

    // 更新管理员密码
    adminData.password = hashedPassword;
    adminData.salt = salt;
    
    // 保存更新后的管理员数据
    const saved = saveAdminData(adminData);
    if (!saved) {
      return NextResponse.json({ error: '保存管理员数据失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '密码更改成功' });
  } catch (error) {
    console.error('更改管理员密码失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更改密码失败，请重试' },
      { status: 500 }
    );
  }
}