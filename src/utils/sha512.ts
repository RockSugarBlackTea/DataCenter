/**
 * SHA512 包装模块
 */

/**
 * SHA512 哈希函数
 * @param data 输入数据（Uint8Array 或字符串）
 * @returns 十六进制格式的哈希值
 */
export function sha512(data: Uint8Array | string): string {
    // 使用全局 sha512 函数（由 index.html 中引入的 js-sha512 库提供）
    if (typeof window !== 'undefined' && (window as any).sha512) {
        const result = (window as any).sha512(data);
        // 如果返回的是对象，尝试调用 toString 或 hex
        if (typeof result === 'object' && result !== null) {
            return result.toString ? result.toString() : result.hex ? result.hex() : String(result);
        }
        return String(result);
    }

    throw new Error('SHA512 库未加载，请确保 index.html 中引入了 sha512.min.js');
}
