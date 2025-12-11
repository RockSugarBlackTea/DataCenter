import { post } from './index';

/**
 * 登录第一步,发起挑战应答
 * @param data 
 * @returns 
 */
export function handleLoginStep1(data: any) {
    return post('/api/login', data);
}

/**
 * 验证登录
 * @param data 
 * @returns 
 */
export function handleLoginStep2(data: any) {
    return post('/api/login/step2', data);
}

/**
 * 获取图片验证码
 */
export function getImageCaptcha(data:any) { 
    return post('/api/captcha',data);
}

/**
 * 发送邮箱验证码
 * @param data 
 * @returns
 */
export function sendEmailCode(data: any) { 
    return post('/api/send-email', data);
}

/**
 * 注册用户
 */
export function handleRegisterServer(data: any) {
    return post('/api/register', data);
}