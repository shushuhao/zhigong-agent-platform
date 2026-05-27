import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableRankingItem from './DraggableRankingItem';
import styles from './RankingList.module.css';

interface RankingItem {
    id: string;
    content: string;
    order: number;
}

interface RankingListProps {
    items: RankingItem[];
    onItemsReorder?: (items: RankingItem[]) => void;
    groupId: string; // 添加组ID参数
}

function RankingList({ items: initialItems, onItemsReorder, groupId }: RankingListProps): React.ReactElement {
    const [items, setItems] = useState(initialItems);

    const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
        const newItems = [...items];
        const [removed] = newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, removed);

        // 更新 order 字段
        const updatedItems = newItems.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        setItems(updatedItems);
        onItemsReorder?.(updatedItems);

        console.log('Items reordered:', updatedItems);
    }, [items, onItemsReorder]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={styles.rankingList}>
                {items.map((item, index) => (
                    <DraggableRankingItem
                        key={item.id}
                        item={item}
                        index={index}
                        moveItem={moveItem}
                        groupId={groupId}
                    />
                ))}
            </div>
        </DndProvider>
    );
}

export default RankingList;
