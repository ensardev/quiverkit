import { useTranslation } from 'react-i18next'
import Detector from '@/components/Detector'
import { ToolShell } from '@/components/ui'

export default function DetectTool() {
  const { t } = useTranslation()

  return (
    <ToolShell id="detect">
      <Detector rows={8} autoFocus />
      <p className="text-muted text-sm">{t('tools.detect.note')}</p>
    </ToolShell>
  )
}
