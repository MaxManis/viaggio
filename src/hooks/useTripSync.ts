import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useTripStore } from '../store/useTripStore'
import type { Trip } from '../types'

// Both partners must use the SAME row id to share a trip.
const ROW_ID = import.meta.env.VITE_TRIP_ID ?? 'shared-trip'

type Row = { data: Trip; updated_at: string }

/**
 * Two-way sync between the local zustand store and a single Supabase row.
 *
 * Model: the whole trip is stored as one JSONB document. Writes are debounced
 * and pushed as upserts; remote changes stream in over Realtime. Conflicts are
 * resolved last-write-wins via the DB-managed `updated_at` column — fine for a
 * two-person trip where you rarely edit the exact same field at the same second.
 */
export function useTripSync(enabled: boolean) {
  const applyingRemote = useRef(false)
  const lastApplied = useRef('')
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || !supabase) return
    const client = supabase
    let cancelled = false

    const applyRemote = (row: Row | undefined) => {
      if (!row?.data || row.updated_at <= lastApplied.current) return
      lastApplied.current = row.updated_at
      applyingRemote.current = true
      useTripStore.getState().replaceTrip(row.data)
      applyingRemote.current = false
    }

    const push = async (trip: Trip) => {
      const { data, error } = await client
        .from('trips')
        .upsert({ id: ROW_ID, data: trip })
        .select('updated_at')
        .single()
      if (error) {
        console.error('[sync] push failed:', error.message)
        return
      }
      // Remember the timestamp of our own write so its Realtime echo is ignored.
      if (data?.updated_at) lastApplied.current = data.updated_at as string
    }

    const start = async () => {
      // Realtime needs the auth token attached so RLS-protected changes stream.
      const {
        data: { session },
      } = await client.auth.getSession()
      client.realtime.setAuth(session?.access_token ?? null)

      const { data, error } = await client
        .from('trips')
        .select('data, updated_at')
        .eq('id', ROW_ID)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        console.error('[sync] load failed:', error.message)
      } else if (data) {
        applyRemote(data as Row)
      } else {
        // First run: seed the shared row with whatever we have locally.
        await push(useTripStore.getState().trip)
      }
    }

    const channel = client
      .channel(`trip-${ROW_ID}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${ROW_ID}` },
        (payload) => applyRemote(payload.new as Row),
      )
      .subscribe()

    const unsub = useTripStore.subscribe((state, prev) => {
      if (applyingRemote.current || state.trip === prev.trip) return
      if (pushTimer.current) clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(() => push(state.trip), 600)
    })

    start()

    return () => {
      cancelled = true
      unsub()
      if (pushTimer.current) clearTimeout(pushTimer.current)
      client.removeChannel(channel)
    }
  }, [enabled])
}
