# 高校综合信息管理系统

高校综合信息管理系统是信息系统实践课程项目，采用前后端分离架构，面向高校基础数据维护、人员管理、权限管理、业务申请、附件管理和日志审计等场景。

项目采用按模块拆分 Pull Request 的协作方式推进。仓库中的功能会按登录认证、系统管理、人员管理、业务管理、测试和部署等模块逐步合并，避免一次性提交大量无关代码。

## 技术栈

前端：

- Vue 3
- JavaScript
- Vite
- Pinia
- Vue Router
- Element Plus
- Axios
- Playwright

后端：

- Java 17
- Spring Boot 3
- Spring Security
- JWT
- MyBatis XML
- MySQL 8.0
- JUnit 5

部署：

- Ubuntu
- Nginx
- systemd
- MySQL

## 项目结构

```text
xtu_system/
├── backend/                       # Spring Boot 后端工程
│   └── src/main/java/com/xtu/system
│       ├── common/                # 通用响应、异常、工具类
│       ├── config/                # 安全、Web 配置
│       └── modules/               # 业务模块
├── frontend/                      # Vue 3 前端工程
│   └── src
│       ├── api/                   # 接口封装
│       ├── components/            # 公共组件
│       ├── layout/                # 后台主布局
│       ├── router/                # 路由配置
│       ├── stores/                # Pinia 状态
│       └── views/                 # 页面模块
├── docs/                          # 课程计划书、报告、Git 过程材料
├── deploy/                        # Nginx、systemd、备份恢复脚本
├── tests/                         # 测试说明和补充材料
├── project_structure_and_api.md   # 项目目录和接口清单
└── README.md
```

## 功能模块

已规划和开发的主要模块如下：

- 登录认证：账号密码登录、JWT 鉴权、退出登录、当前用户信息。
- 权限体系：用户、角色、菜单、按钮权限、动态菜单渲染。
- 工作台：统计卡片、待办事项、趋势数据。
- 系统管理：用户管理、角色管理、菜单管理。
- 组织管理：部门树维护和部门下拉。
- 人员管理：学生管理、教师管理、导入导出、批量删除、账号绑定。
- 业务管理：课程管理、公告管理、申请管理。
- 工作流：待办、已办、审批通过、审批驳回、流转记录。
- 附件管理：上传、下载、删除、按业务对象关联。
- 日志管理：登录日志、操作日志。

## 本地开发

### 1. 环境要求

- JDK 17
- Maven
- Node.js 22 或兼容版本
- npm
- MySQL 8.0

### 2. 数据库配置

默认开发库配置：

```text
地址：127.0.0.1:3306
数据库：xtu_system
账号：root
密码：123456
```

可通过环境变量覆盖：

```bash
export DB_URL='jdbc:mysql://127.0.0.1:3306/xtu_system?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false'
export DB_USERNAME=root
export DB_PASSWORD=123456
```

### 3. 启动后端

```bash
cd backend
DB_USERNAME=root DB_PASSWORD=123456 mvn spring-boot:run
```

默认地址：

```text
http://localhost:8080
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认地址：

```text
http://localhost:5173
```

前端开发环境通过 Vite 将 `/api` 代理到后端服务。

## 默认账号

```text
管理员：admin / admin123
教师：teacher01 / teacher123
```

## 常用命令

后端编译：

```bash
cd backend
mvn -DskipTests compile
```

后端测试：

```bash
cd backend
DB_USERNAME=root DB_PASSWORD=123456 mvn test
```

前端构建：

```bash
cd frontend
npm run build
```

前端 E2E：

```bash
cd frontend
npm run test:e2e:install
npm run test:e2e
```

## 部署说明

原生部署推荐使用：

- Nginx 托管前端 `dist`
- Nginx 反向代理 `/api` 到 Spring Boot
- systemd 管理后端 jar
- MySQL 保存业务数据
- 脚本定期备份和恢复数据库

部署配置位于：

```text
deploy/
├── README.md
├── nginx/xtu_system.conf
├── systemd/xtu-system-backend.service
└── scripts/
    ├── backup_mysql.sh
    └── restore_mysql.sh
```

## Git 协作约定

- 每个功能模块单独创建分支和 Pull Request。
- 每个 PR 只提交当前模块相关文件，不混入无关代码。
- 文档、前端、后端、测试、部署配置尽量分开提交。
- PR 创建后先由成员检查，确认无误后再合并。
- 不提交 `node_modules/`、`target/`、`dist/`、本地上传文件和环境变量文件。

## 文档索引

- [项目计划书](docs/plan/project_plan.md)
- [Git 过程说明](docs/git/git_process.md)
- [中期与结项报告](docs/report/中期与结项报告.md)
- [项目目录和接口清单](project_structure_and_api.md)
- [部署说明](deploy/README.md)

