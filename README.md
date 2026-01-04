# 五险一金计算器

一个基于 Next.js + Supabase 构建的五险一金计算器 Web 应用，用于根据员工工资数据和城市社保标准计算公司应缴纳的社保公积金费用。

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI/样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **Excel 处理**: xlsx

## 功能特性

- 📊 数据上传：支持 Excel 文件上传城市标准和员工工资数据
- 🧮 自动计算：根据预设规则自动计算社保公积金
- 📈 结果展示：清晰展示计算结果，包括统计汇总
- 📱 响应式设计：支持桌面端和移动端访问

## 项目结构

```
社保计算器/
├── app/
│   ├── api/
│   │   ├── calculate/
│   │   │   └── route.ts          # 核心计算 API
│   │   └── upload/
│   │       ├── cities/
│   │       │   └── route.ts      # 城市标准数据上传 API
│   │       └── salaries/
│   │           └── route.ts      # 员工工资数据上传 API
│   ├── page.tsx                  # 主页（导航卡片）
│   ├── upload/
│   │   └── page.tsx              # 数据上传页
│   ├── results/
│   │   └── page.tsx              # 结果展示页
│   ├── layout.tsx                # 根布局
│   └── globals.css               # 全局样式
├── lib/
│   └── supabase.ts               # Supabase 客户端配置
├── types/
│   └── index.ts                  # 类型定义
├── .env.local.example            # 环境变量示例
├── tailwind.config.ts            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 项目依赖
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建一个新项目
2. 在 SQL Editor 中执行以下 SQL 创建数据表：

```sql
-- 城市标准表
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate FLOAT NOT NULL
);

-- 员工工资表
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL
);

-- 计算结果表
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL
);
```

3. 在 Supabase 控制台获取项目的 URL 和 Anon Key
4. 复制 `.env.local.example` 为 `.env.local`，填入你的凭证：

```bash
cp .env.local.example .env.local
```

```env
SUPABASE_URL=你的_supabase_url
SUPABASE_ANON_KEY=你的_supabase_anon_key
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用说明

### 步骤 1: 准备数据文件

**城市标准数据文件 (cities.xlsx)**

| city_name | year | base_min | base_max | rate  |
|-----------|------|----------|----------|-------|
| 佛山      | 2024 | 1900     | 31851    | 0.15  |

**员工工资数据文件 (salaries.xlsx)**

| employee_id | employee_name | month  | salary_amount |
|-------------|---------------|--------|---------------|
| E001        | 张三          | 202401 | 5000          |
| E001        | 张三          | 202402 | 5200          |
| ...         | ...           | ...    | ...           |

### 步骤 2: 上传数据

1. 访问 **数据上传** 页面
2. 上传城市标准数据文件
3. 上传员工工资数据文件

### 步骤 3: 执行计算

点击 **执行计算并存储结果** 按钮，系统会：
1. 计算每位员工的年度月平均工资
2. 根据基数上下限确定缴费基数
3. 计算公司应缴纳金额
4. 存储结果到数据库

### 步骤 4: 查看结果

访问 **结果查询** 页面查看所有员工的计算结果。

## 计算规则

1. **年度月平均工资**: 所有月份工资的算术平均值
2. **缴费基数确定**:
   - 平均工资 < 基数下限 → 使用基数下限
   - 平均工资 > 基数上限 → 使用基数上限
   - 其他情况 → 使用平均工资
3. **公司缴纳金额**: 缴费基数 × 缴纳比例

## 构建生产版本

```bash
npm run build
npm start
```

## 部署

### 部署到 Vercel

1. **访问 Vercel**: 登录 [Vercel Dashboard](https://vercel.com/new)

2. **导入项目**:
   - 选择 "Import Git Repository"
   - 输入你的仓库地址: `https://github.com/qingqingliang-lqq/shebaojisuanqi`
   - 点击 "Import"

3. **⚠️ 重要：配置环境变量**（必须步骤）:

   在项目配置页面的 "Environment Variables" 部分添加以下环境变量：

   ```
   Name: SUPABASE_URL
   Value: https://haywyrzfviwohjxiuxry.supabase.co

   Name: SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheXd5cnpmdml3b2hqeGl1eHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0OTA3NTksImV4cCI6MjA4MzA2Njc1OX0.BiKphVmclI6xfWhKYdfAd-WnwCD7eIXa5C8v6J6FjNk
   ```

   **注意**：
   - 环境变量区分大小写
   - 不要添加引号
   - 必须在部署前配置，否则构建会失败

4. **部署**:
   - 点击 "Deploy" 按钮
   - 等待部署完成（约 1-2 分钟）
   - 部署成功后会获得一个 `.vercel.app` 域名

5. **验证**:
   - 访问部署的网址
   - 测试上传和计算功能

### 更新环境变量

如果以后需要更新 Supabase 配置：

1. 进入 Vercel 项目的 **Settings**
2. 选择 **Environment Variables**
3. 修改变量值
4. 点击 **Save** 后重新部署

## 注意事项

- 上传的 Excel 文件必须包含正确的字段名
- 每次上传会覆盖表中的旧数据
- month 字段格式为 YYYYMM（如 202401）
- 确保城市标准的 year 与工资数据的月份年份匹配

## 许可证

MIT
