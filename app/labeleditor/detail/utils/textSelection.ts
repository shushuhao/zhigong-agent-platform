// 文本选择相关的工具函数

// 选择范围接口
export interface SelectionRange {
    start: number;    // 在整个文本中的起始位置
    end: number;      // 在整个文本中的结束位置
    text: string;     // 选中的文字内容
}

/**
 * 获取当前用户选择的文本信息
 *
 * 工作原理：
 * 1. 获取浏览器的Selection对象
 * 2. 从Selection中提取Range信息
 * 3. 计算选择在整个文本中的位置
 * 4. 返回标准化的选择信息
 *
 * 使用场景：用户选择文字后，调用此函数获取选择信息
 */
export const getCurrentSelection = (): SelectionRange | null => {
    // 1. 获取浏览器选择对象
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        console.log('没有文本选择');
        return null;
    }

    // 2. 获取选择范围
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    // 3. 验证选择是否有效
    if (!selectedText) {
        console.log('选择的文本为空');
        return null;
    }

    // 4. 查找文本容器
    // 我们需要找到包含所有文本的容器元素
    const container = range.commonAncestorContainer;
    const containerElement = container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : container as Element;

    // 查找带有data-text-container属性的容器
    const textContainer = containerElement?.closest('[data-text-container]');
    if (!textContainer) {
        console.log('未找到文本容器');
        return null;
    }

    // 5. 计算选择在整个文本中的位置
    // 创建一个从容器开始到选择开始的范围
    const beforeRange = document.createRange();
    beforeRange.setStart(textContainer, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    // 计算起始位置：选择前的所有文字长度
    const start = beforeRange.toString().length;
    // 计算结束位置：起始位置 + 选择文字长度
    const end = start + selectedText.length;

    console.log('文本选择信息:', { start, end, text: selectedText });

    return {
        start,
        end,
        text: selectedText
    };
};

/**
 * 清除当前的文本选择
 *
 * 使用场景：
 * - 用户完成标注后清除选择
 * - 取消操作时清除选择
 * - 点击其他地方时清除选择
 */
export const clearSelection = (): void => {
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        console.log('已清除文本选择');
    }
};

/**
 * 检查选择是否与现有实体重叠
 *
 * @param selection 新的选择范围
 * @param existingEntities 现有的实体列表
 * @returns 是否有重叠
 *
 * 使用场景：在创建新实体前检查是否与现有实体重叠
 */
export const checkSelectionOverlap = (
    selection: SelectionRange,
    existingEntities: Array<{ start: number; end: number }>
): boolean => {
    return existingEntities.some(entity =>
        // 检查是否有重叠：新选择的开始 < 现有实体的结束 && 新选择的结束 > 现有实体的开始
        selection.start < entity.end && selection.end > entity.start
    );
};

/**
 * 获取选择位置的屏幕坐标
 *
 * @returns 选择位置的坐标，用于显示标签面板
 *
 * 使用场景：用户选择文字后，在选择位置附近显示标签面板
 */
export const getSelectionPosition = (): { x: number; y: number } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 返回选择区域的中心位置
    return {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10  // 在选择下方10px处显示面板
    };
};

/**
 * 验证文本选择是否有效
 *
 * @param selection 选择信息
 * @returns 验证结果和错误信息
 *
 * 验证规则：
 * - 选择不能为空
 * - 选择长度不能超过限制
 * - 选择不能包含特殊字符
 */
export const validateSelection = (selection: SelectionRange): {
    isValid: boolean;
    error?: string;
} => {
    // 检查是否为空
    if (!selection.text.trim()) {
        return { isValid: false, error: '选择的文本不能为空' };
    }

    // 检查长度限制
    if (selection.text.length > 100) {
        return { isValid: false, error: '选择的文本长度不能超过100个字符' };
    }

    // 检查是否只包含空白字符
    if (/^\s+$/.test(selection.text)) {
        return { isValid: false, error: '选择的文本不能只包含空白字符' };
    }

    // 检查是否包含换行符
    if (/\n/.test(selection.text)) {
        return { isValid: false, error: '选择的文本不能包含换行符' };
    }

    return { isValid: true };
};

// 根据位置创建选择
export const createSelectionFromRange = (
    container: Element,
    start: number,
    end: number
): void => {
    const textNodes = getTextNodes(container);
    let currentOffset = 0;
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;

    for (const node of textNodes) {
        const nodeLength = node.textContent?.length || 0;

        if (startNode === null && currentOffset + nodeLength > start) {
            startNode = node;
            startOffset = start - currentOffset;
        }

        if (currentOffset + nodeLength >= end) {
            endNode = node;
            endOffset = end - currentOffset;
            break;
        }

        currentOffset += nodeLength;
    }

    if (startNode && endNode) {
        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};

// 获取元素中的所有文本节点
const getTextNodes = (element: Element): Node[] => {
    const textNodes: Node[] = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
    );

    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    return textNodes;
};