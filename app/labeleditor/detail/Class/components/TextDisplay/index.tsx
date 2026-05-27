import React from 'react';
import styles from './index.module.css';

interface TextDisplayProps {
    content: string;
}

function TextDisplay({ content }: TextDisplayProps): React.ReactElement {
    return (
        <div className={styles.textDisplay}>
            <div className={styles.textContent}>
                {content.split('\n').map((line, index) => (
                    <div key={index} className={styles.textLine}>
                        {line || '\u00A0'}
                        {/* 空行显示为不间断空格 */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TextDisplay;
