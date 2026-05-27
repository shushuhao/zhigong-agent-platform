import React from 'react';
import { Modal, Button } from 'antd';
import { SVGGuideAllIcon } from '../../../../../icons';
import { getUrlParams } from '../../../utils/urlParams';
import styles from './index.module.css';

interface TutorialModalProps {
    visible: boolean;
    onClose: () => void;
    videoUrl?: string; // 可选的视频URL
}

function TutorialModal({ visible, onClose }: TutorialModalProps): React.ReactElement {
    const { kindParam } = getUrlParams();
    return (
        <Modal
            title='标注教程'
            open={visible && kindParam === 'entity-relation'}
            onCancel={onClose}
            footer={[
                <Button key='close' type='primary' onClick={onClose}>
          我知道了
                </Button>,
            ]}
            width={600}
            centered
            className={styles.tutorialModal}
        >
            <div className={styles.tutorialContent}>
                {/* 视频容器 */}
                <div className={styles.videoContainer}>
                    <SVGGuideAllIcon />
                </div>
            </div>
        </Modal>
    );
}

export default TutorialModal;
