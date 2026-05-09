import { expect, test } from '@playwright/test'

const apiBaseUrl = process.env.E2E_API_BASE_URL || 'http://127.0.0.1:8080/api'

async function login(page, username, password) {
    await page.goto('/login')
    await page.getByPlaceholder('请输入账号').fill(username)
    await page.getByPlaceholder('请输入密码').fill(password)
    await page.getByRole('button', { name: '立即登录' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
}

test('教师账号菜单和权限收敛正确', async ({ page, request }) => {
    await login(page, 'teacher01', 'teacher123')

    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toContainText('工作台')
    await expect(sidebar).toContainText('人员管理')
    await expect(sidebar).toContainText('教师管理')
    await expect(sidebar).not.toContainText('用户管理')
    await expect(sidebar).not.toContainText('角色管理')
    await expect(sidebar).not.toContainText('菜单管理')

    await page.goto('/personnel/teachers')
    await expect(page.getByRole('heading', { name: '教师管理' })).toBeVisible()
    await expect(page.getByRole('button', { name: '查询' })).toBeVisible()
    await expect(page.getByRole('button', { name: '重置' })).toBeVisible()
    await expect(page.getByRole('button', { name: '新增教师' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '批量导入' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '批量删除' })).toHaveCount(0)

    const token = await page.evaluate(() => window.localStorage.getItem('xtu_system_token'))
    expect(token).toBeTruthy()

    const forbiddenResponse = await request.get(`${apiBaseUrl}/users?pageNum=1&pageSize=10`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const forbiddenResult = await forbiddenResponse.json()
    expect(forbiddenResult.code).toBe(403)

    const teacherResponse = await request.get(`${apiBaseUrl}/teachers?pageNum=1&pageSize=10`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const teacherResult = await teacherResponse.json()
    expect(teacherResult.code).toBe(200)
})
