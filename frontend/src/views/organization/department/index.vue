<template>
    <div class="department-page">
        <section class="page-card toolbar-card">
            <div>
                <h1 class="page-title">部门管理</h1>
                <p class="page-subtitle">维护组织树结构，供用户、角色和业务模块复用。</p>
            </div>
            <div class="toolbar-actions">
                <el-button v-if="hasPermission('organization:department:create')" type="primary" @click="openCreateDialog(0)">新增顶级部门</el-button>
                <el-button @click="loadDepartments">刷新</el-button>
            </div>
        </section>

        <section class="page-card table-card">
            <el-table
                :data="departmentList"
                row-key="id"
                default-expand-all
                :tree-props="{ children: 'children' }"
            >
                <el-table-column prop="deptName" label="部门名称" min-width="220" />
                <el-table-column prop="deptCode" label="部门编码" min-width="140" />
                <el-table-column label="部门类型" min-width="140">
                    <template #default="{ row }">
                        {{ formatDeptType(row.deptType) }}
                    </template>
                </el-table-column>
                <el-table-column prop="leaderName" label="负责人" min-width="120" />
                <el-table-column prop="leaderPhone" label="联系电话" min-width="140" />
                <el-table-column prop="sortNo" label="排序" width="90" />
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'info'">
                            {{ row.status === 1 ? '启用' : '停用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <el-button v-if="hasPermission('organization:department:create')" link type="primary" @click="openCreateDialog(row.id)">新增下级</el-button>
                        <el-button v-if="hasPermission('organization:department:update')" link type="primary" @click="openEditDialog(row.id)">编辑</el-button>
                        <el-button v-if="hasPermission('organization:department:delete')" link type="danger" @click="handleDelete(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </section>

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" destroy-on-close>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
                <el-form-item label="上级部门" prop="parentId">
                    <el-select v-model="form.parentId" style="width: 100%;">
                        <el-option label="顶级部门" :value="0" />
                        <el-option
                            v-for="option in flatDepartmentOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="部门编码" prop="deptCode">
                    <el-input v-model="form.deptCode" />
                </el-form-item>
                <el-form-item label="部门名称" prop="deptName">
                    <el-input v-model="form.deptName" />
                </el-form-item>
                <el-form-item label="部门类型" prop="deptType">
                    <el-select v-model="form.deptType" clearable placeholder="请选择部门类型" style="width: 100%;">
                        <el-option label="行政部门" value="office" />
                        <el-option label="学院" value="college" />
                        <el-option label="班级" value="class" />
                    </el-select>
                </el-form-item>
                <el-form-item label="负责人" prop="leaderName">
                    <el-input v-model="form.leaderName" />
                </el-form-item>
                <el-form-item label="联系电话" prop="leaderPhone">
                    <el-input v-model="form.leaderPhone" />
                </el-form-item>
                <el-form-item label="排序号" prop="sortNo">
                    <el-input-number v-model="form.sortNo" :min="0" style="width: 100%;" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="form.status">
                        <el-radio :value="1">启用</el-radio>
                        <el-radio :value="0">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" type="textarea" :rows="3" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button
                    v-if="hasPermission(form.id ? 'organization:department:update' : 'organization:department:create')"
                    type="primary"
                    :loading="submitting"
                    @click="handleSubmit"
                >
                    保存
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    createDepartment,
    deleteDepartment,
    getDepartmentDetail,
    getDepartmentOptions,
    getDepartmentTree,
    updateDepartment
} from '@/api/organization/department'
import { usePermission } from '@/composables/use_permission'

const formRef = ref()
const departmentList = ref([])
const departmentOptions = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const { hasPermission } = usePermission()

const form = reactive({
    id: null,
    parentId: 0,
    deptCode: '',
    deptName: '',
    deptType: 'office',
    leaderName: '',
    leaderPhone: '',
    sortNo: 0,
    status: 1,
    remark: ''
})

const rules = {
    parentId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
    deptCode: [{ required: true, message: '请输入部门编码', trigger: 'blur' }],
    deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const dialogTitle = computed(() => (form.id ? '编辑部门' : '新增部门'))
const flatDepartmentOptions = computed(() => flattenOptions(departmentOptions.value))

async function loadDepartments() {
    const [treeResponse, optionResponse] = await Promise.all([
        getDepartmentTree(),
        getDepartmentOptions()
    ])
    departmentList.value = treeResponse.data
    departmentOptions.value = optionResponse.data
}

function resetForm(parentId = 0) {
    Object.assign(form, {
        id: null,
        parentId,
        deptCode: '',
        deptName: '',
        deptType: 'office',
        leaderName: '',
        leaderPhone: '',
        sortNo: 0,
        status: 1,
        remark: ''
    })
}

function openCreateDialog(parentId = 0) {
    resetForm(parentId)
    dialogVisible.value = true
}

async function openEditDialog(id) {
    const { data } = await getDepartmentDetail(id)
    Object.assign(form, data)
    dialogVisible.value = true
}

async function handleSubmit() {
    await formRef.value.validate()
    submitting.value = true

    try {
        if (form.id) {
            await updateDepartment(form.id, form)
            ElMessage.success('部门更新成功')
        } else {
            await createDepartment(form)
            ElMessage.success('部门创建成功')
        }
        dialogVisible.value = false
        loadDepartments()
    } finally {
        submitting.value = false
    }
}

async function handleDelete(id) {
    await ElMessageBox.confirm('删除前会检查下级部门和部门用户，是否继续？', '确认删除', {
        type: 'warning'
    })
    await deleteDepartment(id)
    ElMessage.success('部门删除成功')
    loadDepartments()
}

function flattenOptions(tree, level = 0) {
    return tree.flatMap((item) => {
        const prefix = level === 0 ? '' : `${'　'.repeat(level)}└ `
        const current = {
            label: `${prefix}${item.label}`,
            value: item.value
        }
        return [current, ...flattenOptions(item.children || [], level + 1)]
    })
}

function formatDeptType(deptType) {
    const deptTypeMap = {
        office: '行政部门',
        college: '学院',
        class: '班级'
    }
    return deptTypeMap[deptType] || '未定义'
}

onMounted(() => {
    loadDepartments()
})
</script>

<style scoped>
.department-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.toolbar-card,
.table-card {
    padding: 20px;
}

.toolbar-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.toolbar-actions {
    display: flex;
    gap: 12px;
}

@media (max-width: 960px) {
    .toolbar-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
}
</style>
