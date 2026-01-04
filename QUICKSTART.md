# 五险一金计算器 - 快速入门指南

## 项目已完成！

项目已成功构建并测试通过。以下是快速开始步骤：

## 第一步：配置 Supabase

### 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册账号并创建新项目
3. 等待项目初始化完成（约 2 分钟）

### 2. 创建数据库表

在 Supabase 控制台的 **SQL Editor** 中，执行以下 SQL：

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

### 3. 获取 API 密钥

1. 在 Supabase 控制台，进入 **Settings** → **API**
2. 复制 **Project URL** 和 **anon public** 密钥
3. 打开项目中的 `.env.local` 文件
4. 替换以下内容：

```env
SUPABASE_URL=你复制的_project_url
SUPABASE_ANON_KEY=你复制的_anon_key
```

例如：
```env
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 第二步：准备测试数据

### 城市标准数据 (cities.xlsx)

创建一个 Excel 文件，包含以下列和数据：

| city_name | year | base_min | base_max | rate  |
|-----------|------|----------|----------|-------|
| 佛山      | 2024 | 1900     | 31851    | 0.15  |

### 员工工资数据 (salaries.xlsx)

创建一个 Excel 文件，包含以下列：

| employee_id | employee_name | month  | salary_amount |
|-------------|---------------|--------|---------------|
| E001        | 张三          | 202401 | 5000          |
| E001        | 张三          | 202402 | 5200          |
| E001        | 张三          | 202403 | 4800          |
| E002        | 李四          | 202401 | 8000          |
| E002        | 李四          | 202402 | 8200          |
| E002        | 李四          | 202403 | 7800          |

**注意**：
- month 格式必须是 YYYYMM（如 202401）
- employee_id 可以是任意文本
- 每位员工应该有多个月份的数据

## 第三步：运行应用

```bash
cd /Users/apple/社保计算器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 第四步：使用应用

### 1. 上传数据

- 点击 **数据上传** 卡片
- 先上传 **城市标准数据** (cities.xlsx)
- 再上传 **员工工资数据** (salaries.xlsx)

### 2. 执行计算

- 点击 **执行计算并存储结果** 按钮
- 等待计算完成

### 3. 查看结果

- 点击 **结果查询** 卡片
- 查看所有员工的计算结果

## 计算示例

假设：
- 员工张三的月平均工资 = (5000 + 5200 + 4800) / 3 = 5000 元
- 佛山基数下限 = 1900，基数上限 = 31851
- 缴纳比例 = 15% (0.15)

计算过程：
1. 5000 在 1900 和 31851 之间，所以缴费基数 = 5000
2. 公司应缴纳 = 5000 × 0.15 = 750 元

## 常见问题

### 1. 上传失败怎么办？

检查 Excel 文件的列名是否完全匹配：
- cities: city_name, year, base_min, base_max, rate
- salaries: employee_id, employee_name, month, salary_amount

### 2. 计算失败怎么办？

确保：
- 已上传城市标准数据
- 已上传员工工资数据
- cities 表中的 year 与 salaries 中的 month 年份匹配

### 3. 如何查看数据库中的数据？

在 Supabase 控制台的 **Table Editor** 中可以查看和编辑数据。

## 项目文件说明

```
社保计算器/
├── app/
│   ├── page.tsx          # 主页
│   ├── upload/           # 上传页面
│   ├── results/          # 结果页面
│   └── api/              # API 接口
├── lib/supabase.ts       # Supabase 配置
├── types/index.ts        # 类型定义
└── README.md             # 完整文档
```

## 技术支持

如有问题，请检查：
1. `.env.local` 文件是否正确配置
2. Supabase 项目是否正常运行
3. Excel 文件格式是否正确

## 下一步

应用已完全可用！你可以：
- 修改样式以适应你的品牌
- 添加更多城市支持
- 增加数据导出功能
- 添加用户认证

祝使用愉快！
