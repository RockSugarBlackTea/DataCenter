<template>
    <div class="startview">
        <div class="container">
            <div class="title">
                <img class="logo" src="/vue.svg" alt="logo" loading="lazy" />
                <span class="text">数通中台 --新加坡</span>
            </div>
            <div class="components">
                <LoginComponents />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import LoginComponents from '../components/StartComponents/LoginComponents.vue';
</script>

<style scoped lang="scss">
.startview {
    width: 100dvw;
    height: 100dvh;
    background: url('../assets/images/bg.webp') no-repeat center center;
    background-size: cover;
    position: relative;
    .container{
        position: absolute;
        top: 0;
        left: 10%;
        width: 25%;
        height: 100%;
        background-color: rgba($color: #fff, $alpha: .1);
        backdrop-filter: blur(10px);
        padding: 4rem 2.5rem;
        .title{
            width: 100%;
            height: 3rem;
            display: flex;
            align-items: center;
            .logo{
                margin-right: 1rem;
            }
            .text{
                font-weight: bold;
                font-size: 1.2rem;
                white-space: nowrap;
            }
        }
        .components{
            width: 100%;
            height: calc(100% - 3rem);
        }
    }
}
</style>