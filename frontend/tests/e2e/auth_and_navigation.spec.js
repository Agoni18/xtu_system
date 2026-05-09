import { expect, test } from '@playwright/test'

async function login(page, username = 'admin', password = 'admin123') {
    await page.goto('/login')
    await page.getByPlaceholder('请输入账号').fill(username)
    await page.getByPlaceholder('请输入密码').fill(password)
    await page.getByRole('button', { name: '立即登录' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
}

test('管理员可以登录并访问核心页面', async ({ page }) => {
    await login(page)

    await expect(page.getByText('待办事项')).toBeVisible()

    const pages = [
        ['/system/users', '用户管理'],
        ['/organization/departments', '部门管理'],
        ['/system/roles', '角色管理'],
        ['/system/menus', '菜单管理'],
        ['/personnel/students', '学生管理'],
        ['/personnel/teachers', '教师管理'],
        ['/business/courses', '课程管理'],
        ['/business/notices', '公告管理'],
        ['/business/applications', '申请管理'],
        ['/business/attachments', '附件管理'],
        ['/workflow/applications', '审批任务'],
        ['/system/logs', '日志管理']
    ]

    for (const [path, title] of pages) {
        await page.goto(path)
        await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`))
        await expect(page.getByRole('heading', { name: title })).toBeVisible()
    }

    await page.getByRole('button', { name: '修改密码' }).click()
    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible()
})
