import { create } from 'zustand';
import { message } from 'antd';
import { RankingState, RankingData, RankingItem } from './types';

// Helper function to create delays
const delay = (ms: number): Promise<void> => new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
});

// 模拟API数据
const mockRankingData: RankingData = {
    id: '1',
    name: '问答排序标注任务',
    content: '可以简单介绍一下苏轼吗？主要说说他是哪个朝代的，以及他的代表作有哪些。',
    type: 'ranking',
    title: '请按照优先级排序：',
    items: [
        {
            id: '1',
            content: '苏轼（1037年—1101年），字子瞻，号东坡居士，北宋著名文学家、书画家，他是一位全才的文人巨匠。在诗、词、文、书、画等方面均有极高造诣，其代表作包括：词作《念奴娇·赤壁怀古》、《水调歌头·明月几时有》；散文《前赤壁赋》、《后赤壁赋》；诗歌《题西林壁》等，他与父亲苏洵和弟弟苏辙并称为"三苏"，均被列入"唐宋八大家"。',
            order: 1,
        },
        {
            id: '2',
            content: '苏轼是宋朝的，他写了很多诗词，很有名，比如《水调歌头》，"明月几时有"那个。',
            order: 2,
        },
        {
            id: '3',
            content: '苏轼是唐代著名诗人的简单文人，与李白杜甫齐名，被誉为"诗仙"，他的代表作有《静夜思》、《蜀道难》，此外，他在书法上也颇有造诣，是唐朝代表人物。',
            order: 3,
        },
    ],
    prompts: [
        {
            id: 1,
            prompt: '可以简单介绍一下苏轼吗？主要说说他是哪个朝代的，以及他的代表作有哪些。',
            responses: [
                {
                    id: 1,
                    response: '苏轼（1037年—1101年），字子瞻，号东坡居士，北宋著名文学家、书画家，他是一位全才的文人巨匠。在诗、词、文、书、画等方面均有极高造诣，其代表作包括：词作《念奴娇·赤壁怀古》、《水调歌头·明月几时有》；散文《前赤壁赋》、《后赤壁赋》；诗歌《题西林壁》等，他与父亲苏洵和弟弟苏辙并称为"三苏"，均被列入"唐宋八大家"。',
                },
                {
                    id: 2,
                    response: '苏轼是宋朝的，他写了很多诗词，很有名，比如《水调歌头》，"明月几时有"那个。',
                },
                {
                    id: 3,
                    response: '苏轼是唐代著名诗人的简单文人，与李白杜甫齐名，被誉为"诗仙"，他的代表作有《静夜思》、《蜀道难》，此外，他在书法上也颇有造诣，是唐朝代表人物。',
                },
            ],
        },
    ],
    lastSaved: '',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
};

export const useRankingStore = create<RankingState>((set, get) => ({
    data: null,
    loading: false,
    error: null,
    items: [],
    noAnnotationRequired: false,

    loadData: async (id: string) => {
        set({ loading: true, error: null });
        try {
            // 模拟API调用
            await delay(1000);

            // 根据 ID 决定是否有 content（演示两种情况）
            const hasContent = id !== 'no-content';
            const data = {
                ...mockRankingData,
                id,
                content: hasContent ? mockRankingData.content : '',
            };

            set({
                data,
                items: [...(data.items || [])].sort((a, b) => a.order - b.order),
                loading: false,
            });

            console.log('Ranking data loaded:', data);
        } catch (error) {
            set({ error: '加载数据失败', loading: false });
            message.error('加载数据失败');
        }
    },

    updateItemOrder: (items: RankingItem[]) => {
    // 更新排序，重新分配 order
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        set({ items: updatedItems });
        console.log('Items order updated:', updatedItems);
    },

    submitRanking: async () => {
        const { data, items } = get();
        if (!data) return;

        set({ loading: true, error: null });

        try {
            // 模拟提交API调用
            await delay(1000);

            const submitData = {
                id: data.id,
                rankings: items.map((item) => ({
                    id: item.id,
                    order: item.order,
                })),
            };

            console.log('Submitting ranking data:', submitData);
            message.success('排序提交成功！');
            set({ loading: false });
        } catch (error) {
            set({ error: '提交失败', loading: false });
            message.error('提交失败');
        }
    },

    saveData: async () => {
        const { data, items } = get();
        if (!data) return;

        try {
            // 模拟保存API调用
            await delay(500);

            const saveData = {
                id: data.id,
                rankings: items.map((item) => ({
                    id: item.id,
                    order: item.order,
                })),
            };

            console.log('Saving ranking data:', saveData);

            // 更新最后保存时间
            set((state) => ({
                data: state.data ? {
                    ...state.data,
                    lastSaved: new Date().toLocaleString(),
                } : null,
            }));

            message.success('保存成功');
        } catch (error) {
            message.error('保存失败');
            throw error;
        }
    },

    initializeWithData: (data: RankingData) => {
        set({
            data,
            items: [...(data.items || [])].sort((a, b) => a.order - b.order),
            loading: false,
            error: null,
        });
    },

    // Header组件兼容性方法
    submitAnnotation: async () => get().submitRanking(),

    toggleNoAnnotationRequired: () => {
        set((state) => ({
            noAnnotationRequired: !state.noAnnotationRequired,
        }));
    },

    autoSave: async () => get().saveData(),

}));
