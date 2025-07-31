import React from 'react';
import styles from './CollapsibleSection.modules.css';
import { Icon } from '..'


interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  iconName?: string;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({ title, children, iconName, defaultOpen }: CollapsibleSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen ?? false);

  return (
    <div className={`${styles.collapsibleSection} ${open ? '' : styles.collapsibleSectionClosed}`}>
      <div
        className={styles.collapsibleHeader}
        onClick={() => setOpen(o => !o)}
      >
        <span className={styles.collapsibleTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {iconName ? <Icon iconName={iconName} 
            hoverBgColor='transparent'
            hoverColor='var(--gray6)'
          /> : null}
          
        
        {title}</span>
        <span className={`materialSymbols ${styles.collapsibleArrow} ${open ? '' : styles.collapsibleArrowClosed}`}>
          arrow_drop_down
        </span>
      </div>
      <div className={`${styles.collapsibleContent} ${open ? '' : styles.collapsibleContentClosed}`}
        style={{ maxHeight: open ? 'none' : 0 }}
      >
        <div className={`${styles.collapsibleInner} ${open ? '' : styles.collapsibleInnerClosed}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
