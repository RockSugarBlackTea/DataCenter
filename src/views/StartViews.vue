<template>
    <div class="startview">
        <div class="container">
            <div class="title">
                <img
                    class="logo"
                    src="/vue.svg"
                    alt="logo"
                    loading="lazy"
                />
                <span class="text">数通中台 --新加坡</span>
            </div>
            <div class="desc">
                <img class="returnIcon" @click="returnLastPage" v-if="titleDisplay?.icon" src="../assets/icon/returnIcon.svg" alt="返回图标" loading="lazy" />
                {{ titleDisplay?.item }}
            </div>
            <div class="components">
                <router-view v-slot="{ Component }">
                    <Transition
                        name="drawer"
                        mode="out-in"
                    >
                        <component
                            :is="Component"
                            :key="$route.path"
                        />
                    </Transition>
                </router-view>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const titleObj = ref([
    {
        item: '登录',
        icon: false
    },
    {
        item: '忘记密码',
        icon: true
    },
    {
        item: '注册账号',
        icon: true
    }
])

// 使用 computed 监听路由变化
const titleDisplay = computed(() => {
    switch (route.path) {
        case '/start/login':
            return titleObj.value[0];
        case '/start/forget':
            return titleObj.value[1];
        case '/start/register':
            return titleObj.value[2];
        default:
            return { item: '', icon: false };
    }
});

function returnLastPage() {
    router.back();
}
</script>

<style scoped lang="scss">
.startview {
    width: 100dvw;
    height: 100dvh;
    background: url('../assets/images/bg.webp') no-repeat center center;
    background-size: cover;
    position: relative;

    .container {
        position: absolute;
        top: 0;
        left: 10%;
        width: 25%;
        min-width: 20rem;
        height: 100%;
        background-color: rgba($color: #fff, $alpha: .1);
        backdrop-filter: blur(10px);
        padding: 4rem 2.5rem;

        .title {
            width: 100%;
            height: 3rem;
            display: flex;
            align-items: center;

            .logo {
                margin-right: 1rem;
            }

            .text {
                font-weight: bold;
                font-size: 1.2rem;
                white-space: nowrap;
            }

        }

        .desc {
            font-size: 1.1rem;
            letter-spacing: .1rem;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            .returnIcon{
                width: 1.2rem;
                aspect-ratio: 1/1;
                margin-right: 0.5rem;
            }
        }

        .components {
            width: 100%;
            height: calc(100% - 6rem);
            overflow: hidden;
        }
    }
}

// 抽屉动画
.drawer-enter-active,
.drawer-leave-active {
    transition: all 0.3s;
}

// 进入动画：从右侧滑入
.drawer-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.drawer-enter-to {
    transform: translateX(0);
    opacity: 1;
}

// 离开动画：向左侧滑出
.drawer-leave-from {
    transform: translateX(0);
    opacity: 1;
}

.drawer-leave-to {
    transform: translateX(-100%);
    opacity: 0;
}
</style>