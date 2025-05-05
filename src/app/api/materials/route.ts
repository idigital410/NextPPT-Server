import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Material } from '@/types';
// 确保导入 Buffer (如果尚未导入)
import { Buffer } from 'buffer';

const dataFilePath = path.join(process.cwd(), 'data', 'materials.json');
// --- 新增：定义上传目录 ---
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// 确保data目录存在
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// --- 新增：确保上传目录存在 ---
const ensureUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};


// 读取课件数据
const readMaterialsData = (): Material[] => {
  ensureDataDir();
  
  if (!fs.existsSync(dataFilePath)) {
    // 如果文件不存在，创建一个默认课件列表
    const defaultMaterials = [
      {
        id: '1',
        title: '高等数学第一章',
        description: '函数与极限',
        category: '数学',
        fileUrl: '/materials/math-ch1.pdf',
        fileSize: 2500000,
        uploadDate: '2023-10-15',
        uploadedBy: '张教授'
      }
    ];
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultMaterials, null, 2), 'utf8');
    return defaultMaterials;
  }
  
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

// 写入课件数据
const writeMaterialsData = (materials: Material[]) => {
  ensureDataDir();
  fs.writeFileSync(dataFilePath, JSON.stringify(materials, null, 2), 'utf8');
};

// GET 获取所有课件
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const teacherId = searchParams.get('teacherId');
    
    let materials = readMaterialsData();
    
    // 按分类筛选
    if (category) {
      materials = materials.filter(m => m.category === category);
    }
    
    // 按教师ID筛选
    if (teacherId) {
      materials = materials.filter(m => m.uploadedBy === teacherId);
    }
    
    return NextResponse.json(materials);
  } catch (error) {
    console.error('获取课件数据失败:', error);
    return NextResponse.json({ error: '获取课件数据失败' }, { status: 500 });
  }
}

// POST 添加新课件
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const uploadedBy = formData.get('uploadedBy') as string;
    const file = formData.get('file') as File;
    
    if (!title || !category || !uploadedBy || !file) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    // --- 添加文件保存逻辑 ---
    ensureUploadDir(); // 确保上传目录存在
    const fileName = file.name; // 使用原始文件名 (注意：同名文件会被覆盖，生产环境建议生成唯一文件名)
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`; // URL 路径

    // 将 File 对象转换为 Buffer 并写入文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);
    console.log(`文件已保存到: ${filePath}`);
    // --- 文件保存逻辑结束 ---


    const materials = readMaterialsData();

    // 添加新课件
    const newMaterial: Material = {
      id: Date.now().toString(),
      title,
      description: description || '',
      category,
      fileUrl: fileUrl, // <-- 使用上面定义的 fileUrl
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      uploadedBy
    };

    materials.push(newMaterial);
    writeMaterialsData(materials);

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    console.error('添加课件失败:', error);
    // --- 改进错误处理：如果文件写入失败，也应返回错误 ---
    let errorMessage = '添加课件失败';
    if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE 删除课件
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少课件ID' }, { status: 400 });
    }
    
    let materials = readMaterialsData();
    const initialLength = materials.length;
    
    materials = materials.filter(m => m.id !== id);
    
    if (materials.length === initialLength) {
      return NextResponse.json({ error: '未找到该课件' }, { status: 404 });
    }
    
    writeMaterialsData(materials);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除课件失败:', error);
    return NextResponse.json({ error: '删除课件失败' }, { status: 500 });
  }
}

// PUT 更新课件 - 简化版本
export async function PUT(request: Request) {
  try {
    const { id, title, description, category } = await request.json();
    
    if (!id || !title || !category) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    let materials = readMaterialsData();
    const materialIndex = materials.findIndex(m => m.id === id);
    
    if (materialIndex === -1) {
      return NextResponse.json({ error: '未找到该课件' }, { status: 404 });
    }
    
    // 更新课件信息
    materials[materialIndex] = {
      ...materials[materialIndex],
      title,
      description: description || '',
      category
    };
    
    writeMaterialsData(materials);
    return NextResponse.json(materials[materialIndex]);
    
  } catch (error) {
    console.error('更新课件失败:', error);
    return NextResponse.json(
      { error: '更新课件失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}