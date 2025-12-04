<template>
    <div class="login">
        <div class="title">登录</div>
        <InputBox
            ref="username"
            placeholder="用户名"
            type="text"
        />
        <InputBox
            ref="password"
            placeholder="密码"
            type="password"
        />
        <div class="protocol">
            <el-checkbox v-model="protocolChecked"></el-checkbox>
            <span class="text">我已阅读并同意<a href="#">《用户协议》</a>和<a href="#">《隐私政策》</a></span>
        </div>
        <el-button
            size="large"
            class="loginBtn"
            type="primary"
            :disabled="!isFormValid"
        >登录</el-button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';

import InputBox from '../Modules/InputBox.vue';

const username = ref(); // 用户名
const password = ref(); // 密码
const protocolChecked = ref(false); // 是否同意协议

const isFormValid = computed(() => {
    return protocolChecked.value &&
        username.value?.getValue?.() &&
        password.value?.getValue?.();
});
</script>

<style scoped lang="scss">
.login {
    width: 100%;
    height: 100%;
    padding-top: 2rem;

    .title {
        font-size: 1.1rem;
        letter-spacing: .1rem;
        margin-bottom: .3rem;
    }

    .loginBtn {
        width: 100%;
    }

    .protocol {
        width: 100%;
        display: flex;
        align-items: center;
        font-size: .75rem;
        white-space: nowrap;
        margin-bottom: 2rem;

        .text {
            margin-left: .2rem;
        }
    }
}
</style>