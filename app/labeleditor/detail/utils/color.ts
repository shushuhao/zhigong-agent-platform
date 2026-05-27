// 计算浅色版本的实体颜色
export const getLighterColor = (color: string): string => {
    // 将颜色转换为更浅的版本
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        // 增加亮度，使颜色变浅（增加到80%让颜色更浅）
        const lighterR = Math.min(255, r + (255 - r) * 0.8);
        const lighterG = Math.min(255, g + (255 - g) * 0.8);
        const lighterB = Math.min(255, b + (255 - b) * 0.8);

        return `rgb(${Math.round(lighterR)}, ${Math.round(lighterG)}, ${Math.round(lighterB)})`;
    }
    return color;
};

// 将颜色转换为带透明度的RGBA格式
export const addOpacityToColor = (color: string, opacity: number): string => {
    // 处理十六进制颜色 #RRGGBB
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // 处理RGB颜色 rgb(r, g, b)
    if (color.startsWith('rgb(')) {
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }

    // 处理RGBA颜色 rgba(r, g, b, a) - 替换现有的透明度
    if (color.startsWith('rgba(')) {
        const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
        if (rgbaMatch) {
            const [, r, g, b] = rgbaMatch;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }

    // 如果无法解析，返回原颜色
    return color;
};
