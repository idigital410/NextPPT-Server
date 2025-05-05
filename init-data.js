/**
 * 数据初始化脚本
 * 用于重置项目数据到初始状态
 * 运行方法: node init-data.js
 */

const fs = require('fs');
const path = require('path');

console.log('开始初始化NextPPT-Server数据...');

// 确保目录存在
const dataDir = path.join(__dirname, 'data');
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');

// 创建所有必要的目录
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`创建目录成功: ${dir}`);
  }
}

ensureDirectoryExists(dataDir);
ensureDirectoryExists(publicDir);
ensureDirectoryExists(uploadsDir);

// 初始化数据
const initData = {
  admin: {
    id: "admin1",
    name: "系统管理员",
    email: "admin",
    password: "3511372c2ce76597f22f2f6ddeaedc1e",
    salt: "8cf5e45df7464386ab3aaa988c2f7a52",
    role: "admin"
  },
  categories: [
    { id: "2", name: "语文" },
    { id: "3", name: "数学" },
    { id: "4", name: "英语" },
    { id: "5", name: "政治" },
    { id: "1746103523031", name: "历史" },
    { id: "1746103739296", name: "地理" },
    { id: "1746106144699", name: "生物" },
    { id: "1746106151621", name: "物理" },
    { id: "1746106154703", name: "化学" },
    { id: "1746106156982", name: "其他" }
  ],
  materials: [],
  teachers: []
};

// 写入数据文件
function writeDataFile(filename, data) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ 已创建 ${filename}`);
}

// 清空上传目录
function clearUploads() {
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    }
    console.log('✅ 已清空上传文件夹');
  }
}

// 执行初始化
function initializeData() {
  console.log('🚀 开始初始化数据...');
  
  // 写入数据文件
  writeDataFile('admin.json', initData.admin);
  writeDataFile('categories.json', initData.categories);
  writeDataFile('materials.json', initData.materials);
  writeDataFile('teachers.json', initData.teachers);
  
  // 清空上传目录
  clearUploads();
  
  console.log('✨ 数据初始化完成！');
  console.log('📝 默认管理员账户: admin');
}

// 运行初始化
initializeData();