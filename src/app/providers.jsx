'use client';

import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider, theme as antTheme } from 'antd';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import FloatingBooks from '@/components/FloatingBooks';
import PageTransition from '@/components/PageTransition';

function AppShell({ children }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const antConfig = {
        token: {
            colorPrimary: isDark ? '#f5f5f5' : '#1890ff',
            colorTextLightSolid: isDark ? '#111111' : '#ffffff',
            colorInfo: isDark ? '#f5f5f5' : '#1890ff',
            colorLink: isDark ? '#f5f5f5' : '#1890ff',
            colorLinkHover: isDark ? '#ffffff' : '#40a9ff',
            colorLinkActive: isDark ? '#d4d4d8' : '#096dd9',
            colorText: isDark ? '#f5f5f5' : undefined,
            colorTextSecondary: isDark ? '#c4c4cc' : undefined,
            colorTextTertiary: isDark ? '#8b8b95' : undefined,
            colorBorder: isDark ? '#303036' : undefined,
            colorBorderSecondary: isDark ? '#202024' : undefined,
            colorBgBase: isDark ? '#0b0b0c' : undefined,
            colorBgLayout: isDark ? '#0b0b0c' : undefined,
            colorBgContainer: isDark ? '#18181b' : undefined,
            colorBgElevated: isDark ? '#1f1f23' : undefined,
            colorFillSecondary: isDark ? 'rgba(255,255,255,0.06)' : undefined,
            colorFillTertiary: isDark ? 'rgba(255,255,255,0.08)' : undefined,
            colorPrimaryBg: isDark ? '#232326' : undefined,
            colorPrimaryBgHover: isDark ? '#28282b' : undefined,
            borderRadius: 6,
            fontFamily: 'Inter, sans-serif',
        },
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        components: isDark
            ? {
                  Button: {
                      defaultBg: '#18181b',
                      defaultBorderColor: '#303036',
                      defaultColor: '#f5f5f5',
                      primaryColor: '#111111',
                      colorPrimary: '#f5f5f5',
                      colorPrimaryHover: '#ffffff',
                      colorPrimaryActive: '#d4d4d8',
                  },
                  Input: {
                      colorBgContainer: '#111112',
                      colorBorder: '#303036',
                      activeBorderColor: '#f5f5f5',
                      hoverBorderColor: '#cfcfd4',
                  },
                  Select: {
                      colorBgContainer: '#111112',
                      colorBorder: '#303036',
                      optionSelectedBg: '#28282b',
                  },
                  Tabs: {
                      itemColor: '#8b8b95',
                      itemSelectedColor: '#f5f5f5',
                      itemActiveColor: '#ffffff',
                      inkBarColor: '#f5f5f5',
                  },
                  Menu: {
                      itemColor: '#c4c4cc',
                      itemSelectedColor: '#111111',
                      itemSelectedBg: '#f5f5f5',
                      itemHoverColor: '#ffffff',
                      itemHoverBg: '#232326',
                  },
                  Table: {
                      headerBg: '#232326',
                      headerColor: '#f5f5f5',
                      rowHoverBg: '#28282b',
                      borderColor: '#303036',
                  },
                  Drawer: {
                      colorBgElevated: '#18181b',
                  },
                  Modal: {
                      contentBg: '#18181b',
                      headerBg: '#18181b',
                  },
                  Dropdown: {
                      colorBgElevated: '#18181b',
                  },
              }
            : undefined,
    };

    return (
        <ConfigProvider theme={antConfig}>
            <AuthProvider>
                <StoreProvider>
                    <FloatingBooks />
                    <div className="app-wrapper">
                        <Header />
                        <main className="main-content">
                            <PageTransition>
                                {children}
                            </PageTransition>
                        </main>
                        <Footer />
                        <Toaster richColors position="top-right" />
                    </div>
                </StoreProvider>
            </AuthProvider>
        </ConfigProvider>
    );
}

export function Providers({ children }) {
    return (
        <ThemeProvider>
            <AppShell>{children}</AppShell>
        </ThemeProvider>
    );
}
