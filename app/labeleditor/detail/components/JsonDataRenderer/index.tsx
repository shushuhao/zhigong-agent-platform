'use client';

import React, {
    useState,
    useEffect,
} from 'react';
import {
    Card,
    Spin,
    Alert,
    Typography,
} from 'antd';
import styles from './index.module.css';

const { Text, Paragraph } = Typography;

interface JsonDataRendererProps {
    itemPath: string;
    title?: string;
    onDataLoaded?: (data: any) => void;
    onError?: (error: string) => void;
}

function JsonDataRenderer({
    itemPath,
    title = '数据内容',
    onDataLoaded,
    onError,
}: JsonDataRendererProps): React.ReactElement {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const fetchJsonData = async (url: string): Promise<void> => {
        setLoading(true);
        setError('');
        setData(null);

        try {
            console.log('Fetching JSON data from:', url);

            const response = await fetch(url, {
                method: 'GET',
                // 如果需要处理跨域，可以添加 mode: 'cors'
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const jsonData = await response.json();
            console.log('Fetched JSON data:', jsonData);

            setData(jsonData);
            onDataLoaded?.(jsonData);
        } catch (err: any) {
            const errorMessage = err.message || '获取数据失败';
            console.error('Failed to fetch JSON data:', err);
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (itemPath) {
            fetchJsonData(itemPath);
        }
    }, [itemPath]);

    const renderJsonContent = (jsonData: any): React.ReactNode => {
        if (!jsonData) return null;

        // 如果是字符串，直接显示
        if (typeof jsonData === 'string') {
            return (
                <div className={styles.textContent}>
                    <Paragraph>{jsonData}</Paragraph>
                </div>
            );
        }

        // 如果是数组
        if (Array.isArray(jsonData)) {
            return (
                <div className={styles.arrayContent}>
                    {jsonData.map((item, index) => (
                        <Card key={index} size='small' style={{ marginBottom: '8px' }}>
                            {renderJsonContent(item)}
                        </Card>
                    ))}
                </div>
            );
        }

        // 如果是对象
        if (typeof jsonData === 'object') {
            return (
                <div className={styles.objectContent}>
                    {Object.entries(jsonData).map(([key, value]) => (
                        <div key={key} className={styles.keyValuePair}>
                            <Text strong className={styles.key}>
                                {key}
                                :
                            </Text>
                            <div className={styles.value}>
                                {typeof value === 'object' ? (
                                    renderJsonContent(value)
                                ) : (
                                    <Text>{String(value)}</Text>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // 其他类型直接转换为字符串
        return <Text>{String(jsonData)}</Text>;
    };

    if (loading) {
        return (
            <Card title={title}>
                <div className={styles.loadingContainer}>
                    <Spin size='large' />
                    <Text style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}>
                        正在加载数据...
                    </Text>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title={title}>
                <Alert
                    message='数据加载失败'
                    description={(
                        <div>
                            <p>
                                <strong>错误信息:</strong>
                                {' '}
                                {error}
                            </p>
                            <p>
                                <strong>请求地址:</strong>
                                {' '}
                                {itemPath}
                            </p>
                            <p>
                                <strong>可能原因:</strong>
                            </p>
                            <ul>
                                <li>网络连接问题</li>
                                <li>服务器不可访问</li>
                                <li>跨域访问限制</li>
                                <li>JSON文件不存在或格式错误</li>
                            </ul>
                        </div>
                    )}
                    type='error'
                    showIcon
                />
            </Card>
        );
    }

    if (!data) {
        return (
            <Card title={title}>
                <Alert
                    message='暂无数据'
                    description='未获取到有效的JSON数据'
                    type='info'
                    showIcon
                />
            </Card>
        );
    }

    return (
        <Card title={title} className={styles.jsonRenderer}>
            <div className={styles.jsonContent}>
                {renderJsonContent(data)}
            </div>
        </Card>
    );
}

export default JsonDataRenderer;
