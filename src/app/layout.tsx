import './globals.css'

export const metadata = {
  title: 'WellCooked',
  description: '智能烹饪助手',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
