import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config'
import { Database } from '@/types/database'

type CompatUser = FirebaseUser & { id: string }
type CompatSession = { user: CompatUser; access_token: string | null }

type FilterOp =
  | 'eq'
  | 'neq'
  | 'is'
  | 'in'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'ilike'
  | 'contains'
  | 'not-in'

interface Filter {
  field: string
  op: FilterOp
  value: unknown
}

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toSnakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
}

function parseTimestamp(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(parseTimestamp)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, parseTimestamp(v)])
    )
  }
  return value
}

function withKeyAliases(row: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(row)) {
    output[key] = parseTimestamp(value)

    const snake = toSnakeCase(key)
    const camel = toCamelCase(key)

    if (!(snake in output)) output[snake] = output[key]
    if (!(camel in output)) output[camel] = output[key]
  }

  return output
}

function normalizeWritePayload(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue

    const normalizedKey = toCamelCase(key)
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      output[normalizedKey] = normalizeWritePayload(value as Record<string, unknown>)
    } else {
      output[normalizedKey] = value
    }
  }

  return output
}

function getFieldValue(row: Record<string, unknown>, field: string): unknown {
  const direct = row[field]
  if (direct !== undefined) return direct

  const camel = row[toCamelCase(field)]
  if (camel !== undefined) return camel

  const snake = row[toSnakeCase(field)]
  if (snake !== undefined) return snake

  return undefined
}

function matchesFilter(row: Record<string, unknown>, filter: Filter): boolean {
  const left = getFieldValue(row, filter.field)
  const right = filter.value

  switch (filter.op) {
    case 'eq':
      return left === right
    case 'neq':
      return left !== right
    case 'is':
      return right === null ? left === null || left === undefined : left === right
    case 'in':
      return Array.isArray(right) ? right.includes(left) : false
    case 'not-in':
      return Array.isArray(right) ? !right.includes(left) : true
    case 'gt':
      return Number(left) > Number(right)
    case 'gte':
      return Number(left) >= Number(right)
    case 'lt':
      return Number(left) < Number(right)
    case 'lte':
      return Number(left) <= Number(right)
    case 'ilike': {
      const pattern = String(right ?? '').toLowerCase().replaceAll('%', '')
      return String(left ?? '').toLowerCase().includes(pattern)
    }
    case 'contains':
      return Array.isArray(left) && Array.isArray(right)
        ? (right as unknown[]).every((item) => left.includes(item))
        : false
    default:
      return true
  }
}

function parseOrExpression(expression: string): Filter[] {
  return expression
    .split(',')
    .map((part) => part.trim())
    .map((part) => {
      const match = part.match(/^([^\.]+)\.(eq|neq|gt|gte|lt|lte|ilike)\.(.+)$/)
      if (!match) return null

      const [, field, op, rawValue] = match
      return {
        field,
        op: op as FilterOp,
        value: rawValue,
      }
    })
    .filter(Boolean) as Filter[]
}

function toCompatUser(user: FirebaseUser): CompatUser {
  return Object.assign(user, { id: user.uid }) as CompatUser
}

class FirebaseQueryBuilder implements PromiseLike<any> {
  private readonly db = getFirebaseFirestore()
  private readonly table: string
  private mode: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private payload: Record<string, unknown>[] = []
  private filters: Filter[] = []
  private orFilters: Filter[] = []
  private sortField: string | null = null
  private sortAscending = true
  private limitValue: number | null = null
  private rangeValue: { from: number; to: number } | null = null
  private singleValue = false
  private headCount = false
  private shouldReturnData = false

  constructor(table: string) {
    this.table = table
  }

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    void columns
    if (this.mode !== 'select') {
      this.shouldReturnData = true
      return this
    }

    this.headCount = options?.count === 'exact' && options?.head === true
    return this
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]) {
    this.mode = 'insert'
    this.payload = Array.isArray(data) ? data : [data]
    return this
  }

  update(data: Record<string, unknown>) {
    this.mode = 'update'
    this.payload = [data]
    return this
  }

  delete() {
    this.mode = 'delete'
    return this
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, op: 'eq', value })
    return this
  }

  neq(field: string, value: unknown) {
    this.filters.push({ field, op: 'neq', value })
    return this
  }

  is(field: string, value: unknown) {
    this.filters.push({ field, op: 'is', value })
    return this
  }

  in(field: string, value: unknown[]) {
    this.filters.push({ field, op: 'in', value })
    return this
  }

  gt(field: string, value: unknown) {
    this.filters.push({ field, op: 'gt', value })
    return this
  }

  gte(field: string, value: unknown) {
    this.filters.push({ field, op: 'gte', value })
    return this
  }

  lt(field: string, value: unknown) {
    this.filters.push({ field, op: 'lt', value })
    return this
  }

  lte(field: string, value: unknown) {
    this.filters.push({ field, op: 'lte', value })
    return this
  }

  ilike(field: string, value: string) {
    this.filters.push({ field, op: 'ilike', value })
    return this
  }

  contains(field: string, value: unknown[]) {
    this.filters.push({ field, op: 'contains', value })
    return this
  }

  not(field: string, operator: string, value: string) {
    if (operator === 'in') {
      const cleaned = value.replace(/[()]/g, '')
      const values = cleaned.split(',').map((v) => v.trim())
      this.filters.push({ field, op: 'not-in', value: values })
    }
    return this
  }

  or(expression: string) {
    this.orFilters = parseOrExpression(expression)
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.sortField = field
    this.sortAscending = options?.ascending !== false
    return this
  }

  limit(value: number) {
    this.limitValue = value
    return this
  }

  range(from: number, to: number) {
    this.rangeValue = { from, to }
    return this
  }

  single() {
    this.singleValue = true
    return this
  }

  private async fetchAllRows() {
    const snapshot = await getDocs(collection(this.db, this.table))

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ref: doc(this.db, this.table, docSnap.id),
      row: withKeyAliases({ id: docSnap.id, ...(docSnap.data() as Record<string, unknown>) }),
    }))
  }

  private applyFilters(rows: Array<{ id: string; ref: ReturnType<typeof doc>; row: Record<string, unknown> }>) {
    let filtered = rows.filter((item) => this.filters.every((filter) => matchesFilter(item.row, filter)))

    if (this.orFilters.length > 0) {
      filtered = filtered.filter((item) => this.orFilters.some((filter) => matchesFilter(item.row, filter)))
    }

    if (this.sortField) {
      filtered.sort((a, b) => {
        const left = getFieldValue(a.row, this.sortField as string)
        const right = getFieldValue(b.row, this.sortField as string)

        if (left === right) return 0
        if (left === undefined || left === null) return this.sortAscending ? 1 : -1
        if (right === undefined || right === null) return this.sortAscending ? -1 : 1

        if (left > right) return this.sortAscending ? 1 : -1
        return this.sortAscending ? -1 : 1
      })
    }

    if (this.rangeValue) {
      filtered = filtered.slice(this.rangeValue.from, this.rangeValue.to + 1)
    }

    if (typeof this.limitValue === 'number') {
      filtered = filtered.slice(0, this.limitValue)
    }

    return filtered
  }

  private async executeSelect() {
    const rows = this.applyFilters(await this.fetchAllRows())

    if (this.headCount) {
      return {
        data: null,
        error: null,
        count: rows.length,
      }
    }

    const data = rows.map((entry) => entry.row)

    if (this.singleValue) {
      if (data.length === 0) {
        return {
          data: null,
          error: { message: 'No rows found' },
        }
      }

      return {
        data: data[0],
        error: null,
      }
    }

    return {
      data,
      error: null,
    }
  }

  private async executeInsert() {
    const inserted: Record<string, unknown>[] = []

    for (const payload of this.payload) {
      const normalized = normalizeWritePayload(payload)
      const docRef = await addDoc(collection(this.db, this.table), normalized)
      inserted.push(withKeyAliases({ id: docRef.id, ...normalized }))
    }

    if (this.singleValue) {
      return {
        data: inserted[0] || null,
        error: null,
      }
    }

    return {
      data: this.shouldReturnData ? inserted : inserted,
      error: null,
    }
  }

  private async executeUpdate() {
    const rows = this.applyFilters(await this.fetchAllRows())
    const normalizedUpdate = normalizeWritePayload(this.payload[0] || {})

    for (const row of rows) {
      await updateDoc(row.ref, normalizedUpdate)
    }

    const updatedRows = rows.map((row) => withKeyAliases({ ...row.row, ...normalizedUpdate }))

    if (this.singleValue) {
      return {
        data: updatedRows[0] || null,
        error: null,
      }
    }

    return {
      data: this.shouldReturnData ? updatedRows : updatedRows,
      error: null,
    }
  }

  private async executeDelete() {
    const rows = this.applyFilters(await this.fetchAllRows())

    for (const row of rows) {
      await deleteDoc(row.ref)
    }

    const deletedRows = rows.map((row) => row.row)

    return {
      data: this.shouldReturnData ? deletedRows : deletedRows,
      error: null,
    }
  }

  private async execute() {
    try {
      if (this.mode === 'insert') return await this.executeInsert()
      if (this.mode === 'update') return await this.executeUpdate()
      if (this.mode === 'delete') return await this.executeDelete()
      return await this.executeSelect()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Firebase query failed'
      return {
        data: this.singleValue ? null : [],
        error: { message },
      }
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any)
  }
}

function createNoopChannel() {
  return {
    on() {
      return this
    },
    subscribe() {
      return this
    },
  }
}

interface CompatAuthApi {
  getUser: () => Promise<{ data: { user: CompatUser | null }; error: { message: string } | null }>
  getSession: () => Promise<{ data: { session: CompatSession | null }; error: { message: string } | null }>
  onAuthStateChange: (
    callback: (event: string, session: CompatSession | null) => void
  ) => { data: { subscription: { unsubscribe: () => void } } }
  signInWithPassword: (params: { email: string; password: string }) => Promise<{
    data: { user: CompatUser | null; session: CompatSession | null }
    error: { message: string } | null
  }>
  signUp: (params: {
    email: string
    password: string
    options?: { data?: { full_name?: string } }
  }) => Promise<{
    data: { user: CompatUser | null; session: CompatSession | null }
    error: { message: string } | null
  }>
  signOut: () => Promise<{ error: { message: string } | null }>
  signInWithOAuth: (params: { provider: 'google' | 'facebook' }) => Promise<{
    data: { provider: 'google' | 'facebook'; url: null; user: CompatUser | null }
    error: { message: string } | null
  }>
  exchangeCodeForSession: () => Promise<{ data: { session: CompatSession | null }; error: { message: string } | null }>
}

interface CompatSupabaseClient {
  auth: CompatAuthApi
  from: (table: string) => FirebaseQueryBuilder
  channel: () => ReturnType<typeof createNoopChannel>
  removeChannel: () => null
}

let compatClient: CompatSupabaseClient | null = null

export function useSupabaseClient() {
  return createClient()
}

export function createClient(): CompatSupabaseClient {
  if (compatClient) return compatClient

  const auth = getFirebaseAuth()

  compatClient = {
    auth: {
      async getUser() {
        return {
          data: { user: auth.currentUser ? toCompatUser(auth.currentUser) : null },
          error: null,
        }
      },
      async getSession() {
        const accessToken = auth.currentUser
          ? await auth.currentUser.getIdToken().catch(() => null)
          : null
        const session: CompatSession | null = auth.currentUser
          ? { user: toCompatUser(auth.currentUser), access_token: accessToken }
          : null

        return {
          data: { session },
          error: null,
        }
      },
      onAuthStateChange(callback: (event: string, session: CompatSession | null) => void) {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          const accessToken = user ? await user.getIdToken().catch(() => null) : null
          callback(
            user ? 'SIGNED_IN' : 'SIGNED_OUT',
            user ? { user: toCompatUser(user), access_token: accessToken } : null
          )
        })

        return {
          data: {
            subscription: { unsubscribe },
          },
        }
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          const accessToken = await userCredential.user.getIdToken().catch(() => null)
          return {
            data: {
              user: toCompatUser(userCredential.user),
              session: { user: toCompatUser(userCredential.user), access_token: accessToken },
            },
            error: null,
          }
        } catch (error) {
          return {
            data: { user: null, session: null },
            error: { message: error instanceof Error ? error.message : 'Failed to sign in' },
          }
        }
      },
      async signUp({
        email,
        password,
        options,
      }: {
        email: string
        password: string
        options?: { data?: { full_name?: string } }
      }) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const accessToken = await userCredential.user.getIdToken().catch(() => null)

          if (options?.data?.full_name) {
            await updateFirebaseProfile(userCredential.user, {
              displayName: options.data.full_name,
            })
          }

          return {
            data: {
              user: toCompatUser(userCredential.user),
              session: { user: toCompatUser(userCredential.user), access_token: accessToken },
            },
            error: null,
          }
        } catch (error) {
          return {
            data: { user: null, session: null },
            error: { message: error instanceof Error ? error.message : 'Failed to sign up' },
          }
        }
      },
      async signOut() {
        try {
          await firebaseSignOut(auth)
          return { error: null }
        } catch (error) {
          return { error: { message: error instanceof Error ? error.message : 'Failed to sign out' } }
        }
      },
      async signInWithOAuth({ provider }: { provider: 'google' | 'facebook' }) {
        try {
          const providerInstance = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider()
          const { user } = await signInWithPopup(auth, providerInstance)

          return {
            data: {
              provider,
              url: null,
              user: toCompatUser(user),
            },
            error: null,
          }
        } catch (error) {
          return {
            data: { provider, url: null, user: null },
            error: { message: error instanceof Error ? error.message : 'OAuth sign-in failed' },
          }
        }
      },
      async exchangeCodeForSession() {
        const accessToken = auth.currentUser
          ? await auth.currentUser.getIdToken().catch(() => null)
          : null
        const session: CompatSession | null = auth.currentUser
          ? { user: toCompatUser(auth.currentUser), access_token: accessToken }
          : null

        return {
          data: { session },
          error: null,
        }
      },
    },
    from(table: string) {
      return new FirebaseQueryBuilder(table)
    },
    channel() {
      return createNoopChannel()
    },
    removeChannel() {
      return null
    },
  }

  return compatClient
}

export type { CompatSupabaseClient }
export type SupabaseDatabase = Database
