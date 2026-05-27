import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import styles from './RankingList.module.css';

interface RankingItem {
    id: string;
    content: string;
    order: number;
}

interface DraggableRankingItemProps {
    item: RankingItem;
    index: number;
    moveItem: (dragIndex: number, hoverIndex: number) => void;
    groupId: string; // 添加组ID，用于区分不同题目的拖拽区域
}

interface DragItem {
    index: number;
    id: string;
    groupId: string; // 添加组ID到拖拽项目
}

function DraggableRankingItem({
    item,
    index,
    moveItem,
    groupId,
}: DraggableRankingItemProps): React.ReactElement {
    const ref = useRef<HTMLDivElement>(null);

    // 为每个组创建唯一的ItemType
    const itemType = `RANKING_ITEM_${groupId}`;

    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: unknown }>({
        accept: itemType,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(draggedItem: DragItem, monitor: DropTargetMonitor) {
            if (!ref.current) {
                return;
            }

            // 只允许同组内的拖拽
            if (draggedItem.groupId !== groupId) {
                return;
            }

            const dragIndex = draggedItem.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Time to actually perform the action
            moveItem(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            draggedItem.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: itemType,
        item: () => ({ id: item.id, index, groupId }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0.4 : 1;
    drag(drop(ref));

    return (
        <div
            ref={ref}
            className={`${styles.rankingItem} ${isDragging ? styles.dragging : ''}`}
            style={{ opacity }}
            data-handler-id={handlerId}
        >
            <div className={styles.dragHandle}>
                <svg width='6' height='12' viewBox='0 0 6 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path fillRule='evenodd' clipRule='evenodd' d='M0 0H2V2H0V0ZM4 0H6V2H4V0ZM0 5H2V7H0V5ZM4 5H6V7H4V5ZM0 10H2V12H0V10ZM4 10H6V12H4V10Z' fill='#334155' />
                </svg>
            </div>

            <div className={styles.orderNumber}>
                {index + 1}
            </div>

            <div className={styles.itemContent}>
                {item.content}
            </div>
        </div>
    );
}

export default DraggableRankingItem;
