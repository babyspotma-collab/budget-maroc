import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'

/** `undefined` pendant le chargement, `null` s'il n'y a pas encore de profil. */
export function useProfile() {
  return useLiveQuery(async () => (await db.profile.get(1)) ?? null, [])
}

export function useProgram() {
  return useLiveQuery(async () => (await db.program.get(1)) ?? null, [])
}
