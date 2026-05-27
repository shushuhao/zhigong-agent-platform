import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../contexts/DataContext';
import { RankingData, RankingPrompt, RankingResponse } from '../types';
import RankingList from './RankingList';
import styles from './RankingContent.module.css';

interface RankingContentProps {
    data: RankingData;
}

function RankingContent({ data }: RankingContentProps): React.ReactElement {
    const { updateData } = useDataContext();

    // 为每个 prompt 维护独立的排序状态
    const [promptsState, setPromptsState] = useState<RankingPrompt[]>(
        data.prompts?.map((prompt) => ({
            ...prompt,
            responses: [...(prompt?.responses || [])], // 深拷贝 responses 数组
        })) || [],
    );

    // 当 data.prompts 变化时，更新本地状态
    useEffect(() => {
        setPromptsState(
            data.prompts?.map((prompt) => ({
                ...prompt,
                responses: [...(prompt?.responses || [])],
            })) || [],
        );
    }, [data.prompts]);

    // 处理单个 prompt 的排序变化
    const handlePromptReorder = (promptId: number, newResponses: RankingResponse[]): void => {
        const updatedPrompts = promptsState.map((prompt) => (prompt.id === promptId ?
            { ...prompt, responses: newResponses } :
            prompt));

        setPromptsState(updatedPrompts);

        // 更新 DataContext 中的数据
        const updatedData = {
            ...data,
            prompts: updatedPrompts,
        };
        updateData(updatedData as any); // 临时使用 any 类型，因为 updateData 期望完整的 AnnotationData

        console.log(`Prompt ${promptId} reordered:`, newResponses.map((r) => ({ id: r.id, response: r.response })));
    };

    const hasContent = data.content && data.content.trim().length > 0;

    return (
        <div className={hasContent ? styles.withContentLayout : styles.noContentLayout}>
            {hasContent && (
                /* 左侧内容区域 - 只有当有内容时才显示 */
                <div className={styles.contentSection}>
                    <div className={styles.contentText}>
                        {data.content}
                    </div>
                </div>
            )}

            {/* 右侧排序区域 */}
            <div className={styles.rankingSection}>
                <div className={styles.sectionTitle}>问答排序</div>
                <div className={styles.rankingContent}>
                    {promptsState && promptsState.length > 0 ? promptsState.map((prompt, index) => (
                        <React.Fragment key={prompt.id}>
                            <div className={styles.promptContainer}>
                                {
                                    prompt.prompt && (
                                        <div className={styles.questionTitle}>
                                            <svg style={{ marginRight: 5 }} width='6' height='6' viewBox='0 0 6 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                <path fillRule='evenodd' clipRule='evenodd' d='M3.41914 0.0996094C3.52959 0.0996094 3.61909 0.189223 3.61909 0.299683L3.61824 2.3446L5.45466 1.74829C5.55971 1.71416 5.67248 1.77154 5.70662 1.87659L5.95393 2.63745C5.98806 2.7425 5.93056 2.8554 5.82551 2.88953L3.97517 3.48962L5.20039 5.17627C5.26531 5.26563 5.24556 5.39065 5.1562 5.45557L4.50899 5.92578C4.41963 5.9907 4.29449 5.97095 4.22957 5.88159L2.96321 4.13757L1.69002 5.89075C1.6251 5.98011 1.49996 5.99999 1.4106 5.93506L0.76338 5.46484C0.67402 5.39992 0.654271 5.27479 0.719191 5.18542L1.9742 3.45569L0.169508 2.86963C0.0644584 2.8355 0.00696045 2.72273 0.0410905 2.61768L0.288283 1.85681C0.322413 1.75176 0.435186 1.69426 0.540236 1.72839L2.41817 2.33765L2.41914 0.299683C2.41914 0.189223 2.50863 0.0996094 2.61909 0.0996094H3.41914Z' fill='#EF4444' />
                                            </svg>

                                            <div style={{ fontWeight: 500 }}>{prompt.prompt}</div>
                                        </div>
                                    )
                                }

                                <RankingList
                                    items={prompt?.responses?.map((response) => ({
                                        id: response?.id?.toString(),
                                        content: response?.response,
                                        order: 0, // order 在新格式中不需要，但保持兼容性
                                    }))}
                                    onItemsReorder={(newItems) => {
                                        const newResponses = newItems.map((item) => ({
                                            id: parseInt(item.id, 10),
                                            response: item.content,
                                        }));
                                        handlePromptReorder(prompt.id, newResponses);
                                    }}
                                    groupId={prompt.id.toString()}
                                />
                            </div>

                            {/* 在每个题目后面添加横线，除了最后一个 */}
                            {index < promptsState.length - 1 && (
                                <div className={styles.promptDivider} />
                            )}
                        </React.Fragment>
                    )) : (
                        <div className={styles.noDataMessage}>
                            暂无排序任务数据
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RankingContent;
