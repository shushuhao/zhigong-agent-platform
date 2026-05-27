import { useEffect } from 'react';
import { useClassificationStore } from '../store';

export const useClassificationKeyboardShortcuts = (): void => {
    const { submitClassification, saveData } = useClassificationStore();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            // Ctrl/Cmd + S: 手动保存
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                saveData();
                return;
            }

            // Ctrl/Cmd + Enter: 提交分类结果
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                submitClassification();
                return;
            }

            // Esc: 取消当前操作（如果有的话）
            if (event.key === 'Escape') {
                // 可以在这里添加取消操作的逻辑
                console.log('Escape pressed');
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [submitClassification, saveData]);
};
