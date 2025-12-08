<template>
    <div class="login">
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
        <div class="forget">
            <router-link to="/start/forget">忘记密码？</router-link>
            <div>
                <span style="color: black;">没有账户?</span>
                <router-link to="/start/register">注册账号</router-link>
            </div>
        </div>
        <div class="protocol">
            <el-checkbox v-model="protocolChecked"></el-checkbox>
            <span class="text">我已阅读并同意<router-link to="/">《用户协议》</router-link>和<router-link
                    to="/">《隐私政策》</router-link></span>
        </div>
        <el-button
            size="large"
            class="loginBtn"
            type="primary"
            :disabled="!isFormValid"
            @click="handleLogin"
        >登录</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { modPowDirect, randomHex, hexToBytes, N, g, k, bnToHex, bnToBytes, computeHashedPassword } from '../../utils/SrpUtils';
import { handleLoginStep1, handleLoginStep2 } from '../../api/request';
import { ElMessage } from 'element-plus'
// 从本地 utils 导入 sha512
import { sha512 } from '../../utils/sha512';

import InputBox from '../Modules/InputBox.vue';

const username = ref(); // 用户名
const password = ref(); // 密码
const protocolChecked = ref(false); // 是否同意协议
let usernameInput: any;
let passwordInput: any;

const isFormValid = computed(() => {
    return protocolChecked.value &&
        username.value?.getValue?.() &&
        password.value?.getValue?.();
});

async function handleLogin() {
    usernameInput = username.value;
    passwordInput = password.value;
    const usr = username.value.getValue();
    const pwd = password.value.getValue();

    console.log(`[Login] 用户名: ${usr}, 密码: ${pwd}`);

    const aHex = randomHex(32);
    const a = BigInt('0x' + aHex);
    console.log(`[Login] 生成随机数 a: ${aHex}`);

    const A = modPowDirect(g, a, N);
    const AHex = bnToHex(A);
    console.log(`[Login] 计算 A = g^a mod N: ${AHex}`);
    await handleLoginStep1({
        username: usr,
        A: AHex
    }).then((response) => {
        console.log("登录第一步完成,已获取响应:", response);
        const str = JSON.stringify(response);
        const obj = JSON.parse(str);
        if (obj.code === 200) {
            handleLoginStep(obj.B, obj.salt, A, a, usr);
        } else {
            return;
        }
    }).catch(() => {
        ElMessage.error('前端出问题了,请反馈')
    });


}

async function handleLoginStep(StepB: string, salt: string, A: bigint, a: bigint, username: string) {
    const B = BigInt('0x' + StepB);

    // 1. 计算 u = SHA512(PAD(A) | PAD(B))
    // PAD 长度为 N 的字节长度 (384 bytes)
    const padLen = 384;
    const ABytes = bnToBytes(A, padLen);
    const BBytes = bnToBytes(B, padLen);

    const uInput = new Uint8Array(ABytes.length + BBytes.length);
    uInput.set(ABytes);
    uInput.set(BBytes, ABytes.length);

    const uHex = sha512(uInput)
    const u = BigInt('0x' + uHex);
    const xHex = await computeHashedPassword(salt, password.value.getValue());
    const x = BigInt('0x' + xHex);
    const gx = modPowDirect(g, x, N);
    const kgx = (k * gx) % N;
    let base = (B - kgx) % N;
    if (base < 0n) base += N; // 处理负数
    const exp = a + u * x;

    const S = modPowDirect(base, exp, N);
    const SBytes = bnToBytes(S);
    const KHex = sha512(SBytes);
    const KBytes = hexToBytes(KHex);
    const Nbytes = bnToBytes(N);
    const H_N: Uint8Array = hexToBytes(sha512(Nbytes));
    const gBytes = bnToBytes(g);
    const H_g: Uint8Array = hexToBytes(sha512(gBytes));
    const H_xor = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
        H_xor[i] = (H_N[i] || 0) ^ (H_g[i] || 0);
    }
    const H_I = hexToBytes(sha512(username));
    const saltBytes = hexToBytes(salt);
    const ABytesNoPad = bnToBytes(A,384);
    const BBytesNoPad = bnToBytes(B,384);
    const totalLen = H_xor.length + H_I.length + saltBytes.length + ABytesNoPad.length + BBytesNoPad.length + KBytes.length;
    const M1Input = new Uint8Array(totalLen);
    let offset = 0;
    M1Input.set(H_xor, offset);
    offset += H_xor.length;
    M1Input.set(H_I, offset);
    offset += H_I.length;
    M1Input.set(saltBytes, offset);
    offset += saltBytes.length;
    M1Input.set(ABytesNoPad, offset);
    offset += ABytesNoPad.length;
    M1Input.set(BBytesNoPad, offset);
    offset += BBytesNoPad.length;
    M1Input.set(KBytes, offset);
    const M1 = sha512(M1Input);

    await handleLoginStep2({
        username: username,
        M1: M1
    }).then(async (response) => {
        console.log("登录第二步完成,已获取响应:", response);
        const str = JSON.stringify(response);
        const obj = JSON.parse(str);
        if (obj.code === 200) {
            const verifySafe: boolean = verifyM2(ABytes, M1, KBytes, obj.M2);
            if (verifySafe) {
                ElMessage.success('登录成功')
                // 清除输入框内容
                usernameInput.clearInputValue();
                passwordInput.clearInputValue();
                protocolChecked.value = false;
            } else {
                ElMessage.error('你连接到非法服务器,拒绝登录')
            }
        } else {
            return;
        }
    }).catch(() => {
        ElMessage.error('登录失败,请检查用户名和密码')
    });
}

function verifyM2(ABytes: Uint8Array, M1Hex: string, KBytes: Uint8Array, M2Hex: string): boolean {
    const M1Bytes = hexToBytes(M1Hex);
    const totalLen = ABytes.length + M1Bytes.length + KBytes.length;
    const M2Input = new Uint8Array(totalLen);
    let offset = 0;

    M2Input.set(ABytes, offset);
    offset += ABytes.length;
    M2Input.set(M1Bytes, offset);
    offset += M1Bytes.length;
    M2Input.set(KBytes, offset);

    const expectedM2 = sha512(M2Input);
    return expectedM2 === M2Hex;
}
</script>

<style scoped lang="scss">
.login {
    width: 100%;
    height: 100%;

    .loginBtn {
        width: 100%;
    }

    .forget{
        margin-bottom: 1.2rem;
        color: #307def;
        font-size: .8rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
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
            a{
                color: #307def;
            }
        }
    }
}
</style>