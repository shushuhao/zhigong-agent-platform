/**
 * 计算文本选择在原始文本中的位置
 */
export function getSelectionRange(textElement: HTMLElement): { start: number; end: number; text: string } | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);

    // 计算选择范围在原始文本中的位置
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(textElement);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) return null;

    return {
        start,
        end: start + selectedText.length,
        text: selectedText,
    };
}

/**
 * 清除文本选择
 */
export function clearTextSelection(): void {
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
    }
}

/**
 * 检查两个标注是否重叠
 */
export function isAnnotationOverlapping(
    annotation1: { start: number; end: number },
    annotation2: { start: number; end: number },
): boolean {
    return !(annotation1.end <= annotation2.start || annotation2.end <= annotation1.start);
}

/**
 * 验证新标注是否与现有标注冲突
 */
export function validateNewAnnotation(
    newAnnotation: { start: number; end: number },
    existingAnnotations: any[],
): { isValid: boolean; conflictingAnnotations: any[] } {
    const conflictingAnnotations = existingAnnotations.filter((annotation) => isAnnotationOverlapping(newAnnotation, annotation),
    );

    return {
        isValid: conflictingAnnotations.length === 0,
        conflictingAnnotations,
    };
}

/**
 * 合并重叠的标注（如果需要的话）
 */
export function mergeOverlappingAnnotations(annotations: any[]): any[] {
    if (annotations.length <= 1) return annotations;

    // 按开始位置排序
    const sorted = [...annotations].sort((a, b) => a.start - b.start);
    const merged: any[] = [];

    for (const current of sorted) {
        const last = merged[merged.length - 1];

        if (!last || !isAnnotationOverlapping(last, current)) {
            merged.push(current);
        } else if (last.labelId === current.labelId) {
            // 如果重叠且是同一标签，则合并
            last.end = Math.max(last.end, current.end);
            last.text += current.text.slice(Math.max(0, last.end - current.start));
        } else {
            // 不同标签的重叠，保留两个
            merged.push(current);
        }
    }

    return merged;
}

/**
 * 导出标注数据为不同格式
 */
export function exportAnnotationsToFormat(
    content: string,
    annotations: any[],
    format: 'json' | 'csv' | 'txt' = 'json',
): string {
    switch (format) {
        case 'json':
            return JSON.stringify({
                content,
                annotations: annotations.map((ann) => ({
                    start: ann.start,
                    end: ann.end,
                    text: ann.text,
                    label: ann.labelName,
                    labelId: ann.labelId,
                })),
            }, null, 2);

        case 'csv': {
            const csvHeader = 'start,end,text,label\n';
            const csvRows = annotations.map((ann) => `${ann.start},${ann.end},"${ann.text.replace(/"/g, '""')}","${ann.labelName}"`,
            ).join('\n');
            return csvHeader + csvRows;
        }

        case 'txt':
            return annotations.map((ann) => `${ann.start}-${ann.end}: "${ann.text}" [${ann.labelName}]`,
            ).join('\n');

        default:
            return '';
    }
}

/**
 * 从文本中提取实体的简单规则
 */
export function extractEntitiesWithRules(text: string): Array<{ start: number; end: number; text: string; type: string }> {
    const entities: Array<{ start: number; end: number; text: string; type: string }> = [];

    // 简单的日期匹配
    const dateRegex = /\d{4}年\d{1,2}月|\d{4}年|\d{1,2}月\d{1,2}日/g;
    let match = dateRegex.exec(text);
    while (match !== null) {
        entities.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            type: 'Date',
        });
        match = dateRegex.exec(text);
    }

    // 简单的组织机构匹配（以"公司"、"集团"等结尾）
    const orgRegex = /[\u4e00-\u9fa5]+(?:公司|集团|企业|机构|组织|协会|基金会)/g;
    match = orgRegex.exec(text);
    while (match !== null) {
        entities.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            type: 'Organization',
        });
        match = orgRegex.exec(text);
    }

    return entities;
}

/**
 * 计算标注统计信息
 */
export function calculateAnnotationStats(annotations: any[]): {
    total: number;
    byLabel: Record<string, number>;
    coverage: number;
    totalLength: number;
} {
    const byLabel: Record<string, number> = {};
    let totalLength = 0;

    annotations.forEach((ann) => {
        byLabel[ann.labelName] = (byLabel[ann.labelName] || 0) + 1;
        totalLength += ann.end - ann.start;
    });

    return {
        total: annotations.length,
        byLabel,
        coverage: 0, // 需要传入文档总长度来计算
        totalLength,
    };
}

/**
 * 搜索标注
 */
export function searchAnnotations(
    annotations: any[],
    query: string,
    searchBy: 'text' | 'label' | 'both' = 'both',
): any[] {
    const lowerQuery = query.toLowerCase();

    return annotations.filter((ann) => {
        switch (searchBy) {
            case 'text':
                return ann.text.toLowerCase().includes(lowerQuery);
            case 'label':
                return ann.labelName.toLowerCase().includes(lowerQuery);
            case 'both':
                return ann.text.toLowerCase().includes(lowerQuery) ||
               ann.labelName.toLowerCase().includes(lowerQuery);
            default:
                return false;
        }
    });
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 验证标注数据的完整性
 */
export function validateAnnotationData(
    content: string,
    annotations: any[],
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    annotations.forEach((ann, index) => {
    // 检查位置是否有效
        if (ann.start < 0 || ann.end > content.length || ann.start >= ann.end) {
            errors.push(`标注 ${index + 1}: 位置无效 (${ann.start}-${ann.end})`);
        }

        // 检查文本是否匹配
        const actualText = content.slice(ann.start, ann.end);
        if (actualText !== ann.text) {
            errors.push(`标注 ${index + 1}: 文本不匹配，期望 "${ann.text}"，实际 "${actualText}"`);
        }

        // 检查必要字段
        if (!ann.id || !ann.labelId || !ann.labelName) {
            errors.push(`标注 ${index + 1}: 缺少必要字段`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}
