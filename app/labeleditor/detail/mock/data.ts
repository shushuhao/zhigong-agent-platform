// 暂时使用 any 类型，避免类型定义不匹配的问题
type AnnotationData = any;
import { EntityRelationData, ClassificationData, QAData, RankingData } from '../types'

/**
 * 生成模拟数据的工厂函数
 * @param rId - 资源 ID
 * @param type - 标注类型 ('entity-relation' | 'classification' | 'qa' | 'ranking')
 * @throws Error 如果 type 不是有效的标注类型
 */
export const createMockData = (rId: string, type: string): AnnotationData => {
  // 验证输入参数
  if (!rId) {
    console.error('createMockData: rId is empty or undefined', { rId, type });
    throw new Error('Invalid rId: rId cannot be empty');
  }

  if (!type) {
    console.error('createMockData: type is empty or undefined', { rId, type });
    throw new Error('Invalid type: type cannot be empty or undefined');
  }

  const baseData = {
    id: rId,
    lastSaved: '',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  };

  switch (type) {
    case 'entity-relation':
      return {
        ...baseData,
        name: '实体关系标注任务 - 科技公司介绍',
        content: '微软（Microsoft）由比尔·盖茨（Bill Gates）和保罗·艾伦（Paul Allen）于1975年4月4日在新墨西哥州的阿尔伯克基创立。当时，比尔·盖茨是公司的首席执行官（CEO）。作为一家总部位于美国华盛顿州雷德蒙德的跨国科技公司，微软是全球最大的软件制造商之一。',
        type: 'entity-relation',
        entityLabels: [
          { id: '1', name: '人物', color: '#1890ff', selected: false },
          { id: '2', name: '公司', color: '#52c41a', selected: false },
          { id: '3', name: '地点', color: '#fa8c16', selected: false },
          { id: '4', name: '时间', color: '#eb2f96', selected: false },
          { id: '5', name: '职位', color: '#722ed1', selected: false }
        ],
        relationLabels: [
          { id: '1', name: '创立', entityLabelIds: ['1', '2'], selected: false },
          { id: '2', name: '担任', entityLabelIds: ['1', '5'], selected: false },
          { id: '3', name: '位于', entityLabelIds: ['2', '3'], selected: false }
        ],
        entities: [
          {
            id: 'entity_1',
            text: '微软',
            start: 0,
            end: 2,
            // @ts-ignore
            labelId: '2',
            labelName: '公司',
            color: '#52c41a',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_2',
            text: '比尔·盖茨',
            start: 15,
            end: 20,
            labelId: '1',
            labelName: '人物',
            color: '#1890ff',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_3',
            text: '保罗·艾伦',
            start: 32,
            end: 37,
            labelId: '1',
            labelName: '人物',
            color: '#1890ff',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_4',
            text: '1975年4月4日',
            start: 39,
            end: 49,
            labelId: '4',
            labelName: '时间',
            color: '#eb2f96',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_5',
            text: '新墨西哥州',
            start: 51,
            end: 56,
            labelId: '3',
            labelName: '地点',
            color: '#fa8c16',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_6',
            text: '首席执行官',
            start: 85,
            end: 90,
            labelId: '5',
            labelName: '职位',
            color: '#722ed1',
            visible: true,
            highlighted: false
          }
        ],
        relations: [
          {
            id: 'relation_1',
            fromEntityId: 'entity_2',
            toEntityId: 'entity_1',
            relationId: '1',
            relationName: '创立',
            visible: true
          },
          {
            id: 'relation_2',
            fromEntityId: 'entity_3',
            toEntityId: 'entity_1',
            relationId: '1',
            relationName: '创立',
            visible: true
          },
          {
            id: 'relation_3',
            fromEntityId: 'entity_2',
            toEntityId: 'entity_6',
            relationId: '2',
            relationName: '担任',
            visible: true
          }
        ],
        progress: {
          totalCharacters: 95,
          annotatedCharacters: 35,
          percentage: 37
        }
      } as EntityRelationData;

    case 'classification':
      return {
        ...baseData,
        name: '这是一个标注名称（标注任务: 123）',
        content: `内部采购合同

合同编号：CG-2024-0810-001

甲方（采购方）：
部门名称：创新事业部
负责人：李经理
联系方式：li@company.com / 分机号：8001

乙方（供应方）：
部门名称：行政部-采购处
负责人：王主管
联系方式：wang@company.com / 分机号：6005

鉴于甲方因业务发展需要，时向乙方申请采购一批办公设备，乙方同意根据公司内部采购流程提供相关服务，双方经协商一致，达成如下协议：

第一条 采购物品清单

| 序号 | 物品名称 | 规格型号 | 单位 | 数量 | 预估单价（元）| 预估总价（元）| 备注 |
|------|----------|----------|------|------|---------------|---------------|------|
| 1    | 笔记本电脑 | ThinkPad X1 Carbon | 台  | 5    | 12,000.00     | 60,000.00     | 研发人员使用 |
| 2    | 34英寸曲面显示器 | Dell U3421WE | 台  | 5    | 5,500.00      | 27,500.00     |      |
| 3    | 机械键盘 | Cherry MX 3.0 | 个  | 5    | 800.00        | 4,000.00      |      |
|      |          |          |      |      | 合计：        | 91,500.00     |      |`,
        type: 'classification',
        formFields: [
          {
            id: 'document_type',
            name: 'document_type',
            label: '文本类型',
            type: 'radio',
            required: true,
            options: [
              { label: '合同', value: 'contract', hasInput: true, inputPlaceholder: '请输入合同类型' },
              { label: '报告', value: 'report', hasInput: false },
              { label: '发票', value: 'invoice', hasInput: false },
              { label: '其他', value: 'other', hasInput: true, inputPlaceholder: '请说明其他类型' }
            ]
          },
          {
            id: 'business_department',
            name: 'business_department',
            label: '业务部门',
            type: 'checkbox',
            required: false,
            options: [
              { label: '财务部', value: 'finance', hasInput: false },
              { label: '市场部', value: 'marketing', hasInput: true, inputPlaceholder: '请输入具体市场部门' },
              { label: '人力资源部', value: 'hr', hasInput: false }
            ]
          },
          {
            id: 'project_client',
            // @ts-ignore
            name: 'project_client',
            label: '项目/客户',
            type: 'input',
            required: false,
            placeholder: '输入内容',
            maxLength: 100
          }
        ],
        formValues: {}
      } as ClassificationData;

    case 'qa':
      // 根据 ID 决定是否有 content（演示两种情况）
      const hasContent = rId !== 'no-content';
      //@ts-ignore
      return {
        ...baseData,
        name: '问答标注任务 - AI助手对话',
        content: hasContent ? '一加一等于几？' : '',
        type: 'qa',
        prompts: [
          {
            id: 1,
            prompt: '请回答这个问题',
            response: [['']],
            required: true,
          },
          {
            id: 2,
            prompt: '请提供详细解释',
            response: [['']],
            required: false,
          },
        ],
      } as QAData;

    case 'ranking':
      return {
        ...baseData,
        name: '问答排序标注任务',
        type: 'ranking',
        content: '小白菜',
        prompts: [
          {
            id: 1,
            prompt: '这是什么东西？',
            responses: [
              { id: 1, response: '一种绿色蔬菜' },
              { id: 2, response: '一种农作物' },
              { id: 3, response: '一种食物' },
              { id: 4, response: '一种绿色有机蔬菜食品' }
            ]
          },
          {
            id: 2,
            prompt: '多少钱一斤',
            responses: [
              { id: 1, response: '310分' },
              { id: 2, response: '31角' },
              { id: 3, response: '3块1毛' }
            ]
          }
        ]
      } as RankingData;

    default:
      const validTypes = ['entity-relation', 'classification', 'qa', 'ranking'];
      console.error('createMockData: Unknown annotation type', {
        type,
        rId,
        validTypes,
        typeOfType: typeof type,
        typeLength: type?.length
      });
      throw new Error(
        `Unknown annotation type: "${type}". Valid types are: ${validTypes.join(', ')}. ` +
        `This usually means the URL parameter 'kind' or 'type' is not being passed correctly. ` +
        `Please check your URL parameters.`
      );
  }
};

/**
 * 模拟 API 延迟
 */
export const mockApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 模拟 API 错误
 */
export const mockApiError = (message: string = 'Mock API Error'): Error => {
  return new Error(message);
};
