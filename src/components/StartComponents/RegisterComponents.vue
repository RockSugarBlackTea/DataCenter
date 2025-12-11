<template>
    <div class="register">
        <InputBox
            ref="username"
            placeholder="用户名"
            type="text"
        />
        <InputBox
            ref="email"
            placeholder="邮箱"
            type="email"
        />
        <div class="emailCodeBox">
            <InputBox
                ref="emailCode"
                placeholder="邮箱验证码"
                type="text"
            />
            <el-button
                :disabled="isDisabledButton"
                @click="handleGetEmailCode"
                type="primary"
            >{{ buttonText }}</el-button>
        </div>
        <InputBox
            ref="password"
            placeholder="密码"
            type="password"
        />
        <div class="verifyHumerBox">
            <InputBox
                ref="humerCode"
                placeholder="图形验证码"
                type="text"
            />
            <img
                v-if="imageBase64"
                @click="handleChangeImage"
                :src="imageBase64"
                alt="图形验证码"
            />
        </div>
        <el-button
            size="large"
            class="registerBtn"
            type="primary"
            @click="handleRegister"
            :disabled="isDisabledRegisterButton"
        >注册</el-button>
    </div>
</template>

<script setup lang="ts">
import InputBox from '../Modules/InputBox.vue';
import { getImageCaptcha, sendEmailCode, handleRegisterServer } from '../../api/request';
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { myDebounce } from '../../utils/index.ts';
import { returnVerifierAndSalt } from '../../utils/SrpUtils.ts';
import { useRouter } from 'vue-router';

const router = useRouter();

const imageUUID = ref(''); // 图形验证码的UUID
const imageBase64 = ref(''); // 图形验证码的Base64字符串
const username = ref(); // 用户名输入框
const email = ref(); // 邮箱输入框
const emailCode = ref(); // 邮箱验证码输入框
const password = ref(); // 密码输入框
const humerCode = ref(); // 图形验证码输入框

const isDisabledButton = ref(false); // 邮箱验证码按钮禁用状态
const buttonText = ref('获取验证码'); // 邮箱验证码按钮文本
const countdown = ref(180); // 倒计时秒数，使用 ref 管理
const countdownInterval = ref<ReturnType<typeof setInterval> | null>(null); // 保存定时器引用
const isDisabledRegisterButton = ref(false); // 注册按钮禁用状态

// 创建防抖函数实例（只创建一次）
const debouncedChangeImage = myDebounce(changeVerifyImageFunction, 3000);

// 监听倒计时变化，管理定时器和按钮状态
watch(countdown, (newValue) => {
    if (newValue < 180 && newValue > 0) {
        buttonText.value = `重新获取(${newValue}s)`;
    } else if (newValue <= 0) {
        // 倒计时完成，清除定时器
        if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
        }
        isDisabledButton.value = false;
        buttonText.value = '获取验证码';
        countdown.value = 180;
    }
});

async function changeVerifyImageFunction() {
    const response = await getImageCaptcha({});
    console.log('图形验证码响应:', response);
    const str = JSON.stringify(response);
    const obj = JSON.parse(str);
    if (obj.code === 200) {
        imageUUID.value = obj.UUID;
        imageBase64.value = obj.captcha;
    } else {
        console.error('获取图形验证码失败:', obj.message);
    }
}

async function startCountdown() {
    // 防止重复启动定时器
    if (countdownInterval.value) {
        return;
    }

    isDisabledButton.value = true;
    countdown.value = 180;

    countdownInterval.value = setInterval(() => {
        countdown.value--;
    }, 1000);
}

async function handleGetEmailCode() {
    const emailInput = email.value.getValue();
    if (emailInput === '') {
        ElMessage.error('请输入邮箱地址');
        return;
    }
    sendEmailCode({
        "email": emailInput
    }).then((response) => {
        console.log('发送邮箱验证码响应:', response);
        const str = JSON.stringify(response);
        const obj = JSON.parse(str);
        if (obj.code === 200) {
            startCountdown();
            ElMessage.success('验证码发送成功，请查收邮箱');
        } else {
            ElMessage.error('验证码发送失败: ' + obj.message);
        }
    }).catch(() => {
        ElMessage.error('前端出问题了,请反馈')
    });
}

async function handleRegister() {
    const usernameInput = username.value.getValue();
    const emailInput = email.value.getValue();
    const emailCodeInput = emailCode.value.getValue();
    const passwordInput = password.value.getValue();
    const humerCodeInput = humerCode.value.getValue();

    if(!usernameInput || !emailInput || !emailCodeInput || !passwordInput || !humerCodeInput) {
        ElMessage.error('请完整填写注册信息');
        return;
    }

    await returnVerifierAndSalt(passwordInput).then(async ({ salt, verifier }) => {
        console.log(`生成的盐:${salt},验证器:${verifier}`);

        const data = {
            username: usernameInput,
            email: emailInput,
            salt: salt,
            verifier: verifier,
            emailVerificationCode: emailCodeInput,
            humanCheckKey: imageUUID.value,
            humanCheckCode: humerCodeInput
        }

        await handleRegisterServer(data).then((response) => {
            console.log('注册响应:', response);
            const str = JSON.stringify(response);
            const obj = JSON.parse(str);
            if (obj.code === 200) {
                ElMessage.success('注册成功,请前往登录页面登录');
                // 清除输入框内容
                username.value.clearInputValue();
                email.value.clearInputValue();
                emailCode.value.clearInputValue();
                password.value.clearInputValue();
                humerCode.value.clearInputValue();
                setTimeout(() => {
                    router.push('/start/login');
                },2000)
            } else {
                ElMessage.error('注册失败: ' + obj.message);
            }
        });

    }).catch(() => {
        ElMessage.error('浏览器出现问题');
        return;
    })
}

onMounted(async () => {
    changeVerifyImageFunction()
});

async function handleChangeImage() {
    debouncedChangeImage();
}
</script>

<style scoped lang="scss">
.register {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    &::-webkit-scrollbar {
        display: none;
    }

    .verifyHumerBox {
        display: flex;
        align-items: center;
        height: 4rem;

        img {
            background-color: white;
            height: 3rem;
            cursor: pointer;
        }
    }

    .emailCodeBox {
        display: flex;
        align-items: center;
        height: 4rem;
    }

    .registerBtn{
        width: 100%;
        margin-top: 2rem;
    }
}
</style>