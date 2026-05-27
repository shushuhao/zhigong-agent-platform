import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#0f766e',
    colorSuccess: '#16a34a',
    colorWarning: '#f97316',
    colorError: '#dc2626',
    colorInfo: '#0f766e',

    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f6fffb',
    colorBgBase: '#ffffff',

    colorText: '#13312f',
    colorTextSecondary: '#52706c',
    colorTextTertiary: '#7f9692',
    colorTextQuaternary: '#b6c8c4',

    colorBorder: '#d7e7e3',
    colorBorderSecondary: '#edf6f3',

    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusXS: 4,

    boxShadow: '0 1px 3px 0 rgba(15, 118, 110, 0.10), 0 1px 2px 0 rgba(15, 23, 42, 0.06)',
    boxShadowSecondary: '0 8px 18px -8px rgba(15, 118, 110, 0.24), 0 4px 8px -4px rgba(15, 23, 42, 0.08)',
    boxShadowTertiary: '0 18px 40px -24px rgba(15, 118, 110, 0.36), 0 8px 16px -12px rgba(15, 23, 42, 0.12)',

    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    margin: 16,
    marginLG: 24,
    marginXL: 32,

    lineWidth: 1,
    lineType: 'solid',

    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.15s',

    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#ffffff',
      bodyBg: '#f6fffb',
      triggerBg: '#ffffff',
      triggerColor: '#52706c',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e8f7f3',
      itemHoverBg: '#f0fbf8',
      subMenuItemBg: 'transparent',
      itemHeight: 44,
      itemMarginBlock: 2,
      itemMarginInline: 12,
      itemBorderRadius: 10,
      collapsedWidth: 80,
      iconSize: 18,
      fontSize: 14,
      fontWeightStrong: 500,
      itemColor: '#52706c',
      itemSelectedColor: '#0f766e',
      itemHoverColor: '#0f766e',
    },
    Card: {
      headerBg: '#ffffff',
      paddingLG: 24,
      borderRadiusLG: 14,
      boxShadowTertiary: '0 8px 18px -8px rgba(15, 118, 110, 0.18)',
    },
    Table: {
      headerBg: '#f0fbf8',
      headerColor: '#28514c',
      headerSortActiveBg: '#e8f7f3',
      borderColor: '#edf6f3',
      rowHoverBg: '#f6fffb',
      cellPaddingBlock: 16,
      cellPaddingInline: 16,
    },
    Button: {
      borderRadius: 10,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      fontWeight: 500,
      primaryShadow: '0 2px 10px rgba(15, 118, 110, 0.24)',
      defaultShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
    },
    Input: {
      borderRadius: 10,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      paddingBlock: 8,
      paddingInline: 12,
    },
    Select: {
      borderRadius: 10,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
    },
    Breadcrumb: {
      fontSize: 14,
      itemColor: '#52706c',
      lastItemColor: '#13312f',
      linkColor: '#52706c',
      linkHoverColor: '#0f766e',
      separatorColor: '#7f9692',
    },
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },
  },
};

export const darkTheme: ThemeConfig = {
  ...theme,
  algorithm: 'darkAlgorithm' as any,
  token: {
    ...theme.token,
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
    colorText: '#ffffff',
    colorTextSecondary: '#a6a6a6',
  },
};
