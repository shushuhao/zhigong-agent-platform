import React, {
    forwardRef,
    useImperativeHandle,
} from 'react';
import {
    Form,
    Radio,
    Checkbox,
    Input,
    Select,
} from 'antd';
import { ClassificationFormField } from '../../types';
import styles from './index.module.css';

const { TextArea } = Input;

interface DynamicFormProps {
    fields: ClassificationFormField[];
    values: Record<string, any>;
    onChange: (fieldId: string, value: any) => void;
    title?: string; // 添加可选的标题属性
}

// 暴露给父组件的方法
export interface DynamicFormRef {
    validateFields: () => Promise<any>;
    resetFields: () => void;
}

const DynamicForm = forwardRef<DynamicFormRef, DynamicFormProps>((
    {
        fields,
        values,
        onChange,
        title = '标注',
    },
    ref,
) => {
    const [form] = Form.useForm();

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        validateFields: async () => {
            console.log('🚨🚨🚨 DynamicForm 自定义校验方法被调用！🚨🚨🚨');
            console.log('🔍 DynamicForm 开始校验，当前表单值:', form.getFieldsValue());
            console.log('🔍 当前 values 状态:', values);
            console.log('🔍 当前 fields 状态:', fields);
            console.log('🔍 必填字段列表:', fields.filter((f) => f.required));

            // 先清除所有可能存在的输入框错误状态
            fields.forEach((field) => {
                if ((field.type === 'radio' || field.type === 'checkbox') && field.options) {
                    field.options.forEach((option) => {
                        if (option.hasInput) {
                            const inputKey = `${field.id}_${option.value}_input`;
                            // 彻底清除错误状态
                            form.setFields([{
                                name: inputKey,
                                errors: [],
                                validating: false,
                                touched: false,
                            }]);
                            console.log(`🧹 彻底清除错误状态: ${inputKey}`);
                        }
                    });
                }
            });

            // 分步骤校验：先校验主字段，再校验输入框
            const errors: any = {};

            // 第一步：校验所有主字段
            for (const field of fields) {
                const fieldValue = values[field.id];
                console.log(`🔍 校验字段 ${field.id}:`, { fieldValue, required: field.required });

                // 校验必填字段
                if (field.required) {
                    let isValid = false;

                    if (field.type === 'radio') {
                        // 单选框：跳过主字段校验，在第二步中统一处理
                        isValid = true; // 总是通过主字段校验
                        console.log(`🔍 单选框主字段校验 ${field.id}: 跳过主字段校验，在第二步处理`, { fieldValue });
                    } else if (field.type === 'checkbox') {
                        isValid = Array.isArray(fieldValue) && fieldValue.length > 0;
                    } else {
                        isValid = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
                    }

                    if (!isValid) {
                        errors[field.id] = [`请选择或填写：${field.label}`];
                        console.log(`❌ 主字段校验失败: ${field.id} - ${field.label}`);
                        continue; // 跳过该字段的输入框校验
                    } else {
                        console.log(`✅ 主字段校验通过: ${field.id} - ${field.label}`);
                    }
                }

                // 第二步：如果主字段校验通过，再校验相关的输入框
                if ((field.type === 'radio' || field.type === 'checkbox') && field.options) {
                    // 对于单选框，先检查是否选择了任何选项
                    if (field.type === 'radio' && field.required) {
                        const hasAnySelection = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
                        console.log(`🔍 单选框选择状态检查 ${field.id}:`, {
                            fieldValue,
                            hasAnySelection,
                            fieldValueType: typeof fieldValue,
                        });

                        // 检查是否有任何选项被选中（包括带输入框的选项）
                        let hasValidSelection = hasAnySelection;

                        // 如果主字段没有值，检查是否有带输入框的选项被填写了
                        if (!hasAnySelection && field.options) {
                            for (const option of field.options) {
                                if (option.hasInput) {
                                    const inputKey = `${field.id}_${option.value}_input`;
                                    const inputValue = values[inputKey];
                                    if (inputValue && inputValue.trim()) {
                                        hasValidSelection = true;
                                        console.log(`✅ 发现输入框有内容，认为已选择: ${inputKey} = "${inputValue}"`);
                                        break;
                                    }
                                }
                            }
                        }

                        // 只有在完全没有选择任何选项时才显示主字段错误
                        if (!hasValidSelection) {
                            errors[field.id] = [`请选择或填写：${field.label}`];
                            console.log(`❌ 单选框未选择任何选项: ${field.id} - ${field.label}`);
                            // 继续处理其他字段，不要跳过
                        } else {
                            console.log(`✅ 单选框已选择选项: ${field.id} - ${field.label}`, { fieldValue, hasValidSelection });
                        }
                    }

                    // 检查带输入框的选项
                    for (const option of field.options) {
                        if (option.hasInput) {
                            const inputKey = `${field.id}_${option.value}_input`;
                            let isOptionSelected = false;

                            if (field.type === 'radio') {
                                isOptionSelected = fieldValue === option.value;
                            } else if (field.type === 'checkbox') {
                                isOptionSelected = Array.isArray(fieldValue) && fieldValue.includes(option.value);
                            }

                            console.log(`🔍 检查选项 ${option.label}:`, {
                                isOptionSelected,
                                inputKey,
                                fieldValue,
                                optionValue: option.value,
                                fieldType: field.type,
                                fieldId: field.id,
                                inputValue: values[inputKey],
                            });

                            if (isOptionSelected) {
                                // 选项被选中，校验输入框
                                const inputValue = values[inputKey];
                                console.log(`🔍 校验输入框 ${inputKey}:`, { inputValue });
                                if (!inputValue || !inputValue.trim()) {
                                    // 当选择了带输入框的选项但没有填写时，只显示输入框错误，不显示主字段错误
                                    // 先清除可能存在的主字段错误
                                    if (errors[field.id]) {
                                        // 移除主字段的"请选择或填写"错误，只保留其他错误
                                        errors[field.id] = errors[field.id].filter((err: string) => !err.includes('请选择或填写'));
                                        if (errors[field.id].length === 0) {
                                            delete errors[field.id];
                                        }
                                    }
                                    // 添加输入框特定的错误信息到主字段
                                    if (!errors[field.id]) errors[field.id] = [];
                                    errors[field.id].push(`请填写"${option.label}"的具体内容`);
                                    console.log(`❌ 输入框校验失败: ${inputKey} - ${option.label}`);
                                } else {
                                    console.log(`✅ 输入框校验通过: ${inputKey} - ${option.label}`);
                                }
                            } else {
                                console.log(`🧹 选项未被选中，跳过校验: ${inputKey} (${option.label})`);
                            }
                        }
                    }
                }
            }

            // 如果有错误，设置错误状态并抛出异常
            if (Object.keys(errors).length > 0) {
                console.log('❌ DynamicForm 校验失败:', errors);

                // 设置错误状态到表单
                const errorFields = Object.entries(errors).map(([name, messages]) => ({
                    name,
                    errors: messages as string[],
                }));
                form.setFields(errorFields);

                throw new Error('Validation failed');
            }

            console.log('✅ DynamicForm 校验通过');
            return form.getFieldsValue();
        },
        resetFields: () => form.resetFields(),
    }));

    // 同步外部 values 到 Form
    React.useEffect(() => {
        form.setFieldsValue(values);
    }, [form, values]);

    console.log('🔧 DynamicForm - 接收到的 fields:', {
        fields,
        fieldsType: typeof fields,
        isArray: Array.isArray(fields),
        length: fields?.length,
        firstField: fields?.[0],
        allFields: fields?.map((f) => ({
            id: f.id,
            label: f.label,
            type: f.type,
            options: f.options,
        })),
    });

    console.log('🔧 DynamicForm - 接收到的 values:', {
        values,
        valuesType: typeof values,
        valuesKeys: Object.keys(values || {}),
        valuesEntries: Object.entries(values || {}),
        allValues: values,
    });

    // 特别检查单选框字段的选项配置
    fields?.forEach(field => {
        if (field.type === 'radio' && field.options) {
            console.log(`🔍 单选框字段 ${field.id} 的选项配置:`, field.options);
            field.options.forEach(option => {
                console.log(`  - ${option.label}: value="${option.value}" (${typeof option.value}), hasInput=${option.hasInput}`);
            });
        }
    });

    // 防御性编程：确保 fields 是数组
    if (!fields || !Array.isArray(fields)) {
        console.warn('🚨 DynamicForm - fields 不是有效的数组:', {
            fields,
            type: typeof fields,
            isArray: Array.isArray(fields),
        });
        return (
            <div className={styles.formContainer}>
                <div className={styles.formTitle}>
                    {title}
                </div>
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#999',
                }}
                >
                    暂无表单字段数据
                    <br />
                    <small style={{ color: '#ccc' }}>
                        fields类型:
                        {' '}
                        {typeof fields}
                        , 是否为数组:
                        {' '}
                        {Array.isArray(fields) ? '是' : '否'}
                    </small>
                </div>
            </div>
        );
    }

    const renderField = (field: ClassificationFormField): React.ReactElement | null => {
        const value = values[field.id];

        console.log(`🔍 渲染字段 ${field.id}:`, {
            value,
            valueType: typeof value,
            fieldType: field.type,
        });

        switch (field.type) {
            case 'radio':
                return (
                    <div className={styles.radioContainer}>
                        <Radio.Group
                            value={value}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                console.log(`🔄 单选框值变化 ${field.id}:`, {
                                    oldValue: values[field.id],
                                    newValue,
                                    newValueType: typeof newValue,
                                    target: e.target,
                                });

                                // 同时更新 Form 和外部状态
                                form.setFieldValue(field.id, newValue);
                                onChange(field.id, newValue);

                                // 清除所有相关输入框的校验错误状态
                                field.options?.forEach((option) => {
                                    if (option.hasInput) {
                                        const inputKey = `${field.id}_${option.value}_input`;
                                        form.setFields([{ name: inputKey, errors: [] }]);
                                    }
                                });
                            }}
                            className={styles.radioGroup}
                        >
                            {field.options?.map((option) => {
                                console.log('🔍 渲染单选选项:', {
                                    label: option.label,
                                    value: option.value,
                                    hasInput: option.hasInput,
                                    fieldId: field.id,
                                });

                                return (
                                    <div key={option.value} className={styles.radioItem}>
                                        <div className={styles.optionRow}>
                                            <Radio value={option.value} className={styles.radioOption}>
                                                {option.label}
                                            </Radio>
                                            {/* 根据接口字段判断是否需要输入框 - 直接显示，不需要选中 */}
                                            {option.hasInput && (() => {
                                                const inputKey = `${field.id}_${option.value}_input`;
                                                const fieldValue = values[field.id];
                                                const isOptionSelected = fieldValue === option.value;

                                                console.log(`🔍 渲染单选输入框 ${inputKey}:`, {
                                                    isOptionSelected,
                                                    fieldValue,
                                                    optionValue: option.value,
                                                });

                                                return (
                                                    <Form.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => prevValues !== currentValues}
                                                    >
                                                        {() => {
                                                            // 获取当前字段的错误状态
                                                            const fieldError = form.getFieldError(inputKey);
                                                            const hasError = fieldError && fieldError.length > 0;

                                                            console.log(`🔍 输入框错误状态 ${inputKey}:`, { hasError, fieldError });

                                                            return (
                                                                <div>
                                                                    <Input
                                                                        key={`${inputKey}_${isOptionSelected ? 'selected' : 'unselected'}`}
                                                                        placeholder={option.inputPlaceholder || '请输入'}
                                                                        value={values[inputKey] || ''}
                                                                        onChange={(e) => {
                                                                            const inputValue = e.target.value;

                                                                            if (isOptionSelected) {
                                                                                form.setFieldValue(inputKey, inputValue);
                                                                                if (inputValue && inputValue.trim()) {
                                                                                    form.setFields([{ name: inputKey, errors: [], validating: false }]);
                                                                                }
                                                                            }

                                                                            onChange(inputKey, inputValue);
                                                                        }}
                                                                        className={`${styles.optionInput} ${!isOptionSelected ? 'force-normal-border' : ''}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        status={(() => {
                                                                            if (!isOptionSelected) return undefined;
                                                                            return hasError ? 'error' : undefined;
                                                                        })()}
                                                                        style={(() => {
                                                                            if (!isOptionSelected) {
                                                                                return {
                                                                                    borderColor: '#d9d9d9',
                                                                                    boxShadow: 'none',
                                                                                };
                                                                            }
                                                                            if (hasError) {
                                                                                return {
                                                                                    borderColor: '#ff4d4f',
                                                                                    // boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)',
                                                                                };
                                                                            }
                                                                            return undefined;
                                                                        })()}
                                                                    />
                                                                    {/* 显示错误消息 */}
                                                                    {hasError && isOptionSelected && fieldError && fieldError.length > 0 && (
                                                                        <div style={{
                                                                            color: '#ff4d4f',
                                                                            fontSize: '14px',
                                                                            lineHeight: '1.5715',
                                                                            marginTop: '4px',
                                                                        }}
                                                                        >
                                                                            {fieldError[0]}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    </Form.Item>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}
                        </Radio.Group>
                    </div>
                );

            case 'checkbox':
                return (
                    <div className={styles.checkboxContainer}>
                        <Checkbox.Group
                            value={value || []}
                            onChange={(checkedValues) => {
                                // 同时更新 Form 和外部状态
                                form.setFieldValue(field.id, checkedValues);
                                onChange(field.id, checkedValues);

                                // 清除所有相关输入框的校验错误状态
                                field.options?.forEach((option) => {
                                    if (option.hasInput) {
                                        const inputKey = `${field.id}_${option.value}_input`;
                                        form.setFields([{ name: inputKey, errors: [] }]);
                                    }
                                });
                            }}
                            className={styles.checkboxGroup}
                        >
                            {field.options?.map((option) => (
                                <div key={option.value} className={styles.checkboxItem}>
                                    <div className={styles.optionRow}>
                                        <Checkbox value={option.value} className={styles.checkboxOption}>
                                            {option.label}
                                        </Checkbox>
                                        {/* 根据接口字段判断是否需要输入框 - 直接显示，不需要选中 */}
                                        {option.hasInput && (() => {
                                            const inputKey = `${field.id}_${option.value}_input`;
                                            const fieldValue = values[field.id];
                                            const isOptionSelected = Array.isArray(fieldValue) && fieldValue.includes(option.value);

                                            console.log(`🔍 渲染多选输入框 ${inputKey}:`, {
                                                isOptionSelected,
                                                fieldValue,
                                                optionValue: option.value,
                                            });

                                            return (
                                                <Form.Item
                                                    noStyle
                                                    shouldUpdate={(prevValues, currentValues) => prevValues !== currentValues}
                                                >
                                                    {() => {
                                                        // 获取当前字段的错误状态
                                                        const fieldError = form.getFieldError(inputKey);
                                                        const hasError = fieldError && fieldError.length > 0;

                                                        console.log(`🔍 多选输入框错误状态 ${inputKey}:`, { hasError, fieldError });

                                                        return (
                                                            <div>
                                                                <Input
                                                                    key={`${inputKey}_${isOptionSelected ? 'selected' : 'unselected'}`}
                                                                    placeholder={option.inputPlaceholder || '请输入'}
                                                                    value={values[inputKey] || ''}
                                                                    onChange={(e) => {
                                                                        const inputValue = e.target.value;

                                                                        if (isOptionSelected) {
                                                                            form.setFieldValue(inputKey, inputValue);
                                                                            if (inputValue && inputValue.trim()) {
                                                                                form.setFields([{ name: inputKey, errors: [], validating: false }]);
                                                                            }
                                                                        }

                                                                        onChange(inputKey, inputValue);
                                                                    }}
                                                                    className={`${styles.optionInput} ${!isOptionSelected ? 'force-normal-border' : ''}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    status={(() => {
                                                                        if (!isOptionSelected) return undefined;
                                                                        return hasError ? 'error' : undefined;
                                                                    })()}
                                                                    style={(() => {
                                                                        if (!isOptionSelected) {
                                                                            return {
                                                                                borderColor: '#d9d9d9 !important',
                                                                                boxShadow: 'none !important',
                                                                            };
                                                                        }
                                                                        if (hasError) {
                                                                            return {
                                                                                borderColor: '#ff4d4f',
                                                                                // boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)',
                                                                            };
                                                                        }
                                                                        return undefined;
                                                                    })()}
                                                                />
                                                                {/* 显示错误消息 */}
                                                                {hasError && isOptionSelected && fieldError && fieldError.length > 0 && (
                                                                    <div style={{
                                                                        color: '#ff4d4f',
                                                                        fontSize: '14px',
                                                                        lineHeight: '1.5715',
                                                                        marginTop: '4px',
                                                                    }}
                                                                    >
                                                                        {fieldError[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </Form.Item>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </Checkbox.Group>
                    </div>
                );

            case 'input':
                return (
                    <Input
                        value={value || ''}
                        onChange={(e) => {
                            // 同时更新 Form 和外部状态
                            form.setFieldValue(field.id, e.target.value);
                            onChange(field.id, e.target.value);
                        }}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        className={styles.input}
                    />
                );

            case 'textarea':
                return (
                    <TextArea
                        value={value || ''}
                        onChange={(e) => {
                            // 同时更新 Form 和外部状态
                            form.setFieldValue(field.id, e.target.value);
                            onChange(field.id, e.target.value);
                        }}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        rows={field.rows || 4}
                        className={styles.textarea}
                    />
                );

            case 'select':
                return (
                    <Select
                        value={value}
                        onChange={(selectValue) => {
                            // 同时更新 Form 和外部状态
                            form.setFieldValue(field.id, selectValue);
                            onChange(field.id, selectValue);
                        }}
                        placeholder={field.placeholder}
                        className={styles.select}
                    >
                        {field.options?.map((option) => (
                            <Select.Option key={option.value} value={option.value}>
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                );

            default:
                return null;
        }
    };

    console.log('fields', fields);

    return (
        <div className={styles.dynamicForm}>
            <div className={styles.sectionTitle}>
                {title}
            </div>
            <Form
                form={form}
                layout='vertical'
                className={styles.form}
                initialValues={values}
                validateTrigger={[]} // 禁用所有自动校验触发器，只在手动调用时校验
            >
                {fields.map((field) => (
                    <div key={field.id}>
                        {/* 主字段 */}
                        <Form.Item
                            name={field.id}
                            label={(
                                <span className={styles.fieldLabel}>
                                    {field.required && (
                                        <svg style={{ marginRight: 4 }} width='6' height='6' viewBox='0 0 6 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                            <path fillRule='evenodd' clipRule='evenodd' d='M3.41914 0.0996094C3.52959 0.0996094 3.61909 0.189223 3.61909 0.299683L3.61824 2.3446L5.45466 1.74829C5.55971 1.71416 5.67248 1.77154 5.70662 1.87659L5.95393 2.63745C5.98806 2.7425 5.93056 2.8554 5.82551 2.88953L3.97517 3.48962L5.20039 5.17627C5.26531 5.26563 5.24556 5.39065 5.1562 5.45557L4.50899 5.92578C4.41963 5.9907 4.29449 5.97095 4.22957 5.88159L2.96321 4.13757L1.69002 5.89075C1.6251 5.98011 1.49996 5.99999 1.4106 5.93506L0.76338 5.46484C0.67402 5.39992 0.654271 5.27479 0.719191 5.18542L1.9742 3.45569L0.169508 2.86963C0.0644584 2.8355 0.00696045 2.72273 0.0410905 2.61768L0.288283 1.85681C0.322413 1.75176 0.435186 1.69426 0.540236 1.72839L2.41817 2.33765L2.41914 0.299683C2.41914 0.189223 2.50863 0.0996094 2.61909 0.0996094H3.41914Z' fill='#EF4444' />
                                        </svg>
                                    )}
                                    {field.label}
                                    ：
                                </span>
                            )}
                            rules={[]} // 完全禁用内置校验规则，只使用自定义校验
                            validateTrigger={[]} // 禁用自动校验触发器
                            className={styles.customFormItem}
                        >
                            {renderField(field)}
                        </Form.Item>

                        {/* 为单选和多选的输入框创建独立的Form.Item - 只为被选中的选项创建 */}
                        {(field.type === 'radio' || field.type === 'checkbox') && field.options?.map((option) => {
                            if (!option.hasInput) return null;

                            const inputKey = `${field.id}_${option.value}_input`;
                            const fieldValue = values[field.id];
                            let isOptionSelected = false;

                            if (field.type === 'radio') {
                                isOptionSelected = fieldValue === option.value;
                            } else if (field.type === 'checkbox') {
                                isOptionSelected = Array.isArray(fieldValue) && fieldValue.includes(option.value);
                            }

                            // 只为被选中的选项创建 Form.Item，未选中的选项不创建任何Form.Item
                            if (!isOptionSelected) {
                                console.log(`🚫 跳过创建Form.Item: ${inputKey} (${option.label}未被选中)`);
                                return null;
                            }

                            console.log(`✅ 创建Form.Item: ${inputKey} (${option.label}被选中)`);

                            return (
                                <Form.Item
                                    key={inputKey}
                                    name={inputKey}
                                    validateTrigger={[]} // 禁用自动校验触发器，使用自定义校验
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '1px',
                                        height: '1px',
                                        overflow: 'hidden',
                                        opacity: 0,
                                        pointerEvents: 'none',
                                    }} // 完全隐藏但保持在DOM中，让错误状态能被访问
                                >
                                    <Input />
                                </Form.Item>
                            );
                        })}
                    </div>
                ))}
            </Form>
        </div>
    );
});

export default DynamicForm;
