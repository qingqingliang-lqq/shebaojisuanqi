# 五险一金计算器项目 - 上下文管理中枢

## 项目目标
构建一个迷你的"五险一金"计算器Web应用，根据预设的员工工资数据和城市社保标准，计算公司为每位员工应缴纳的社保公积金费用。

## 技术栈
- **前端框架**: Next.js (App Router)
- **UI/样式**: Tailwind CSS
- **数据库/后端**: Supabase (PostgreSQL + 数据API)

---

## 数据库设计 (Supabase)

### 1. cities 表（城市标准表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键 |
| city_name | text | 城市名（固定为"佛山"） |
| year | text | 年份（如"2024"） |
| base_min | int | 社保基数下限 |
| base_max | int | 社保基数上限 |
| rate | float | 综合缴纳比例（如 0.15 表示15%） |

### 2. salaries 表（员工工资表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键 |
| employee_id | text | 员工工号 |
| employee_name | text | 员工姓名 |
| month | text | 年份月份（YYYYMM格式，如"202401"） |
| salary_amount | int | 该月工资金额 |

### 3. results 表（计算结果表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键 |
| employee_name | text | 员工姓名 |
| avg_salary | float | 年度月平均工资 |
| contribution_base | float | 最终缴费基数 |
| company_fee | float | 公司缴纳金额 |

---

## 核心业务逻辑

### 计算函数执行步骤
1. **读取数据**: 从 salaries 表读取所有工资数据
2. **分组计算**: 按 employee_name 分组，计算每位员工的年度月平均工资
3. **获取标准**: 从 cities 表获取佛山的 base_min, base_max, rate
4. **确定基数**: 对每位员工，将 avg_salary 与基数上下限比较
   - 若 avg_salary < base_min → 使用 base_min
   - 若 avg_salary > base_max → 使用 base_max
   - 若 base_min ≤ avg_salary ≤ base_max → 使用 avg_salary
5. **计算费用**: company_fee = contribution_base × rate
6. **存储结果**: 将结果存入 results 表（每次计算前清空旧数据）

---

## 前端页面设计

### 1. 主页 (/)
**定位**: 应用入口和导航中枢

**布局**:
- 桌面端：两个卡片水平排列
- 移动端：响应式垂直排列

**内容**:
- 卡片一：「数据上传」
  - 标题: "数据上传"
  - 说明: "上传城市标准和员工工资数据"
  - 点击跳转: /upload
- 卡片二：「结果查询」
  - 标题: "结果查询"
  - 说明: "查看五险一金计算结果"
  - 点击跳转: /results

### 2. 数据上传页 (/upload)
**定位**: 数据准备和计算控制面板

**功能**:
- 按钮一：「上传城市标准数据」
  - 上传 Excel 文件（对应 cities 表）
  - 上传后清空并重新插入 cities 表数据
- 按钮二：「上传员工工资数据」
  - 上传 Excel 文件（对应 salaries 表）
  - 上传后清空并重新插入 salaries 表数据
- 按钮三：「执行计算并存储结果」
  - 触发核心计算逻辑
  - 清空 results 表旧数据
  - 插入新的计算结果

### 3. 结果查询页 (/results)
**定位**: 计算结果展示页面

**功能**:
- 页面加载时自动从 results 表获取所有数据
- 使用 Tailwind CSS 渲染清晰的数据表格
- 表头字段: 员工姓名、年度月平均工资、缴费基数、公司缴纳金额

---

## 开发任务清单 (TodoList)

### 阶段一：项目初始化与环境搭建
- [ ] 使用 `npx create-next-app@latest` 创建 Next.js 项目
- [ ] 安装 Tailwind CSS 及相关依赖
- [ ] 配置 Tailwind CSS (tailwind.config.js, globals.css)
- [ ] 安装 Supabase 客户端库 (`@supabase/supabase-js`)
- [ ] 安装 Excel 处理库 (`xlsx` 或 `papaparse`)
- [ ] 配置环境变量 (.env.local): SUPABASE_URL, SUPABASE_ANON_KEY

### 阶段二：Supabase 数据库设置
- [ ] 在 Supabase 创建项目
- [ ] 在 Supabase SQL Editor 中创建三张表 (cities, salaries, results)
- [ ] 设置表的主键和字段类型
- [ ] 关闭 Row Level Security (RLS) 或设置为公开读取/写入（开发阶段）
- [ ] 准备测试数据并插入

### 阶段三：项目基础配置与工具函数
- [ ] 创建 Supabase 客户端实例文件 (lib/supabase.ts 或 utils/supabase.ts)
- [ ] 创建类型定义文件 (types/index.ts) 定义数据库表类型
- [ ] 测试 Supabase 连接是否正常

### 阶段四：核心计算逻辑实现
- [ ] 创建 API 路由: app/api/calculate/route.ts
- [ ] 实现读取 salaries 数据的逻辑
- [ ] 实现按员工分组计算平均工资的逻辑
- [ ] 实现从 cities 获取标准的逻辑
- [ ] 实现缴费基数三区间判断逻辑
- [ ] 实现计算公司缴纳费用的逻辑
- [ ] 实现清空并插入 results 表的逻辑
- [ ] 添加错误处理和日志输出

### 阶段五：数据上传功能实现
- [ ] 创建 API 路由: app/api/upload/cities/route.ts
  - 接收文件上传
  - 解析 Excel/CSV
  - 清空 cities 表
  - 插入新数据
  - 返回成功/失败响应
- [ ] 创建 API 路由: app/api/upload/salaries/route.ts
  - 接收文件上传
  - 解析 Excel/CSV
  - 清空 salaries 表
  - 插入新数据
  - 返回成功/失败响应
- [ ] 在 /upload 页面创建上传组件
  - 两个独立的文件上传区域
  - 文件选择按钮
  - 上传进度/状态提示
  - 错误提示

### 阶段六：前端页面开发
- [ ] 创建主页 app/page.tsx
  - 布局容器（使用 Tailwind grid 或 flex）
  - 数据上传卡片组件
  - 结果查询卡片组件
  - 响应式设计（移动端适配）
- [ ] 创建上传页 app/upload/page.tsx
  - 页面标题和说明
  - 城市标准数据上传组件
  - 员工工资数据上传组件
  - "执行计算"按钮
  - 操作状态提示（成功/失败/加载中）
- [ ] 创建结果页 app/results/page.tsx
  - 页面标题
  - 数据获取逻辑（useEffect 或服务端组件）
  - 数据表格组件（使用 Tailwind 样式）
  - 空数据状态提示

### 阶段七：UI 优化与样式
- [ ] 统一页面布局和导航（可选：添加导航栏）
- [ ] 优化卡片样式（阴影、圆角、hover 效果）
- [ ] 优化表格样式（边框、斑马纹、响应式）
- [ ] 添加加载状态指示器（Spinner 或骨架屏）
- [ ] 优化按钮样式和交互反馈

### 阶段八：测试与验证
- [ ] 准备测试用的 Excel 文件（cities 数据, salaries 数据）
- [ ] 测试数据上传功能（两个文件分别测试）
- [ ] 测试计算功能（验证计算逻辑正确性）
- [ ] 测试结果展示页面
- [ ] 测试边界情况（空数据、错误格式等）
- [ ] 手动验证计算结果是否符合预期

### 阶段九：部署准备（可选）
- [ ] 代码检查和清理
- [ ] 环境变量配置文档
- [ ] 部署到 Vercel 或其他平台
- [ ] 最终功能验证

---

## 关键注意事项

### 数据处理
- 所有上传操作都是**覆盖模式**（先清空再插入）
- 每次计算前先清空 results 表
- Excel 列名必须与数据库字段名完全一致

### 计算规则
- 固定使用佛山的数据标准
- 从 month 字段提取年份来匹配 cities.year
- 缴费基数三区间规则：低于下限用下限，高于上限用上限，中间用实际值

### UI/UX
- 桌面端卡片水平排列，移动端垂直排列
- 不需要用户认证系统
- 不需要数据编辑/删除功能
- Excel 格式错误时需要重新上传

### 文件结构建议
```
社保计算器/
├── app/
│   ├── api/
│   │   ├── calculate/
│   │   │   └── route.ts
│   │   └── upload/
│   │       ├── cities/
│   │       │   └── route.ts
│   │       └── salaries/
│   │           └── route.ts
│   ├── page.tsx (主页)
│   ├── upload/
│   │   └── page.tsx
│   └── results/
│       └── page.tsx
├── lib/
│   └── supabase.ts
├── types/
│   └── index.ts
├── .env.local
├── tailwind.config.js
├── package.json
└── claude.md (本文件)
```

---

## 开发状态
- 当前阶段: 计划确认中
- 下一步: 开始环境搭建
