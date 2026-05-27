import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Input } from 'antd';
import { QAPrompt } from '../../types';
import styles from './QAForm.module.css';

interface QAFormProps {
    prompts: QAPrompt[];
    values: Record<string, string>;
    onChange: (promptId: number, value: string) => void;
    title?: string;
}

// 暴露给父组件的方法
export interface QAFormRef {
    validateFields: () => Promise<any>;
    resetFields: () => void;
}

const QAForm = forwardRef<QAFormRef, QAFormProps>(({
    prompts,
    values,
    onChange,
    title = '问答标注',
}, ref) => {
    const [form] = Form.useForm();

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        validateFields: () => form.validateFields(),
        resetFields: () => form.resetFields(),
    }));

    // 同步外部 values 到 Form
    React.useEffect(() => {
        form.setFieldsValue(values);
    }, [form, values]);

    console.log('QAForm - 渲染参数:', { prompts, values, onChange: !!onChange });

    return (
        <div className={styles.qaForm}>
            <div className={styles.title}>{title}</div>

            <Form
                form={form}
                layout='vertical'
                className={styles.form}
                initialValues={values}
            >
                {prompts?.map((prompt) => {
                    const fieldKey = `prompt_${prompt.id}`;
                    const hasUserInput = Object.prototype.hasOwnProperty.call(values, fieldKey); // 检查用户是否输入过
                    const currentValue = values[fieldKey] || '';

                    // 如果有预填充答案，将它们合并为字符串
                    const prefilledValue = prompt.response && prompt.response.length > 0 ?
                        prompt.response.map((answerArray) => answerArray.join(' ')).join('\n') :
                        '';

                    // 优先使用用户输入的值，只有在用户从未输入过时才使用预填充值
                    const displayValue = hasUserInput ? currentValue : prefilledValue;

                    console.log('QAForm - 处理 prompt:', {
                        promptId: prompt.id,
                        fieldKey,
                        currentValue,
                        prefilledValue,
                        displayValue,
                    });

                    return (
                        <div
                            key={prompt.id}
                            className={styles.promptCard}
                        >
                            <Form.Item
                                name={fieldKey}
                                label={(
                                    <span className={styles.customLabel}>
                                        <svg style={{ marginRight: 4 }} width='6' height='6' viewBox='0 0 6 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                            <path fillRule='evenodd' clipRule='evenodd' d='M3.41914 0.0996094C3.52959 0.0996094 3.61909 0.189223 3.61909 0.299683L3.61824 2.3446L5.45466 1.74829C5.55971 1.71416 5.67248 1.77154 5.70662 1.87659L5.95393 2.63745C5.98806 2.7425 5.93056 2.8554 5.82551 2.88953L3.97517 3.48962L5.20039 5.17627C5.26531 5.26563 5.24556 5.39065 5.1562 5.45557L4.50899 5.92578C4.41963 5.9907 4.29449 5.97095 4.22957 5.88159L2.96321 4.13757L1.69002 5.89075C1.6251 5.98011 1.49996 5.99999 1.4106 5.93506L0.76338 5.46484C0.67402 5.39992 0.654271 5.27479 0.719191 5.18542L1.9742 3.45569L0.169508 2.86963C0.0644584 2.8355 0.00696045 2.72273 0.0410905 2.61768L0.288283 1.85681C0.322413 1.75176 0.435186 1.69426 0.540236 1.72839L2.41817 2.33765L2.41914 0.299683C2.41914 0.189223 2.50863 0.0996094 2.61909 0.0996094H3.41914Z' fill='#EF4444' />
                                        </svg>
                                        {prompt.prompt}
                                    </span>
                                )}
                                rules={[
                                    {
                                        required: true,
                                        message: `请回答：${prompt.prompt}`,
                                    },
                                ]}
                                className={styles.customFormItem}
                            >
                                <Input.TextArea
                                    autoSize
                                    placeholder='请输入答案'
                                    onChange={(e) => {
                                        console.log('QAForm - Input onChange:', { promptId: prompt.id, value: e.target.value });
                                        // 同时更新 Form 和外部状态
                                        form.setFieldValue(fieldKey, e.target.value);
                                        onChange(prompt.id, e.target.value);
                                    }}
                                />
                            </Form.Item>
                        </div>
                    );
                })}
            </Form>
        </div>
    );
});

export default QAForm;
