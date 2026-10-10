import { useState } from 'react'
import { usePrefs } from '../../app/prefs'
import { Button, Card, Field, PageHeader, ProgressBar, Sheet } from '../../components/ui'

/** Page de contrôle visuel (dev uniquement) : composants de base en FR/AR. */
export function UiKitPage() {
  const { money } = usePrefs()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')

  return (
    <>
      <PageHeader title="Kit UI" subtitle="Composants de base" />
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button>Enregistrer</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="ghost">Annuler</Button>
          <Button variant="danger">Supprimer</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <Button size="lg" block onClick={() => setOpen(true)}>
          Ouvrir la feuille
        </Button>

        <Card tone="accent">
          <div className="flex justify-between">
            <span className="font-medium">🛒 Courses</span>
            <span className="tabular-nums">{money(82000)} / {money(100000)}</span>
          </div>
          <div className="mt-3">
            <ProgressBar ratio={0.82} label="Courses" />
          </div>
        </Card>
        <Card tone="warning">Alerte : 80 % du budget Sorties atteint.</Card>
        <Card tone="danger">Budget Transport dépassé (100 %).</Card>
        <Card>
          <ProgressBar ratio={0.4} label="Loyer" />
        </Card>

        <Field
          label="Montant"
          amount
          inputMode="decimal"
          placeholder="0"
          suffix="MAD"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Field label="Note" placeholder="Facultatif" hint="Ex. marché du samedi" />
        <Field label="Date" error="Date invalide" defaultValue="2026-13-40" />
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Nouvelle dépense">
        <div className="space-y-4">
          <Field label="Montant" amount inputMode="decimal" placeholder="0" suffix="MAD" />
          <Button size="lg" block onClick={() => setOpen(false)}>
            Enregistrer
          </Button>
        </div>
      </Sheet>
    </>
  )
}
