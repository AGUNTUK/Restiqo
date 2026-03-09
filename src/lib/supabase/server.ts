import { createClient as createCompatClient } from './client'

export async function createClient() {
  return createCompatClient()
}
