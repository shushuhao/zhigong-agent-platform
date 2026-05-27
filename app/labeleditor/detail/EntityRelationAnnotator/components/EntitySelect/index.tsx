import React, { useEffect, useRef } from 'react';
import { Card } from 'antd';
import styles from './index.module.css';
import { useEntityRelationStore } from '../../store';

interface EntitySelectProps {
    handleEntityLabelSelect: (labelId: string) => void;
    position: { x: number; y: number } | null;
}

function EntitySelect({ handleEntityLabelSelect }: EntitySelectProps): React.ReactElement | null {
    const {
        data,
        selectedEntityLabelId,
        selectedText,
        continuousAnnotation,
        showEntityDropdown,
        dropdownPosition,
        hideEntitySelectionDropdown,
    } = useEntityRelationStore();

    const dropdownRef = useRef<HTMLDivElement>(null);

    // 处理点击外部区域关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                hideEntitySelectionDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [hideEntitySelectionDropdown]);

    const handleLabelClick = async (labelId: string): Promise<void> => {
        console.log('EntitySelect: 处理标签点击', labelId);

        try {
            // 调用父组件传入的处理函数
            await handleEntityLabelSelect(labelId);
            console.log('EntitySelect: 标签选择处理完成');

            // 确保下拉框被隐藏
            hideEntitySelectionDropdown();
        } catch (error) {
            console.error('EntitySelect: 标签选择处理失败', error);
            // 即使出错也要隐藏下拉框
            hideEntitySelectionDropdown();
        }
    };

    if (!showEntityDropdown || !dropdownPosition || !data) {
        console.log('EntitySelect: 不显示下拉框', {
            showEntityDropdown,
            hasDropdownPosition: !!dropdownPosition,
            hasData: !!data,
        });
        return null;
    }

    console.log('EntitySelect: 显示下拉框', {
        showEntityDropdown,
        dropdownPosition,
        selectedText,
        entityLabelsCount: data.entityLabels.length,
    });

    return (
        <div
            ref={dropdownRef}
            className={styles.entityDropdown}
            style={{
                position: 'fixed',
                left: dropdownPosition.x, // 直接使用传入的x坐标，与文本左侧对齐
                top: dropdownPosition.y,
                zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    hideEntitySelectionDropdown();
                }
            }}
            role='menu'
            tabIndex={-1}
        >
            <Card size='small' style={{ minWidth: 144, border: 'none', boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.1)' }}>
                <div className={styles.dropdownContent}>
                    {data.entityLabels.map((label) => (
                        <div
                            key={label.id}
                            className={`${styles.dropdownItem} ${
                                selectedEntityLabelId === label.id ? styles.selected : ''
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('EntitySelect: 点击标签:', label.name, label.id);
                                handleLabelClick(label.id);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('EntitySelect: 键盘选择标签:', label.name, label.id);
                                    handleLabelClick(label.id);
                                }
                            }}
                            role='menuitem'
                            tabIndex={0}
                        >
                            <div
                                className={styles.labelColor}
                                style={{ backgroundColor: label.color }}
                            />
                            <span>{label.name}</span>
                            {selectedEntityLabelId === label.id && continuousAnnotation && (
                                <span className={styles.continuousHint}>连续</span>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default EntitySelect;
