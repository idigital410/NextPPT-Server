import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User } from '@/types';
import { generateSalt, hashPassword, verifyPassword } from '@/utils/auth';

const dataFilePath = path.join(process.cwd(), 'data', 'teachers.json');

// 确保data目录存在
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取教师数据
const readTeachersData = (): User[] => {
  ensureDataDir();
  
  if (!fs.existsSync(dataFilePath)) {
    // 如果文件不存在，创建一个空数组
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
  
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

// 写入教师数据
const writeTeachersData = (teachers: User[]) => {
  ensureDataDir();
  fs.writeFileSync(dataFilePath, JSON.stringify(teachers, null, 2), 'utf8');
};

// GET 获取所有教师
export async function GET() {
  try {
    const teachers = readTeachersData();
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('获取教师数据失败:', error);
    return NextResponse.json({ error: '获取教师数据失败' }, { status: 500 });
  }
}

// POST 添加新教师
export async function POST(request: Request) {
  try {
    const newTeacher = await request.json();
    const teachers = readTeachersData();
    
    // 检查邮箱是否已存在
    if (teachers.some(t => t.email === newTeacher.email)) {
      return NextResponse.json({ error: '该邮箱已被使用' }, { status: 400 });
    }
    
    // 生成盐值并哈希密码
    const salt = generateSalt();
    const hashedPassword = hashPassword(newTeacher.password, salt);
    
    // 添加新教师
    const teacherWithId = {
      ...newTeacher,
      password: hashedPassword,
      salt: salt,
      id: Date.now().toString(),
      role: 'teacher'
    };
    
    teachers.push(teacherWithId);
    writeTeachersData(teachers);
    
    // 返回时移除敏感信息
    const { password, salt: returnedSalt, ...safeTeacher } = teacherWithId;
    
    return NextResponse.json(safeTeacher, { status: 201 });
  } catch (error) {
    console.error('添加教师失败:', error);
    return NextResponse.json({ error: '添加教师失败' }, { status: 500 });
  }
}

// DELETE 删除教师
// PUT 更新教师信息（包括更改密码）
export async function PUT(request: Request) {
  try {
    const { id, currentPassword, newPassword, action } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: '缺少教师ID' }, { status: 400 });
    }
    
    const teachers = readTeachersData();
    const teacherIndex = teachers.findIndex(t => t.id === id);
    
    if (teacherIndex === -1) {
      return NextResponse.json({ error: '未找到该教师' }, { status: 404 });
    }
    
    // 处理密码更改
    if (action === 'changePassword') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: '当前密码和新密码不能为空' }, { status: 400 });
      }
      
      const teacher = teachers[teacherIndex];
      
      // 如果教师已经有盐值，验证当前密码
      if (teacher.salt) {
        if (!verifyPassword(currentPassword, teacher.password, teacher.salt)) {
          return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
        }
      } else {
        // 兼容旧密码（未加盐）
        if (currentPassword !== teacher.password) {
          return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
        }
      }
      
      // 生成新的盐值和哈希密码
      const salt = generateSalt();
      const hashedPassword = hashPassword(newPassword, salt);
      
      // 更新密码和盐值
      teachers[teacherIndex] = {
        ...teacher,
        password: hashedPassword,
        salt: salt
      };
      
      writeTeachersData(teachers);
      
      return NextResponse.json({ success: true, message: '密码更改成功' });
    }
    
    return NextResponse.json({ error: '不支持的操作' }, { status: 400 });
  } catch (error) {
    console.error('更新教师信息失败:', error);
    return NextResponse.json({ error: '更新教师信息失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少教师ID' }, { status: 400 });
    }
    
    let teachers = readTeachersData();
    const initialLength = teachers.length;
    
    teachers = teachers.filter(t => t.id !== id);
    
    if (teachers.length === initialLength) {
      return NextResponse.json({ error: '未找到该教师' }, { status: 404 });
    }
    
    writeTeachersData(teachers);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除教师失败:', error);
    return NextResponse.json({ error: '删除教师失败' }, { status: 500 });
  }
}