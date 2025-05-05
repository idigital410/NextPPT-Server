import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Category } from '@/types'; // 确保引入 Category 类型

// 修改文件路径指向 categories.json
const dataFilePath = path.join(process.cwd(), 'data', 'categories.json');

// 确保data目录存在 (保持不变)
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取科目数据 (修改函数名和类型)
const readCategoriesData = (): Category[] => {
  ensureDataDir();

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }

  const data = fs.readFileSync(dataFilePath, 'utf8');
  // 添加错误处理，防止JSON解析失败
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('解析 categories.json 失败:', error);
    // 返回空数组或抛出错误，取决于你的错误处理策略
    return [];
  }
};

// 写入科目数据 (修改函数名和类型)
const writeCategoriesData = (categories: Category[]) => {
  ensureDataDir();
  fs.writeFileSync(dataFilePath, JSON.stringify(categories, null, 2), 'utf8');
};

// GET 获取所有科目 (保持不变, 但建议检查类型)
export async function GET() {
  try {
    const categories = readCategoriesData();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取科目数据失败:', error);
    return NextResponse.json({ error: '获取科目数据失败' }, { status: 500 });
  }
}

// POST 添加新科目 (保持不变, 但建议检查类型)
export async function POST(request: Request) {
  try {
    const newCategoryData = await request.json();

    // 验证输入
    if (!newCategoryData.name || typeof newCategoryData.name !== 'string' || newCategoryData.name.trim() === '') {
      return NextResponse.json({ error: '科目名称无效' }, { status: 400 });
    }

    const categories = readCategoriesData();

    // 检查科目名称是否已存在 (可选，根据需求)
    if (categories.some(c => c.name.toLowerCase() === newCategoryData.name.trim().toLowerCase())) {
      return NextResponse.json({ error: '该科目名称已存在' }, { status: 400 });
    }

    const newCategory: Category = {
      id: Date.now().toString(), // 使用时间戳作为简单ID
      name: newCategoryData.name.trim(),
    };

    categories.push(newCategory);
    writeCategoriesData(categories);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('添加科目失败:', error);
    return NextResponse.json({ error: '添加科目失败' }, { status: 500 });
  }
}

// PUT 更新科目 (添加或修正此方法)
export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();

    // 验证输入
    if (!id || !name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: '缺少科目ID或名称无效' }, { status: 400 });
    }

    let categories = readCategoriesData();
    const categoryIndex = categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return NextResponse.json({ error: '未找到该科目' }, { status: 404 });
    }

    // 检查更新后的名称是否与其他科目冲突 (可选)
    const trimmedName = name.trim();
    if (categories.some(c => c.id !== id && c.name.toLowerCase() === trimmedName.toLowerCase())) {
       return NextResponse.json({ error: '更新后的科目名称已存在' }, { status: 400 });
    }


    // 更新科目信息
    categories[categoryIndex] = { ...categories[categoryIndex], name: trimmedName };

    writeCategoriesData(categories);

    return NextResponse.json(categories[categoryIndex]); // 返回更新后的科目
  } catch (error) {
    console.error('更新科目失败:', error);
    return NextResponse.json({ error: '更新科目失败' }, { status: 500 });
  }
}


// DELETE 删除科目 (修正此方法)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少科目ID' }, { status: 400 });
    }

    let categories = readCategoriesData(); // 修正: 读取科目数据
    const initialLength = categories.length;

    categories = categories.filter(c => c.id !== id);

    if (categories.length === initialLength) {
      return NextResponse.json({ error: '未找到该科目' }, { status: 404 });
    }

    writeCategoriesData(categories); // 修正: 写入科目数据
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除科目失败:', error);
    return NextResponse.json({ error: '删除科目失败' }, { status: 500 });
  }
}