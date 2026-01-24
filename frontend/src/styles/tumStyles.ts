// TUM Corporate Design Constants
// Official TUM color palette and shared styles

export const TUM_COLORS = {
    // Primary Colors
    blue: '#0065BD',
    white: '#FFFFFF',
    black: '#000000',

    // Secondary Blues
    blueDark: '#005293',
    blueDarker: '#003359',

    // Grays
    gray80: '#333333',
    gray50: '#808080',
    gray20: '#CCCCCC',
    grayLight: '#DAD7CB',
    grayBg: '#F5F5F5',

    // Accent Colors
    orange: '#E37222',
    green: '#A2AD00',
    lightBlue1: '#98C6EA',
    lightBlue2: '#64A0C8',

    // Status Colors (for severity indicators)
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
};

// Shared page container style
export const pageContainerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: TUM_COLORS.grayBg,
    padding: 32,
    fontFamily: "Arial, 'Helvetica Neue', sans-serif",
};

// Shared card style
export const cardStyle: React.CSSProperties = {
    backgroundColor: TUM_COLORS.white,
    border: `1px solid ${TUM_COLORS.gray20}`,
    borderRadius: 8,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

// Page header style
export const pageHeaderStyle: React.CSSProperties = {
    marginBottom: 24,
};

export const pageTitleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: TUM_COLORS.gray80,
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
};

export const pageSubtitleStyle: React.CSSProperties = {
    fontSize: 14,
    color: TUM_COLORS.gray50,
    margin: 0,
};

// Button styles
export const primaryButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 24px',
    backgroundColor: TUM_COLORS.blue,
    color: TUM_COLORS.white,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 14,
    fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    transition: 'background-color 0.2s',
};

export const secondaryButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: 'transparent',
    color: TUM_COLORS.blue,
    border: `1px solid ${TUM_COLORS.blue}`,
};

export const dangerButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: TUM_COLORS.error,
};

// Input styles
export const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${TUM_COLORS.gray20}`,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

export const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: TUM_COLORS.gray80,
    marginBottom: 6,
};

// Section header style
export const sectionHeaderStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: TUM_COLORS.gray80,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
};

// Alert/Banner styles
export const infoBannerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(152, 198, 234, 0.2)',
    border: '1px solid rgba(100, 160, 200, 0.5)',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
};

export const warningBannerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
};

export const successBannerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
};

// Drop zone style
export const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${TUM_COLORS.gray20}`,
    borderRadius: 8,
    padding: 48,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: TUM_COLORS.white,
};

export const dropZoneActiveStyle: React.CSSProperties = {
    ...dropZoneStyle,
    borderColor: TUM_COLORS.blue,
    backgroundColor: 'rgba(0, 101, 189, 0.05)',
};

// Table styles
export const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
};

export const tableHeaderStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: 12,
    fontWeight: 500,
    color: TUM_COLORS.gray80,
    backgroundColor: TUM_COLORS.grayBg,
    borderBottom: `1px solid ${TUM_COLORS.gray20}`,
};

export const tableCellStyle: React.CSSProperties = {
    padding: 12,
    color: TUM_COLORS.gray80,
    borderBottom: `1px solid ${TUM_COLORS.gray20}`,
};

// Badge styles
export const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
};

export const successBadgeStyle: React.CSSProperties = {
    ...badgeStyle,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: TUM_COLORS.success,
};

export const warningBadgeStyle: React.CSSProperties = {
    ...badgeStyle,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: TUM_COLORS.warning,
};

export const errorBadgeStyle: React.CSSProperties = {
    ...badgeStyle,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: TUM_COLORS.error,
};
