<template>
    <div class="register">
        <InputBox ref="username" placeholder="用户名" type="text" />
        <InputBox ref="email" placeholder="邮箱" type="email" />
        <div class="emailCodeBox">
            <InputBox ref="emailCode" placeholder="邮箱验证码" type="text" />
            <el-button @click="handleGetEmailCode" size="small" type="primary">获取验证码</el-button>   
        </div>
        <InputBox ref="password" placeholder="密码" type="password" />
        <div class="verifyHumerBox">
            <InputBox ref="humerCode" placeholder="图形验证码" type="text" />
            <img @click="handleChangeImage" :src="imageBase64" loading="lazy" alt="图形验证码" />
        </div>
    </div>
</template>

<script setup lang="ts">
import InputBox from '../Modules/InputBox.vue';
import { getImageCaptcha } from '../../api/request';
import { ref, onMounted } from 'vue';

const imageUUID = ref(''); // 图形验证码的UUID
const imageBase64 = ref(''); // 图形验证码的Base64字符串

async function changeVerifyImageFunction() {
    const response = await getImageCaptcha();
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

onMounted(async () => {
    changeVerifyImageFunction()
});

async function handleChangeImage() {
    changeVerifyImageFunction()
}
</script>

<style scoped lang="scss">
.register{
    width: 100%;
    height: 100%;
    .verifyHumerBox{
        display: flex;
        align-items: center;
        height: 4rem;
        img{
            background-color: white;
            height: 3rem;
            cursor: pointer;
        }
    }
}
</style>