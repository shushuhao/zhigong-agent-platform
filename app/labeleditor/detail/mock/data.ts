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
        name: '实体关系标注任务 - 设备告警工单',
        content: '产线A-03空压机在2026年5月27日08:15触发高温告警，边缘网关GW-07通过Modbus TCP采集到排气温度96℃、振动RMS 8.2mm/s。运维工程师张工在一车间确认冷却风扇转速异常，并创建工单WO-20260527-001。',
        type: 'entity-relation',
        entityLabels: [
          { id: '1', name: '设备', color: '#1890ff', selected: false },
          { id: '2', name: '产线/位置', color: '#52c41a', selected: false },
          { id: '3', name: '时间', color: '#fa8c16', selected: false },
          { id: '4', name: '告警', color: '#eb2f96', selected: false },
          { id: '5', name: '采集网关', color: '#722ed1', selected: false },
          { id: '6', name: '协议', color: '#13c2c2', selected: false },
          { id: '7', name: '指标', color: '#f5222d', selected: false },
          { id: '8', name: '人员', color: '#faad14', selected: false },
          { id: '9', name: '工单', color: '#2f54eb', selected: false }
        ],
        relationLabels: [
          { id: '1', name: '位于', entityLabelIds: ['1', '2'], selected: false },
          { id: '2', name: '触发', entityLabelIds: ['1', '4'], selected: false },
          { id: '3', name: '采集自', entityLabelIds: ['7', '5'], selected: false },
          { id: '4', name: '使用协议', entityLabelIds: ['5', '6'], selected: false },
          { id: '5', name: '处理人', entityLabelIds: ['9', '8'], selected: false }
        ],
        entities: [
          {
            id: 'entity_1',
            text: '产线A-03',
            start: 0,
            end: 6,
            // @ts-ignore
            labelId: '2',
            labelName: '产线/位置',
            color: '#52c41a',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_2',
            text: '空压机',
            start: 6,
            end: 9,
            labelId: '1',
            labelName: '设备',
            color: '#1890ff',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_3',
            text: '2026年5月27日08:15',
            start: 10,
            end: 25,
            labelId: '3',
            labelName: '时间',
            color: '#fa8c16',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_4',
            text: '高温告警',
            start: 27,
            end: 31,
            labelId: '4',
            labelName: '告警',
            color: '#eb2f96',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_5',
            text: '边缘网关GW-07',
            start: 32,
            end: 41,
            labelId: '5',
            labelName: '采集网关',
            color: '#722ed1',
            visible: true,
            highlighted: false
          },
          {
            id: 'entity_6',
            text: 'Modbus TCP',
            start: 43,
            end: 53,
            labelId: '6',
            labelName: '协议',
            color: '#13c2c2',
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
            relationName: '位于',
            visible: true
          },
          {
            id: 'relation_2',
            fromEntityId: 'entity_1',
            toEntityId: 'entity_4',
            relationId: '2',
            relationName: '触发',
            visible: true
          },
          {
            id: 'relation_3',
            fromEntityId: 'entity_5',
            toEntityId: 'entity_6',
            relationId: '4',
            relationName: '使用协议',
            visible: true
          }
        ],
        progress: {
          totalCharacters: 121,
          annotatedCharacters: 72,
          percentage: 60
        }
      } as EntityRelationData;

    case 'classification':
      return {
        ...baseData,
        name: '告警文本分类任务 - 工业设备状态',
        content: `设备告警记录

告警编号：ALM-20260527-0087
设备名称：A03 空压机
所属产线：总装一线
采集来源：边缘网关 GW-07 / Modbus TCP
触发时间：2026-05-27 08:15:32

告警内容：排气温度连续 6 分钟高于 95℃，振动 RMS 从 5.4mm/s 升至 8.2mm/s，设备健康评分降至 64。现场点检发现冷却风扇转速偏低，建议限制负载并创建预测性维护工单。

关联指标：排气温度、振动 RMS、电流负载率、冷却风扇转速、设备健康评分。`,
        type: 'classification',
        formFields: [
          {
            id: 'document_type',
            name: 'document_type',
            label: '文本类型',
            type: 'radio',
            required: true,
            options: [
              { label: '设备告警', value: 'alarm', hasInput: true, inputPlaceholder: '请输入告警类型' },
              { label: '点检记录', value: 'inspection', hasInput: false },
              { label: '维修工单', value: 'work_order', hasInput: false },
              { label: '设备手册', value: 'manual', hasInput: false },
              { label: '其他', value: 'other', hasInput: true, inputPlaceholder: '请说明其他类型' }
            ]
          },
          {
            id: 'alarm_level',
            name: 'alarm_level',
            label: '告警等级',
            type: 'checkbox',
            required: false,
            options: [
              { label: '提示', value: 'notice', hasInput: false },
              { label: '一般', value: 'minor', hasInput: false },
              { label: '严重', value: 'major', hasInput: true, inputPlaceholder: '请输入严重原因' },
              { label: '紧急', value: 'critical', hasInput: true, inputPlaceholder: '请输入紧急处置要求' }
            ]
          },
          {
            id: 'affected_asset',
            // @ts-ignore
            name: 'affected_asset',
            label: '影响设备/产线',
            type: 'input',
            required: false,
            placeholder: '例如：A03 空压机 / 总装一线',
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
        name: '问答标注任务 - 设备告警处置',
        content: hasContent ? 'A03 空压机排气温度连续 6 分钟高于 95℃，振动 RMS 升至 8.2mm/s，健康评分为 64，应该如何处置？' : '',
        type: 'qa',
        prompts: [
          {
            id: 1,
            prompt: '请给出标准处置建议',
            response: [['']],
            required: true,
          },
          {
            id: 2,
            prompt: '请补充需要核查的关联指标',
            response: [['']],
            required: false,
          },
        ],
      } as QAData;

    case 'ranking':
      return {
        ...baseData,
        name: '故障排查步骤排序任务',
        type: 'ranking',
        content: 'A03 空压机出现高温告警，同时振动 RMS 持续上升。请对排查步骤和处置建议进行优先级排序。',
        prompts: [
          {
            id: 1,
            prompt: '优先排查哪些现场因素？',
            responses: [
              { id: 1, response: '先确认边缘网关和传感器数据是否连续、可信' },
              { id: 2, response: '检查冷却风扇转速、风道堵塞和环境温度' },
              { id: 3, response: '核对负载电流、排气压力和近期工况变化' },
              { id: 4, response: '查看历史趋势，判断温度和振动是否同步劣化' }
            ]
          },
          {
            id: 2,
            prompt: '哪些处置建议更适合生成工单？',
            responses: [
              { id: 1, response: '创建预测性维护工单，记录告警指标、趋势和现场照片' },
              { id: 2, response: '限制设备负载，安排班组检查冷却系统' },
              { id: 3, response: '复核备件库存，准备风扇组件和温振传感器' }
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
