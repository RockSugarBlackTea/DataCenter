<template>
    <div
        ref="inputBox"
        :class="['inputBox', isFocused ? 'focusInputBox' : '']"
    >
        <div
            ref="placeholderRef"
            :class="['placeholder', isFocused ? 'focusPlaceholder' : '']"
        >{{ placeholderText }}</div>
        <div class="container">
            <input
                ref="inputRef"
                class="input"
                :type="type"
                v-model="inputValue"
                @focus="bindInputFocus"
                @blur="bindInputUnfocus"
            />
            <div
                v-if="isClearIcon && inputValue !== ''"
                class="clearIcon"
            >
                <img
                    src="../../assets/icon/clear.svg"
                    alt="clear"
                    loading="lazy"
                    @click="clearInputValue"
                    class="clear"
                    v-if="type !== 'password'"
                />
                <img
                    src="../../assets/icon/passwordNoDisplay.svg"
                    alt="nodisplay"
                    loading="lazy"
                    @click="displayPassword"
                    ref="passwordIconRef"
                    v-else
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineExpose } from 'vue';

const props = defineProps<{
    placeholder?: string;
    type?: string;
    isClearIcon?: boolean;
    value?: string;
}>();
const inputBox = ref<HTMLDivElement | null>(null); // 输入框整体的DOM
const inputRef = ref<HTMLInputElement | null>(null); // 输入框的DOM
const placeholderRef = ref<HTMLDivElement | null>(null); // 占位符的DOM
const passwordIconRef = ref<HTMLImageElement | null>(null); // 密码显示图标的DOM
const inputValue = ref(props.value || ''); // 输入框的值
const isFocused = ref(false); // 输入框是否聚焦状态
const placeholderText = ref(props.placeholder || '请输入内容'); // 占位符文本
const type = ref(props.type || 'text'); // 输入框类型
const isClearIcon = ref(props.isClearIcon || true); // 是否显示清除图标(默认显示)

function bindInputFocus() {
    if (placeholderRef.value) {
        isFocused.value = true;
    }
}

function bindInputUnfocus() {
    if (inputValue.value === '' && placeholderRef.value) {
        isFocused.value = false;
    }
}

function clearInputValue() {
    inputValue.value = '';
}

function displayPassword() {
    if (type.value === 'password') {
        type.value = 'text';
        if (passwordIconRef.value) {
            passwordIconRef.value.src = '../../assets/icon/passwordDisplay.svg';
        }
    } else {
        type.value = 'password';
        if (passwordIconRef.value) {
            passwordIconRef.value.src = '../../assets/icon/passwordNoDisplay.svg';
        }
    }
}

defineExpose({
    getValue: () => inputValue.value
});
</script>

<style scoped lang="scss">
.focusInputBox {
    border-bottom: 1px solid #307def !important;
}

.inputBox {
    width: 100%;
    height: 4rem;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    transition: all .5s;
    margin: 1.2rem 0;

    .placeholder {
        position: absolute;
        color: rgba(255, 255, 255, 0.3);
        top: 50%;
        left: .5rem;
        transform: translateY(-50%);
        transition: all .5s;
        padding: 0 .2rem;
        pointer-events: none;
        font-size: 1rem;
    }

    .focusPlaceholder {
        top: 0%;
        left: 5%;
        font-size: 0.8rem;
        transform: translateY(0%);
        color: #307def;
    }

    .container {
        width: 100%;
        height: 100%;
        position: relative;

        .input {
            width: 100%;
            position: absolute;
            bottom: 0;
            height: 75%;
            border: none;
            outline: none;
            font-size: 1rem;
            background-color: transparent;
            padding: 0 .5rem;
            font-family: 'zk';
        }

        .clearIcon {
            height: 75%;
            position: absolute;
            bottom: 0;
            right: .2rem;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 1rem;
                height: 1rem;
                cursor: pointer;
            }
        }
    }
}
</style>