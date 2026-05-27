import React, { useState, useRef } from 'react';
import { DownOutlined } from '@ant-design/icons';
import styles from './index.module.css';

interface CollapsePanelProps {
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
    indicatorColor?: string; // 添加色块颜色属性
}

interface CustomCollapseProps {
    items: CollapsePanelProps[];
    expandedKeys?: Set<string>; // 外部控制的展开状态
    onToggle?: (key: string) => void; // 展开状态变化回调
}

function CustomCollapse({ items, expandedKeys: externalExpandedKeys, onToggle }: CustomCollapseProps): React.ReactElement {
    const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(new Set());
    const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // 使用外部状态或内部状态
    const expandedKeys = externalExpandedKeys || internalExpandedKeys;

    const togglePanel = (key: string): void => {
        if (onToggle) {
            // 如果有外部回调，使用外部状态管理
            onToggle(key);
        } else {
            // 否则使用内部状态管理
            const newExpandedKeys = new Set(internalExpandedKeys);
            if (internalExpandedKeys.has(key)) {
                newExpandedKeys.delete(key);
            } else {
                newExpandedKeys.add(key);
            }
            setInternalExpandedKeys(newExpandedKeys);
        }
    };

    return (
        <div className={styles.collapse}>
            {items.map((item) => {
                const isExpanded = expandedKeys.has(item.key);
                return (
                    <div key={item.key} className={styles.collapseItem}>
                        <div
                            className={`${styles.collapseHeader} ${isExpanded ? styles.headerExpanded : ''}`}
                            onClick={() => togglePanel(item.key)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    togglePanel(item.key);
                                }
                            }}
                            role='button'
                            tabIndex={0}
                            style={{ position: 'relative' }}
                        >
                            {item.indicatorColor && (
                                <div
                                    className={styles.labelIndicator}
                                    style={{
                                        backgroundColor: item.indicatorColor,
                                        borderRadius: expandedKeys.has(item.key) ? '0' : '4px 0 0 4px',
                                    }}

                                />
                            )}
                            <div className={styles.headerContent}>
                                {item.label}
                            </div>
                            <div
                                className={styles.expandIcon}
                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <DownOutlined />
                            </div>
                        </div>
                        <div
                            ref={(ref) => { contentRefs.current[item.key] = ref; }}
                            className={styles.collapseContent}
                            style={{
                                maxHeight: isExpanded ? 'none' : '0',
                                opacity: isExpanded ? 1 : 0,
                                transition: 'max-height 0.3s ease, opacity 0.3s ease',
                            }}
                        >
                            {item.children}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default CustomCollapse;
