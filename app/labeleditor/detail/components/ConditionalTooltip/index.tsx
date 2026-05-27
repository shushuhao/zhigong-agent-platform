import React, { useRef, useEffect, useState } from 'react';
import { Tooltip } from 'antd';

function ConditionalTooltip({
    title,
    children,
    placement = 'top',
}: {
    title: string;
    children: React.ReactElement;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}): React.ReactElement {
    const [showTooltip, setShowTooltip] = useState(false);
    const textRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const checkOverflow = (): void => {
            if (textRef.current) {
                const isOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;
                setShowTooltip(isOverflowing);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [title]);

    const childWithRef = React.cloneElement(children, { ref: textRef });

    return showTooltip ? (
        <Tooltip color='#fff' title={title} placement={placement} overlayStyle={{ zIndex: 99999999 }}>
            {childWithRef}
        </Tooltip>
    ) : (
        childWithRef
    );
}
export default ConditionalTooltip;
