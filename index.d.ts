export type TemplateItem = {
  method: string
  url: string
  body: Record<string, any>
  headers: Record<string, any>
}

export function generateSDK(
  template?: Record<string, TemplateItem>,
  outfile?: string
): void
