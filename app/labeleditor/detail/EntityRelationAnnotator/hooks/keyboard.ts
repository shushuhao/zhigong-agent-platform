import { useKeyPress } from 'ahooks';
import { useEntityRelationStore } from '../store';

interface UseKeyboardShortcutsOptions {
    enableAutoSave?: boolean;
    enableEscapeCancel?: boolean;
}

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
    const {
        enableAutoSave = true,
        enableEscapeCancel = true,
    } = options;

    const {
        saveData,
        cancelConnection,
        connecting,
        connectingFromId,
    } = useEntityRelationStore();

    // Ctrl/Cmd + S: 手动保存 (支持 Mac 和 Windows)
    useKeyPress(['ctrl.s', 'meta.s'], (event) => {
        console.log('快捷键被触发:', {
            enableAutoSave,
            event: event?.type,
            key: event?.key,
            ctrlKey: event?.ctrlKey,
            metaKey: event?.metaKey,
            platform: navigator.platform,
        });

        if (enableAutoSave) {
            // 阻止浏览器默认的保存行为
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            console.log('快捷键触发保存 - 调用 saveData');
            try {
                saveData(true); // 快捷键保存是手动操作，传递 isManual: true
                console.log('saveData 调用成功');
            } catch (error) {
                console.error('saveData 调用失败:', error);
            }
        } else {
            console.log('自动保存被禁用，跳过保存');
        }
    }, {
        exactMatch: true,
        useCapture: true,
        target: () => document,
    });

    // ESC: 取消连线
    useKeyPress('esc', (event) => {
        console.log('ESC键被触发:', {
            enableEscapeCancel,
            connecting,
            connectingFromId,
            event: event?.type,
        });

        // 总是阻止ESC键的默认行为，避免浏览器执行默认操作（如刷新页面）
        event?.preventDefault?.();
        event?.stopPropagation?.();

        if (enableEscapeCancel && connecting && connectingFromId) {
            console.log('ESC键取消连线');
            try {
                cancelConnection();
                console.log('cancelConnection 调用成功');
            } catch (error) {
                console.error('cancelConnection 调用失败:', error);
            }
        } else {
            console.log('ESC键条件不满足，但已阻止默认行为');
        }
    }, {
        target: () => document,
        useCapture: true, // 使用捕获阶段，确保优先处理
    });

    return {
        triggerSave: saveData,
        triggerCancelConnection: cancelConnection,
        isConnecting: connecting && !!connectingFromId,
    };
};
