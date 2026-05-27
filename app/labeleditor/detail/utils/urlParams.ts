// URL 参数获取工具函数
// 支持微前端环境（wujie）和普通环境


export interface UrlParams {
    rId: string;
    tId: string;
    kindParam: string;
    name: string;
}

/**
 * 获取 URL 参数的函数 - 支持微前端环境
 * 按优先级尝试多种方式获取参数：
 * 1. 从 wujie props 获取（微前端环境）
 * 2. 从父窗口 URL 获取（如果可访问）
 * 3. 从 window.location 获取（兜底方案）
 *
 * 注意：此函数必须在客户端执行，不能在服务端执行
 * 因为 window.location 只在浏览器中可用
 */
export const getUrlParams = (): UrlParams => {
    let rId: string | null = null;
    let tId: string | null = null;
    let kindParam: string | null = null;
    let name: string | null = null;

    // 只在客户端执行 - 检查 window 对象是否存在
    if (typeof window !== 'undefined') {
        try {
            const windowParams = new URLSearchParams(window.location.search);
            rId = windowParams.get('rId');
            tId = windowParams.get('tId');
            name = windowParams.get('name');
            kindParam = windowParams.get('kind') || windowParams.get('type');

            console.log('From window.location:', { rId, tId, kindParam, name });
        } catch (error) {
            console.error('Error parsing URL parameters:', error);
        }
    } else {
        // 服务端环境 - 不能访问 window.location
        console.warn('getUrlParams called on server side - window is undefined');
    }

    const result = {
        rId: rId || '1',
        tId: tId || '',
        kindParam: kindParam || '1',
        name: name || '',
    };

    console.log('Final URL params:', result);
    return result;
};

/**
 * 根据 kind 参数确定标注类型
 */
export const getAnnotationType = (kindParam: string): 'entity-relation' | 'classification' | 'qa' | 'ranking' => {
    switch (kindParam) {
        case '1':
            return 'classification';
        case '2':
            return 'qa';
        case '3':
            return 'ranking';
        case '4':
        default:
            return 'entity-relation';
    }
};
