import { post } from './index';

export function handleLoginStep1(data: any) {
    return post('/api/login', data);
}

export function handleLoginStep2(data: any) {
    return post('/api/login/step2', data);
}