import React, {
    useState,
    useEffect,
    useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import {
    Checkbox,
    Button,
    Dropdown,
    Modal,
} from 'antd';
import {
    EllipsisOutlined,
} from '@ant-design/icons';
import { useDataContext } from '../../contexts/DataContext';
import { getUrlParams } from '../../utils/urlParams';
import { useEntityRelationStore } from '../../EntityRelationAnnotator/store';
import styles from './index.module.css';

function Header(): React.ReactElement {
    const router = useRouter();
    const { name } = getUrlParams();
    const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');
    const [shortcutModalVisible, setShortcutModalVisible] = useState(false);
    const [lastTaskName, setLastTaskName] = useState<string>(''); // 保存上一次的任务名称
    const [showTutorialTooltip, setShowTutorialTooltip] = useState(false); // 控制教程提示显示
    const [dropdownOpen, setDropdownOpen] = useState(false); // 控制 Dropdown 显示
    const [hasClosedTutorial, setHasClosedTutorial] = useState(false); // 记录是否已关闭过教程
    const [previousShowTutorial, setPreviousShowTutorial] = useState<boolean | null>(null); // 记录上一次的 showTutorial 状态
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 }); // Tooltip 位置
    // 自动保存定时器引用
    const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // 从 DataContext 获取通用数据
    const dataContext = useDataContext();
    const {
        noAnnotationRequired,
        toggleNoAnnotationRequired,
        submitting,
    } = dataContext;
    const {
        data: contextData,
        saveData: contextSaveData,
        submitData: contextSubmitData,
        registerAutoSaveTimerCleaner,
    } = dataContext;

    // 监听任务ID变化，强制重新创建定时器
    const currentTaskId = contextData?.id;
    const currentNotStartedNum = contextData?.requirement_info?.not_started_num;

    // 只保留 entityRelationStore 用于教程功能
    const entityRelationStore = useEntityRelationStore();
    const { showTutorial } = entityRelationStore;

    // 统一的数据和方法，所有类型都使用相同的提交接口
    const getCurrentPageData = (): {
        data: any;
        loading: boolean;
        submitAnnotation: () => Promise<void>;
        continuousAnnotation: boolean;
        toggleContinuousAnnotation: () => void;
        autoSave: () => Promise<void>;
        saveData: () => Promise<void>;
    } => {
        console.log('contextData', contextData)
        // if (!contextData) {
        //     return {
        //         data: null,
        //         loading: true,
        //         submitAnnotation: async (): Promise<void> => {},
        //         continuousAnnotation: false,
        //         toggleContinuousAnnotation: (): void => {},
        //         autoSave: async (): Promise<void> => {},
        //         saveData: async (): Promise<void> => {},
        //     };
        // }

        // 统一使用 DataContext 的方法，不再区分类型
        return {
            data: contextData,
            loading: false,
            submitAnnotation: (): Promise<void> => contextSubmitData(2, noAnnotationRequired ? 0 : 1),
            continuousAnnotation: noAnnotationRequired,
            toggleContinuousAnnotation: toggleNoAnnotationRequired,
            autoSave: (): Promise<void> => contextSaveData(false), // 自动保存，不显示提示
            saveData: (): Promise<void> => contextSaveData(true), // 手动保存，显示提示
        };
    };

    const currentPageData = getCurrentPageData();
    const {
        data,
        submitAnnotation,
        continuousAnnotation,
        toggleContinuousAnnotation,
    } = currentPageData;

    // 当有新数据时，保存任务名称
    useEffect(() => {
        if (contextData?.name && contextData.name !== lastTaskName) {
            setLastTaskName(contextData.name);
        }
    }, [contextData?.name, lastTaskName]);

    // 格式化时间的通用函数
    const formatTime = (): string => {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    };

    // 页面初始化时设置当前时间
    useEffect(() => {
        setLastAutoSaveTime(formatTime());
    }, []);

    // 监听 showTutorial 状态变化，只有当从 true 变为 false 时才触发提示
    useEffect(() => {
        // 记录当前状态
        if (previousShowTutorial === null) {
            setPreviousShowTutorial(showTutorial);
            return;
        }

        // 检测状态变化：从 true 变为 false（用户手动关闭了教程弹窗）
        if (previousShowTutorial === true && showTutorial === false && !hasClosedTutorial) {
            console.log('检测到教程弹窗关闭，显示 Dropdown 和 Tooltip');
            setHasClosedTutorial(true);
            setDropdownOpen(true); // 自动打开 Dropdown
            setShowTutorialTooltip(true); // 显示 Tooltip

            // 延迟计算菜单项位置，等待 Dropdown 渲染完成
            setTimeout(() => {
                const tutorialMenuItem = document.getElementById('tutorial-menu-item');
                if (tutorialMenuItem) {
                    const rect = tutorialMenuItem.getBoundingClientRect();
                    setTooltipPosition({
                        top: rect.top + rect.height / 2, // 垂直居中对齐菜单项
                        left: rect.left - 200, // 显示在菜单项左侧，预留足够空间给 tooltip 文字
                    });
                    console.log('计算到的菜单项位置:', {
                        menuTop: rect.top,
                        menuLeft: rect.left,
                        tooltipTop: rect.top + rect.height / 2,
                        tooltipLeft: rect.left - 200,
                    });
                }
            }, 100);
        }

        // 更新上一次的状态
        setPreviousShowTutorial(showTutorial);
    }, [showTutorial, previousShowTutorial, hasClosedTutorial]);

    // 添加点击页面隐藏 Dropdown 和 Tooltip 的逻辑
    useEffect(() => {
        const handleGlobalClick = (): void => {
            console.log('全局点击事件触发，当前状态:', { dropdownOpen, showTutorialTooltip });
            if (dropdownOpen || showTutorialTooltip) {
                console.log('隐藏 Dropdown 和 Tooltip');
                setDropdownOpen(false);
                setShowTutorialTooltip(false);
            }
        };

        // 只有在显示状态时才添加监听器
        if (dropdownOpen || showTutorialTooltip) {
            // 延迟添加监听器，避免立即触发
            const timer = setTimeout(() => {
                document.addEventListener('click', handleGlobalClick);
            }, 100);

            return (): void => {
                clearTimeout(timer);
                document.removeEventListener('click', handleGlobalClick);
            };
        }

        return undefined;
    }, [dropdownOpen, showTutorialTooltip]);

    // 手动保存（暂存）
    const handleManualSave = async (): Promise<void> => {
        try {
            // 调用 submitData 进行暂存，根据"无需标注"状态设置 result_type
            const resultType = noAnnotationRequired ? 0 : 1;
            await contextSubmitData(1, resultType);
            setLastAutoSaveTime(formatTime());
        } catch (error) {
            console.error('手动暂存失败:', error);
        }
    };

    // 组件挂载和卸载日志
    useEffect(() => {
        console.log('Header: 组件已挂载');
        return () => {
            console.log('Header: 组件即将卸载');
        };
    }, []);

    // 使用 ref 来保存最新的 contextSubmitData 函数，避免依赖项变化导致定时器重新创建
    const contextSubmitDataRef = useRef(contextSubmitData);
    contextSubmitDataRef.current = contextSubmitData;

    // 自动保存功能 - 每3秒自动暂存
    useEffect(() => {
        // 检查必要的依赖项
        if (!registerAutoSaveTimerCleaner || !contextData) {
            return (): void => {};
        }

        // 如果已经有定时器在运行，先清理它
        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
            autoSaveIntervalRef.current = null;
        }

        // 定义清理定时器的函数
        const clearTimerFunction = (): void => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
                autoSaveIntervalRef.current = null;
            }
        };

        // 注册清理函数到DataContext
        registerAutoSaveTimerCleaner(clearTimerFunction);

        // 启动自动保存定时器
        autoSaveIntervalRef.current = setInterval(async () => {
            try {
                // 获取当前的状态值，而不是依赖闭包中的值
                const currentNoAnnotationRequired = dataContext.noAnnotationRequired;
                const resultType = currentNoAnnotationRequired ? 0 : 1;

                // 使用 ref 中的最新函数
                await contextSubmitDataRef.current(1, resultType, false);
                setLastAutoSaveTime(formatTime());
            } catch (error) {
                // 静默处理错误
            }
        }, 30000);

        // 卸载时清理定时器
        return clearTimerFunction;
    }, [registerAutoSaveTimerCleaner, currentTaskId, currentNotStartedNum]);

    // 快捷键保存功能
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            // Ctrl+S 或 Cmd+S
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault(); // 阻止浏览器默认保存行为
                handleManualSave();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return (): void => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleManualSave]);

    // 快捷键数据
    const shortcuts = contextData?.type === 'entity-relation' ? [
        { key: 'Ctrl/Cmd + S', description: '手动保存当前标注' },
        { key: 'Esc', description: '取消关系连线操作' },
    ] : [
        { key: 'Ctrl/Cmd + S', description: '手动保存当前标注' },
    ];

    // 菜单项
    const menuItems = [
        {
            key: 'shortcuts',
            label: (
                <div
                    onClick={(): void => setShortcutModalVisible(true)}
                    onKeyDown={(e): void => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setShortcutModalVisible(true);
                        }
                    }}
                    role='button'
                    tabIndex={0}
                >
                    快捷键
                </div>
            ),
        },
        contextData?.type === 'entity-relation' && {
            key: 'tutorial',
            label: (
                <div
                    id='tutorial-menu-item'
                    onClick={(): void => {
                        // 根据当前页面类型调用对应的教程显示函数
                        if (contextData?.type === 'entity-relation') {
                            entityRelationStore.showTutorialModal();
                        }
                    }}
                    onKeyDown={(e): void => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            if (contextData?.type === 'entity-relation') {
                                entityRelationStore.showTutorialModal();
                            }
                        }
                    }}
                    role='button'
                    tabIndex={0}
                >
                    使用教程
                </div>
            ),
        },
    ].filter((item): item is { key: string; label: React.ReactElement } => Boolean(item));

    // 返回列表
    const handleBack = (): void => {
        // 返回前清理自动保存定时器
        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
            autoSaveIntervalRef.current = null;
        }
        router.back();
    };
    return (
        <>
            <div className={styles.topBar}>
                <div className={styles.topLeft}>
                    {/* <Button
                        type='text'
                        icon={<ArrowLeftOutlined />}
                        className={styles.backButton}
                    /> */}
                    <svg style={{ cursor: 'pointer' }} onClick={(): void => handleBack()} width='16' height='12' viewBox='0 0 16 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path fillRule='evenodd' clipRule='evenodd' d='M3.6405 6.74988L7.13236 10.2417L6.07171 11.3024L0.768406 5.9991L6.07171 0.6958L7.13237 1.75646L3.63895 5.24988L15.125 5.24988L15.125 6.74988L3.6405 6.74988Z' fill='#1E293B' />
                    </svg>

                    <div className={styles.titleSection}>
                        <div className={styles.titleText} style={{ display: 'flex' }}>
                            <div style={{ marginRight: 4 }}>{name || data?.name || lastTaskName || '加载中...'}</div>
                            <div style={{ color: '#0F172A', fontWeight: 'normal' }}>
                                (剩余任务:
                                {' '}
                                {data?.requirement_info?.not_started_num || 0}
                                )
                            </div>
                        </div>
                        <div className={styles.titleTime}>
                            自动保存于
                            {' '}
                            {lastAutoSaveTime}
                        </div>
                    </div>
                </div>

                <div className={styles.topRight}>
                    <div className={styles.continuousToggle}>
                        <Checkbox
                            checked={continuousAnnotation}
                            onChange={toggleContinuousAnnotation}
                        />
                        <span className={styles.switchLabel}>
                            无需标注
                        </span>
                    </div>
                    <Button
                        type='primary'
                        onClick={submitAnnotation}
                        loading={submitting}
                        disabled={submitting}
                    >
                        {submitting ? '提交中...' : '提交'}
                    </Button>
                    <div style={{ position: 'relative' }}>
                        <Dropdown
                            overlayStyle={{ width: '124px' }}
                            menu={{ items: menuItems }}
                            trigger={['click']}
                            placement='bottomRight'
                            open={dropdownOpen}
                            onOpenChange={(open): void => {
                                setDropdownOpen(open);
                                // 如果 Dropdown 关闭，同时关闭 Tooltip
                                if (!open && showTutorialTooltip) {
                                    setShowTutorialTooltip(false);
                                }
                            }}
                        >
                            <Button
                                type='text'
                                icon={<EllipsisOutlined />}
                                className={styles.moreButton}
                            />
                        </Dropdown>

                        {/* 独立的 Tooltip，指向菜单项 */}
                        {showTutorialTooltip && tooltipPosition.top > 0 && (
                            <div
                                style={{
                                    position: 'fixed', // 使用 fixed 定位，相对于视口
                                    top: `${tooltipPosition.top + 10}px`,
                                    left: `${tooltipPosition.left - 30}px`,
                                    transform: 'translateY(-50%)',
                                    background: '#fff',
                                    color: '#000',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap',
                                    zIndex: 9999,
                                    pointerEvents: 'none',
                                }}
                            >
                                可以在这里再次查看教程 👉
                                {/* 箭头指向右侧菜单项 */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '-8px',
                                        transform: 'translateY(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid #d8d8d8',
                                        borderTop: '8px solid transparent',
                                        borderBottom: '8px solid transparent',
                                    }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '-9px',
                                        transform: 'translateY(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '9px solid #fff',
                                        borderTop: '9px solid transparent',
                                        borderBottom: '9px solid transparent',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 快捷键弹窗 */}
            <Modal
                title='快捷键列表'
                open={shortcutModalVisible}
                onCancel={(): void => setShortcutModalVisible(false)}
                width={500}
                footer={null}
            >
                <div className={styles.shortcutList}>
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className={styles.shortcutItem}>
                            <div className={styles.shortcutKey}>
                                {shortcut.key}
                            </div>
                            <div className={styles.shortcutDescription}>
                                {shortcut.description}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
}

export default Header;
