import { HTMLAttributes } from 'react'

const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}
    {...props}
  />
)

const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />
)

const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`} {...props} />
)

const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props} />
)

export { Card, CardHeader, CardTitle, CardContent }
