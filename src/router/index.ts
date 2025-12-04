import { createWebHistory, createRouter } from 'vue-router';

// 导入工具
import { getCookie } from '../utils/index.ts';

const routes: any = [
    {
        path: '/start',
        component: () => import('../views/StartViews.vue'),
        meta: { requiresAuth: false }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 添加路由守卫
//@ts-ignore
router.beforeEach(async (to, from, next) => {
    if (to.matched.some((record: any) => record.meta.requiresAuth)) {
        // 获取cookies中是否有auto_token字段
        const token = getCookie('AUTO_TOKEN');
        if (!token) {
            // next({
            //     path: '/start',
            //     query: { redirect: to.fullPath }
            // })// 生产环境使用
            next() // 开发环境使用
            return;
        }
        next() // 保证一定要调用 next()
    } else {
        next() // 保证一定要调用 next()
    }
});

export default router;